import { z } from "zod";

import {
    createQuestionBankSchema,
    createQuestionSchema,
    aiGenerateQuestionsSchema,
    bulkCreateQuestionSchema,
} from "./questionBank.validator";

export type CreateQuestionBankDTO =
    z.infer<
        typeof createQuestionBankSchema
    >;

export type CreateQuestionDTO =
    z.infer<
        typeof createQuestionSchema
    >;

export type AIGenerateQuestionsDTO =
    z.infer<
        typeof aiGenerateQuestionsSchema
    >;

export type BulkCreateQuestionDTO =
    z.infer<
        typeof bulkCreateQuestionSchema
    >;