<!-- © AngelaMos | 2026 — ROADMAP.md -->

# Angela 3D — Roadmap

> A 3D avatar AI assistant with voice activation, lip sync, and Mixamo animations.
> Currently: stateless MVP with Ollama + Whisper + Edge TTS + OpenWakeWord + VRM avatar.

---

## Current State (MVP)

- [x] Wake word detection ("Angela" via OpenWakeWord custom `.tflite` model)
- [x] Speech-to-text (faster-whisper, `base.en`)
- [x] LLM generation (Ollama streaming, `qwen2.5:7b`)
- [x] Text-to-speech (Edge TTS, `en-GB-LibbyNeural`)
- [x] VRM avatar with Mixamo animation retargeting
- [x] Real-time lip sync via frequency analysis
- [x] Animation state machine (idle → listening → thinking → speaking → error)
- [x] 13 Mixamo animations (6 idle, 5 speaking, 2 listening/thinking)
- [x] Status overlay UI with mute/stop/minimize controls
- [x] Dockerized (GPU + CPU compose files, Nginx reverse proxy)
- [x] Keyboard fallback trigger (Ctrl+Shift+A)

---

## Phase 1 — Provider Flexibility & Model Options

Make every stage of the pipeline swappable without touching code.

### LLM Providers
- [ ] Claude API (Anthropic) as LLM backend
- [ ] OpenAI / ChatGPT API
- [ ] Google Gemini API
- [ ] Hugging Face Inference API (serverless models)
- [ ] Keep Ollama as default local option with more model choices
- [ ] Provider selection via config/UI (dropdown per provider, model picker per provider)
- [ ] Unified streaming interface across all providers

### STT Providers
- [ ] Keep faster-whisper as default
- [ ] OpenAI Whisper API (cloud)
- [ ] Google Speech-to-Text
- [ ] Deepgram
- [ ] AssemblyAI
- [ ] Whisper model size selector in UI (tiny → large-v3)

### TTS Providers
- [ ] ElevenLabs integration (already partially wired — make it fully selectable)
- [ ] OpenAI TTS API
- [ ] Google Cloud TTS
- [ ] Coqui / XTTS (local, open source)
- [ ] Bark (local, open source)
- [ ] Piper TTS (lightweight local)
- [ ] Voice preview + selection UI for each provider

### Wake Word Options
- [ ] Train more OpenWakeWord models: "Claudia", "Hey Angela", "Jarvis", "Friday", "Nova", "Computer"
- [ ] Wake word selector in UI
- [ ] Custom wake word training pipeline (record samples → train → deploy)
- [ ] Adjustable sensitivity per wake word from UI

---

## Phase 2 — Memory & Statefulness

Transform Angela from stateless Q&A into a persistent, context-aware assistant.

### Conversation Memory
- [ ] Persist conversation history (SQLite or PostgreSQL)
- [ ] Sliding window context (keep last N turns in prompt)
- [ ] Conversation summarization (compress old context into summaries)

### Long-Term Memory (Vector Store)
- [ ] Vector embedding store (ChromaDB, Qdrant, or pgvector)
- [ ] Auto-embed important facts from conversations
- [ ] RAG retrieval — query memory before each LLM call for relevant context
- [ ] Memory management UI (view, search, delete memories)
- [ ] Configurable memory extraction (what gets stored vs. ephemeral)

### User Profiles
- [ ] Named user recognition (voice fingerprinting or manual profiles)
- [ ] Per-user preferences and memory
- [ ] Per-user conversation history

---

## Phase 3 — Avatar & Scene Customization

### VRM Model Library
- [ ] Download and bundle more VRM models (different characters/styles)
- [ ] VRM model selector in UI (preview + switch without reload)
- [ ] Support loading custom VRM files (drag-and-drop or file picker)
- [ ] Per-model animation compatibility validation

### Animation Configurator (UI)
- [ ] Animation manager UI panel
- [ ] Assign animations per state (idle, listening, thinking, speaking, error)
- [ ] Configure animation duration, frequency, and combo count
- [ ] Upload custom Mixamo FBX files from UI
- [ ] Animation preview/test buttons
- [ ] Download more Mixamo animations (broader variety — waving, gestures, dances)
- [ ] Per-animation crossfade duration setting

### Scene & Environment
- [ ] Background color/gradient picker
- [ ] Skybox / HDRI environment maps (selectable presets)
- [ ] Custom background image/video upload
- [ ] Lighting presets (warm, cool, dramatic, neon)
- [ ] Custom lighting controls (position, intensity, color per light)
- [ ] Ground plane style (grid, solid, reflective, none)
- [ ] Camera angle presets (close-up, full body, side view)
- [ ] Post-processing effects (bloom, vignette, depth of field)
- [ ] Particle effects selector (stars, rain, snow, sakura, fire)

---

## Phase 4 — Claude Code MCP Integration

Build an MCP server so Angela becomes the voice of Claude Code.

### MCP Server
- [ ] Build MCP server that exposes Angela's TTS as a tool
- [ ] Claude Code speaks its output in real-time as it generates
- [ ] Angela avatar animates while Claude Code works (thinking → speaking per action)
- [ ] Option to replace Ollama entirely — Claude Code's reasoning becomes Angela's brain
- [ ] Bidirectional: voice commands to Claude Code through Angela
- [ ] Status overlay shows Claude Code's current action (reading, editing, running)

