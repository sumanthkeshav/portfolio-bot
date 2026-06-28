import Replicate from "replicate";

let _replicate: Replicate | null = null;

function getReplicateClient(): Replicate {
  if (!_replicate) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }
    _replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  }
  return _replicate;
}

const MODEL =
  "minimax/speech-02-hd:b2c687e53557eee08b35b59620f88750671e97b9a91f351ea6797ac838a0773d" as const;

const VOICE_ID = "R8_ZVBKSSCZ";

export async function generateSpeech(text: string): Promise<string> {
  const replicate = getReplicateClient();

  const output = await replicate.run(MODEL, {
    input: {
      text,
      voice_id: VOICE_ID,
      speed: 1.0,
      volume: 1.0,
      pitch: 0,
      emotion: "auto",
      audio_format: "mp3",
      language_boost: "English",
    },
  });

  if (typeof output === "string") return output;
  if (output && typeof (output as { url?: () => string }).url === "function") {
    return (output as { url: () => string }).url();
  }
  throw new Error("Unexpected Replicate output format");
}
