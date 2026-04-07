import express from "express";

const app = express();
app.use(express.json());

const MIRRORS = [
  "https://api.cobalt.tools/api/json",
  "https://cobalt.api.destruct.top/api/json",
  "https://api.cobalt.red/api/json"
];

app.post("/api/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL gerekli" });

  for (const mirror of MIRRORS) {
    try {
      const response = await fetch(mirror, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          // KENDİMİZİ GERÇEK BİR TARAYICI GİBİ TANITIYORUZ (ÖNEMLİ!)
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: JSON.stringify({
          url: url,
          vCodec: "h264",
          vQuality: "720",
          isNoTTWatermark: true
        }),
        signal: AbortSignal.timeout(10000) // 10 saniye bekle
      });

      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
    } catch (err: any) {
      console.error(`${mirror} hatası:`, err.message);
    }
  }

  res.status(503).json({ error: "İndirme sunucuları şu an yanıt vermiyor. Lütfen 1 dakika sonra tekrar deneyin." });
});

export default app;
