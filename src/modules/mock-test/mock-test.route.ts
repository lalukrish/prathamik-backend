import { Router } from "express";
import { mockTestController } from "./mock-test.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  // roleMiddleware("ADMIN"),
  upload.single("thumbnail"),

  mockTestController.createMockTest,
);

router.get("/", authMiddleware, mockTestController.getAllMockTests);

router.get("/:id", authMiddleware, mockTestController.getMockTestById);

router.put(
  "/:id",
  authMiddleware,
  // roleMiddleware("ADMIN"),
  mockTestController.updateMockTest,
);

router.delete(
  "/:id",
  authMiddleware,
  // roleMiddleware("ADMIN"),
  mockTestController.deleteMockTest,
);

export default router;
