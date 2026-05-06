import { Router } from "express";
import { refresh, logout } from "./auth.controller";

const router = Router();

router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;