"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechState = "idle" | "listening" | "error" | "unsupported";

interface UseSpeechRecognitionOptions {
  onResult: (transcript: string) => void;
}

interface UseSpeechRecognitionReturn {
  state: SpeechState;
  interimTranscript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions
): UseSpeechRecognitionReturn {
  const [state, setState] = useState<SpeechState>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(options.onResult);
  onResultRef.current = options.onResult;

  useEffect(() => {
    const SR =
      typeof window !== "undefined"
        ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
        : undefined;

    if (!SR) {
      setState("unsupported");
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      setInterimTranscript(interim);
      if (final.trim()) {
        setInterimTranscript("");
        onResultRef.current(final.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg =
        event.error === "not-allowed"
          ? "Microphone access denied. Allow mic permission and try again."
          : `Speech error: ${event.error}`;
      setError(msg);
      setState("error");
    };

    recognition.onend = () => {
      setInterimTranscript("");
      setState((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognitionRef.current = recognition;
  }, []);

  const start = useCallback(() => {
    if (state === "listening" || state === "unsupported") return;
    setError(null);
    setInterimTranscript("");
    setState("listening");
    recognitionRef.current?.start();
  }, [state]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setInterimTranscript("");
    setState("idle");
  }, []);

  return { state, interimTranscript, error, start, stop };
}
