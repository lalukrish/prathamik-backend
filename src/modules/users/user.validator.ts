import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .superRefine((password, ctx) => {
        if (!/[A-Z]/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password must contain at least 1 uppercase letter",
          });
        }

        if (!/\d/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password must contain at least 1 number",
          });
        }

        if (!/[@$!%*?&]/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password must contain at least 1 special character",
          });
        }
      }),

    role: z.enum(["super_admin", "hr_manager", "recruiter"], {
      message: "Role is required",
    }),

    // optional because super_admin may not belong to org
    orgId: z.string().uuid("Invalid organization ID").optional(),

    // optional branch name
    branch_name: z.string().optional(),

    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // recruiter/hr must have organization
    if (
      (data.role === "recruiter" || data.role === "hr_manager") &&
      !data.orgId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["orgId"],
        message: "Organization is required",
      });
    }

    // if branch name sent, orgId must exist
    if (data.branch_name && !data.orgId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["branch_name"],
        message: "Organization is required for branch name",
      });
    }
  });

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),

    email: z.string().email("Invalid email address").optional(),

    role: z.enum(["super_admin", "hr_manager", "recruiter"]).optional(),

    isActive: z.boolean().optional(),
  }),

  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
});

export const softDeleteUserSchema = z.object({
  body: z.object({
    isActive: z.boolean().refine((val) => val !== undefined, {
      message: "isActive is required",
    }),
  }),

  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
});
