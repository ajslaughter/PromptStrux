"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Prompt, Category } from "@/lib/types";
import {
  getPrompts,
  savePrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from "@/lib/storage";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CategoryPills from "@/components/CategoryPills";
import PromptCard from "@/components/PromptCard";
import EmptyState from "@/components/EmptyState";
import PromptModal from "@/components/PromptModal";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  // Load prompts from localStorage
  useEffect(() => {
    const loaded = getPrompts();
    setPrompts(loaded);
    setLoading(false);
  }, []);

  // Persist whenever prompts change (skip initial load)
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      return;
    }
    savePrompts(prompts);
  }, [prompts, initialized]);

  // Filter prompts
  const filtered = useMemo(() => {
    let result = prompts;

    if (favoritesOnly) {
      result = result.filter((p) => p.favorite);
    }

    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.llm.toLowerCase().includes(q)
      );
    }

    return result;
  }, [prompts, search, activeCategory, favoritesOnly]);

  const handleNewPrompt = useCallback(() => {
    setEditingPrompt(null);
    setModalOpen(true);
  }, []);

  const handleEditPrompt = useCallback((prompt: Prompt) => {
    setEditingPrompt(prompt);
    setModalOpen(true);
  }, []);

  const handleSavePrompt = useCallback(
    (data: {
      title: string;
      category: Category;
      llm: string;
      prompt: string;
      tags: string[];
    }) => {
      if (editingPrompt) {
        setPrompts((prev) => updatePrompt(prev, editingPrompt.id, data));
      } else {
        const newPrompt = createPrompt(data);
        setPrompts((prev) => [newPrompt, ...prev]);
      }
      setModalOpen(false);
      setEditingPrompt(null);
    },
    [editingPrompt]
  );

  const handleDeletePrompt = useCallback((id: string) => {
    setPrompts((prev) => deletePrompt(prev, id));
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))
    );
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingPrompt(null);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const hasActiveFilters =
    search.trim() !== "" || activeCategory !== "all" || favoritesOnly;

  return (
    <div className="min-h-screen bg-[#111110]">
      <Header promptCount={prompts.length} onNewPrompt={handleNewPrompt} />

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Search & Filter */}
        <div className="mb-4">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            favoritesOnly={favoritesOnly}
            onToggleFavorites={() => setFavoritesOnly(!favoritesOnly)}
          />
        </div>

        {/* Category Pills */}
        <div className="mb-6">
          <CategoryPills active={activeCategory} onChange={setActiveCategory} />
        </div>

        {/* Cards Grid or Empty State */}
        {filtered.length > 0 ? (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            }}
          >
            {filtered.map((prompt, i) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                index={i}
                onEdit={handleEditPrompt}
                onDelete={handleDeletePrompt}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            hasSearch={hasActiveFilters}
            onCreateNew={handleNewPrompt}
          />
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <PromptModal
          prompt={editingPrompt}
          onSave={handleSavePrompt}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
