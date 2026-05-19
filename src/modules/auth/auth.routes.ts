import { Router } from "express";
import { authController } from "./auth.controller";
import { userController } from "../users/user.controller";

const router = Router();

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/register", authController.register);
router.put("/change-password/:id", authController.changePassword);
router.post("/signup", userController.createUser);

export default router;
