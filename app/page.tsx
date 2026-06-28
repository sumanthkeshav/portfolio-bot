import { ChatPanel } from "@/components/chat-panel";

export default function Home() {
  return (
    <main className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Left — identity panel (desktop only) */}
      <div className="hidden md:flex md:w-[380px] lg:w-[420px] flex-col justify-between px-10 lg:px-14 py-12 border-r border-white/[0.06] shrink-0">
        {/* Top — avatar + name */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-white/80">K</span>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Keshav</h1>
              <p className="text-xs text-white/40 mt-0.5">AI Product Manager</p>
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-5">
            <Credential
              label="JP Morgan"
              sub="Equity Research · 2021–2025"
              detail="€250B coverage, built automation that cut report time 87%"
            />
            <Credential
              label="Landeed (YC)"
              sub="Product Owner · 2025–2026"
              detail="Owned ₹30L/mo revenue, 10-person team, 30% user growth"
            />
            <Credential
              label="AITSR"
              sub="AI title search engine"
              detail="1,400+ reports · 90% accuracy · 3 hrs → 1 hr per report"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-8">
            {["BITS Pilani", "CFA L1 + L2", "13 hackathon wins"].map((t) => (
              <span
                key={t}
                className="text-[11px] text-white/35 border border-white/[0.08] rounded-full px-2.5 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom — links */}
        <div className="flex gap-4">
          <a
            href="https://linkedin.com/in/sumanthkeshav"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/30 hover:text-white/70 transition-colors"
          >
            LinkedIn ↗
          </a>
          <a
            href="https://github.com/sumanthkeshav"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/30 hover:text-white/70 transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </div>

      {/* Right — chat panel */}
      <div className="flex-1 flex flex-col p-3 md:p-5 min-h-0">
        {/* Mobile-only header */}
        <div className="md:hidden flex items-center gap-3 px-1 pb-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-white/80">K</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold">Keshav</h1>
            <p className="text-[11px] text-white/40">AI Product Manager</p>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ChatPanel />
        </div>
      </div>
    </main>
  );
}

function Credential({
  label,
  sub,
  detail,
}: {
  label: string;
  sub: string;
  detail: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-white/80">{label}</span>
        <span className="text-[11px] text-white/35">{sub}</span>
      </div>
      <p className="text-[12px] text-white/40 mt-0.5 leading-relaxed">{detail}</p>
    </div>
  );
}
