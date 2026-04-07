import express from "express";

const app = express();
app.use(express.json());

// Genişletilmiş ve güncel ayna listesi
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

  console.log(`Gelen istek: ${url}`);

  for (const mirror of MIRRORS) {
    try {
      console.log(`Deneniyor: ${mirror}`);
      const response = await fetch(mirror, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          // Cloudflare'i aşmak için tarayıcı taklidi yapıyoruz
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
        // Her ayna için 10 saniye limit koyuyoruz
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Başarılı! Sunucu: ${mirror}`);
        return res.json(data);
      } else {
        const errorText = await response.text();
        console.error(`Sunucu Yanıtı Hatası [${mirror}]:`, errorText.substring(0, 100));
      }
    } catch (err: any) {
      console.error(`Bağlantı Hatası [${mirror}]:`, err.message);
    }
  }

  // Eğer hiçbir ayna cevap vermezse
  res.status(503).json({ 
    error: "Şu an tüm indirme sunucuları yoğun veya IP engeli var. Lütfen 1-2 dakika sonra tekrar deneyin." 
  });
});

// --- RENDER İÇİN PORT AYARI ---
// Render uygulamayı başlattığında bir PORT açmamızı bekler.
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Sunucu ${PORT} portunda başarıyla başlatıldı.`);
});

// SADECE BİR TANE EXPORT KALSIN:
export default app;
