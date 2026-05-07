import { Router } from "express";
import { userController } from "./user.controller";
import { validate } from "../../middlewares/validation.middleware";
import { createJobSchema } from "../jobs/job.validator";
import { createUserSchema, updateUserSchema } from "./user.validator";

const router = Router();

router.get("/get-single-user/:id", userController.getSingleUserById);
router.post(
  "/create-user",
  validate(createUserSchema),
  userController.createUser,
);
router.put(
  "/update-user/:id",
  validate(updateUserSchema),
  userController.updateUser,
);
router.put("/delete-user/:id", userController.softDeleteUser);
router.get("/get-all-user", userController.getAllUser);
export default router;
