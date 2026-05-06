import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.get("/get-single-user/:id", userController.getSingleUserById);
router.post("/create-user", userController.createUser);

export default router;
