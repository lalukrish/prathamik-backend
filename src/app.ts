import express from "express";
import routes from "./routes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("HAi Backend Running 🚀");
});

app.use("/api", routes);

export default app;
