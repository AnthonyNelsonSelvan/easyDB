import { model, Schema } from "mongoose";


const DBSchema = new Schema({
    dbName: {
        type: String,
        required: true,
        unique: true,
        match: [/^[^$\x00\\."\/ ]+$/, 'Invalid database name characters (no spaces allowed)']
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

DBSchema.index({ userId: 1 });

const DB = model('db', DBSchema);

export default DB;