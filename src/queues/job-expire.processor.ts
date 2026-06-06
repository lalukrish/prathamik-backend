import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { processExpiredJobs } from "../modules/jobs/job-expire.worker";

export const jobExpireWorker = new Worker(
    "job-expire",
    async () => {
        await processExpiredJobs();
    },
    {
        connection: redisConnection,
    },
);

jobExpireWorker.on("ready", () => {
    console.log("✅ Job Expire Worker Ready");
});
