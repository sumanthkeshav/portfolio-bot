import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "24 h"),
  prefix: "rl:chat",
});

const ttsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "24 h"),
  prefix: "rl:tts",
});

export async function proxy(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";

  const { pathname } = req.nextUrl;

  let result;
  if (pathname === "/api/chat") {
    result = await chatLimiter.limit(ip);
  } else if (pathname === "/api/tts") {
    result = await ttsLimiter.limit(ip);
  } else {
    return NextResponse.next();
  }

  if (!result.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again tomorrow." },
      {
        status: 429,
        headers: { "Retry-After": "86400" },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/chat", "/api/tts"],
};
