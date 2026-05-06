import { Router } from "express";
import { clearAuth, refresh,  } from "./auth.controller";

const router = Router();

router.post("/refresh", refresh);
router.post("/cleartoken", clearAuth);

export default router;