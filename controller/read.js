import Col from "../model/collection.js";
import DB from "../model/db.js";

async function readOneRecord(req, res) {
    try {
        const dbName = `${req.params.dbName}_${req.user.id}`;
        const collectionName = req.params.collectionName;
        const query = req.body;

        if (typeof query !== 'object' || query === null) {
            return res.status(400).json({ message: "Request body must be a valid document object." });
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

        const db = req.mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.findOne(query);

        if (!result) {
            return res.status(404).json({ message: "No document found matching query" });
        }

        res.status(200).json({
            message: "Document fetched successfully",
            data: result
        });
    } catch (error) {
        console.log("Read one record Error :", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function readManyRecord(req, res) {
    try {
        const dbName = `${req.params.dbName}_${req.user.id}`;
        const collectionName = req.params.collectionName;
        const query = req.body.query || {};
        const options = req.body.options || {};

        if (typeof query !== 'object' || query === null) {
            return res.status(400).json({ message: "Request body must be a valid document object." });
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

        const db = req.mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.find(query,options).toArray();

        if (result.length === 0) {
            return res.status(404).json({ message: "No document found matching query" });
        }

        res.status(200).json({
            message: "Documents fetched successfully",
            data: result
        });
    } catch (error) {
        console.log("Read one record Error :", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export {readOneRecord,readManyRecord};