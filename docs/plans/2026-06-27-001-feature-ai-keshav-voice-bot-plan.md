---
name: ai-keshav-voice-bot
description: Implementation-ready plan for the AI Keshav voice bot — embedded chat panel with voice + quick-tap buttons, sitting on the homepage alongside Keshav's intro
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
---

# AI Keshav Voice Bot — Plan

## Goal Capsule

**Objective:** Build an AI voice bot that sits permanently open on the right side of Keshav's portfolio homepage. Recruiters can speak to it or tap preset question buttons to hear AI Keshav answer in his cloned voice, with a live text transcript.

**Product authority:** Keshav

**Open blockers:** None. Portfolio homepage design and broader website structure are explicitly deferred — build the bot pipeline first, integrate into final design after.

---

## Product Contract

### Primary Actor
Recruiters and hiring managers visiting Keshav's portfolio website.

### Core Outcome
A recruiter lands on the homepage, sees AI Keshav's chat panel immediately on the right, and can engage — by tapping a preset question or speaking — without any friction. The bot responds in Keshav's cloned voice with a live transcript.

### Secondary Outcome
The bot demonstrates Keshav's ability to ship a production AI voice system; it is itself a portfolio artefact.

### Interaction Model

**Homepage split layout (design placeholder — final design deferred):**
- Left side: brief intro copy ("Hi, I'm Keshav — AI Product Manager.")
- Right side: AI Keshav chat panel, always open

**Bot interaction (two entry points):**
1. **Quick tap** — visitor clicks a preset button ("Who are you?", "What projects are you most proud of?", "What are your skills?", "Resume") → bot answers in voice + transcript
2. **Voice** — visitor presses mic button, speaks a free-form question → bot answers in voice + transcript

