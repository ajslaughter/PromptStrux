"use client";

interface EmptyStateProps {
  hasSearch: boolean;
  onCreateNew: () => void;
}

export default function EmptyState({ hasSearch, onCreateNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <span className="text-5xl text-[#7a7772] mb-4">◇</span>
      <p className="text-[#7a7772] text-lg mb-6">
        {hasSearch ? "No prompts match your search" : "No prompts yet"}
      </p>
      {!hasSearch && (
        <button
          onClick={onCreateNew}
          className="bg-[#c8a97e] text-[#111110] px-5 py-2.5 rounded-[6px] font-semibold text-sm hover:brightness-110 transition-all cursor-pointer"
        >
          Create your first prompt
        </button>
      )}
    </div>
  );
}
