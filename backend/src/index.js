import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import simulateRouter from "./routes/simulate.js";
import chatRouter from "./routes/chat.js";
import riskProfileRouter from "./routes/riskProfile.js";

// .env lives at the repo root (twinfolio/.env), not inside backend/ — resolve
// relative to this file so it loads correctly regardless of which directory
// `npm run dev`/`node src/index.js` is invoked from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", simulateRouter);
app.use("/api", chatRouter);
app.use("/api", riskProfileRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Twinfolio backend listening on port ${PORT}`);
});
