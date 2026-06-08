import { Worker } from "bullmq";
import { evaluateInterview } from "./interview-evaluvation.ai";
import { redisConnection } from "../../config/redis";
export const interviewEvaluationWorker =
    new Worker(
        "interview-evaluation",
        async (job) => {
            const { interviewId } = job.data;

            await evaluateInterview(interviewId);
        },
        {
            connection: redisConnection,
            concurrency: 5,
        }
    );

interviewEvaluationWorker.on(
    "completed",
    (job) => {
        console.log(
            `✅ Interview Evaluation Completed: ${job.id}`
        );
    }
);

interviewEvaluationWorker.on(
    "failed",
    (job, error) => {
        console.error(
            `❌ Interview Evaluation Failed: ${job?.id}`,
            error
        );
    }
);