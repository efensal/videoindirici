import express from "express";

const app = express();
app.use(express.json());

// Genişletilmiş ayna listesi
const MIRRORS = [
  "https://api.cobalt.tools/api/json",
  "https://cobalt.api.destruct.top/api/json",
  "https://api.cobalt.red/api/json",
  "https://cobalt-api.kwiateusz.pl/api/json",
  "https://api.cobalt.black/api/json"
];

app.post("/api/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL gerekli" });

  for (const mirror of MIRRORS) {
    try {
      console.log(`Deneniyor: ${mirror}`);
      const response = await fetch(mirror, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          // BURASI 2. ADIM: Kendimizi gerçek bir kullanıcı gibi tanıtıyoruz
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Origin": "https://cobalt.tools",
          "Referer": "https://cobalt.tools/"
        },
        body: JSON.stringify({
          url: url,
          vCodec: "h264",
          vQuality: "720",
          isNoTTWatermark: true,
          filenamePattern: "classic"
        }),
        signal: AbortSignal.timeout(10000) // Her ayna için 10 saniye bekle
      });

      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      } else {
        const errorText = await response.text();
        console.error(`Sunucu Yanıtı Hatası [${mirror}]:`, errorText);
      }
    } catch (err: any) {
      // Loglarda hatanın tam sebebini görmek için burası çok önemli
      console.error(`BAĞLANTI HATASI [${mirror}]:`, err.message);
    }
  }

  res.status(503).json({ 
    error: "Şu an tüm indirme sunucuları meşgul veya Vercel'i engelliyor. Lütfen 1-2 dakika sonra tekrar deneyin." 
  });
});

export default app;
