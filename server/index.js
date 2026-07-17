import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const treatments = {
  organic: [
    "Remove and bury heavily affected leaves away from the field.",
    "Spray neem oil (3 ml per litre of water) on both sides of leaves in the cool evening.",
    "Repeat after 7 days only if fresh spots appear. Do not spray before rain.",
  ],
  chemical: [
    "Remove severely affected leaves before spraying.",
    "Use a locally registered copper fungicide only at the label dose for your crop.",
    "Wear gloves and a mask. Observe the label’s harvest waiting period.",
  ],
};

function demoDiagnosis({
  crop = "Tomato",
  region = "Maharashtra",
  stage = "Flowering",
  language = "en",
}) {
  const result = {
    disease: "Early blight",
    scientificName: "Alternaria solani",
    confidence: 87,
    crop,
    region,
    stage,
    isDemo: true,
    summary: `The leaf pattern looks consistent with early blight in ${crop}. This fungal disease often spreads quickly in warm, humid weather.`,
    organic: treatments.organic,
    chemical: treatments.chemical,
    prevention: [
      "Keep leaves dry: water the soil near the roots in the morning.",
      "Remove crop debris after harvest; do not compost visibly diseased plants.",
      "Leave space between plants so air can move through the crop.",
      `For ${region}, check the forecast and avoid spraying before rain or strong wind.`,
    ],
    caution:
      "This is an AI screening result, not a laboratory test. If symptoms spread fast or confidence is below 70%, show the plant to a local agriculture officer.",
  };
  if (language !== "hi") return result;
  return {
    ...result,
    disease: "अगेती झुलसा (Early blight)",
    summary: `${crop} की पत्ती पर निशान अगेती झुलसा रोग से मिलते हैं। गर्म और नमी वाले मौसम में यह फफूंद तेजी से फैल सकती है।`,
    organic: [
      "बहुत प्रभावित पत्तियों को हटाकर खेत से दूर मिट्टी में दबा दें।",
      "शाम के समय पत्तियों के दोनों तरफ नीम तेल (3 मिली प्रति लीटर पानी) का छिड़काव करें।",
      "नए धब्बे दिखें तो 7 दिन बाद दोहराएँ। बारिश से पहले छिड़काव न करें।",
    ],
    chemical: [
      "बहुत प्रभावित पत्तियों को छिड़काव से पहले हटा दें।",
      "अपनी फसल के लिए पंजीकृत कॉपर फफूंदनाशक का स्थानीय लेबल पर दी गई मात्रा में ही प्रयोग करें।",
      "दस्ताने और मास्क पहनें। लेबल पर दिए फसल कटाई से पहले के इंतज़ार समय का पालन करें।",
    ],
    prevention: [
      "पत्तियों को सूखा रखें: सुबह जड़ों के पास मिट्टी में पानी दें।",
      "कटाई के बाद फसल का कचरा हटाएँ; रोगी पौधों को खाद में न डालें।",
      "पौधों के बीच हवा आने के लिए पर्याप्त जगह रखें।",
      `${region} में बारिश या तेज हवा से पहले छिड़काव न करें।`,
    ],
    caution:
      "यह AI द्वारा प्रारंभिक जाँच है, लैब रिपोर्ट नहीं। रोग तेजी से फैले या भरोसा 70% से कम हो तो स्थानीय कृषि अधिकारी से पौधा दिखाएँ।",
  };
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/diagnose", upload.single("image"), async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({
        error: "Please add a clear leaf or stem photo before scanning.",
      });
  const result = demoDiagnosis(req.body);
  // Integration boundary: replace the demo result with Kindwise vision output, then
  // pass diagnosis + crop/region/stage to an LLM for localized recommendations.
  res.json(result);
});

app.listen(port, () => console.log(`Fasal Doctor Ji API running on :${port}`));
