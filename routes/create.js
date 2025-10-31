import { Router } from "express";
import { createManyRecords, createOneRecord } from "../controller/create.js";

const router = Router();

router.post("/one/operation/:dbName/:collectionName",createOneRecord);

router.post("/many/operation/:dbName/:collectionName",createManyRecords);

export default router;