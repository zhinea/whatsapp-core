import P from 'pino'

export const logger = P({
    level: process.env.LOGGER_LEVEL || 'info',
    timestamp: () => `,"time":"${new Date().toJSON()}"`
})