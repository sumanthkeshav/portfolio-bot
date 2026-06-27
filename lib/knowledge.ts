import { readFile } from "fs/promises";
import path from "path";

const KB_DIR = path.join(process.cwd(), "docs", "knowledge-base");

const FILES = [
  { header: "Career Narrative", file: "01-career-narrative.md" },
  { header: "Projects", file: "02-projects.md" },
  { header: "Interview Q&A", file: "03-interview-qa.md" },
];

interface Cache {
  content: string;
  expiresAt: number;
}

let cache: Cache | null = null;
const CACHE_TTL_MS = 60_000;

export async function loadKnowledgeBase(): Promise<string> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.content;
  }

  const sections = await Promise.all(
    FILES.map(async ({ header, file }) => {
      const filePath = path.join(KB_DIR, file);
      try {
        const content = await readFile(filePath, "utf-8");
        return `## ${header}\n\n${content.trim()}`;
      } catch {
        throw new Error(`Knowledge base file not found: ${filePath}`);
      }
    })
  );

  const content = sections.join("\n\n---\n\n");
  cache = { content, expiresAt: Date.now() + CACHE_TTL_MS };
  return content;
}
