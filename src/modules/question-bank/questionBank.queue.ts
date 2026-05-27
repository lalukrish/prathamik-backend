import { Queue } from "bullmq";

import { redisConnection } from "../../config/redis";

export const questionBankQueue =
    new Queue(
        "question-bank-ai",
        {
            connection: redisConnection,
        },
    );