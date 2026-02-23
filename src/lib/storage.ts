import { Prompt } from "./types";

const STORAGE_KEY = "promptstrux:prompts";

const SAMPLE_PROMPTS: Omit<Prompt, "id" | "createdAt">[] = [
  {
    title: "Senior Dev Code Reviewer",
    category: "coding",
    llm: "Claude",
    prompt:
      "You are a senior software engineer conducting a thorough code review. Analyze the code I share for: bugs, security vulnerabilities, performance issues, readability concerns, and adherence to best practices. Provide specific line-by-line feedback with suggested fixes. Rate severity as Critical, Warning, or Suggestion.",
    tags: ["code review", "debugging", "best practices"],
    favorite: true,
  },
  {
    title: "Troubleshooting Assistant",
    category: "troubleshoot",
    llm: "Any",
    prompt:
      "Help me troubleshoot step by step. Ask me clarifying questions before jumping to solutions. Start by understanding the expected behavior vs actual behavior, then work through potential causes systematically from most likely to least likely. After each suggestion, ask if it resolved the issue before moving on.",
    tags: ["debugging", "systematic", "step-by-step"],
    favorite: false,
  },
  {
    title: "Explain Like I'm Learning",
    category: "learning",
    llm: "Any",
    prompt:
      "Explain concepts to me as a patient teacher would. Start with a high-level analogy, then break down the technical details progressively. Use concrete examples at each level. After explaining, give me a small challenge or question to test my understanding. Adjust complexity based on my responses.",
    tags: ["teaching", "learning", "concepts"],
    favorite: true,
  },
];

function generateId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
  );
}

export function getPrompts(): Prompt[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    // First visit — seed with sample data
    const seeded = SAMPLE_PROMPTS.map((p, i) => ({
      ...p,
      id: generateId() + i,
      createdAt: Date.now() - (SAMPLE_PROMPTS.length - i) * 60000,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(stored);
}

export function savePrompts(prompts: Prompt[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export function createPrompt(
  data: Omit<Prompt, "id" | "createdAt" | "favorite">
): Prompt {
  return {
    ...data,
    id: generateId(),
    createdAt: Date.now(),
    favorite: false,
  };
}

export function updatePrompt(
  prompts: Prompt[],
  id: string,
  data: Partial<Omit<Prompt, "id" | "createdAt">>
): Prompt[] {
  return prompts.map((p) =>
    p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
  );
}

export function deletePrompt(prompts: Prompt[], id: string): Prompt[] {
  return prompts.filter((p) => p.id !== id);
}
