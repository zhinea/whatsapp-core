import type { WASocket } from '@whiskeysockets/baileys'
import { DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWASocket } from "@whiskeysockets/baileys";
import NodeCache from 'node-cache'
import type P from 'pino'
import {logger} from "../../utils/logger.ts";
import {useMongoDBAuthState} from "../../utils/useMongoDBAuthState.ts";
import {Boom} from "@hapi/boom";
import type {WhatsappContainerOptions} from "../../types/common";
import Cred from "../../models/Cred.ts";
import EventEmitter from 'events'

const msgRetryCounterCache = new NodeCache()

export class WhatsappInstance extends EventEmitter {

    sockets: Map<string, WASocket>

    logger: P

    constructor(options: WhatsappContainerOptions = {}) {
        this.sockets = new Map()

        this.logger = logger.child({}, options?.logger)
    }

    async startInstance(instanceId: string, options: any = {}){
        const { state, saveCreds } = await useMongoDBAuthState(instanceId)
        // fetch latest version of WA Web
        const { version, isLatest } = await fetchLatestBaileysVersion()
        this.logger.info(`[${instanceId}] using WA v${version.join('.')}, isLatest: ${isLatest}`)


        const sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: options?.printQRInTerminal || true,
            mobile: false,
            auth: {
                creds: state.creds,
                /** caching makes the store faster to send/recv messages */
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            msgRetryCounterCache,
            generateHighQualityLinkPreview: true,
        })

        // the process function lets you process all events that just occurred
        // efficiently in a batch
        sock.ev.process(
            // events is a map for event name => event data
            async(events) => {
                // something about the connection changed
                // maybe it closed, or we received all offline message or connection opened
                if(events['connection.update']) {
                    const update = events['connection.update']
                    const { connection, lastDisconnect } = update
                    if(connection === 'close') {
                        // reconnect if not logged out
                        if((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                            this.startInstance(instanceId, options)
                        } else {
                            await Cred.deleteMany({
                                instanceId
                            })

                            this.logger.info(`[${instanceId}]`, 'Connection closed. You are logged out.')
                            this.emit('logout', {
                                instanceId
                            })

                        }
                    }

                    this.logger.info(`[${instanceId}]`, 'connection update', update)
                }

                // credentials updated -- save them
                if(events['creds.update']) {
                    await saveCreds()
                }
            }
        )

        this.sockets.set(instanceId, sock)
    }


    /**
     * Get specify whatsapp socket
     * @param instanceId {string}
     */
    getSocket(instanceId: string): WASocket | undefined {
        return <WASocket | undefined>this.sockets.get(instanceId)
    }

    /**
     * Get sockets lists
     */
    getSockets(): string[] {
        return <string[]>this.sockets.keys()
    }

    // TODO: remove and disconnect socket from this node,
    //  but don't logout the whatsapp instance
    removeSocket(instanceId: string) {
    }



}
