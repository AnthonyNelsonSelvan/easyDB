import Col from "../model/collection.js";
import DB from "../model/db.js";
import Sch from "../model/schema.js";
import convertToMongoSchemaProperties from "../utils/schemaConvert.js";

async function handleCreateDB(req, res) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized or missing user info." });
    }
    const { dbName } = req.body;
    try {
        const validDBName = await DB.findOne({ dbName: `${dbName}_${req.user?.id}` });
        if (validDBName) {
            return res.status(409).json({ message: "DB name already exists." });
        }
        const duh = await DB.create({ dbName: `${dbName}_${req.user?.id}`, userId: req.user?.id });
        console.log(duh.dbName);
        return res.status(201).json({ message: "DB created Successfully" });
    } catch (err) {
        console.log("Error While creating DB : ", err);
        res.status(500).json({ message: "Unexpected error happened." });
    }
}

async function handleCollectionCreation(req, res) {//check for valid collection name.
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized or missing user info." });
    }
    const client = req.mongoClient;
    const dbName = req.params.dbName;
    const collectionName = req.params.collectionName;
    if (!dbName) return res.status(400).json({ message: 'dbName required' });
    if (!collectionName) return res.status(400).json({ message: 'collectionName required' });
    try {
        const dbInfo = await DB.findOne({ dbName: `${dbName}_${req.user?.id}` });
        if (!dbInfo) {
            return res.status(404).json({ message: "No such DB found." });
        }

        const db = client.db(dbInfo.dbName);

        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length > 0) {
            return res.status(409).json({ message: `Collection '${collectionName}' already exists.` });
        }

        await db.createCollection(collectionName)
        await Col.create({ collectionName: collectionName, dbId: dbInfo._id, });
        res.status(201).json({ message: `Collection '${collectionName}' created.` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create collection', details: err.message });
    }
}

async function handleSchemaCreation(req, res) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized or missing user info." });
    }
    const { collectionName } = req.params;
    const { schemaName, ownerInput, dbName } = req.body;

    if (!ownerInput) return res.status(400).json({ error: 'ownerInput schema definition required' });
    if (!collectionName) return res.status(400).json({ error: 'collectionName parameter required' });
    if (!dbName) return res.status(400).json({ error: 'dbName required' });

    const fulldbName = `${dbName}_${req.user?.id}`

    try {
        const dbInfo = await DB.findOne({ dbName: fulldbName });
        if (!dbInfo) return res.status(404).json({ message: "there is no such DB" });
        const colInfo = await Col.findOne({ collectionName: collectionName, dbId: dbInfo._id });
        if (!colInfo) return res.status(404).json({ message: "there is no such Collection." });

        const db = req.mongoClient.db(fulldbName);
        const collection = db.collection(collectionName);
        const collectionsList = await db.listCollections({ name: collectionName }).toArray();
        if (collectionsList.length === 0) {
            if (colInfo) {
                await Col.deleteOne({ collectionName: collectionName, dbId: dbInfo._id });
            }
            return res.status(404).json({ error: `Collection '${collectionName}' not found.` });
        }

        const schemaParts = convertToMongoSchemaProperties(ownerInput);

        const validator = {
            $jsonSchema: {
                bsonType: "object",
                required: schemaParts.required || [],
                properties: schemaParts.properties || {}
            }
        };

        await db.command({
            collMod: collectionName,
            validator: validator,
            validationLevel: "strict",
            validationAction: "error"
        });


        console.log(`Schema validation applied to ${collectionName}.`);

        const indexPromises = [];
        for (const fieldName of schemaParts.unique || []) {
            indexPromises.push(
                collection.createIndex({ [fieldName]: 1 }, { unique: true })
            );
        }
        for (const fieldName of schemaParts.nonUnique || []) {
            indexPromises.push(
                collection.createIndex({ [fieldName]: 1 })
            );
        }

        await Promise.allSettled(indexPromises);
        const schInfo = await Sch.create({ schemaName: schemaName, definition: ownerInput, ownerUserId: req.user.id })
        await Col.updateOne({ collectionName: collectionName, dbId: dbInfo._id }, { $set: { schemaDefinitionId: schInfo._id } });
        res.status(200).json({ message: `Schema applied to ${collectionName}` });
    } catch (err) {
        console.error(`Error in handleSchemaCreation for ${dbName}.${collectionName}:`, err);
        res.status(500).json({ message: 'Failed to apply schema', details: err.message });
    }
}

export { handleCreateDB, handleCollectionCreation, handleSchemaCreation }