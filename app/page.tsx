import { ChatPanel } from "@/components/chat-panel";

export default function Home() {
  return (
    // TODO: Replace with final homepage design — this is a placeholder
    <main className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Left — intro (desktop only; on mobile, chat comes first) */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center px-12 lg:px-20 shrink-0">
        <p className="text-white/40 text-sm font-medium tracking-widest uppercase mb-4">
          Portfolio
        </p>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
          Hi, I&apos;m Keshav.
        </h1>
        <p className="text-white/50 text-lg leading-relaxed max-w-sm">
          AI Product Manager. Ask me anything — tap a question or hold the mic.
        </p>
      </div>

      {/* Right — chat panel (full width on mobile) */}
      <div className="flex-1 md:w-1/2 flex flex-col p-3 md:p-6 min-h-0">
        {/* Mobile-only name */}
        <div className="md:hidden px-1 pb-3 shrink-0">
          <h1 className="text-xl font-bold">Keshav</h1>
          <p className="text-white/40 text-sm">AI Product Manager</p>
        </div>
        <div className="flex-1 min-h-0">
          <ChatPanel />
        </div>
      </div>
    </main>
  );
}
