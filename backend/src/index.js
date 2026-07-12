import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import simulateRouter from "./routes/simulate.js";
import chatRouter from "./routes/chat.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", simulateRouter);
app.use("/api", chatRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Twinfolio backend listening on port ${PORT}`);
});
