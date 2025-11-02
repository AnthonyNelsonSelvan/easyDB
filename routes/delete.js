import { Router } from "express";
import { deleteMany, deleteOne } from "../controller/delete.js";

const router = Router();

router.post("/one/operation/:dbName/:collectionName", deleteOne);

router.post("/many/operation/:dbName/:collectionName", deleteMany);

export default router;