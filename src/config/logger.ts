import pino from "pino";
import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const fileStream = pino.destination({
    dest: "./logs/app.log",
    sync: false,
});

export const logger = pino(
    {
        level: "info",
        timestamp: pino.stdTimeFunctions.isoTime,
    },
    fileStream
);