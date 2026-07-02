import { Router } from "express";
import { publicController } from "./public.controller";

const router = Router();

router.get("/search", publicController.searchMockTestsPublic);

export default router;
