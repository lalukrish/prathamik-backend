import dotenv from "dotenv";

dotenv.config();

import "./queues/application.worker";
import "./modules/question-bank/questionBank.worker";
import "./queues/interview-expire.processor";
import "./queues/job-expire.processor";
import { registerJobExpireJob } from "./queues/job-expire.scheduler";
import { registerInterviewExpireJob } from "./queues/interview-expire.scheduler";

(async () => {
    await registerInterviewExpireJob();
    await registerJobExpireJob();
})();

console.log("🚀 Worker Running");
