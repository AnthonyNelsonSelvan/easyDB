import { Router } from "express";
import { readManyRecord, readOneRecord } from "../controller/read.js";

const router = Router();

router.post("/one/operation/:dbName/:collectionName",readOneRecord);

router.post("/many/operation/:dbName/:collectionName",readManyRecord);

export default router;