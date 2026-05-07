import { z } from "zod";

export const createJobSchema = z.object({
    title: z.string().min(2),

    jdHtml: z.string().min(10),

    requiredSkills: z.array(z.string()).default([]),
    niceToHave: z.array(z.string()).default([]),

    experienceMin: z.number().optional(),
    experienceMax: z.number().optional(),
});

export type CreateJobDTO = z.infer<typeof createJobSchema>;

export const updateJobSchema = createJobSchema.partial();

export type UpdateJobDTO = z.infer<typeof updateJobSchema>;