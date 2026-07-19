import { useEffect, useState } from "react";
import { queueScan, removeQueuedScan, takeQueuedScans } from "./offlineQueue";

const copy = {
  en: {
    app: "Fasal Doctor Ji",
    scan: "Scan crop",
    history: "History",
    settings: "Settings",
    homeTitle: "What is troubling your crop?",
    homeSub: "Take one clear photo of the affected leaf or stem.",
    takePhoto: "Take a photo",
    upload: "Choose from gallery",
    crop: "Crop",
    region: "Your state",
    stage: "Crop stage",
    scanNow: "Check my crop",
    checking: "Checking your crop…",
    tips: "For a better result",
    tip1: "Photograph one affected leaf in daylight",
    tip2: "Keep the leaf clear and in focus",
    tip3: "Avoid shadows and blurry photos",
    result: "Scan result",
    confidence: "AI confidence",
    viewPlan: "View treatment plan",
    scanAnother: "Scan another crop",
    likely: "Likely diagnosis",
    prevention: "Prevent it next time",
    organic: "Organic",
    chemical: "Chemical",
    treatment: "Treatment plan",
    steps: "What to do now",
    safety: "Safety note",
    listen: "Listen",
    stop: "Stop",
    saved: "Saved to your history",
    noHistory: "No scans yet",
    noHistorySub: "Your saved crop checks will appear here.",
    scanFirst: "Scan your first crop",
    language: "Language",
    offline:
      "You are offline. Your photo will be ready to retry when you reconnect.",
    demo: "Demo guidance",
    formCrop: "Tomato",
    formRegion: "Maharashtra",
    formStage: "Flowering",
    retry: "Try again",
    error:
      "We could not check this photo. Please try again with a clear photo of one leaf.",
    queued: "Photo saved safely. We will check it when you reconnect.",
    lowConfidenceMessage:
      "We couldn't confidently identify this. Try a clearer, closer photo of the affected leaf/stem, or check with a local agricultural expert.",
  },
  hi: {
    app: "फसल डॉक्टर जी",
    scan: "फसल जाँचें",
    history: "इतिहास",
    settings: "सेटिंग्स",
    homeTitle: "आपकी फसल को क्या परेशानी है?",
    homeSub: "प्रभावित पत्ती या तने की एक साफ़ फोटो लें।",
    takePhoto: "फोटो लें",
    upload: "गैलरी से चुनें",
    crop: "फसल",
    region: "आपका राज्य",
    stage: "फसल की अवस्था",
    scanNow: "मेरी फसल जाँचें",
    checking: "आपकी फसल की जाँच हो रही है…",
    tips: "बेहतर परिणाम के लिए",
    tip1: "दिन की रोशनी में एक प्रभावित पत्ती की फोटो लें",
    tip2: "पत्ती साफ़ और फोकस में रखें",
    tip3: "छाया और धुंधली फोटो से बचें",
    result: "जाँच परिणाम",
    confidence: "AI का भरोसा",
    viewPlan: "इलाज का तरीका देखें",
    scanAnother: "दूसरी फसल जाँचें",
    likely: "संभावित रोग",
    prevention: "अगली बार बचाव",
    organic: "जैविक",
    chemical: "रासायनिक",
    treatment: "इलाज का तरीका",
    steps: "अब क्या करें",
    safety: "सुरक्षा सलाह",
    listen: "सुनें",
    stop: "रोकें",
    saved: "आपके इतिहास में सेव हो गया",
    noHistory: "अभी कोई जाँच नहीं",
    noHistorySub: "आपकी सेव की हुई फसल जाँच यहाँ दिखाई देगी।",
    scanFirst: "पहली फसल जाँचें",
    language: "भाषा",
    offline: "आप ऑफलाइन हैं। कनेक्ट होने पर फोटो फिर से भेजी जाएगी।",
    demo: "डेमो सलाह",
    formCrop: "टमाटर",
    formRegion: "महाराष्ट्र",
    formStage: "फूल आने का समय",
    retry: "फिर कोशिश करें",
    error:
      "यह फोटो जाँची नहीं जा सकी। एक पत्ती की साफ़ फोटो लेकर फिर कोशिश करें।",
    queued: "फोटो सुरक्षित सेव हो गई है। इंटरनेट आने पर इसकी जाँच होगी।",
    lowConfidenceMessage:
      "हमें विश्वसनीय पहचान नहीं मिली। कृपया पत्ती/तने की साफ फोटो लें या किसी कृषि विशेषज्ञ से सलाह लें।",
  },
};

