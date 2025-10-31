import { hashFields, hashFieldsForMany } from "../auth/hash.js";
import Col from "../model/collection.js";
import DB from "../model/db.js";

async function createOneRecord(req, res) {
    try {
        const dbName = `${req.params.dbName}_${req.user.id}`;
        const collectionName = req.params.collectionName;
        const document = req.body;

        if (typeof document !== 'object' || document === null) {
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

        const finalDoc = await hashFields(document, colWithSchema)//does hashing if schema had hash true

        const db = req.mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(finalDoc);

        res.status(201).json({
            acknowledged: result.acknowledged,
            insertedId: result.insertedId
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Duplicate key error: this data already exists." });
        }

        if (error.code === 121) {
            return res.status(400).json({ message: "Document failed validation: missing or invalid fields." });
        }
        console.error("API Error inserting document:", error);
        res.status(500).json({ message: "Failed to insert document", error: error.message });
    }
}

async function createManyRecords(req, res) {
    try {
        const dbName = `${req.params.dbName}_${req.user.id}`;
        const collectionName = req.params.collectionName;

        const documents = req.body.documents;
        const insertOptions = req.body.options || {};

        if (!Array.isArray(documents)) {
            return res.status(400).json({ message: "Request body must contain a 'documents' Array" });
        }

        if (typeof documents !== 'object' || documents === null) {
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
        //till here (caching) will apply soon (same in every place)

        //cache the schema
        const finalDoc = await hashFieldsForMany(documents, colWithSchema);

        const db = req.mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.insertMany(finalDoc, insertOptions);

        res.status(201).json({
            acknowledged: result.acknowledged,
            insertedCount: result.insertedCount,
            insertedIds: result.insertedIds
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Duplicate key error: this data already exists." });
        }

        if (error.code === 121) {
            return res.status(400).json({ message: "Document failed validation: missing or invalid fields." });
        }
        console.error("API Error inserting multiple documents:", error);
        res.status(500).json({ message: "Failed to insert documents", error: error.message });
    }
};

export { createOneRecord, createManyRecords }
