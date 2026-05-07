import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.get("/get-single-user/:id", userController.getSingleUserById);
router.post("/create-user", userController.createUser);
router.put("/update-user/:id", userController.updateUser);
router.put("/delete-user/:id", userController.softDeleteUser);

export default router;
