import { Router } from "express";
import { updateMany, updateOne } from "../controller/update.js";

const router = Router();

router.post("/one/operation/:dbName/:collectionName",updateOne);

router.post("/many/operation/:dbName/:collectionName",updateMany);

export default router;