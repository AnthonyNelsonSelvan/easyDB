import { getMongoClient } from "../database.js";

function getClusterClient(req, res, next){
    try {
        req.mongoClient = getMongoClient();
        next();
    } catch (error) {
        console.error("Middleware DB Client Error:", error.message);
        res.status(503).json({ message: "Database service unavailable" });
    }
}

export default getClusterClient;