<<<<<<< HEAD
import cookieParser from "cookie-parser";
=======
import "dotenv/config";
>>>>>>> 9c5a64070ae11a5aa41105734b24d020831c29b9
import express from "express";
import routes from "./routes";
import { logger } from "./utils/logger";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("HAi Backend Running 🚀");
});

app.use("/api", routes);

export default app;
