"use client";

import { cn } from "@/lib/utils";

interface QuickButtonsProps {
  onQuestion: (text: string) => void;
  disabled: boolean;
}

const PRESETS = [
  "Who are you?",
  "What projects are you most proud of?",
  "What are your skills?",
  "Can I see your resume?",
];

export function QuickButtons({ onQuestion, disabled }: QuickButtonsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap scrollbar-none">
      {PRESETS.map((q) => (
        <button
          key={q}
          onClick={() => onQuestion(q)}
          disabled={disabled}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            "border-white/10 text-white/70 hover:border-white/30 hover:text-white/90 hover:bg-white/5",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-white/10 disabled:hover:text-white/70"
          )}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
