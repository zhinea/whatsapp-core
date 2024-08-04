import type {CreateServiceOptions} from "./types/common";
import {MongoDB} from './libs/database/index.ts'
import {WhatsappInstance} from "./libs/whatsapp";

export const createService = async (options: CreateServiceOptions): Promise<ReturnType<typeof WhatsappInstance>> => {

    await MongoDB.Connect(options.database.mongodb_uri)

    return new WhatsappInstance(options?.whatsapp);
}