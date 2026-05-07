import "dotenv/config";
import express from "express";
import routes from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("HAi Backend Running 🚀");
});

app.use("/api", routes);

app.use(errorMiddleware);
export default app;
