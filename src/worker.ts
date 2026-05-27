import dotenv from "dotenv";

dotenv.config();

import "./queues/application.worker";
import "./modules/question-bank/questionBank.worker";
console.log("🚀 AI Worker Running");
