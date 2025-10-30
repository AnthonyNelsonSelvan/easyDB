import { Router } from "express";
import { handleLogin, handleSignUp } from "../controller/user.js";

const router = Router();

router.post("/auth/signup", handleSignUp);

router.post("/auth/login", handleLogin);

export default router;