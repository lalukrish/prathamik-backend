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

    totalExperience: z.string().optional(),

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

export const cancelInterviewSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .trim()
      .min(10, "Reason must be at least 10 characters")
      .max(500, "Reason cannot exceed 500 characters"),
  }),

  params: z.object({
    token: z.string().min(1, "Interview token is required"),
  }),
});

export const submitInterviewAnswerSchema =
  z.object({
    params: z.object({
      token: z.string(),
    }),

    body: z.object({
      questionId: z.string().uuid(),
      answer: z.string().min(1).max(10000),
    }),
  });

export const interviewSecurityEventSchema =
  z.object({
    params: z.object({
      token: z.string(),
    }),

    body: z.object({
      type: z.enum([
        "TAB_SWITCH",
        "WINDOW_BLUR",
        "WINDOW_MINIMIZE",
        "FULLSCREEN_EXIT",
        "COPY_PASTE",
        "RIGHT_CLICK",
        "MULTIPLE_MONITORS",
        "DEVTOOLS_OPEN",
        "NETWORK_DISCONNECT",
        "LONG_INACTIVITY",
        "MULTIPLE_FACES",
        "VOICE_MISMATCH",
        "RAPID_ANSWERING",
        "SUSPICIOUS_TYPING",
      ]),

      metadata: z.record(z.any()).optional(),
    }),
  });


export const completeInterviewSchema =
  z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
  });