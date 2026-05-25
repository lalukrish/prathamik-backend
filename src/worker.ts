import dotenv from "dotenv";

dotenv.config();

import "./queues/application.worker";

console.log("🚀 AI Worker Running");