**Turn loop:**
1. Question arrives (from preset button tap OR voice input)
2. Transcript + history → `/api/chat` → DeepSeek V4 Flash (AI Keshav persona + RAG context)
3. Response text → `/api/tts` → F5-TTS on Replicate (Keshav's cloned voice) → audio URL
4. Browser plays audio; transcript panel updates
5. Repeat

### Scope

**In scope (MVP):**
- Voice-to-voice bot with quick-tap preset question buttons
- Live text transcript alongside audio
- Keshav's cloned voice via F5-TTS on Replicate
- RAG over markdown knowledge base (no vector DB)
- Per-IP rate limiting (Upstash Redis) — active before launch
- Minimal homepage: split layout placeholder (left intro + right chat panel) to prove the bot works
- Chrome/Edge only (Web Speech API for mic input)

**Explicitly excluded (deferred):**
- Final portfolio homepage design — other sections, nav structure, aesthetic polish, typography decisions
- Safari/Firefox support (MVP)
- Streaming audio mid-sentence (per-turn sufficient)
- Text input box in chat (voice + quick buttons covers MVP; add later)
- Phone call / Vapi (Phase 2)
- Pipecat (Phase 3)
- Per-topic off-topic guardrails

### Preset Quick Buttons (MVP set)
1. "Who are you?"
2. "What projects are you most proud of?"
3. "What are your skills?"
4. "Can I see your resume?"

### Success Criteria
- Recruiter taps a preset button → hears Keshav's voice answer within 4 s
- Recruiter speaks a free-form question → hears accurate answer within 4 s
- Answers are accurate to knowledge base content
- Voice is recognisably Keshav's
- Cost per conversation under $0.10
- Per-IP rate limit prevents budget exhaustion

---

## Key Technical Decisions

**KTD-1 — F5-TTS over XTTS-v2**
F5-TTS uses flow-matching diffusion (non-autoregressive): consistent latency regardless of response length, better quality on paragraph answers. XTTS-v2 (7.1M Replicate runs) is the documented fallback — a one-line model slug swap in `lib/replicate-tts.ts`.

**KTD-2 — DeepSeek V4 Flash**
`deepseek-chat` is deprecated 2026-07-24. Use `deepseek-v4-flash`. Context window 1M tokens; RAG context under 20K per turn. Cache hit pricing ($0.0028/1M) makes repeated system prompt injection near-free. Fallback: `gpt-4o-mini`.

**KTD-3 — Markdown RAG at request time, no vector DB**
Three knowledge base files (~30K tokens total). `lib/knowledge.ts` reads all three from disk and injects full context into the system prompt. No embeddings, no retrieval. Simple, fast, accurate at this scale. Revisit if knowledge base exceeds ~100K tokens.

**KTD-4 — Press-to-talk over VAD**
Press-to-talk (hold mic button) is explicit, reliable, no false positives. VAD is an upgrade path once the core loop is stable.

**KTD-5 — Edge Middleware for rate limiting**
Upstash `@upstash/ratelimit` in Next.js Edge Middleware intercepts before route handlers. Sliding window: `/api/chat` — 30 req/IP/24h; `/api/tts` — 20 req/IP/24h. Returns 429 + `Retry-After: 86400`.

**KTD-6 — Audio via URL, not base64**
Replicate returns a hosted audio URL. Browser plays via `<audio>` element — no base64 serialisation, no memory pressure.

**KTD-7 — Embedded chat panel on homepage, not a full page**
The bot is a persistent right-side panel on the portfolio homepage — always visible, always ready. Final homepage layout and broader portfolio design are deferred; MVP uses a minimal split-layout placeholder to host the panel.

**KTD-8 — Preset buttons are question shortcuts, not separate logic**
Quick-tap preset buttons send the preset question string through the same pipeline as voice input. No separate code path — just `handleQuestion(presetText)` directly.

---

## Output Structure

```
portfolio/bot/
├── app/
│   ├── layout.tsx               # Root layout, metadata, global styles
│   ├── page.tsx                 # Homepage (split-layout placeholder: left intro + right chat panel)
│   └── api/
│       ├── chat/
│       │   └── route.ts         # DeepSeek LLM endpoint
│       └── tts/
│           └── route.ts         # F5-TTS Replicate endpoint
├── components/
│   ├── chat-panel.tsx           # Main chat widget (assembles all sub-components; placed right side)
│   ├── quick-buttons.tsx        # Preset question buttons row
│   ├── mic-button.tsx           # Press-to-talk mic button
│   ├── waveform.tsx             # Audio waveform animation (Framer Motion)
│   └── transcript.tsx           # Scrollable conversation transcript
├── hooks/
│   ├── use-speech-recognition.ts  # Web Speech API abstraction
│   └── use-audio-playback.ts      # Audio fetch + playback
├── lib/
│   ├── knowledge.ts             # Knowledge base loader (reads markdown, builds context)
│   ├── deepseek.ts              # DeepSeek API client wrapper
│   └── replicate-tts.ts         # Replicate F5-TTS client wrapper
├── public/
│   └── voice-reference.m4a      # Keshav's normalised voice sample (copy from docs/knowledge-base/voice-sample-normalized.m4a)
├── docs/
│   ├── knowledge-base/          # AI Keshav knowledge base docs (existing)
│   └── plans/                   # This plan (existing)
├── middleware.ts                 # Upstash per-IP rate limiting
├── .env.example                  # Required env vars documented
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## High-Level Technical Design

### Turn loop

```
Quick button click  ─┐
                     ├──► handleQuestion(text)
Voice mic release   ─┘
                          │
                          ▼
                    POST /api/chat
                    { message, history }
                          │
                    DeepSeek V4 Flash
                    (system prompt + RAG + history)
                          │
                          ▼
                    POST /api/tts
                    { text }
                          │
                    Replicate F5-TTS
                    (voice-reference.m4a)
                          │
                          ▼
                    audio URL → play + transcript update
```

### Turn state machine

```
IDLE ──(button tap or mic press)──► PROCESSING (button) / LISTENING (mic)
LISTENING ──(speech end)──► PROCESSING
PROCESSING ──(audio URL received)──► SPEAKING
SPEAKING ──(audio ended)──► IDLE
PROCESSING ──(error / 429)──► ERROR ──(dismiss)──► IDLE
```

---

## Implementation Units

Units are ordered by dependency — build in sequence.

### U1. Project Bootstrap

**Goal:** Initialise the Next.js 15 App Router project with all dependencies and base file structure. No functional code yet — just a working build.

**Dependencies:** None.

**Files:**
- `package.json`
- `next.config.ts`
- `tailwind.config.ts`
- `app/layout.tsx`
- `app/globals.css`
- `.env.example`
- `tsconfig.json`

**Approach:**
- `create-next-app` with App Router, TypeScript, Tailwind CSS
- Install: `framer-motion`, `@radix-ui/react-slot`, `lucide-react`, `clsx`, `tailwind-merge`, `next-themes`, `@upstash/ratelimit`, `@upstash/redis`, `replicate`, `openai`
- shadcn/ui methodology: `npx shadcn@latest init`, then `npx shadcn@latest add button` — components owned in-repo under `components/ui/`
- Root layout: dark background (`#0a0a0a`), `text-white`, Geist or Inter via `next/font`
- `.env.example` documents: `DEEPSEEK_API_KEY`, `REPLICATE_API_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_BASE_URL`
- Tailwind `content` array covers `app/**`, `components/**`

**Test scenarios:**
- `next build` completes with zero TypeScript errors
- `next dev` serves a blank page at `/` without console errors
- `tailwind.config.ts` content array is correct
- `.env.example` lists all five required vars

**Verification:** `next build` passes; blank dark home page renders in Chrome.

---

### U2. Knowledge Base Loader

**Goal:** Server-side utility that reads the three knowledge base markdown files and returns a single concatenated context string for LLM injection.

**Dependencies:** U1.

**Files:**
- `lib/knowledge.ts`

**Approach:**
- `loadKnowledgeBase(): Promise<string>` — reads `docs/knowledge-base/01-career-narrative.md`, `02-projects.md`, `03-interview-qa.md` via `fs/promises` from `process.cwd()`
- Concatenates with section headers: `## Career Narrative\n...\n\n## Projects\n...\n\n## Interview Q&A\n...`
- Module-level in-memory cache: re-reads after 60 s to pick up edits without restart
- Throws a descriptive error if any file is missing (not a silent empty string)

**Test scenarios:**
- Returns non-empty string when all three files present
- Each file's content appears under its section header
- Missing file throws with the file path in the error message
- Second call within 60 s returns same object reference (no re-read)
- String contains "Sumant Keshav" and "AITSR"

**Verification:** Import in Node REPL; confirm output contains career and project content.

---

### U3. LLM API Route

**Goal:** `POST /api/chat` accepts visitor message + history, calls DeepSeek V4 Flash with the AI Keshav system prompt and RAG context, returns response text.

**Dependencies:** U1, U2.

**Files:**
- `app/api/chat/route.ts`
- `lib/deepseek.ts`

**Approach:**
- Request body: `{ message: string, history: { role: "user"|"assistant", content: string }[] }`
- `lib/deepseek.ts`: wraps DeepSeek API via the `openai` package pointed at `https://api.deepseek.com/v1`
- Model: `deepseek-v4-flash` (not `deepseek-chat` — deprecated 2026-07-24)
- System prompt:
  ```
  You are AI Keshav — an AI version of Sumant Keshav. Answer in first person as Keshav.
  Be direct, specific, honest. Only claim what is documented below. If asked something
  outside your knowledge, say "You'd need to ask Keshav directly about that."

  [KNOWLEDGE BASE]
  {loadKnowledgeBase() output}
  [END KNOWLEDGE BASE]
  ```
- `max_tokens: 400`, `temperature: 0.7`
- Returns `{ text: string }`
- On DeepSeek error: return 502 `{ error: "LLM unavailable" }`
- 400 on empty or missing message

**Test scenarios:**
- Valid `{ message, history }` returns `{ text }` with non-empty content
- Knowledge base content present in system prompt (integration test with mocked DS)
- History passed as prior messages in correct OpenAI message array order
- Empty message → 400
- Missing message field → 400
- DeepSeek 500 (mocked) → 502 `{ error: "LLM unavailable" }`

**Verification:** `curl -X POST /api/chat -d '{"message":"Tell me about AITSR","history":[]}'` returns accurate text about the title search project.

---

### U4. TTS API Route

**Goal:** `POST /api/tts` accepts response text, calls F5-TTS on Replicate with Keshav's voice reference, returns the audio URL.

**Dependencies:** U1.

**Files:**
- `app/api/tts/route.ts`
- `lib/replicate-tts.ts`
- `public/voice-reference.m4a` — copy `docs/knowledge-base/voice-sample-normalized.m4a` here

**Approach:**
- Request body: `{ text: string }`
- Text length guard: reject over 600 chars (400 response)
- `lib/replicate-tts.ts`: uses `replicate` npm package
- Model: `lucataco/f5-tts` (verify current slug on Replicate before build; pin to a version hash)
- Input: `{ text, reference_audio_url, reference_text: "" }` — `reference_audio_url` built from `NEXT_PUBLIC_BASE_URL + "/voice-reference.m4a"` or request `origin` header
- Poll until prediction completes; timeout 30 s
- Returns `{ audioUrl: string }`
- On timeout or Replicate error: 502 `{ error: "TTS unavailable" }`
- **XTTS-v2 fallback**: if F5-TTS slug unavailable, swap to `lucataco/xtts-v2` — one line change in `lib/replicate-tts.ts`, documented in a comment

**Test scenarios:**
- `{ text: "Hello, I'm Keshav." }` returns `{ audioUrl }` as valid HTTPS URL
- Returned URL is playable audio (Content-Type `audio/*`)
- Text over 600 chars → 400
- Empty text → 400
- Replicate timeout (mocked) → 502
- Voice reference URL correctly formed from request origin (not hardcoded localhost)

**Verification:** POST `{ text: "Hi, I'm Sumant Keshav." }`, play returned URL in browser — voice is Keshav's.

---

### U5. Rate Limiting Middleware

**Goal:** Per-IP sliding window rate limits on `/api/chat` and `/api/tts` using Upstash Redis at the Edge.

**Dependencies:** U1.

**Files:**
- `middleware.ts`

**Approach:**
- Two `Ratelimit` instances (sliding window):
  - `chatLimiter`: 30 req / IP / 24 h
  - `ttsLimiter`: 20 req / IP / 24 h
- IP from `request.headers.get("x-forwarded-for")?.split(",")[0]` — Vercel sets this; fallback `"anonymous"` in dev
- 429 response: `{ error: "Rate limit exceeded" }` + `Retry-After: 86400`
- Matcher: only `/api/chat` and `/api/tts`

**Test scenarios:**
- First 20 `/api/tts` requests from one IP: pass through
- 21st request: 429 + `Retry-After` header
- Second IP unaffected by first IP's count
- `/api/chat` and `/api/tts` counters are independent
- Missing `x-forwarded-for` → fallback to `"anonymous"` without error
- `GET /` and other non-API routes: middleware does not fire

**Verification:** 21 successive TTS requests from same IP; 21st returns 429.

---

### U6. Speech Recognition Hook

**Goal:** React hook abstracting the Web Speech API into a clean state machine.

**Dependencies:** U1.

**Files:**
- `hooks/use-speech-recognition.ts`

**Approach:**
- Returns `{ transcript, state, start, stop, error }`
- States: `"idle" | "listening" | "error" | "unsupported"`
- Init: `const SR = window.SpeechRecognition || window.webkitSpeechRecognition`
- If `SR` undefined: return `{ state: "unsupported" }` — caller renders "Chrome required" notice
- Config: `continuous: false`, `interimResults: true`, `lang: "en-US"`
- `start()` → `"listening"`; `onspeechend` / `onend` → fires `onResult(finalTranscript)` callback then → `"idle"`
- `stop()` cancels, returns to `"idle"`
- `onerror` → `"error"` with message
- Guard: calling `start()` while already `"listening"` is a no-op

**Test scenarios:**
- `start()` → state `"listening"` synchronously
- Interim transcript updates in real time
- Final transcript returned via `onResult` callback on speech end
- `stop()` before speech end → graceful cancel → `"idle"`
- `onerror` (mic denied) → `"error"` with message
- `start()` while `"listening"` → no-op
- `window.SpeechRecognition` undefined → `"unsupported"`

**Verification:** Speak "Tell me about AITSR" in Chrome — final transcript appears accurately.

---

### U7. Audio Playback Hook + Waveform Component

**Goal:** Hook to fetch and play a TTS audio URL; waveform animation while audio plays.

**Dependencies:** U1.

**Files:**
- `hooks/use-audio-playback.ts`
- `components/waveform.tsx`

**Approach:**

`useAudioPlayback`:
- `{ play, stop, state }` — states: `"idle" | "loading" | "playing" | "error"`
- `play(url)` → creates `new Audio(url)`, state `"loading"` → `"playing"` on `canplaythrough` → `"idle"` on `ended` → `"error"` on error
- `stop()` → `.pause()`, `.src=""`, state → `"idle"`
- Cleanup audio element on unmount

`Waveform`:
- Props: `isPlaying: boolean`
- 5 vertical bars with Framer Motion staggered `scaleY` animation when `isPlaying`
- Static low-height bars when idle
- Minimal, dark aesthetic (no external UI library)

**Test scenarios:**
- `play(url)` transitions `idle → loading → playing`
- State → `"idle"` on audio end
- `stop()` → `"idle"` immediately
- Invalid URL → `"error"`
- Waveform bars animate when `isPlaying={true}`
- Waveform bars static when `isPlaying={false}`
- Audio element paused + cleared on unmount

**Verification:** Play a Replicate audio URL — waveform animates during playback, stops on end.

---

### U8. Quick Buttons Component

**Goal:** Row of preset question buttons that fire directly into the bot's turn loop without mic interaction.

**Dependencies:** U1.

**Files:**
- `components/quick-buttons.tsx`

**Approach:**
- Props: `onQuestion: (text: string) => void`, `disabled: boolean`
- MVP button set:
  1. "Who are you?"
  2. "What projects are you most proud of?"
  3. "What are your skills?"
  4. "Can I see your resume?"
- On click: calls `onQuestion(buttonText)` — same function as the voice path
- `disabled={true}` when bot is processing or speaking (prevents double-send)
- Styled as small pill buttons; Tailwind only — no shadcn dependency
- Horizontal scroll on small screens (`overflow-x-auto flex flex-nowrap`)

**Test scenarios:**
- Clicking "Who are you?" calls `onQuestion("Who are you?")`
- All four buttons render with correct labels
- `disabled={true}` → buttons are non-interactive (not just visually muted)
- On mobile-width viewport: buttons are horizontally scrollable, no wrapping

**Verification:** Click "What are your skills?" → same pipeline fires as voice input.

---

### U9. Chat Panel Component

**Goal:** Self-contained chat widget that assembles all sub-components and manages the turn state machine. This is placed in the right column of the homepage.

**Dependencies:** U1, U6, U7, U8, and calls `/api/chat` + `/api/tts`.

**Files:**
- `components/chat-panel.tsx`

**Approach:**
- State: `turnState: "idle" | "listening" | "processing" | "speaking" | "error"`
- Conversation: `messages: { role, content, pending?: boolean }[]`
- `handleQuestion(text)`: core function used by both quick buttons and voice path
  1. Append `{ role: "user", content: text }` to messages
  2. Set `turnState → "processing"`; append `{ role: "assistant", pending: true }`
  3. POST `/api/chat` → get `{ text }`
  4. POST `/api/tts` → get `{ audioUrl }`
  5. Update pending message to `{ content: text, pending: false }`; set `turnState → "speaking"`
  6. Call `audioPlayback.play(audioUrl)`
  7. On audio end: `turnState → "idle"`
- Voice path: `useSpeechRecognition` with `onResult: handleQuestion`
- Error handling:
  - 429 from either API: show "You've reached today's conversation limit." — mic + buttons disabled
  - Other error: show "Something went wrong. Try again." with retry
- `<Transcript />` shows messages
- `<QuickButtons />` at top of panel; disabled when `turnState !== "idle"`
- `<MicButton />` + `<Waveform />` at bottom
- "Chrome or Edge required" notice if STT state is `"unsupported"`

**Test scenarios:**
- Button tap → `turnState` transitions `idle → processing → speaking → idle`
- Mic press → `idle → listening → processing → speaking → idle`
- Transcript accumulates across turns
- Pending message shows ellipsis; resolves to text when response arrives
- 429 from `/api/chat`: rate limit message shown, inputs disabled
- 429 from `/api/tts`: rate limit message shown
- 502 from either: "Something went wrong" + retry button
- `"unsupported"` STT: Chrome/Edge message, mic hidden
- Waveform animates during `"speaking"` only

**Verification:** Full manual turn: tap "Who are you?" → hear Keshav's voice answer → transcript shows exchange → bot returns to idle.

---

### U10. Homepage Placeholder

**Goal:** Minimal homepage with a split layout so the chat panel can be seen and tested in context. This is a **placeholder** — final portfolio homepage design (typography, hero copy, other sections) is a separate follow-up plan.

**Dependencies:** U1, U9.

**Files:**
- `app/layout.tsx` (update)
- `app/page.tsx`

**Approach:**

`app/layout.tsx`:
- Dark background, Geist font, basic `<html>` + `<body>`
- No nav yet (deferred to full portfolio plan)
- Metadata: `title: "Keshav"`, basic description

`app/page.tsx`:
- Two-column layout: `flex flex-col md:flex-row h-screen`
- **Left column** (`md:w-1/2`): placeholder intro text
  - Name + one-line role ("Hi, I'm Keshav — AI Product Manager")
  - Subtext: "Tap a question or use the mic to hear me."
  - Styled minimally in Tailwind — this is a placeholder, not the final hero
- **Right column** (`md:w-1/2`): `<ChatPanel />` fills the full height
- Mobile: stacks vertically; chat panel shown first (above the fold)
- Note in code: `{/* TODO: Replace with final homepage design — this is a placeholder */}`

**Test scenarios:**
- Page renders without errors
- Left column shows name and placeholder text
- Right column renders `<ChatPanel />`
- On viewport ≥ 768px: two columns side by side
- On mobile: chat panel shown first (above intro text), full width
- `next build` passes after this unit

**Verification:** Open `/` in Chrome — chat panel visible on the right; tap a button, hear voice reply.

---

## Verification Contract

Before going live, verify each gate:

| Gate | Check |
|---|---|
| Voice turn | Tap "Who are you?" → hear Keshav's voice answer; check latency under 4 s |
| Free-form voice | Speak "What did you build at Landeed?" → accurate voice reply |
| Quick buttons | All 4 preset buttons fire correctly and return distinct, accurate answers |
| Knowledge accuracy | Ask 5 questions from `03-interview-qa.md`; verify answers match |
| Rate limiting | 21 requests to `/api/tts` from one IP; 21st returns 429 |
| Cold start | First TTS call after 10 min idle; plays within 10 s |
| Chrome guard | Open in Safari; "Chrome or Edge required" notice shown; buttons still work |
| Cost | 3 full conversations; Replicate + DeepSeek total < $0.30 |
| Build | `next build` zero TypeScript errors, zero lint errors |
| Mobile | Open on iPhone; chat panel visible first; buttons tappable |

---

## Definition of Done

- All 10 units implemented and verified
- Verification Contract gates pass
- `public/voice-reference.m4a` in place (copied from `docs/knowledge-base/voice-sample-normalized.m4a`)
- `.env.local` set with all real API keys (not committed); `.env.example` committed
- Knowledge base markdown files in `docs/knowledge-base/`
- Deployed to Vercel with env vars set; public URL accessible
- Rate limiting active on production (Upstash Redis connected)
- Full portfolio homepage design — visual direction, other sections, typography — is a documented follow-up

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| F5-TTS cold start > 10 s | Medium | Test before launch; swap to XTTS-v2 if unacceptable (KTD-1) |
| Replicate F5-TTS slug changes | Low | Pin to version hash in `lib/replicate-tts.ts` |
| DeepSeek V4 Flash unavailable | Low | Fallback to `gpt-4o-mini` documented in `lib/deepseek.ts` |
| Web Speech accuracy on accented / noisy input | Medium | Quick buttons as primary interaction path reduces dependence on voice input |
| Upstash free tier (10K cmds/day) exceeded | Low | Portfolio traffic; upgrade to paid ($10/mo) if needed |

---

## Deferred

- Final portfolio homepage design (hero copy, typography, aesthetic polish, other sections)
- Safari/Firefox support
- Text input box in chat
- Phase 2: Vapi phone number
- Phase 3: Pipecat on Fly.io
- VAD over press-to-talk
- Off-topic guardrails
- Analytics on conversation topics

---

## Sources

- [F5-TTS vs XTTS-v2 comparison](https://www.inferless.com/learn/comparing-different-text-to-speech---tts--models-part-2)
- [DeepSeek V4 pricing and deprecation](https://api-docs.deepseek.com/quick_start/pricing)
- [Upstash rate limiting with Next.js](https://upstash.com/blog/nextjs-ratelimiting)
- [Next.js 15 + Web Speech API patterns](https://dev.to/programmingcentral/how-to-build-a-real-time-talking-assistant-with-nextjs-vercel-ai-sdk-and-web-speech-api-3hbg)
- Reference design: https://portfolio-one-gilt-29.vercel.app/ (Anuj's digital twin — embedded chat panel, preset buttons)
