export interface Prompt {
  id: string;
  title: string;
  category: Category;
  llm: string;
  prompt: string;
  tags: string[];
  createdAt: number;
  updatedAt?: number;
  favorite: boolean;
}

export type Category =
  | "coding"
  | "troubleshoot"
  | "learning"
  | "creative"
  | "research"
  | "writing"
  | "system";

export const LLM_OPTIONS = [
  "Any",
  "Claude",
  "GPT",
  "Gemini",
  "Llama",
  "Mistral",
  "Copilot",
  "Other",
] as const;

export const CATEGORIES: { key: Category | "all"; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "◈" },
  { key: "coding", label: "Coding", icon: "⌘" },
  { key: "troubleshoot", label: "Troubleshoot", icon: "⚡" },
  { key: "learning", label: "Learning", icon: "◉" },
  { key: "creative", label: "Creative", icon: "✦" },
  { key: "research", label: "Research", icon: "⬡" },
  { key: "writing", label: "Writing", icon: "¶" },
  { key: "system", label: "System", icon: "⊞" },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  coding: "#2d4a3e",
  troubleshoot: "#4a3a2d",
  learning: "#2d3a4a",
  creative: "#3a2d4a",
  research: "#2d4a4a",
  writing: "#4a2d3a",
  system: "#3a3a2d",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  coding: "⌘",
  troubleshoot: "⚡",
  learning: "◉",
  creative: "✦",
  research: "⬡",
  writing: "¶",
  system: "⊞",
};
