"use client";

interface HeaderProps {
  promptCount: number;
  onNewPrompt: () => void;
}

export default function Header({ promptCount, onNewPrompt }: HeaderProps) {
  return (
    <header className="border-b border-[#2a2a28] px-6 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl text-[#e8e4df]">
            <span className="text-[#c8a97e] mr-2">◈</span>
            PromptStrux
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a7772] mt-0.5 font-medium">
            Your Prompt Library
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-code text-sm text-[#7a7772]">
            {promptCount} {promptCount === 1 ? "prompt" : "prompts"}
          </span>
          <button
            onClick={onNewPrompt}
            className="bg-[#c8a97e] text-[#111110] px-4 py-2 rounded-[6px] font-semibold text-sm hover:brightness-110 transition-all cursor-pointer"
          >
            + New Prompt
          </button>
        </div>
      </div>
    </header>
  );
}
