import { z } from "zod";

// =====================================================
// ENUMS
// =====================================================

export const questionTypeEnum = z.enum([
    "TEXT",
    "MULTIPLE_SELECT",
    "RADIO",
    "VOICE_SPEAK",
    "VOICE_TYPE",
]);

export const difficultyEnum = z.enum([
    "EASY",
    "MEDIUM",
    "HARD",
]);

// =====================================================
// CREATE QUESTION BANK
// =====================================================

export const createQuestionBankSchema =
    z.object({
        jobId: z.string().uuid().optional(),

        title: z.string().min(1),

        description:
            z.string().optional(),

        mode: z.enum([
            "MANUAL",
            "AI",
        ]),

        config: z
            .object({
                count: z
                    .number()
                    .min(1)
                    .max(20),

                difficulty:
                    difficultyEnum,

                types: z.array(
                    questionTypeEnum,
                ),
            })
            .optional(),
    });

// =====================================================
// QUESTION
// =====================================================

export const questionSchema =
    z.object({
        question: z.string().min(1),

        type: questionTypeEnum,

        difficulty:
            difficultyEnum,

        weight: z
            .number()
            .min(1)
            .max(100)
            .optional(),

        skillTags: z.array(
            z.string(),
        ),

        options: z
            .array(z.string())
            .optional(),

        audioUrl: z
            .string()
            .optional(),

        aiGenerated: z
            .boolean()
            .optional(),
    });

// =====================================================
// BULK QUESTIONS
// =====================================================

export const bulkQuestionSchema =
    z.object({
        questions: z.array(
            questionSchema,
        ),
    });

// =====================================================
// UPDATE BANK
// =====================================================

export const updateQuestionBankSchema =
    z.object({
        title: z
            .string()
            .optional(),

        description: z
            .string()
            .optional(),

        isActive: z
            .boolean()
            .optional(),
    });

// =====================================================
// UPDATE QUESTION
// =====================================================

export const updateQuestionSchema =
    questionSchema.partial();