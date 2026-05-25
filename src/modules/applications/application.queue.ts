import { Queue } from "bullmq";

import { redisConnection } from "../../config/redis";

export const applicationQueue =
    new Queue(
        "application-processing",

        {
            connection:
                redisConnection,
        },
    );

// ============================================
// Add Application To Queue
// ============================================

export const addApplicationToQueue =
    async (
        applicationId: string,
    ) => {
        try {
            await applicationQueue.add(
                "process-application",

                {
                    applicationId,
                },

                {
                    // ============================================
                    // Prevent Duplicate Jobs
                    // ============================================

                    jobId:
                        applicationId,

                    // ============================================
                    // Cleanup
                    // ============================================

                    removeOnComplete: true,

                    removeOnFail: false,

                    // ============================================
                    // Retry Strategy
                    // ============================================

                    attempts: 3,

                    backoff: {
                        type: "exponential",

                        delay: 5000,
                    },
                },
            );

            console.log(
                `APPLICATION QUEUED: ${applicationId}`,
            );
        } catch (error) {
            console.error(
                "QUEUE ERROR:",
                error,
            );

            throw error;
        }
    };