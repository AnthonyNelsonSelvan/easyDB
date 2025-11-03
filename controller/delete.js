import validateDbandCol from "../utils/validateQuery.js";
import gotDbAndCol from "../utils/dbAndCol.js";

async function deleteOne(req, res) {
    try {
        const dbName = `${req.params.dbName}_${req.user.id}`;
        const collectionName = req.params.collectionName;
        const query = req.body.query;
        const option = req.body.option || {};

        if (typeof query !== 'object' || query === null) {
            return res.status(400).json({ message: "Request body must be a valid document object." });
        }
        const dbAndCol = gotDbAndCol(dbName, collectionName);
        if (!dbAndCol.valid) return res.status(400).json({ message: dbAndCol.message });

        //needs caching right here
        const colWithSchema = await validateDbandCol(dbName, collectionName);
        if (!colWithSchema.valid) {
            return res.status(404).json({ message: colWithSchema.message })
        }
        //till here (caching) will apply soon

        const db = req.mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.deleteOne(query, option)

        res.status(200).json({
            acknowledged: result.acknowledged,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function deleteMany(req, res) {
    try {
        const dbName = `${req.params.dbName}_${req.user.id}`;
        const collectionName = req.params.collectionName;
        const query = req.body.query;
        const option = req.body.option || {};

        if (typeof query !== 'object' || query === null) {
            return res.status(400).json({ message: "Request body must be a valid document object." });
        }
        if (Object.keys(query).length === 0) {
            return res.status(400).json({ message: "Query cannot be empty for deleteMany." });
        }
        const dbAndCol = gotDbAndCol(dbName, collectionName);
        if (!dbAndCol.valid) return res.status(400).json({ message: dbAndCol.message });

        //needs caching right here
        const colWithSchema = await validateDbandCol(dbName, collectionName);
        if (!colWithSchema.valid) {
            return res.status(404).json({ message: colWithSchema.message })
        }
        //till here (caching) will apply soon

        const db = req.mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.deleteMany(query, option)

        res.status(200).json({
            acknowledged: result.acknowledged,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export { deleteOne, deleteMany };