import mongoose from 'mongoose';
import {logger} from "../../utils/logger.ts";


export const Connect = async (uri: string) => {
    logger.info('Connecting to mongodb')
    try {
        await mongoose.connect(uri)
            .then(() => logger.info('Connected!'));
    } catch (e){
        logger.warn('Failed to connect mongodb')
        logger.error(e)
    }
}