import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Volume2, Pause, Play, Loader2, Languages, AlertCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LANGUAGES = [
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

export default function VerdictAudioPlayer({ text, title = "Listen to Verdict" }) {
  const [lang, setLang] = useState("hi-IN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);
  const audioRef = useRef(null);

  // Revoke old blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When language changes, clear previously generated audio
  useEffect(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const generate = async () => {
    if (!text || !text.trim()) {
      setError("No verdict text available yet.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API}/sarvam/tts`, {
        text: text.slice(0, 15000), // safety cap ~15k chars
        language_code: lang,
      });
      // Convert base64 WAV to blob URL
      const byteChars = atob(data.audio_base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setChunkCount(data.chunk_count || 0);
      // Auto-play after a tick
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "TTS failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-[#0B192C] via-[#12223A] to-[#0B192C] border border-[#C5A059]/30 rounded-sm p-5 shadow-lg"
      data-testid="verdict-audio-player"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-[#C5A059]/15 border border-[#C5A059]/30 rounded-sm flex items-center justify-center">
          <Volume2 className="w-4 h-4 text-[#C5A059]" />
        </div>
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C5A059] font-semibold">Sarvam AI · Voice</p>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Hear the Council's verdict aloud in your preferred Indian language. Powered by Sarvam AI's Bulbul voice engine.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Languages className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/15 text-white text-sm rounded-sm focus:outline-none focus:border-[#C5A059]/60 appearance-none cursor-pointer"
            data-testid="tts-language-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-[#0B192C] text-white">
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading || !text}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#B8954F] text-white text-sm font-semibold rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          data-testid="tts-generate-button"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Synthesising...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              {audioUrl ? "Regenerate" : "Generate Audio"}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-sm px-3 py-2 mb-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {audioUrl && (
        <div className="bg-white/5 border border-white/10 rounded-sm p-3" data-testid="tts-audio-ready">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#C5A059] text-white flex items-center justify-center hover:bg-[#B8954F] transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="flex-1 h-10"
              data-testid="tts-audio-element"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
          {chunkCount > 1 && (
            <p className="text-[10px] text-slate-500 mt-2">
              Stitched from {chunkCount} synthesis chunks
            </p>
          )}
        </div>
      )}
    </div>
  );
}
