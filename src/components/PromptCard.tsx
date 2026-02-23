"use client";

import { useState } from "react";
import { Prompt, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/types";

interface PromptCardProps {
  prompt: Prompt;
  index: number;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function PromptCard({
  prompt,
  index,
  onEdit,
  onDelete,
  onToggleFavorite,
}: PromptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = prompt.prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const badgeColor = CATEGORY_COLORS[prompt.category];
  const catIcon = CATEGORY_ICONS[prompt.category];

  return (
    <div
      className="animate-slide-in rounded-xl border transition-all duration-300"
      style={{
        animationDelay: `${index * 0.04}s`,
        background: "#1a1a18",
        borderColor: expanded ? "#c8a97e44" : "#2a2a28",
        boxShadow: expanded ? "0 4px 24px rgba(0,0,0,0.3)" : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <span
          className="text-[10px] uppercase font-semibold tracking-wider px-2 py-1 rounded"
          style={{ background: badgeColor, color: "#e8e4df" }}
        >
          {catIcon} {prompt.category}
        </span>
        <span className="font-code text-xs text-[#7a7772]">
          {prompt.llm}
        </span>
        <button
          onClick={() => onToggleFavorite(prompt.id)}
          className="ml-auto text-lg cursor-pointer transition-colors hover:scale-110"
          style={{ color: prompt.favorite ? "#c8a97e" : "#7a7772" }}
          title={prompt.favorite ? "Remove from favorites" : "Add to favorites"}
        >
          {prompt.favorite ? "★" : "☆"}
        </button>
      </div>

      {/* Title */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-1 cursor-pointer"
      >
        <h3 className="font-heading text-lg text-[#e8e4df] hover:text-[#c8a97e] transition-colors">
          {prompt.title}
        </h3>
      </button>

      {/* Prompt Preview */}
      <div
        className="px-5 py-2 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: expanded ? "600px" : "80px" }}
      >
        <p className="font-code text-[13px] text-[#9a9690] leading-relaxed whitespace-pre-wrap">
          {prompt.prompt}
        </p>
      </div>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 py-2">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="font-code text-[11px] text-[#7a7772] bg-[#222220] px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#2a2a28] mt-1">
        <button
          onClick={handleCopy}
          className={`text-sm font-medium cursor-pointer transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-md ${
            copied
              ? "bg-[#1a2e1a] border border-[#2a5a2a] text-[#6dbb6d]"
              : "text-[#c8a97e] hover:brightness-110"
          }`}
        >
          {copied ? "✓ Copied!" : "⎘ Copy"}
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(prompt)}
            className="text-sm text-[#7a7772] hover:text-[#e8e4df] cursor-pointer transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="text-sm text-[#7a7772] hover:text-[#e8e4df] cursor-pointer transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
