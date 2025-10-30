import { Router } from "express";
import { createOneRecord } from "../controller/create.js";

const router = Router();

router.post("/one/operation/:dbName/:collectionName",createOneRecord);

export default router;