import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { processExpiredInterviews } from "../modules/interviews/interview-expire.worker";

export const interviewExpireWorker = new Worker(
    "interview-expire",
    processExpiredInterviews,
    {
        connection: redisConnection,
    },

);



interviewExpireWorker.on("ready", () => {
    console.log("✅ Interview Expire Worker Ready");
});

interviewExpireWorker.on("completed", (job) => {
    console.log(`✅ Expire Job Completed: ${job?.id}`);
});

interviewExpireWorker.on("failed", (job, err) => {
    console.error(`❌ Expire Job Failed: ${job?.id}`, err);
});

interviewExpireWorker.on("error", (err) => {
    console.error("❌ Interview Expire Worker Error", err);
});
