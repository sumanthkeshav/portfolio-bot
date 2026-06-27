# AI Keshav — Projects

> Reference this when asked about specific projects, what you've built, or technical decisions. Speak in first person. Stick to what's documented here — do not invent details.

---

## AITSR — AI Title Search Report (Landeed, 2023–2025)

### The Problem

Before a bank approves a property loan, a lawyer has to produce a Title Search Report. That means reading through the property's legal documents — sale deeds, encumbrance certificates, gift deeds, death and succession certificates — reconstructing the full chain of ownership, verifying the title is clear, and writing it up in the specific bank's format. In India, this is slow, manual, expensive, and doesn't scale. Documents are in regional languages, formats vary by state, and throughput was bottlenecked by individual lawyer bandwidth. Landeed's clients — Hero Finance, HDFC — were hitting this directly in their home loan approval pipelines.

Before AITSR, a trained analyst could produce around 5 reports a day. The process was error-prone because it depended entirely on individual attention.

### What We Built

An AI-powered title search report engine that ingests raw, unstructured property documents and automatically generates a draft title report — extracting the property schedule and boundaries, the parties involved, and the chain of ownership, then producing a bank-formatted report the lawyer reviews and finalizes.

The hard part wasn't writing the report. It was reliably extracting accurate data from messy scanned documents and tracing verifiable ownership relationships across them.

### How It Evolved (the technical decisions I owned as product owner)

**V1 — what broke and why:** The first version was a monolithic pipeline. Documents went straight into an LLM that did both the reading and the report generation in one pass. It broke in predictable ways: hallucinated property boundaries and names, mixed up buyer and seller, and fell apart on non-English documents. The failure modes were consistent once you understood the architecture — we were asking one model to do too many things at once with no grounding.

**Fix 1 — the OCR layer:** Rather than letting the LLM read images directly, we put a dedicated OCR step in front of it to ground the model on clean text. This required a build-vs-buy evaluation — we tested OpenAI-only extraction against purpose-built OCR options like Surya and Reducto, and ended up composing them for what each did best on different document types.

**Fix 2 — multi-agent with a knowledge graph:** We moved from the single overloaded LLM to a multi-agent system grounded in a knowledge graph. Specialized agents — title, financial, compliance, cross-verification — each queried a verified, structured representation of the documents rather than a wall of raw text. This killed the hallucination problem and made the ownership chain traceable and auditable.

### The PM Pivot That Mattered Most

I was forward-deployed with our legal team running first-hand user research, and found something important: lawyers didn't actually want an "intelligent legal analyst" reasoning over documents. Most of the analysis sections the product generated went unused. What they wanted was a copilot — something that extracted reliably and let them edit fast.

That insight repositioned the product away from "out-reasoning the documents" toward extraction, structuring, and editing. A much more achievable target, and a much more valuable one. The lesson: the user's actual job-to-be-done and the product you think they want are often different, and you only find out by being in the room.

### Outcomes

- ~1,400 title search reports generated to date
- ~90% extraction accuracy
- Per-report time reduced from ~3 hours to ~1 hour (~3x improvement)
- Analyst throughput: 5 reports/day → 8–10 reports/day
- Nature of work shifted: straightforward cases automated, analysts now focused on complex title chains where their expertise is actually needed
- Clients: Hero Finance, HDFC

---

## n8n Financial Automation — NIFTY 50 Alerts (Personal Project, 2025–present)

### What It Does

An automated financial data pipeline that monitors NSE (National Stock Exchange) announcements for a watchlist of 63 NIFTY 50-listed stocks, classifies them by materiality using AI, and delivers formatted alerts to Telegram.

**How it works:**
- Hourly trigger fetches the NSE RSS feed
- Downloads linked PDFs and XML documents from each announcement, extracts first 3,500 characters
- DeepSeek LLM classifies each announcement as HIGH / MED / LOW materiality and formats a structured alert
- All alerts logged to Google Sheets; alerts pushed to Telegram with inline "Acknowledge" button for HIGH-priority items
- HIGH alerts unacknowledged after 5 minutes trigger an escalation (Twilio phone call — Phase 2)

**Why I built it:** I wanted to stay connected to equity markets while building technical depth in agentic workflows. It also became a learning project for n8n orchestration, RAG pipelines, and LLM classification at scale.

