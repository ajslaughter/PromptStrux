"use client";

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  favoritesOnly: boolean;
  onToggleFavorites: () => void;
}

export default function SearchBar({
  search,
  onSearchChange,
  favoritesOnly,
  onToggleFavorites,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[240px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7772] text-sm">
          ⌕
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search prompts, tags, or LLMs..."
          className="w-full bg-[#111110] border border-[#2a2a28] rounded-lg pl-9 pr-9 py-2.5 text-sm text-[#e8e4df] placeholder:text-[#7a7772] font-body"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7772] hover:text-[#e8e4df] text-sm cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>
      <button
        onClick={onToggleFavorites}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
          favoritesOnly
            ? "bg-[#2a2520] border-[#c8a97e66] text-[#c8a97e]"
            : "bg-[#1c1c1a] border-[#2a2a28] text-[#7a7772] hover:text-[#e8e4df]"
        }`}
      >
        {favoritesOnly ? "★" : "☆"} Favorites
      </button>
    </div>
  );
}
