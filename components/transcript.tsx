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
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-white/30 text-sm text-center leading-relaxed">
          Tap a question below or press the mic
          <br />
          to start talking to AI Keshav.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-white/10 text-white/90"
                  : "bg-white/5 text-white/80"
              )}
            >
              {msg.role === "assistant" && (
                <span className="block text-[10px] text-white/30 mb-1 font-medium tracking-wide uppercase">
                  Keshav
                </span>
              )}
              {msg.pending ? (
                <PendingDots />
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </motion.div>
        ))}

        {interimTranscript && (
          <motion.div
            key="interim"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm bg-white/5 text-white/40 italic">
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
          className="w-1 h-1 bg-white/40 rounded-full inline-block"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}
