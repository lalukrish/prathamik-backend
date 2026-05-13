import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/register", authController.register);
router.put("/change-password/:id", authController.changePassword);

export default router;