const states = [
  "Maharashtra",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Rajasthan",
  "Punjab",
  "Karnataka",
  "Bihar",
];
const crops = [
  "Tomato",
  "Potato",
  "Rice",
  "Wheat",
  "Cotton",
  "Chilli",
  "Mango",
];
const stages = [
  "Seedling",
  "Vegetative",
  "Flowering",
  "Fruiting",
  "Harvest ready",
];
const apiUrl = (path) => `${import.meta.env.VITE_API_URL || ""}${path}`;
const initialHistory = () =>
  JSON.parse(localStorage.getItem("fasal-history") || "[]");
const makeThumbnail = (file) =>
  new Promise((resolve) => {
    const source = URL.createObjectURL(file),
      image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 360 / image.width);
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      canvas
        .getContext("2d")
        .drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(source);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => resolve(source);
    image.src = source;
  });

function LeafLogo() {
  return <div className="leaf-logo">⌁</div>;
}
function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`button ${variant}`} {...props}>
      {children}
    </button>
  );
}
export default function App() {
  const [lang, setLang] = useState(localStorage.getItem("fasal-lang") || "en");
  const [screen, setScreen] = useState("scan");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({
    crop: "Tomato",
    region: "Maharashtra",
    stage: "Flowering",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const [history, setHistory] = useState(initialHistory);
  const [online, setOnline] = useState(navigator.onLine);
  const t = copy[lang];

  useEffect(() => {
    localStorage.setItem("fasal-lang", lang);
  }, [lang]);
  useEffect(() => {
    const yes = () => setOnline(true),
      no = () => setOnline(false);
    addEventListener("online", yes);
    addEventListener("offline", no);
    return () => {
      removeEventListener("online", yes);
      removeEventListener("offline", no);
    };
  }, []);
  useEffect(() => {
    if (!online) return;
    const uploadQueued = async () => {
      const scans = await takeQueuedScans();
      for (const queued of scans) {
        try {
          const body = new FormData();
          body.append("image", queued.file);
          Object.entries(queued.meta).forEach(([key, value]) =>
            body.append(key, value),
          );
          body.append("language", lang);
          const response = await fetch(apiUrl("/api/diagnose"), {
            method: "POST",
            body,
          });
          if (!response.ok) continue;
          const result = await response.json();
          saveHistory({
            id: Date.now(),
            date: new Date().toLocaleDateString(
              lang === "hi" ? "hi-IN" : "en-IN",
              { day: "numeric", month: "short" },
            ),
            image: await makeThumbnail(queued.file),
            ...result,
          });
          await removeQueuedScan(queued.id);
        } catch {
          /* Leave the scan queued until the next connection. */
        }
      }
    };
    uploadQueued();
  }, [online]);

  const onImage = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setImage(URL.createObjectURL(selected));
    setError("");
  };
  const updateMeta = (key, value) =>
    setMeta((current) => ({ ...current, [key]: value }));
  const saveHistory = (entry) => {
    const next = [entry, ...history].slice(0, 12);
    setHistory(next);
    localStorage.setItem("fasal-history", JSON.stringify(next));
  };
  const diagnose = async () => {
    if (!file) return setError(t.error);
    if (!online) {
      await queueScan({ file, meta, createdAt: Date.now() });
      return setError(t.queued);
    }
    setLoading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      Object.entries(meta).forEach(([key, value]) => body.append(key, value));
      body.append("language", lang);
      const response = await fetch(apiUrl("/api/diagnose"), {
        method: "POST",
        body,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Request failed");
      }
      const result = await response.json();
      const entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
          day: "numeric",
          month: "short",
        }),
        image,
        ...result,
      };
      setDiagnosis(entry);
      if (!result.lowConfidence) {
        saveHistory({ ...entry, image: await makeThumbnail(file) });
      }
      setScreen("result");
    } catch (requestError) {
      setError(requestError.message || t.error);
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    setImage(null);
    setFile(null);
    setDiagnosis(null);
    setError("");
    setScreen("scan");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={reset} aria-label={t.app}>
          <LeafLogo />
          <span>{t.app}</span>
        </button>
        <div className="header-actions">
          <span className={`network ${online ? "online" : ""}`}>
            {online ? "●" : "○"} {online ? "Online" : "Offline"}
          </span>
          <button
            className="language"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
          >
            {lang === "en" ? "हिं" : "EN"}
          </button>
        </div>
      </header>
      {!online && <div className="offline-note">◌ {t.offline}</div>}
      <section className="page">
        {screen === "scan" && (
          <Scan
            {...{
              t,
              image,
              meta,
              error,
              loading,
              onImage,
              updateMeta,
              diagnose,
            }}
          />
        )}
        {screen === "result" && diagnosis && (
          <Result {...{ t, diagnosis, setScreen, reset }} />
        )}
        {screen === "treatment" && diagnosis && (
          <Treatment {...{ t, diagnosis }} />
        )}
        {screen === "history" && (
          <History {...{ t, history, setDiagnosis, setScreen, reset }} />
        )}
        {screen === "settings" && <Settings {...{ t, lang, setLang }} />}
      </section>
      <nav className="bottom-nav">
        <Nav
          icon="⌁"
          label={t.scan}
          active={screen === "scan"}
          onClick={() => setScreen("scan")}
        />
        <Nav
          icon="◷"
          label={t.history}
          active={screen === "history"}
          onClick={() => setScreen("history")}
        />
        <Nav
          icon="⚙"
          label={t.settings}
          active={screen === "settings"}
          onClick={() => setScreen("settings")}
        />
      </nav>
    </main>
  );
}

