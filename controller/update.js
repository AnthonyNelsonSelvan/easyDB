import { hashFieldOnUpdate } from "../auth/hash.js";
import Col from "../model/collection.js";
import DB from "../model/db.js";

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
        const dbValid = await DB.findOne({ dbName: dbName })
        if (!dbValid) {
            return res.status(404).json({ message: "There is no such DB name" });
        }
        const colWithSchema = await Col.findOne({ collectionName: collectionName, dbId: dbValid._id }).populate('schemaDefinitionId');;
        if (!colWithSchema) {
            return res.status(404).json({ message: "There is no such Collection in your db" });
        }
        if (colWithSchema.dbId.toString() !== dbValid._id.toString()) {
            return res.status(403).json({ message: "Collection does not belong to this database" });
        }
        //till here (caching) will apply soon

        const finalUpdate = await hashFieldOnUpdate(update,colWithSchema);

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
        console.log("Error updating one document : ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export {updateOne};