### Developer Mode
- [ ] "Pair programming" mode — Angela narrates code changes
- [ ] Voice-activated code commands ("Angela, run the tests", "Angela, commit this")
- [ ] Terminal output read-aloud (errors, build results)
- [ ] Git status / PR summary spoken on demand

---

## Phase 5 — Smart Home & IoT

### Home Assistant Integration
- [ ] Home Assistant API integration (open source, massive device compatibility)
- [ ] Voice commands for lights, switches, thermostats, locks, cameras
- [ ] Device state queries ("Angela, is the front door locked?")
- [ ] Routines / automations via voice ("Angela, goodnight" → lights off, lock doors, set alarm)
- [ ] Device discovery and setup from Angela's UI

### MQTT Support
- [ ] Direct MQTT broker connection for custom IoT devices
- [ ] Publish/subscribe to topics via voice commands
- [ ] Sensor data monitoring and alerts

---

## Phase 6 — Skills & Tool Use

### Function Calling / Tool Use
- [ ] LLM function calling support (works with Claude, OpenAI, Ollama tool-capable models)
- [ ] Built-in tools: weather, timers, alarms, calculator, unit conversion
- [ ] Web search tool (search the internet, summarize results)
- [ ] Date/time awareness ("What time is it?", "What day is it?")
- [ ] Reminders and scheduled notifications

### Plugin System
- [ ] Plugin architecture for community-built skills
- [ ] Plugin manifest format (name, description, triggers, actions)
- [ ] Plugin marketplace / directory UI
- [ ] Example plugins: Spotify, calendar, news, stocks, sports scores

### Proactive Interactions
- [ ] Scheduled check-ins ("Good morning" briefing with weather, calendar, news)
- [ ] Event-driven triggers (doorbell rings → Angela announces visitor)
- [ ] Inactivity prompts (Angela initiates conversation after long silence)
- [ ] Notification relay (reads phone notifications aloud)

---

## Phase 7 — Multi-Modal & Vision

### Camera / Screen Input
- [ ] Webcam capture — "Angela, what do you see?"
- [ ] Screen capture — "Angela, look at my screen"
- [ ] Image upload for analysis
- [ ] Vision model integration (LLaVA via Ollama, Claude Vision, GPT-4V)

### Voice Cloning
- [ ] ElevenLabs voice cloning (clone any voice with samples)
- [ ] Local voice cloning via XTTS / RVC
- [ ] Voice selection from cloned library

### Emotion & Sentiment
- [ ] Detect user tone/emotion from voice (prosody analysis)
- [ ] Angela responds with matching emotional tone
- [ ] VRM expression mapping (happy, sad, surprised, angry)
- [ ] Emotion-aware animation selection

---

## Phase 8 — Multi-User & Deployment

### Multi-User Support
- [ ] Voice fingerprint recognition (identify who's speaking)
- [ ] Per-user settings, memory, and conversation history
- [ ] Family/team profiles

### Mobile & Multi-Platform
- [ ] PWA support (installable on mobile)
- [ ] Responsive layout for phone/tablet
- [ ] WebRTC for remote access (talk to Angela from anywhere)
- [ ] Companion mobile app (optional)

### Multi-Instance
- [ ] Multiple Angela instances in different rooms
- [ ] Shared state/memory across instances
- [ ] Hand-off ("Angela, continue this in the bedroom")

---

## Phase 9 — Polish & UX

### Settings Dashboard
- [ ] Unified settings page for all configuration
- [ ] Provider selection with API key management
- [ ] Model picker per provider
- [ ] Voice/avatar/scene customization all in one place
- [ ] Import/export configuration

### Conversation UI
- [ ] Full chat history view (scrollable transcript)
- [ ] Text input fallback (type instead of speak)
- [ ] Conversation search
- [ ] Export conversations

### Accessibility
- [ ] Keyboard navigation for all controls
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Adjustable font sizes in overlay

### Performance
- [ ] Animation LOD (reduce complexity when not focused)
- [ ] Audio worklet optimization for lower latency
- [ ] Model preloading and caching
- [ ] WebGPU renderer option (when browser support is stable)

---

## Ideas Backlog (Unscoped)

These are cool ideas without a phase yet — pick them up whenever.

- [ ] **Persona system** — Switch Angela's personality (professional, casual, sarcastic, pirate)
- [ ] **Multi-language** — Angela speaks and understands multiple languages, auto-detect
- [ ] **Music playback** — Spotify / YouTube Music integration, "Angela, play lo-fi"
- [ ] **Knowledge base** — Feed Angela documents/PDFs, she becomes an expert on your stuff
- [ ] **Code review** — Paste code or point at a file, Angela reviews it vocally
- [ ] **Ambient mode** — Angela reacts to ambient sound (music visualizer, environmental awareness)
- [ ] **Avatar physics** — Hair/clothing physics simulation on VRM models
- [ ] **AR mode** — WebXR support, Angela in augmented reality
- [ ] **Multiplayer** — Multiple avatars in the same scene (Angela + friends)
- [ ] **Stream integration** — OBS overlay, Twitch chat interaction
- [ ] **Email/messaging** — "Angela, read my unread emails" / "Send a message to..."
- [ ] **Learning mode** — Angela teaches topics interactively (flashcards, quizzes)
- [ ] **Journaling** — Daily voice journal, Angela summarizes and tracks themes over time
