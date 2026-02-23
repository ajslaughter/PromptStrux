"use client";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#111110] flex items-center justify-center z-50">
      <p className="font-heading text-xl text-[#e8e4df] animate-pulse-loading">
        <span className="text-[#c8a97e] mr-2">◈</span>
        Loading PromptStrux...
      </p>
    </div>
  );
}
