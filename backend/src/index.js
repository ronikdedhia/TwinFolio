import "./env.js"; // must stay the first import — see env.js for why

import express from "express";
import cors from "cors";
import helmet from "helmet";
import simulateRouter from "./routes/simulate.js";
import chatRouter from "./routes/chat.js";
import riskProfileRouter from "./routes/riskProfile.js";
import profileRouter from "./routes/profile.js";
import nudgesRouter from "./routes/nudges.js";
import adminRouter from "./routes/admin.js";
import { withClerk, requireUser } from "./middleware/auth.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(withClerk);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Public utility calculators — not tied to a specific stored customer.
app.use("/api", simulateRouter);

// Everything below operates on "the logged-in customer" and requires auth.
app.use("/api", requireUser, profileRouter);
app.use("/api", requireUser, chatRouter);
app.use("/api", requireUser, riskProfileRouter);
app.use("/api", requireUser, nudgesRouter);
app.use("/api", requireUser, adminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Twinfolio backend listening on port ${PORT}`);
});
