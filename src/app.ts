import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("HAi Backend Running 🚀");
});

export default app;