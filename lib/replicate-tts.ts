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

// F5-TTS on Replicate — pinned to a stable version hash.
// To swap to XTTS-v2: replace with "lucataco/xtts-v2:<version-hash>"
const F5_TTS_MODEL =
  "lucataco/f5-tts:87faf6dd7a692dd82043f662e76c8048b6a18b2c6a185a2ef6e87ed42985e5e5" as const;

export async function generateSpeech(
  text: string,
  referenceAudioUrl: string
): Promise<string> {
  const replicate = getReplicateClient();

  const output = await replicate.run(F5_TTS_MODEL, {
    input: {
      gen_text: text,
      ref_audio_url: referenceAudioUrl,
      ref_text: "",
      model_type: "F5-TTS",
      remove_silence: true,
    },
  });

  if (typeof output === "string") return output;
  if (output && typeof (output as { url?: () => string }).url === "function") {
    return (output as { url: () => string }).url();
  }
  throw new Error("Unexpected Replicate output format");
}
