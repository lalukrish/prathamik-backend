// transaction.routes.ts
import { Router } from "express";
import { transactionController } from "./transaction.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/initiate", transactionController.initiate);
router.patch("/confirm/:transactionId", transactionController.confirmDummy);
router.get("/history", transactionController.getHistory);

export default router;
