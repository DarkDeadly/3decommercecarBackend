import mongoose , { Schema }  from "mongoose"


const idempotentKeySchema = new Schema({
    key : { type : String, required: true, unique: true },
    response : {type : mongoose.Schema.Types.Mixed, required: true },
    createdAt : { type : Date, default: Date.now, expires: "24h" } // Key expires after 1 hour
})

const IdempotentKeyModel = mongoose.model("IdempotentKey", idempotentKeySchema) ;
export default IdempotentKeyModel