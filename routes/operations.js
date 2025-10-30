import { Router } from "express";
import { handleCollectionCreation, handleCreateDB, handleSchemaCreation } from "../controller/dbOperations.js";

const router = Router();

router.post("/create-db",handleCreateDB);

router.post("/create-collection/:dbName/:collectionName",handleCollectionCreation);

router.post("/collections/:collectionName/schema",handleSchemaCreation)//schema creation

export default router;


