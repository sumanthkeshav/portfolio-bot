"use client";

import { cn } from "@/lib/utils";

interface QuickButtonsProps {
  onQuestion: (text: string) => void;
  disabled: boolean;
}

const PRESETS = [
  { label: "Who are you?", q: "Who are you?" },
  { label: "Tell me about AITSR", q: "Tell me about AITSR." },
  { label: "Your experience", q: "Walk me through your experience." },
  { label: "What are you looking for?", q: "What are you looking for?" },
];

export function QuickButtons({ onQuestion, disabled }: QuickButtonsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap scrollbar-none">
      {PRESETS.map(({ label, q }) => (
        <button
          key={q}
          onClick={() => onQuestion(q)}
          disabled={disabled}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
            "border-white/[0.09] text-white/50 bg-white/[0.02]",
            "hover:border-white/25 hover:text-white/80 hover:bg-white/[0.06]",
            "disabled:opacity-30 disabled:cursor-not-allowed",
            "disabled:hover:bg-white/[0.02] disabled:hover:border-white/[0.09] disabled:hover:text-white/50"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
