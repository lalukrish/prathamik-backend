import { z } from "zod";

export const createJobSchema = z.object({
    body: z.object({
        title: z
            .string({
                required_error: "Job title is required",
            })
            .min(2, "Job title must be at least 2 characters")
            .max(150, "Job title cannot exceed 150 characters"),

        jdHtml: z
            .string({
                required_error: "Job description is required",
            })
            .min(10, "Job description must be at least 10 characters"),

        requiredSkills: z
            .array(z.string())
            .default([]),

        niceToHave: z
            .array(z.string())
            .default([]),

        experienceMin: z
            .number({
                invalid_type_error:
                    "Minimum experience must be a number",
            })
            .min(0, "Minimum experience cannot be negative")
            .optional(),

        experienceMax: z
            .number({
                invalid_type_error:
                    "Maximum experience must be a number",
            })
            .min(0, "Maximum experience cannot be negative")
            .optional(),
    }),
});

export const updateJobSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(2, "Job title must be at least 2 characters")
            .max(150, "Job title cannot exceed 150 characters")
            .optional(),

        jdHtml: z
            .string()
            .min(10, "Job description must be at least 10 characters")
            .optional(),

        requiredSkills: z
            .array(z.string())
            .optional(),

        niceToHave: z
            .array(z.string())
            .optional(),

        experienceMin: z
            .number({
                invalid_type_error:
                    "Minimum experience must be a number",
            })
            .min(0, "Minimum experience cannot be negative")
            .optional(),

        experienceMax: z
            .number({
                invalid_type_error:
                    "Maximum experience must be a number",
            })
            .min(0, "Maximum experience cannot be negative")
            .optional(),
    }),

    params: z.object({
        id: z.string().uuid("Invalid job ID"),
    }),
});