import { Router } from "express";
import { updateOne } from "../controller/update.js";

const router = Router();

router.post("/one/operation/:dbName/:collectionName",updateOne);

export default router;