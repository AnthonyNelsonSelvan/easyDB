function gotDbAndCol(dbName,collectionName) {
    if (!req.mongoClient) throw new Error("Database client not found in request");
    if (!dbName) return { message: "dbName parameter required", valid: false };
    if (!collectionName) return { message: "collectionName parameter required", valid: false };
    return {valid : true}
}

export default gotDbAndCol;