import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getDeepSeekClient(): OpenAI {
  if (!_client) {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not set");
    }
    _client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1",
    });
  }
  return _client;
}

// Fallback: "gpt-4o-mini" (swap baseURL + apiKey to OpenAI)
export const DEEPSEEK_MODEL = "deepseek-v4-flash";
