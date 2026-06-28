"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

interface TranscriptProps {
  messages: Message[];
  interimTranscript?: string;
}

export function Transcript({ messages, interimTranscript }: TranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interimTranscript]);

  if (messages.length === 0 && !interimTranscript) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-1.5">
          <p className="text-white/25 text-sm">Ask me anything</p>
          <p className="text-white/15 text-xs">Tap a question below or hold the mic to speak</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {/* Assistant dot */}
            {msg.role === "assistant" && (
              <div className="w-5 h-5 rounded-full bg-white/8 border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[9px] font-semibold text-white/50">K</span>
              </div>
            )}

            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-white/8 text-white/85 rounded-tr-sm"
                  : "bg-white/[0.04] border border-white/[0.06] text-white/75 rounded-tl-sm"
              )}
            >
              {msg.pending ? <PendingDots /> : <span>{msg.content}</span>}
            </div>
          </motion.div>
        ))}

        {interimTranscript && (
          <motion.div
            key="interim"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm bg-white/[0.03] border border-white/[0.06] text-white/30 italic">
              {interimTranscript}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}

function PendingDots() {
  return (
    <span className="flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 bg-white/35 rounded-full inline-block"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}
