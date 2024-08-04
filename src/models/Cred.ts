import mongoose, {Schema, SchemaTypes} from "mongoose";


const Cred = new Schema({
    sessionId: {
        type: SchemaTypes.String,
        index: true
    },
    key: {
        type: SchemaTypes.String,
        index: true
    },
    value: SchemaTypes.String
})


export default mongoose.model('creds', Cred)