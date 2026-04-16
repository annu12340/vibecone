"""
Sarvam AI Integration Service
Provides Text-to-Speech (TTS) and Speech-to-Text (STT) capabilities
for 11 Indian languages using Sarvam AI's Bulbul and Saaras models.
"""
import os
import io
import base64
import logging
from typing import List, Optional

import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

SARVAM_BASE_URL = "https://api.sarvam.ai"


def _get_api_key() -> str:
    """Read API key at call-time so dotenv load order doesn't matter."""
    return os.environ.get("SARVAM_API_SUBSCRIPTION_KEY", "").strip()

# Supported languages for both TTS and STT
SUPPORTED_LANGUAGES = {
    "hi-IN": "Hindi",
    "ta-IN": "Tamil",
    "te-IN": "Telugu",
    "bn-IN": "Bengali",
    "mr-IN": "Marathi",
    "kn-IN": "Kannada",
    "gu-IN": "Gujarati",
    "ml-IN": "Malayalam",
    "od-IN": "Odia",
    "pa-IN": "Punjabi",
    "en-IN": "English (Indian)",
}

# TTS constraints
TTS_MAX_CHARS_PER_CHUNK = 450  # Conservative — Bulbul v2 limit is 500
TTS_DEFAULT_SPEAKER = "anushka"  # Bulbul v2 female voice (available for all langs)
TTS_MODEL = "bulbul:v2"

# STT constraints
STT_MODEL = "saarika:v2.5"

sarvam_router = APIRouter(prefix="/sarvam", tags=["sarvam-ai"])


# ============================================================
# Schemas
# ============================================================
class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to convert to speech")
    language_code: str = Field(default="hi-IN", description="BCP-47 code, e.g. hi-IN")
    speaker: Optional[str] = Field(default=TTS_DEFAULT_SPEAKER)
    pace: float = Field(default=1.0, ge=0.5, le=2.0)


class TTSResponse(BaseModel):
    audio_base64: str
    language_code: str
    audio_format: str = "wav"
    chunk_count: int


class STTRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64-encoded audio (webm/wav/mp3)")
    language_code: Optional[str] = Field(default=None, description="Source lang, e.g. hi-IN. Omit for auto-detect.")
    translate_to_english: bool = Field(default=True, description="If true, translate to English")
    audio_mime_type: Optional[str] = Field(default="audio/webm")


class STTResponse(BaseModel):
    transcript: str
    detected_language: Optional[str] = None
    translated: bool
    mode: str


# ============================================================
# Helpers
# ============================================================
def _chunk_text(text: str, max_len: int = TTS_MAX_CHARS_PER_CHUNK) -> List[str]:
    """Split text into chunks of <= max_len, preferring sentence boundaries."""
    text = text.strip()
    if len(text) <= max_len:
        return [text]

    # Split at sentence boundaries first
    import re
    sentences = re.split(r"(?<=[.!?।])\s+", text)
    chunks: List[str] = []
    current = ""

    for s in sentences:
        if not s:
            continue
        # If a single sentence is itself too long, hard-split it
        if len(s) > max_len:
            if current:
                chunks.append(current.strip())
                current = ""
            # Break long sentence on spaces
            words = s.split()
            buf = ""
            for w in words:
                if len(buf) + len(w) + 1 <= max_len:
                    buf = (buf + " " + w).strip()
                else:
                    if buf:
                        chunks.append(buf.strip())
                    buf = w
            if buf:
                chunks.append(buf.strip())
            continue

        if len(current) + len(s) + 1 <= max_len:
            current = (current + " " + s).strip()
        else:
            if current:
                chunks.append(current.strip())
            current = s

    if current:
        chunks.append(current.strip())

    return [c for c in chunks if c]


def _tts_chunk(text: str, language_code: str, speaker: str, pace: float) -> str:
    """Call Sarvam TTS REST API for a single chunk, return base64 audio."""
    url = f"{SARVAM_BASE_URL}/text-to-speech"
    headers = {
        "api-subscription-key": _get_api_key(),
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": [text],
        "target_language_code": language_code,
        "speaker": speaker,
        "pitch": 0,
        "pace": pace,
        "loudness": 1.0,
        "speech_sample_rate": 22050,
        "enable_preprocessing": True,
        "model": TTS_MODEL,
    }

    resp = requests.post(url, json=payload, headers=headers, timeout=60)
    if resp.status_code != 200:
        logger.error(f"Sarvam TTS error {resp.status_code}: {resp.text[:500]}")
        raise HTTPException(
            status_code=502,
            detail=f"Sarvam TTS failed (HTTP {resp.status_code}): {resp.text[:300]}",
        )

    data = resp.json()
    audios = data.get("audios", [])
    if not audios:
        raise HTTPException(status_code=502, detail="Sarvam TTS returned no audio")
    return audios[0]  # base64 WAV


