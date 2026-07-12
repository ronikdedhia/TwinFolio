import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Twinfolio backend listening on port ${PORT}`);
});
