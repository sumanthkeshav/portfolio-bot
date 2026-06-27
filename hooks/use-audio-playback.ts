"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioState = "idle" | "loading" | "playing" | "error";

interface UseAudioPlaybackReturn {
  state: AudioState;
  play: (url: string) => void;
  stop: () => void;
}

export function useAudioPlayback(): UseAudioPlaybackReturn {
  const [state, setState] = useState<AudioState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setState("idle");
  }, []);

  const play = useCallback(
    (url: string) => {
      stop();
      setState("loading");
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        setState("playing");
        audio.play().catch(() => setState("error"));
      };

      audio.onended = () => {
        audioRef.current = null;
        setState("idle");
      };

      audio.onerror = () => {
        audioRef.current = null;
        setState("error");
      };
    },
    [stop]
  );

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return { state, play, stop };
}
