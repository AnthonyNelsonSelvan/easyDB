import validateDbandCol from "../utils/validateQuery.js";

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
        const colWithSchema = await validateDbandCol(dbName,collectionName);
        if(!colWithSchema.valid){
            return res.status(404).json({message : colWithSchema.message})
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
        const colWithSchema = await validateDbandCol(dbName,collectionName);
        if(!colWithSchema.valid){
            return res.status(404).json({message : colWithSchema.message})
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