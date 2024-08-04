import { BufferJSON, initAuthCreds } from "@whiskeysockets/baileys";
import type {proto, AuthenticationState, SignalDataTypeMap, AuthenticationCreds } from '@whiskeysockets/baileys'
import Cred from "../models/Cred.ts";

/**
 * Optimized authentication store DB
 * */
export const useMongoDBAuthState = async(folder: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {

	const writeData = async (data: any, file: string) => {
		 await Cred.create({
			sessionId: folder,
			key: file,
			value: JSON.stringify(data, BufferJSON.replacer)
		})

		return Promise.resolve()
	}

	const readData = async(file: string) => {
		try {
			const data= await Cred.findOne({
				sessionId: folder,
				key: file
			}).exec()

			if(!data?.value){
				return null
			}

			return JSON.parse(data!.value, BufferJSON.reviver)
		} catch(error) {
			return null
		}
	}

	const removeData = async(file: string) => {
		try {
			await Cred.deleteOne({
				sessionId: folder,
				key: file
			}).exec()
		} catch{
		}
	}

	const creds: AuthenticationCreds = await readData('creds') || initAuthCreds()

	return {
		state: {
			creds,
			keys: {
				get: async(type, ids) => {
					const data: { [_: string]: SignalDataTypeMap[typeof type] } = { }
					await Promise.all(
						ids.map(
							async id => {
								let value = await readData(`${type}-${id}`)
								if(type === 'app-state-sync-key' && value) {
									value = proto.Message.AppStateSyncKeyData.fromObject(value)
								}

								data[id] = value
							}
						)
					)

					return data
				},
				set: async(data) => {
					const tasks: Promise<void>[] = []
					for(const category in data) {
						for(const id in data[category]) {
							const value = data[category][id]
							const file = `${category}-${id}`
							tasks.push(value ? writeData(value, file) : removeData(file))
						}
					}

					await Promise.all(tasks)
				}
			}
		},
		saveCreds: () => {
			return writeData(creds, 'creds')
		}
	}
}