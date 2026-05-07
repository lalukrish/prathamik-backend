import { z } from "zod";
import {
    createJobSchema,
    updateJobSchema,
} from "./job.validator";

export type CreateJobDTO =
    z.infer<typeof createJobSchema>["body"];

export type UpdateJobDTO =
    z.infer<typeof updateJobSchema>["body"];