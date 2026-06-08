import dotenv from "dotenv";

dotenv.config();

import "./queues/application.worker";
import "./modules/question-bank/questionBank.worker";
import "./queues/interview-expire.processor";
import "./queues/job-expire.processor";
import "./modules/interviews/interview-evaluation.worker";
import { registerJobExpireJob } from "./queues/job-expire.scheduler";
import { registerInterviewExpireJob } from "./queues/interview-expire.scheduler";

(async () => {
    await registerInterviewExpireJob();
    await registerJobExpireJob();
})();

console.log("🚀 Worker Running");
