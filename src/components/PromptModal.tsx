"use client";

import { useState, useEffect } from "react";
import { Prompt, Category, LLM_OPTIONS, CATEGORIES } from "@/lib/types";

interface PromptModalProps {
  prompt: Prompt | null; // null = new prompt
  onSave: (data: {
    title: string;
    category: Category;
    llm: string;
    prompt: string;
    tags: string[];
  }) => void;
  onClose: () => void;
}

export default function PromptModal({
  prompt,
  onSave,
  onClose,
}: PromptModalProps) {
  const [title, setTitle] = useState(prompt?.title ?? "");
  const [category, setCategory] = useState<Category>(
    prompt?.category ?? "coding"
  );
  const [llm, setLlm] = useState(prompt?.llm ?? "Any");
  const [promptText, setPromptText] = useState(prompt?.prompt ?? "");
  const [tags, setTags] = useState<string[]>(prompt?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  const isValid = title.trim() !== "" && promptText.trim() !== "";
  const isEditing = prompt !== null;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSave({
      title: title.trim(),
      category,
      llm,
      prompt: promptText.trim(),
      tags,
    });
  };

  const categoryOptions = CATEGORIES.filter((c) => c.key !== "all");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[560px] bg-[#1a1a18] rounded-2xl border border-[#2a2a28] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="font-heading text-xl text-[#e8e4df]">
            {isEditing ? "Edit Prompt" : "New Prompt"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#7a7772] hover:text-[#e8e4df] text-xl cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-[12px] uppercase font-semibold tracking-wider text-[#7a7772] mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your prompt a name..."
              className="w-full bg-[#111110] border border-[#2a2a28] rounded-lg px-3 py-2.5 text-sm text-[#e8e4df] placeholder:text-[#7a7772]"
            />
          </div>

          {/* Category + LLM */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[12px] uppercase font-semibold tracking-wider text-[#7a7772] mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-[#111110] border border-[#2a2a28] rounded-lg px-3 py-2.5 text-sm text-[#e8e4df] cursor-pointer"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] uppercase font-semibold tracking-wider text-[#7a7772] mb-2">
                Target LLM
              </label>
              <select
                value={llm}
                onChange={(e) => setLlm(e.target.value)}
                className="w-full bg-[#111110] border border-[#2a2a28] rounded-lg px-3 py-2.5 text-sm text-[#e8e4df] cursor-pointer"
              >
                {LLM_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prompt Text */}
          <div className="mb-4">
            <label className="block text-[12px] uppercase font-semibold tracking-wider text-[#7a7772] mb-2">
              Prompt / Instructions
            </label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Write your prompt or custom instructions..."
              className="w-full bg-[#111110] border border-[#2a2a28] rounded-lg px-3 py-2.5 text-sm text-[#e8e4df] placeholder:text-[#7a7772] font-code min-h-[160px] resize-y"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-[12px] uppercase font-semibold tracking-wider text-[#7a7772] mb-2">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag..."
                className="flex-1 bg-[#111110] border border-[#2a2a28] rounded-lg px-3 py-2.5 text-sm text-[#e8e4df] placeholder:text-[#7a7772]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-[#2a2a28] text-[#e8e4df] px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3a3a38] transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 font-code text-xs text-[#c8a97e] bg-[#2a2520] px-2.5 py-1 rounded-md"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[#c8a97e] hover:text-[#e8e4df] ml-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2a2a28]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#2a2a28] text-sm text-[#7a7772] hover:text-[#e8e4df] hover:border-[#7a7772] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="bg-[#c8a97e] text-[#111110] px-5 py-2.5 rounded-[6px] font-semibold text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
            >
              {isEditing ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
