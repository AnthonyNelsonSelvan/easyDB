import { hashFieldOnUpdate } from "../auth/hash.js";
import validateDbandCol from "../utils/validateQuery.js";

async function updateOne(req, res) {
    try {
        const dbName = `${req.params.dbName}_${req.user.id}`;
        const collectionName = req.params.collectionName;
        let updateQuery = req.body.updateQuery;
        let update = req.body.update;

        if (typeof updateQuery !== 'object' || updateQuery === null) {
            return res.status(400).json({ message: "Request body must be a valid update query." });
        }

        if (typeof update !== 'object' || update === null) {
            return res.status(400).json({ message: "Request body must be a valid update value" });
        }

        if (!Object.keys(update).some(key => key.startsWith("$"))) {
            update = { $set: update };
        }

        if (!req.mongoClient) throw new Error("Database client not found in request");
        if (!dbName) return res.status(400).json({ message: "dbName parameter required" });
        if (!collectionName) return res.status(400).json({ message: "collectionName parameter required" });

        //needs caching right here
        const colWithSchema = await validateDbandCol(dbName,collectionName);
        if(!colWithSchema.valid){
            return res.status(404).json({message : colWithSchema.message})
        }
        //till here (caching) will apply soon

        const finalUpdate = await hashFieldOnUpdate(update, colWithSchema.schema);

        const db = req.mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(updateQuery, finalUpdate);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "No document found matching query" });
        }

        res.status(200).json({
            message: "Document updated successfully",
            data: result
        });
    } catch (error) {
         if (error.code === 11000) {
            return res.status(409).json({ message: "Duplicate key error: You cannot update it will lead to Duplicate entry" });
        }

        if (error.code === 121) {
            return res.status(400).json({ message: "Document failed validation: missing or invalid fields." });
        }
        console.log("Error updating one document : ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function updateMany(req, res) {
    try {
        const dbName = `${req.params.dbName}_${req.user.id}`;
        const collectionName = req.params.collectionName;
        let updateQuery = req.body.updateQuery;
        let update = req.body.update;
        let options = req.body.options || {};

        if (typeof updateQuery !== 'object' || updateQuery === null) {
            return res.status(400).json({ message: "Request body must be a valid update query." });
        }

        if (typeof update !== 'object' || update === null) {
            return res.status(400).json({ message: "Request body must be a valid update value" });
        }

        if (!Object.keys(update).some(key => key.startsWith("$"))) {
            update = { $set: update };
        }

        if (!req.mongoClient) throw new Error("Database client not found in request");
        if (!dbName) return res.status(400).json({ message: "dbName parameter required" });
        if (!collectionName) return res.status(400).json({ message: "collectionName parameter required" });

        //needs caching right here
        const colWithSchema = await validateDbandCol(dbName,collectionName);
        if(!colWithSchema.valid){
            return res.status(404).json({message : colWithSchema.message})
        }
        //till here (caching) will apply soon

        const finalUpdate = await hashFieldOnUpdate(update, colWithSchema.schema);

        const db = req.mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.updateMany(updateQuery, finalUpdate, options);

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "No document were updated." });
        }

        res.status(200).json({
            message: "Documents updated successfully",
            data: result
        });
    } catch (error) {
         if (error.code === 11000) {
            return res.status(409).json({ message: "Duplicate key error: You cannot update it will lead to Duplicate entry." });
        }

        if (error.code === 121) {
            return res.status(400).json({ message: "Document failed validation: missing or invalid fields." });
        }
        console.log("Error updating many documents : ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { updateOne,updateMany };