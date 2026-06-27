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

// XTTS-v2 on Replicate (F5-TTS was removed from the platform)
const TTS_MODEL =
  "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e" as const;

export async function generateSpeech(
  text: string,
  referenceAudioUrl: string
): Promise<string> {
  const replicate = getReplicateClient();

  const output = await replicate.run(TTS_MODEL, {
    input: {
      text,
      speaker: referenceAudioUrl,
      language: "en",
      cleanup_voice: false,
    },
  });

  if (typeof output === "string") return output;
  if (output && typeof (output as { url?: () => string }).url === "function") {
    return (output as { url: () => string }).url();
  }
  throw new Error("Unexpected Replicate output format");
}