def _concat_wav_base64(chunks_b64: List[str]) -> str:
    """Concatenate multiple WAV files (base64) into a single WAV (base64).
    Sarvam returns 22050 Hz 16-bit mono WAVs. We parse & stitch PCM data.
    """
    if len(chunks_b64) == 1:
        return chunks_b64[0]

    import wave

    pcm_parts = []
    params = None
    for b64 in chunks_b64:
        raw = base64.b64decode(b64)
        with wave.open(io.BytesIO(raw), "rb") as wf:
            if params is None:
                params = wf.getparams()
            pcm_parts.append(wf.readframes(wf.getnframes()))

    out_buf = io.BytesIO()
    with wave.open(out_buf, "wb") as wf_out:
        wf_out.setnchannels(params.nchannels)
        wf_out.setsampwidth(params.sampwidth)
        wf_out.setframerate(params.framerate)
        wf_out.writeframes(b"".join(pcm_parts))

    return base64.b64encode(out_buf.getvalue()).decode("utf-8")


# ============================================================
# Endpoints
# ============================================================
@sarvam_router.get("/languages")
async def get_languages():
    """Return supported languages for TTS and STT."""
    return {
        "languages": SUPPORTED_LANGUAGES,
        "default_language": "hi-IN",
        "tts_model": TTS_MODEL,
        "stt_model": STT_MODEL,
    }


@sarvam_router.post("/tts", response_model=TTSResponse)
async def text_to_speech(request: TTSRequest):
    """Convert English/Indic text to speech in a selected Indian language.
    Long text is automatically chunked and stitched back into a single WAV.
    """
    if not _get_api_key():
        raise HTTPException(status_code=500, detail="SARVAM_API_SUBSCRIPTION_KEY not configured")

    if request.language_code not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language_code. Supported: {list(SUPPORTED_LANGUAGES.keys())}",
        )

    # Strip markdown-ish stuff that reads badly
    clean_text = request.text.replace("**", "").replace("*", "").replace("#", "").strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Text is empty after cleaning")

    chunks = _chunk_text(clean_text)
    logger.info(f"TTS: {len(chunks)} chunk(s), lang={request.language_code}")

    audio_b64_list: List[str] = []
    for i, ch in enumerate(chunks):
        try:
            audio_b64 = _tts_chunk(ch, request.language_code, request.speaker or TTS_DEFAULT_SPEAKER, request.pace)
            audio_b64_list.append(audio_b64)
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"TTS chunk {i} failed")
            raise HTTPException(status_code=500, detail=f"TTS chunk {i} failed: {str(e)}")

    combined = _concat_wav_base64(audio_b64_list)
    return TTSResponse(
        audio_base64=combined,
        language_code=request.language_code,
        audio_format="wav",
        chunk_count=len(chunks),
    )


@sarvam_router.post("/stt", response_model=STTResponse)
async def speech_to_text(request: STTRequest):
    """Transcribe recorded audio. If translate_to_english=True, returns English
    transcript from any supported Indian-language speech (using the translate endpoint).
    """
    if not _get_api_key():
        raise HTTPException(status_code=500, detail="SARVAM_API_SUBSCRIPTION_KEY not configured")

    try:
        audio_bytes = base64.b64decode(request.audio_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 audio_data")

    if len(audio_bytes) < 1000:
        raise HTTPException(status_code=400, detail="Audio too short or empty")

    # Pick correct Sarvam endpoint
    mime = request.audio_mime_type or "audio/webm"
    # Pick a filename extension that Sarvam will accept.
    ext = "webm"
    if "wav" in mime:
        ext = "wav"
    elif "mp3" in mime or "mpeg" in mime:
        ext = "mp3"
    elif "ogg" in mime:
        ext = "ogg"
    elif "mp4" in mime or "m4a" in mime:
        ext = "m4a"
    elif "webm" in mime:
        ext = "webm"

    headers = {"api-subscription-key": _get_api_key()}

    if request.translate_to_english:
        url = f"{SARVAM_BASE_URL}/speech-to-text-translate"
        data = {"model": "saaras:v2.5"}
        mode = "translate"
    else:
        url = f"{SARVAM_BASE_URL}/speech-to-text"
        data = {"model": STT_MODEL}
        if request.language_code and request.language_code in SUPPORTED_LANGUAGES:
            data["language_code"] = request.language_code
        else:
            data["language_code"] = "unknown"
        mode = "transcribe"

    files = {"file": (f"audio.{ext}", audio_bytes, mime)}

    try:
        resp = requests.post(url, headers=headers, data=data, files=files, timeout=120)
    except requests.RequestException as e:
        logger.exception("Sarvam STT network error")
        raise HTTPException(status_code=502, detail=f"Sarvam STT network error: {e}")

    if resp.status_code != 200:
        logger.error(f"Sarvam STT error {resp.status_code}: {resp.text[:500]}")
        raise HTTPException(
            status_code=502,
            detail=f"Sarvam STT failed (HTTP {resp.status_code}): {resp.text[:300]}",
        )

    result = resp.json()
    transcript = result.get("transcript", "")
    detected = result.get("language_code")

    return STTResponse(
        transcript=transcript,
        detected_language=detected,
        translated=request.translate_to_english,
        mode=mode,
    )
