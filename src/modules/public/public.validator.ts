import { z } from "zod";

export const applyJobSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address."),

    phone: z.string().optional(),

    currentRole: z.string().optional(),

    totalExperience: z.string().transform(Number).optional(),

    skills: z.string().transform((value) => JSON.parse(value || "[]")),

    expectedSalary: z.string().transform(Number).optional(),

    currentCTC: z.string().transform(Number).optional(),

    noticePeriod: z.string().transform(Number).optional(),

    isOnNoticePeriod: z.string().transform((value) => value === "true"),

    linkedinUrl: z.string().optional(),
  }),

  params: z.object({
    jobId: z.string().uuid(),
  }),
});