function Nav({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={active ? "nav-active" : ""}>
      <span>{icon}</span>
      {label}
    </button>
  );
}
function Scan({
  t,
  image,
  meta,
  error,
  loading,
  onImage,
  updateMeta,
  diagnose,
}) {
  return (
    <div className="scan-page">
      <div className="hero">
        <p className="eyebrow">AI CROP CARE</p>
        <h1>{t.homeTitle}</h1>
        <p>{t.homeSub}</p>
      </div>
      <div className="capture-card">
        {image ? (
          <img className="preview" src={image} alt="Selected crop leaf" />
        ) : (
          <div className="image-placeholder">
            <span>⌁</span>
            <strong>{t.takePhoto}</strong>
            <small>JPG, PNG · up to 8 MB</small>
          </div>
        )}
        <div className="capture-actions">
          <label className="button primary">
            ▣ {t.takePhoto}
            <input
              hidden
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onImage}
            />
          </label>
          <label className="button secondary">
            ▤ {t.upload}
            <input hidden type="file" accept="image/*" onChange={onImage} />
          </label>
        </div>
      </div>
      <div className="form-card">
        <Select
          label={t.crop}
          value={meta.crop}
          items={crops}
          change={(value) => updateMeta("crop", value)}
        />
        <Select
          label={t.region}
          value={meta.region}
          items={states}
          change={(value) => updateMeta("region", value)}
        />
        <Select
          label={t.stage}
          value={meta.stage}
          items={stages}
          change={(value) => updateMeta("stage", value)}
        />
      </div>
      {error && <div className="error-message">⚠ {error}</div>}
      <Button onClick={diagnose} disabled={loading}>
        {loading ? <>◌ {t.checking}</> : <>⌁ {t.scanNow}</>}
      </Button>
      <div className="tip-card">
        <h2>✦ {t.tips}</h2>
        <p>1. {t.tip1}</p>
        <p>2. {t.tip2}</p>
        <p>3. {t.tip3}</p>
      </div>
    </div>
  );
}
function Select({ label, value, items, change }) {
  return (
    <label className="select-label">
      <span>{label}</span>
      <select value={value} onChange={(e) => change(e.target.value)}>
        {items.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}
function Result({ t, diagnosis, setScreen, reset }) {
  if (diagnosis.lowConfidence) {
    return (
      <div className="result-page">
        <p className="eyebrow">{t.result}</p>
        <div className="result-photo">
          <img src={diagnosis.image} alt="Scanned crop" />
        </div>
        <div className="diagnosis-card">
          <div className="confidence">
            <div>
              <span>{t.confidence}</span>
              <strong>{diagnosis.confidence}%</strong>
            </div>
            <div className="meter">
              <i style={{ width: `${diagnosis.confidence}%` }} />
            </div>
          </div>
          <p className="low-confidence-message">⚠ {t.lowConfidenceMessage}</p>
        </div>
        <Button onClick={reset}>{t.retry}</Button>
      </div>
    );
  }
  return (
    <div className="result-page">
      <p className="eyebrow">{t.result}</p>
      <div className="result-photo">
        <img src={diagnosis.image} alt="Scanned crop" />
        <span className="success-badge">✓ {t.saved}</span>
      </div>
      <div className="diagnosis-card">
        <div className="confidence">
          <div>
            <span>{t.confidence}</span>
            <strong>{diagnosis.confidence}%</strong>
          </div>
          <div className="meter">
            <i style={{ width: `${diagnosis.confidence}%` }} />
          </div>
        </div>
        <h1>{diagnosis.disease}</h1>
        <em>{diagnosis.scientificName}</em>
        <p>{diagnosis.summary}</p>
        <div className="meta-row">
          <span>🌱 {diagnosis.crop}</span>
          <span>⌖ {diagnosis.region}</span>
          <span>◒ {diagnosis.stage}</span>
        </div>
      </div>
      <Button onClick={() => setScreen("treatment")}>{t.viewPlan} →</Button>
      <Button variant="ghost" onClick={reset}>
        {t.scanAnother}
      </Button>
    </div>
  );
}
function Treatment({ t, diagnosis }) {
  const [mode, setMode] = useState("organic");
  const [speaking, setSpeaking] = useState(false);
  const steps = diagnosis[mode];
  const speak = () => {
    if (speaking) {
      speechSynthesis.cancel();
      return setSpeaking(false);
    }
    const speech = new SpeechSynthesisUtterance(
      `${diagnosis.disease}. ${steps.join(". ")}. ${diagnosis.caution}`,
    );
    speech.lang = "en-IN";
    speech.onend = () => setSpeaking(false);
    speechSynthesis.speak(speech);
    setSpeaking(true);
  };
  return (
    <div className="treatment-page">
      <p className="eyebrow">{t.treatment}</p>
      <div className="treatment-head">
        <div>
          <h1>{diagnosis.disease}</h1>
          <p>
            {diagnosis.crop} · {diagnosis.stage}
          </p>
        </div>
        <button className="listen" onClick={speak}>
          ♬ {speaking ? t.stop : t.listen}
        </button>
      </div>
      <div className="toggle">
        <button
          className={mode === "organic" ? "selected" : ""}
          onClick={() => setMode("organic")}
        >
          ✦ {t.organic}
        </button>
        <button
          className={mode === "chemical" ? "selected" : ""}
          onClick={() => setMode("chemical")}
        >
          ◈ {t.chemical}
        </button>
      </div>
      <section className="plan-card">
        <h2>{t.steps}</h2>
        <ol>
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <section className="prevention-card">
        <h2>☂ {t.prevention}</h2>
        {diagnosis.prevention.map((item) => (
          <p key={item}>✓ {item}</p>
        ))}
      </section>
      <section className="caution">
        <strong>⚠ {t.safety}</strong>
        <p>{diagnosis.caution}</p>
      </section>
    </div>
  );
}
function History({ t, history, setDiagnosis, setScreen, reset }) {
  return (
    <div className="history-page">
      <p className="eyebrow">YOUR SCANS</p>
      <h1>{t.history}</h1>
      {history.length === 0 ? (
        <div className="empty">
          <span>⌁</span>
          <h2>{t.noHistory}</h2>
          <p>{t.noHistorySub}</p>
          <Button onClick={reset}>{t.scanFirst}</Button>
        </div>
      ) : (
        <div className="history-list">
          {history.map((entry) => (
            <button
              key={entry.id}
              className="history-item"
              onClick={() => {
                setDiagnosis(entry);
                setScreen("result");
              }}
            >
              <img src={entry.image} alt="Crop scan" />
              <div>
                <strong>{entry.disease}</strong>
                <span>
                  {entry.crop} · {entry.date}
                </span>
                <small>
                  {entry.confidence}% {t.confidence}
                </small>
              </div>
              <b>›</b>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function Settings({ t, lang, setLang }) {
  return (
    <div className="settings-page">
      <p className="eyebrow">PREFERENCES</p>
      <h1>{t.settings}</h1>
      <div className="settings-card">
        <div>
          <strong>{t.language}</strong>
          <span>English / हिन्दी</span>
        </div>
        <div className="language-switch">
          <button
            className={lang === "en" ? "chosen" : ""}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <button
            className={lang === "hi" ? "chosen" : ""}
            onClick={() => setLang("hi")}
          >
            हिं
          </button>
        </div>
      </div>
      <div className="about-card">
        <span>⌁</span>
        <div>
          <strong>{t.app}</strong>
          <p>Simple crop advice, designed for farmers.</p>
          <small>Version 0.1 · Demo build</small>
        </div>
      </div>
    </div>
  );
}
