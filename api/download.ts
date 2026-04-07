import express from "express";

const app = express();
app.use(express.json());

// Denenecek güvenilir sunucu listesi
const MIRRORS = [
  "https://api.cobalt.tools/api/json",
  "https://cobalt.api.destruct.top/api/json",
  "https://api.cobalt.red/api/json"
];

app.post("/api/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL gerekli" });

  // Sunucuları sırayla dene
  for (const mirror of MIRRORS) {
    try {
      console.log(`Deneniyor: ${mirror}`);
      const response = await fetch(mirror, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: url,
          vCodec: "h264",
          vQuality: "720",
          isNoTTWatermark: true
        }),
        // 8 saniye içinde cevap gelmezse iptal et (Vercel timeout'a girmeden diğerini denesin)
        signal: AbortSignal.timeout(8000) 
      });

      if (response.ok) {
        const data = await response.json();
        return res.json(data); // Başarılıysa sonucu dön ve döngüden çık
      }
    } catch (err: any) {
      console.error(`${mirror} hatası:`, err.message);
      // Bu ayna çalışmadıysa döngü devam edecek ve bir sonrakini deneyecek
    }
  }

  // Eğer hiçbir sunucu çalışmazsa hata dön
  res.status(503).json({ error: "Şu an tüm indirme sunucuları yoğun. Lütfen birkaç dakika sonra tekrar deneyin." });
});

export default app;