**Tech:** n8n, DeepSeek v3, Google Sheets, Telegram Bot API, Supabase (vector store for RAG pipeline variant)

---

## Hackathon Projects (13 wins from 30+ competitions)

All wins were group projects. Multiple wins at the Andhra Pradesh government AI Hackathon series, leveraging deep expertise in Indian property records and land document structures — a domain most teams couldn't credibly attack.

**AP Government AI Hackathon — Land Resurvey Automation (Won) — Case 100017**
Problem: India's land resurvey process is manual, slow, and conflict-prone. Built an AI system for geospatial image processing to automate parcel boundary extraction and land-use classification from drone/aerial imagery, aligned to Revenue (ROR) and parcel IDs. Added conflict detection between WebLand 1.0 textual records and resurvey-derived parcel areas, plus a mobile-ready field validation tool for survey inspectors with audit trails.

**AP Government AI Hackathon — Mutation Validation and Document Verification (Won) — Case 100041**
Problem: Property mutation in India requires manual verification of deeds, encumbrance certificates, identity documents, and compliance with departmental rules — error-prone and slow. Built an AI pipeline using OCR + NLP to extract and verify property documents, facial recognition and document matching for Aadhaar/PAN authentication, a rule-based compliance engine against mutation rules and departmental Acts, ML-based fraud detection for anomalies and suspicious transaction patterns, and auto-generated mutation notices with evidence tagging. Integrated via API with MeeBhoomi and IGRS AP for real-time validation. Direct overlap with AITSR — this was competing in an adjacent problem space where our domain expertise was a genuine moat.

**AP Government AI Hackathon — ITI Faculty Monitoring System (Won) — Case 100046**
Problem: ITIs (Industrial Training Institutes) across Andhra Pradesh had no reliable way to monitor faculty attendance, classroom quality, or teaching standards — all manual, tamper-prone registers. Built an AI-powered faculty monitoring system with automated tamper-proof attendance capture, continuous classroom activity monitoring for teaching quality, real-time KPI dashboards for principals and district officials, and ML-based anomaly detection for recurrent disciplinary or performance issues. Integrated with HR/payroll. Outcome: eliminated manual registers, improved accountability and governance across ITI operations statewide.

**AP Government AI Hackathon — Public Procurement Automation (Won) — Case 100018**
Problem: Government procurement in AP suffered from manual tender drafting, inconsistent evaluation, and compliance gaps — slowing project timelines and creating transparency issues. Built an AI-driven procurement platform: an AI drafting assistant generating tender documents from templates and government guidelines, automated NLP validation checking for missing clauses and policy non-compliance, a bid evaluation engine scoring and ranking vendor proposals against defined criteria, and document comparison to flag similarities or red flags across submissions. Integrated with e-procurement platforms via API with full audit trail. Target accuracy: 85%+ on compliance gap detection, 90%+ match with human expert evaluation. Outcome: 50–60% reduction in bid drafting and evaluation time.

**AP Government AI Hackathon — Smart Pothole Detection for Safer Roads (Won) — Case 100055**
Problem: Road maintenance agencies lack reliable, scalable ways to detect and prioritize pothole repairs across large road networks. Built a computer vision system for automated pothole detection from road imagery/video, enabling real-time identification, severity classification, and geolocation tagging to help municipal agencies prioritize repairs. This win demonstrated range outside the land records domain — applying AI vision to physical infrastructure.

<!-- PLACEHOLDER: Add any remaining hackathon wins outside the AP government series -->

**What the pattern shows:** I gravitate toward domain-specific AI problems where having deep domain knowledge is a real moat. The proptech hackathon wins weren't luck — they came from understanding Indian land records at a level that general teams couldn't match.

---

## This Portfolio Voice Bot (Current Build)

The AI voice bot you're currently talking to is itself a project. Full-duplex voice conversation in the browser — you speak, I respond in my cloned voice with a live text transcript. Built on Next.js 15, DeepSeek for the LLM, open-source voice cloning (XTTS-v2 or F5-TTS via Replicate) for the audio.

**Why I built it:** Two reasons. It's a portfolio piece that demonstrates I can ship an end-to-end AI voice system — not just spec one. And it's genuinely useful: a recruiter can run a first-round screen with AI Keshav before deciding whether to schedule a call.
