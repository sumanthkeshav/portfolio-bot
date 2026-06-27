"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpeechState } from "@/hooks/use-speech-recognition";

interface MicButtonProps {
  speechState: SpeechState;
  botBusy: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function MicButton({ speechState, botBusy, onStart, onStop }: MicButtonProps) {
  const isListening = speechState === "listening";
  const disabled = botBusy || speechState === "unsupported";

  return (
    <button
      onMouseDown={onStart}
      onMouseUp={onStop}
      onTouchStart={onStart}
      onTouchEnd={onStop}
      disabled={disabled}
      aria-label={isListening ? "Release to send" : "Hold to speak"}
      className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0",
        isListening
          ? "bg-red-500/90 scale-110 ring-2 ring-red-400/50"
          : "bg-white/10 hover:bg-white/20",
        disabled && "opacity-40 cursor-not-allowed hover:bg-white/10"
      )}
    >
      {botBusy ? (
        <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
      ) : isListening ? (
        <MicOff className="w-5 h-5 text-white" />
      ) : (
        <Mic className="w-5 h-5 text-white/80" />
      )}
    </button>
  );
}
