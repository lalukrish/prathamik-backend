import { Router } from "express";
import { PublicController } from "./public.controller";
import { validate } from "../../middlewares/validation.middleware";
import { applyJobSchema } from "./public.validator";
import { upload } from "../../middlewares/upload.middleware";
const router = Router();
const controller = new PublicController();
