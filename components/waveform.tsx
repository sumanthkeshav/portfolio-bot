"use client";

import { motion } from "framer-motion";

interface WaveformProps {
  isPlaying: boolean;
}

const BARS = 5;

export function Waveform({ isPlaying }: WaveformProps) {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {Array.from({ length: BARS }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-white/80 inline-block"
          animate={
            isPlaying
              ? { scaleY: [0.3, 1, 0.3], height: ["8px", "20px", "8px"] }
              : { height: "6px" }
          }
          transition={
            isPlaying
              ? {
                  duration: 0.7,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }
              : { duration: 0.2 }
          }
          style={{ height: "6px" }}
        />
      ))}
    </div>
  );
}
