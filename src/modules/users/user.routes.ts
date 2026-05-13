import { Router } from "express";
import { userController } from "./user.controller";
import { validate } from "../../middlewares/validation.middleware";
import { createJobSchema } from "../jobs/job.validator";
import { createUserSchema, updateUserSchema } from "./user.validator";

const router = Router();

router.get("/:id", userController.getSingleUserById);
// router.post("/signup", validate(createUserSchema), userController.createUser);
router.put("/:id", validate(updateUserSchema), userController.updateUser);
router.put("/delete-user/:id", userController.softDeleteUser);
router.get("/", userController.getAllUser);
export default router;
