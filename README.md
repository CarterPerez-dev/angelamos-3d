<!-- © AngelaMos | 2026 — README.md -->

<div align="center">

```
      d8888                        888         .d8888b. 8888888b.
     d88888                        888        d88P  Y88b888  "Y88b
    d88P888                        888             .d88P888    888
   d88P 88888888b.  .d88b.  .d88b. 888 8888b.     8888" 888    888
  d88P  888888 "88bd88P"88bd8P  Y8b888    "88b     "Y8b.888    888
 d88P   888888  888888  88888888888888.d888888888    888888    888
d8888888888888  888Y88b 888Y8b.    888888  888Y88b  d88P888  .d88P
d88P     888888  888 "Y88888 "Y8888 888"Y888888 "Y8888P" 8888888P"
                        888
                   Y8b d88P
                    "Y88P"
```

**A 3D avatar AI assistant with voice activation, lip sync, and real-time animations.**

Say "Angela" and ask anything. She listens, thinks, and speaks back — with a full animated VRM avatar.

[![Demo Video](https://img.shields.io/badge/Demo-YouTube-red?style=for-the-badge&logo=youtube)](https://youtube.com)

<!-- TODO: Replace with actual video embed -->
<!-- [![Angela 3D Demo](https://img.youtube.com/vi/VIDEO_ID_HERE/maxresdefault.jpg)](https://www.youtube.com/watch?v=VIDEO_ID_HERE) -->

</div>

---

## What Is This

Angela 3D is a local-first voice assistant with a 3D animated avatar. Think Alexa, but with a VRM character that does breakdance moves while answering your questions.

**Voice Pipeline:** Wake Word &rarr; Speech-to-Text &rarr; LLM &rarr; Text-to-Speech &rarr; Lip Sync Playback

**Stack:**
- **Frontend** — React, Three.js, @pixiv/three-vrm
- **Backend** — Python, FastAPI
- **LLM** — Ollama (qwen2.5:7b default)
- **STT** — faster-whisper
- **TTS** — Edge TTS
- **Wake Word** — OpenWakeWord (custom "Angela" model)
- **Animations** — Mixamo FBX retargeted to VRM

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- NVIDIA GPU + drivers (or use the CPU compose file)
- Ollama model pulled (`ollama pull qwen2.5:7b`)

### Run

```bash
cp .env.example .env

# GPU
docker compose up --build

# CPU only
docker compose -f compose.cpu.yml up --build
```

Open `http://localhost:7200` — say **"Angela"** or click the status dot to begin.

### Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `7200` | Nginx exposed port |
| `WHISPER_MODEL` | `base.en` | Whisper model size |
| `OLLAMA_MODEL` | `qwen2.5:7b` | Ollama model name |

---

## Project Structure

```
angelamos-3d/
├── backend/           Python FastAPI (STT, TTS, LLM, Wake Word)
│   ├── app/
│   │   ├── chat/      Ollama streaming chat
│   │   ├── stt/       faster-whisper transcription
│   │   ├── tts/       Edge TTS synthesis
│   │   └── wake/      OpenWakeWord WebSocket
│   └── models/        Wake word .tflite models
├── frontend/          React + Three.js
│   ├── src/
│   │   ├── api/       Backend API clients
│   │   ├── hooks/     Voice pipeline, scene, wake word
│   │   ├── lib/       Animation, audio, wake word engines
│   │   └── components/
│   └── public/
│       ├── vrm/       VRM avatar models
│       └── animations/ Mixamo FBX files
├── nginx/             Reverse proxy config
├── compose.yml        GPU docker compose
└── compose.cpu.yml    CPU docker compose
```

---

## How It Works

1. **Wake Word** — AudioWorklet streams mic audio over WebSocket to OpenWakeWord
2. **Recording** — On detection, records until silence (850ms threshold)
3. **Transcription** — Audio sent to faster-whisper, returns text
4. **LLM** — Text streamed to Ollama, response chunks displayed in real-time
5. **Speech** — Full response synthesized via Edge TTS, returns MP3
6. **Playback** — Audio plays with real-time frequency analysis driving mouth movement
7. **Animations** — State machine transitions avatar between idle, listening, thinking, speaking

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full plan — provider flexibility, memory, scene customization, IoT, Claude Code MCP integration, and more.

---

## License

MIT
