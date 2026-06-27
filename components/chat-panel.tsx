"use client";

import { useCallback, useState } from "react";
import { nanoid } from "nanoid";
import { Transcript, type Message } from "@/components/transcript";
import { QuickButtons } from "@/components/quick-buttons";
import { MicButton } from "@/components/mic-button";
import { Waveform } from "@/components/waveform";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useAudioPlayback } from "@/hooks/use-audio-playback";

type TurnState = "idle" | "processing" | "speaking" | "error" | "rate-limited";

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [turnState, setTurnState] = useState<TurnState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioPlayback = useAudioPlayback();

  const handleQuestion = useCallback(
    async (text: string) => {
      if (turnState !== "idle") return;

      const userMsg: Message = { id: nanoid(), role: "user", content: text };
      const pendingMsg: Message = { id: nanoid(), role: "assistant", content: "", pending: true };

      setMessages((prev) => [...prev, userMsg, pendingMsg]);
      setTurnState("processing");
      setErrorMsg(null);

      const history = messages
        .filter((m) => !m.pending)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history }),
        });

        if (chatRes.status === 429) {
          setTurnState("rate-limited");
          setErrorMsg("You've reached today's conversation limit. Come back tomorrow.");
          setMessages((prev) => prev.filter((m) => m.id !== pendingMsg.id));
          return;
        }

        if (!chatRes.ok) throw new Error("chat-api");

        const { text: responseText } = await chatRes.json() as { text: string };

        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: responseText }),
        });

        if (ttsRes.status === 429) {
          setTurnState("rate-limited");
          setErrorMsg("You've reached today's conversation limit. Come back tomorrow.");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === pendingMsg.id ? { ...m, content: responseText, pending: false } : m
            )
          );
          return;
        }

        if (!ttsRes.ok) throw new Error("tts-api");

        const { audioUrl } = await ttsRes.json() as { audioUrl: string };

        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingMsg.id ? { ...m, content: responseText, pending: false } : m
          )
        );

        setTurnState("speaking");
        audioPlayback.play(audioUrl);

        // Poll for audio end
        const checkEnd = setInterval(() => {
          if (audioPlayback.state === "idle" || audioPlayback.state === "error") {
            clearInterval(checkEnd);
            setTurnState("idle");
          }
        }, 200);
      } catch {
        setTurnState("error");
        setErrorMsg("Something went wrong. Try again.");
        setMessages((prev) => prev.filter((m) => m.id !== pendingMsg.id));
      }
    },
    [turnState, messages, audioPlayback]
  );

  const { state: speechState, interimTranscript, start: startListening, stop: stopListening } =
    useSpeechRecognition({ onResult: handleQuestion });

  const isBusy = turnState !== "idle";

  const handleRetry = () => {
    setTurnState("idle");
    setErrorMsg(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] rounded-2xl border border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
          <span className="text-xs text-white/40 font-medium tracking-wide">AI KESHAV</span>
        </div>
      </div>

      {/* Transcript */}
      <Transcript messages={messages} interimTranscript={interimTranscript} />

      {/* Error / rate limit banner */}
      {errorMsg && (
        <div className="px-4 pb-2 shrink-0">
          <div className="flex items-center justify-between gap-2 bg-white/5 rounded-lg px-3 py-2">
            <span className="text-xs text-white/50">{errorMsg}</span>
            {turnState === "error" && (
              <button
                onClick={handleRetry}
                className="text-xs text-white/60 hover:text-white/90 underline shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] space-y-3 shrink-0">
        {/* Quick buttons */}
        {speechState !== "unsupported" ? (
          <QuickButtons onQuestion={handleQuestion} disabled={isBusy} />
        ) : (
          <p className="text-xs text-yellow-400/70 text-center">
            Chrome or Edge required for voice input. Quick buttons still work.
          </p>
        )}

        {/* Mic + waveform row */}
        <div className="flex items-center gap-3">
          <MicButton
            speechState={speechState}
            botBusy={isBusy}
            onStart={startListening}
            onStop={stopListening}
          />
          <Waveform isPlaying={audioPlayback.state === "playing"} />
          {turnState === "processing" && (
            <span className="text-xs text-white/30 ml-1">Thinking…</span>
          )}
          {speechState === "listening" && (
            <span className="text-xs text-white/30 ml-1">Listening…</span>
          )}
        </div>
      </div>
    </div>
  );
}
