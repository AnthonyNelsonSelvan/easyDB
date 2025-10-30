import { model, Schema } from "mongoose";

const SchemaDefinitionSchema = new Schema({
    schemaName: {
        type: String,
        required: false
    },
    definition: {
        type: Object,
        required: true
    },
    ownerUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });

SchemaDefinitionSchema.index({ ownerUserId: 1 });

const Sch = model('SchemaDefinition', SchemaDefinitionSchema);

export default Sch;