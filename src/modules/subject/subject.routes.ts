import { Router } from "express";
import { subjectController } from "./subject.controller";
import {
  authMiddleware,
  roleMiddleware,
} from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  //   roleMiddleware("ADMIN"),
  subjectController.create,
);

router.get(
  "/",

  // authMiddleware,
  subjectController.getAll,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  subjectController.delete,
);

export default router;
