import { model, Schema } from "mongoose";

const CollectionSchema = new Schema({
    collectionName: {
        type: String,
        required: [true, 'Collection name is required'],
        // Basic validation for MongoDB collection names
        match: [/^[^$\x00\\."\/]+$/, 'Invalid collection name characters']
    },
    dbId: {
        type: Schema.Types.ObjectId,
        ref: 'DB',
        required: true
    },
    schemaDefinitionId: {
        type: Schema.Types.ObjectId,
        ref: 'SchemaDefinition'
    },
    estimatedDocCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Col = model('collections',CollectionSchema);

export default Col;