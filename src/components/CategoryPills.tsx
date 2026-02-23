"use client";

import { CATEGORIES, Category } from "@/lib/types";

interface CategoryPillsProps {
  active: Category | "all";
  onChange: (cat: Category | "all") => void;
}

export default function CategoryPills({ active, onChange }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
            active === cat.key
              ? "bg-[#2a2520] border-[#c8a97e66] text-[#c8a97e]"
              : "bg-[#1c1c1a] border-[#2a2a28] text-[#7a7772] hover:text-[#e8e4df]"
          }`}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
