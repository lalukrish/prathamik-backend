import { Request, Response } from "express";
import { PublicService } from "./public.service";
import { ApplyJobDTO } from "./public.types";

const publicService = new PublicService();

export class PublicController {}
