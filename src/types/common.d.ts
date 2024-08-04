import { ChildLoggerOptions }from "pino";

export type RedisConnectOptions = {

}

export type DatabaseOptions = {
    mongodb_uri: string,
    redis?: RedisConnectOptions
}

export type WhatsappContainerOptions = {
    logger?: ChildLoggerOptions;
}

export type CreateServiceOptions = {
    database: DatabaseOptions,
    whatsapp?: WhatsappContainerOptions
}


