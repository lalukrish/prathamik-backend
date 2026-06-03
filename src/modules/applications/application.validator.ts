import { z } from "zod";

export const changeApplicationStatusSchema = z.object({
    status: z.enum([
        "APPLIED",
        "SHORTLISTED",
        "INTERVIEW",
        "SELECTED",
        "REJECTED",
    ]),
});

export type ChangeApplicationStatusInput = z.infer<
    typeof changeApplicationStatusSchema
>;