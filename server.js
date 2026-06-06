const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/outfits", async (req, res) => {
  const { occasion, vibe, budget, platform, gender } = req.body;

  const prompt = `You are Drip, a top Indian fashion stylist AI specializing in ${gender} fashion.

User details:
- Occasion: ${occasion}
- Vibe: ${vibe}
- Budget: ₹${budget}
- Shopping platform: ${platform}
- Gender: ${gender}

Return ONLY a valid JSON object (no markdown, no backticks) like this:
{
  "outfits": [
    {
      "title": "Short evocative look name (3-4 words)",
      "mood": "One poetic sentence describing the vibe",
      "items": ["Specific item 1", "Specific item 2", "Specific item 3", "Accessory"],
      "price": "₹X,XXX",
      "best": true
    },
    {
      "title": "...",
      "mood": "...",
      "items": ["...", "...", "...", "..."],
      "price": "₹X,XXX",
      "best": false
    },
    {
      "title": "...",
      "mood": "...",
      "items": ["...", "...", "...", "..."],
      "price": "₹X,XXX",
      "best": false
    }
  ],
  "tip": "One specific, actionable styling tip for this occasion and vibe."
}

Rules:
- Exactly 3 outfits, one marked best:true
- Items must be searchable on ${platform} (be specific)
- All outfit prices must fit within ₹${budget} total
- Tip must be genuinely useful and specific`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content.map((b) => b.text || "").join("");
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Drip server running on port ${PORT}`));
