import express from "express";

const app = express();
app.use(express.json());

// API route
app.post("/api/download", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL gerekli" });

    const response = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: url,
        vCodec: "h264",
        vQuality: "720",
        aFormat: "mp3",
        isNoTTWatermark: true
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ÇOK ÖNEMLİ: Vercel için app'i dışa aktarıyoruz
export default app;
