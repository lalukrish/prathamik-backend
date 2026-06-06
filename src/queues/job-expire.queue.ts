import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const jobExpireQueue =
    new Queue(
        "job-expire",
        {
            connection:
                redisConnection,
        }
    );