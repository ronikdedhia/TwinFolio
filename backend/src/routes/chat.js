import { Router } from "express";
import { handleChatTurn, NoProfileError } from "../services/chatService.js";

const router = Router();

// POST /api/chat — talk to the financial twin (requires auth; see middleware/auth.js)
router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message (string) is required" });
  }

  try {
    const reply = await handleChatTurn({ userId: req.userId, message });
    res.json({ reply });
  } catch (err) {
    if (err instanceof NoProfileError) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
