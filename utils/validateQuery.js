import DB from "../model/db.js";
import Col from "../model/collection.js";

async function validateDbandCol(dbName, collectionName) {
    try {
        const dbValid = await DB.findOne({ dbName: dbName })
        if (!dbValid) {
            return { valid: false, message: "DB was not found." };
        }
        const colWithSchema = await Col.findOne({ collectionName: collectionName, dbId: dbValid._id }).populate('schemaDefinitionId');
        if (!colWithSchema) {
            return { valid: false, message: "Collection was not found." };
        }
        return { valid: true, schema: colWithSchema };
    } catch (error) {
        console.log("Error in ValidateDbandCol: ", error);
        return { valid: false, message: error.message || "Unexpected error occurred." }
    }
}

export default validateDbandCol;