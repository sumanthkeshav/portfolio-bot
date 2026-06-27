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

// deepseek-chat currently resolves to V3; update to V4 slug when published.
// deepseek-chat alias is deprecated 2026-07-24.
export const DEEPSEEK_MODEL = "deepseek-chat";
