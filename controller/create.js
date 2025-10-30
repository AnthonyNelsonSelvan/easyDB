import Col from "../model/collection.js";
import DB from "../model/db.js";

async function createOneRecord(req, res) {
    try {
        const dbName = `${req.params.dbName}_${req.user.id}`;
        console.log(dbName)
        const collectionName = req.params.collectionName;
        const document = req.body;

        if (typeof document !== 'object' || document === null) {
            return res.status(400).json({ message: "Request body must be a valid document object." });
        }
        if (!req.mongoClient) throw new Error("Database client not found in request");
        if (!dbName) return res.status(400).json({ message: "dbName parameter required" });
        if (!collectionName) return res.status(400).json({ message: "collectionName parameter required" });

        //needs caching right here
        const dbValid = DB.findOne({dbName : dbName})
        if(!dbValid){
            return res.status(404).json({message : "There is no such DB name"});
        }
        const colValid = Col.findOne({collectionName : collectionName});
        if(!colValid){
            return res.status(404).json({message : "There is no such Collection in your db"});
        }
        //till here (caching) will apply soon

        const schema = await Col.findOne({ collectionName: collectionName }).populate('schemaDefinitionId')
        console.log(schema);

        const db = req.mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(document);

        res.status(201).json({
            acknowledged: result.acknowledged,
            insertedId: result.insertedId
        });
    } catch (error) {
        console.error("API Error inserting document:", error);
        res.status(500).json({ message: "Failed to insert document", error: error.message });
    }
}

async function createManyRecords(req, res) {
    try {
        const dbName = req.params.dbName;
        const collectionName = req.params.collectionName;

        const documents = req.body.documents;
        const insertOptions = req.body.options || {};

        if (!Array.isArray(documents)) {
            return res.status(400).json({ message: "Request body must contain a 'documents' Array" });
        }

        if (!req.mongoClient) throw new Error("Database client not found in request");
        if (!dbName) return res.status(400).json({ message: "dbName parameter required" });
        if (!collectionName) return res.status(400).json({ message: "collectionName parameter required" });
        if (typeof document !== 'object' || document === null) {
            return res.status(400).json({ message: "Request body must be a valid document object." });
        }

        const db = req.mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.insertMany(documents, insertOptions);

        res.status(201).json({
            acknowledged: result.acknowledged,
            insertedCount: result.insertedCount,
            insertedIds: result.insertedIds
        });
    } catch (error) {
        console.error("API Error inserting multiple documents:", error);
        res.status(500).json({ message: "Failed to insert documents", error: error.message });
    }
};

export { createOneRecord, createManyRecords }
