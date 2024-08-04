import dotenv from 'dotenv'
dotenv.config()

import {createService} from "../src";

const service = await createService({
    database: {
        mongodb_uri: process.env.MONGODB_URI,
        redis: undefined
    }
})


// service.startInstance("baileys_auth_info")
service.startInstance("test2")