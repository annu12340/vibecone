import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Mic, MicOff, Loader2, Languages, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LANGUAGES = [
  { code: "unknown", label: "Auto-detect language" },
  { code: "hi-IN", label: "हिन्दी · Hindi" },
  { code: "en-IN", label: "English (Indian)" },
  { code: "ta-IN", label: "தமிழ் · Tamil" },
  { code: "te-IN", label: "తెలుగు · Telugu" },
  { code: "bn-IN", label: "বাংলা · Bengali" },
  { code: "mr-IN", label: "मराठी · Marathi" },
  { code: "kn-IN", label: "ಕನ್ನಡ · Kannada" },
  { code: "gu-IN", label: "ગુજરાતી · Gujarati" },
  { code: "ml-IN", label: "മലയാളം · Malayalam" },
  { code: "od-IN", label: "ଓଡ଼ିଆ · Odia" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ · Punjabi" },
];

export default function VoiceNarrator({ onTranscript }) {
  const [lang, setLang] = useState("hi-IN");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [detectedLang, setDetectedLang] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startTimer = () => {
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        const base64 = typeof result === "string" ? result.split(",")[1] : "";
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const startRecording = async () => {
    setError(null);
    setTranscript("");
    setDetectedLang(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Pick a supported MIME type
      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
      const mimeType = candidates.find((t) => window.MediaRecorder && window.MediaRecorder.isTypeSupported(t)) || "";

      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stopTimer();
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        // Stop the mic stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (blob.size < 800) {
          setError("Recording too short. Please try again and speak for at least a second.");
          return;
        }
        await transcribeAudio(blob);
      };

      mr.start();
      setIsRecording(true);
      startTimer();
    } catch (e) {
      setError("Microphone access denied. Please enable microphone permissions in your browser.");
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const transcribeAudio = async (blob) => {
    setIsProcessing(true);
    try {
      const b64 = await blobToBase64(blob);
      const { data } = await axios.post(`${API}/sarvam/stt`, {
        audio_base64: b64,
        audio_mime_type: blob.type || "audio/webm",
        language_code: lang === "unknown" ? null : lang,
        translate_to_english: true,
      });
      setTranscript(data.transcript || "");
      setDetectedLang(data.detected_language);
      if (typeof onTranscript === "function") onTranscript(data.transcript || "", data.detected_language);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Transcription failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setTranscript("");
    setDetectedLang(null);
    setError(null);
  };

  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      className="bg-white border-2 border-[#C5A059]/30 rounded-sm p-5 shadow-md"
      data-testid="voice-narrator"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-sm flex items-center justify-center">
          <Mic className="w-4 h-4 text-[#C5A059]" />
        </div>
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C5A059] font-semibold">Sarvam AI · Voice</p>
          <h3 className="text-sm font-semibold text-[#0B192C]">Speak Your Case (Optional)</h3>
        </div>
      </div>
      <p className="text-xs text-slate-600 mb-4 leading-relaxed">
        Speak your narrative in Hindi or any Indian language. We'll transcribe and translate it to English, which you can add as extra context for the Council.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Languages className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={isRecording || isProcessing}
            className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 text-slate-900 text-sm rounded-sm focus:outline-none focus:border-[#C5A059] disabled:opacity-60"
            data-testid="stt-language-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={isProcessing}
            className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#B8954F] text-white text-sm font-semibold rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="stt-record-button"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Transcribing...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Recording
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 animate-pulse"
            data-testid="stt-stop-button"
          >
            <MicOff className="w-4 h-4" />
            Stop ({mmss(elapsed)})
          </button>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-xs text-red-600 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          Recording... speak clearly into your microphone
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-3">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {transcript && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-3" data-testid="stt-transcript-result">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-semibold text-emerald-900">
                Transcribed (translated to English)
                {detectedLang && detectedLang !== "unknown" && (
                  <span className="ml-2 text-[10px] text-emerald-700 font-normal">· detected: {detectedLang}</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={clear}
              className="text-slate-400 hover:text-red-600"
              title="Clear"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{transcript}</p>
        </div>
      )}
    </div>
  );
}
