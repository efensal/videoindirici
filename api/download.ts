import express from "express";

const app = express();
app.use(express.json());

app.post("/api/download", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL gerekli" });

    // Ana sunucu yerine bu alternatif sunuculardan birini deneyelim
    // Alternatifler: 
    // 1. https://cobalt.api.destruct.top/api/json
    // 2. https://api.cobalt.red/api/json
    
    const response = await fetch("https://cobalt.api.destruct.top/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: url,
        vCodec: "h264",
        vQuality: "720",
        isNoTTWatermark: true,
        filenamePattern: "classic"
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.text || "API sunucusu yanıt vermedi.");
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Backend Hatası:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default app;
