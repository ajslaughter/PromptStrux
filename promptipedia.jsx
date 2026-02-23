import { useState, useEffect, useCallback } from "react";

const CATEGORIES = [
  { id: "all", label: "All", icon: "◈" },
  { id: "coding", label: "Coding", icon: "⌘" },
  { id: "troubleshoot", label: "Troubleshoot", icon: "⚡" },
  { id: "learning", label: "Learning", icon: "◉" },
  { id: "creative", label: "Creative", icon: "✦" },
  { id: "research", label: "Research", icon: "⬡" },
  { id: "writing", label: "Writing", icon: "¶" },
  { id: "system", label: "System/Custom", icon: "⊞" },
];

const LLMS = ["Any", "Claude", "GPT", "Gemini", "Llama", "Mistral", "Copilot", "Other"];

const SAMPLE_PROMPTS = [
  {
    id: "sample-1",
    title: "Senior Dev Code Reviewer",
    category: "coding",
    llm: "Claude",
    prompt: "You are a senior software engineer conducting a thorough code review. Analyze the code I share for: bugs, security vulnerabilities, performance issues, readability concerns, and adherence to best practices. Provide specific line-by-line feedback with suggested fixes. Rate severity as Critical, Warning, or Suggestion.",
    tags: ["code review", "debugging", "best practices"],
    createdAt: Date.now() - 86400000,
    favorite: true,
  },
  {
    id: "sample-2",
    title: "Troubleshooting Assistant",
    category: "troubleshoot",
    llm: "Any",
    prompt: "Help me troubleshoot step by step. Ask me clarifying questions before jumping to solutions. Start by understanding the expected behavior vs actual behavior, then work through potential causes systematically from most likely to least likely. After each suggestion, ask if it resolved the issue before moving on.",
    tags: ["debugging", "systematic", "step-by-step"],
    createdAt: Date.now() - 172800000,
    favorite: false,
  },
  {
    id: "sample-3",
    title: "Explain Like I'm Learning",
    category: "learning",
    llm: "Any",
    prompt: "Explain concepts to me as a patient teacher would. Start with a high-level analogy, then break down the technical details progressively. Use concrete examples at each level. After explaining, give me a small challenge or question to test my understanding. Adjust complexity based on my responses.",
    tags: ["teaching", "learning", "concepts"],
    createdAt: Date.now() - 259200000,
    favorite: true,
  },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export default function Promptipedia() {
  const [prompts, setPrompts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "coding",
    llm: "Any",
    prompt: "",
    tags: [],
  });

  // Load prompts from storage
  useEffect(() => {
    async function load() {
      try {
        const result = await window.storage.get("promptipedia:prompts");
        if (result && result.value) {
          setPrompts(JSON.parse(result.value));
        } else {
          setPrompts(SAMPLE_PROMPTS);
          await window.storage.set("promptipedia:prompts", JSON.stringify(SAMPLE_PROMPTS));
        }
      } catch {
        setPrompts(SAMPLE_PROMPTS);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Save prompts to storage
  const savePrompts = useCallback(async (updated) => {
    setPrompts(updated);
    try {
      await window.storage.set("promptipedia:prompts", JSON.stringify(updated));
    } catch (e) {
      console.error("Save failed:", e);
    }
  }, []);

  const filtered = prompts.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.llm.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = !showFavoritesOnly || p.favorite;
    return matchesCategory && matchesSearch && matchesFav;
  });

  const handleCopy = async (prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error("Copy failed");
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.prompt.trim()) return;
    let updated;
    if (editingPrompt) {
      updated = prompts.map((p) =>
        p.id === editingPrompt.id ? { ...p, ...form, updatedAt: Date.now() } : p
      );
    } else {
      const newPrompt = {
        ...form,
        id: generateId(),
        createdAt: Date.now(),
        favorite: false,
      };
      updated = [newPrompt, ...prompts];
    }
    await savePrompts(updated);
    resetEditor();
  };

  const handleDelete = async (id) => {
    await savePrompts(prompts.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const handleToggleFavorite = async (id) => {
    const updated = prompts.map((p) =>
      p.id === id ? { ...p, favorite: !p.favorite } : p
    );
    await savePrompts(updated);
  };

  const startEdit = (prompt) => {
    setEditingPrompt(prompt);
    setForm({
      title: prompt.title,
      category: prompt.category,
      llm: prompt.llm,
      prompt: prompt.prompt,
      tags: prompt.tags || [],
    });
    setShowEditor(true);
  };

  const resetEditor = () => {
    setShowEditor(false);
    setEditingPrompt(null);
    setForm({ title: "", category: "coding", llm: "Any", prompt: "", tags: [] });
    setTagInput("");
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setTagInput("");
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const getCategoryInfo = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingText}>◈ Loading Promptipedia...</div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 3px; }
        textarea:focus, input:focus, select:focus { outline: none; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>
            <span style={styles.logoIcon}>◈</span> Promptipedia
          </h1>
          <span style={styles.tagline}>Your prompt library</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.promptCount}>{prompts.length} prompt{prompts.length !== 1 ? "s" : ""}</span>
          <button style={styles.newBtn} onClick={() => { resetEditor(); setShowEditor(true); }}>
            + New Prompt
          </button>
        </div>
      </header>

      {/* Search & Filters */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>⌕</span>
          <input
            style={styles.searchInput}
            placeholder="Search prompts, tags, or LLMs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button style={styles.clearSearch} onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>
        <button
          style={{
            ...styles.favFilterBtn,
            ...(showFavoritesOnly ? styles.favFilterActive : {}),
          }}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          {showFavoritesOnly ? "★" : "☆"} Favorites
        </button>
      </div>

      {/* Categories */}
      <div style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            style={{
              ...styles.catBtn,
              ...(activeCategory === cat.id ? styles.catBtnActive : {}),
            }}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span style={styles.catIcon}>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>◇</div>
            <div style={styles.emptyText}>
              {searchQuery ? "No prompts match your search" : "No prompts yet"}
            </div>
            <button style={styles.emptyBtn} onClick={() => { resetEditor(); setShowEditor(true); }}>
              Create your first prompt
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((p, i) => {
              const catInfo = getCategoryInfo(p.category);
              const isExpanded = expandedId === p.id;
              return (
                <div
                  key={p.id}
                  style={{
                    ...styles.card,
                    animationDelay: `${i * 0.04}s`,
                    ...(isExpanded ? styles.cardExpanded : {}),
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.cardMeta}>
                      <span style={{ ...styles.cardCat, background: getCatColor(p.category) }}>
                        {catInfo.icon} {catInfo.label}
                      </span>
                      <span style={styles.cardLlm}>{p.llm}</span>
                    </div>
                    <button
                      style={styles.favBtn}
                      onClick={() => handleToggleFavorite(p.id)}
                    >
                      {p.favorite ? "★" : "☆"}
                    </button>
                  </div>

                  <h3 style={styles.cardTitle} onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                    {p.title}
                  </h3>

                  <div style={{
                    ...styles.cardPrompt,
                    ...(isExpanded ? styles.cardPromptExpanded : {}),
                  }}>
                    <pre style={styles.promptText}>{p.prompt}</pre>
                  </div>

                  {p.tags?.length > 0 && (
                    <div style={styles.cardTags}>
                      {p.tags.map((t) => (
                        <span key={t} style={styles.tag}>#{t}</span>
                      ))}
                    </div>
                  )}

                  <div style={styles.cardActions}>
                    <button
                      style={{
                        ...styles.copyBtn,
                        ...(copiedId === p.id ? styles.copyBtnDone : {}),
                      }}
                      onClick={() => handleCopy(p)}
                    >
                      {copiedId === p.id ? "✓ Copied!" : "⎘ Copy"}
                    </button>
                    <div style={styles.cardActionsRight}>
                      <button style={styles.editBtn} onClick={() => startEdit(p)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div style={styles.overlay} onClick={resetEditor}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingPrompt ? "Edit Prompt" : "New Prompt"}
              </h2>
              <button style={styles.modalClose} onClick={resetEditor}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Senior Dev Code Reviewer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div style={styles.fieldRow}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.select}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Target LLM</label>
                  <select
                    style={styles.select}
                    value={form.llm}
                    onChange={(e) => setForm({ ...form, llm: e.target.value })}
                  >
                    {LLMS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Prompt / Instructions</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Write your prompt or custom instructions here..."
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  rows={8}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Tags</label>
                <div style={styles.tagInputWrap}>
                  <input
                    style={styles.tagInputField}
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addTag(); }
                    }}
                  />
                  <button style={styles.tagAddBtn} onClick={addTag}>+</button>
                </div>
                {form.tags.length > 0 && (
                  <div style={styles.tagList}>
                    {form.tags.map((t) => (
                      <span key={t} style={styles.tagEditable}>
                        #{t}
                        <button style={styles.tagRemove} onClick={() => removeTag(t)}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={resetEditor}>Cancel</button>
              <button
                style={{
                  ...styles.saveBtn,
                  opacity: form.title.trim() && form.prompt.trim() ? 1 : 0.4,
                }}
                onClick={handleSave}
                disabled={!form.title.trim() || !form.prompt.trim()}
              >
                {editingPrompt ? "Update Prompt" : "Save Prompt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getCatColor(cat) {
  const colors = {
    coding: "#2d4a3e",
    troubleshoot: "#4a3a2d",
    learning: "#2d3a4a",
    creative: "#3a2d4a",
    research: "#2d4a4a",
    writing: "#4a2d3a",
    system: "#3a3a2d",
  };
  return colors[cat] || "#333";
}

const styles = {
  app: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#111110",
    color: "#e8e4df",
    minHeight: "100vh",
    maxWidth: "100%",
    overflow: "hidden",
  },
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#111110",
  },
  loadingText: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 20,
    color: "#c8a97e",
    animation: "pulse 1.5s ease infinite",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #2a2a28",
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    display: "flex",
    alignItems: "baseline",
    gap: 14,
  },
  logo: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26,
    fontWeight: 400,
    color: "#e8e4df",
    letterSpacing: "-0.02em",
  },
  logoIcon: {
    color: "#c8a97e",
    fontSize: 22,
  },
  tagline: {
    fontSize: 13,
    color: "#7a7772",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  promptCount: {
    fontSize: 13,
    color: "#7a7772",
    fontFamily: "'JetBrains Mono', monospace",
  },
  newBtn: {
    background: "#c8a97e",
    color: "#111110",
    border: "none",
    padding: "8px 18px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 24px",
    flexWrap: "wrap",
  },
  searchWrap: {
    flex: 1,
    minWidth: 200,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    color: "#5a5854",
    fontSize: 16,
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    background: "#1c1c1a",
    border: "1px solid #2a2a28",
    borderRadius: 8,
    padding: "10px 36px 10px 34px",
    color: "#e8e4df",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  clearSearch: {
    position: "absolute",
    right: 10,
    background: "none",
    border: "none",
    color: "#5a5854",
    cursor: "pointer",
    fontSize: 14,
  },
  favFilterBtn: {
    background: "#1c1c1a",
    border: "1px solid #2a2a28",
    borderRadius: 8,
    padding: "9px 14px",
    color: "#7a7772",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
  },
  favFilterActive: {
    background: "#2a2520",
    borderColor: "#c8a97e44",
    color: "#c8a97e",
  },
  categories: {
    display: "flex",
    gap: 6,
    padding: "0 24px 16px",
    overflowX: "auto",
    flexWrap: "wrap",
  },
  catBtn: {
    background: "#1c1c1a",
    border: "1px solid #2a2a28",
    borderRadius: 20,
    padding: "6px 14px",
    color: "#7a7772",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  catBtnActive: {
    background: "#2a2520",
    borderColor: "#c8a97e66",
    color: "#c8a97e",
  },
  catIcon: {
    fontSize: 11,
    marginRight: 2,
  },
  content: {
    padding: "0 24px 24px",
    overflowY: "auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#1a1a18",
    border: "1px solid #2a2a28",
    borderRadius: 12,
    padding: 20,
    animation: "slideIn 0.3s ease both",
    transition: "border-color 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardExpanded: {
    borderColor: "#c8a97e44",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardCat: {
    fontSize: 11,
    padding: "3px 9px",
    borderRadius: 4,
    color: "#c8c4bf",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  cardLlm: {
    fontSize: 12,
    color: "#7a7772",
    fontFamily: "'JetBrains Mono', monospace",
  },
  favBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    color: "#c8a97e",
    cursor: "pointer",
    padding: 0,
  },
  cardTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 18,
    fontWeight: 400,
    color: "#e8e4df",
    cursor: "pointer",
    lineHeight: 1.3,
  },
  cardPrompt: {
    maxHeight: 80,
    overflow: "hidden",
    transition: "max-height 0.3s ease",
    position: "relative",
  },
  cardPromptExpanded: {
    maxHeight: 600,
    overflow: "auto",
  },
  promptText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "#9a9690",
    fontFamily: "'JetBrains Mono', monospace",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: 0,
  },
  cardTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    fontSize: 11,
    color: "#7a7772",
    background: "#222220",
    padding: "2px 8px",
    borderRadius: 4,
    fontFamily: "'JetBrains Mono', monospace",
  },
  cardActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
    borderTop: "1px solid #222220",
    marginTop: "auto",
  },
  copyBtn: {
    background: "#252520",
    border: "1px solid #3a3a38",
    borderRadius: 6,
    padding: "6px 14px",
    color: "#c8a97e",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    transition: "all 0.2s",
  },
  copyBtnDone: {
    background: "#1a2e1a",
    borderColor: "#2a5a2a",
    color: "#6dbb6d",
  },
  cardActionsRight: {
    display: "flex",
    gap: 8,
  },
  editBtn: {
    background: "none",
    border: "none",
    color: "#7a7772",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    padding: "4px 8px",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#5a4a4a",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    padding: "4px 8px",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    animation: "fadeIn 0.5s ease",
  },
  emptyIcon: {
    fontSize: 48,
    color: "#3a3a38",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#5a5854",
    marginBottom: 20,
  },
  emptyBtn: {
    background: "#c8a97e",
    color: "#111110",
    border: "none",
    padding: "10px 22px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 20,
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    background: "#1a1a18",
    border: "1px solid #2a2a28",
    borderRadius: 16,
    width: "100%",
    maxWidth: 560,
    maxHeight: "90vh",
    overflow: "auto",
    animation: "slideIn 0.3s ease",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #2a2a28",
  },
  modalTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 22,
    fontWeight: 400,
    color: "#e8e4df",
  },
  modalClose: {
    background: "none",
    border: "none",
    color: "#7a7772",
    fontSize: 18,
    cursor: "pointer",
  },
  modalBody: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldRow: {
    display: "flex",
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#7a7772",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  input: {
    background: "#111110",
    border: "1px solid #2a2a28",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#e8e4df",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  select: {
    background: "#111110",
    border: "1px solid #2a2a28",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#e8e4df",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
  },
  textarea: {
    background: "#111110",
    border: "1px solid #2a2a28",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#e8e4df",
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1.6,
    resize: "vertical",
    minHeight: 160,
  },
  tagInputWrap: {
    display: "flex",
    gap: 6,
  },
  tagInputField: {
    flex: 1,
    background: "#111110",
    border: "1px solid #2a2a28",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#e8e4df",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
  },
  tagAddBtn: {
    background: "#252520",
    border: "1px solid #3a3a38",
    borderRadius: 8,
    padding: "8px 14px",
    color: "#c8a97e",
    fontSize: 16,
    cursor: "pointer",
  },
  tagList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  tagEditable: {
    fontSize: 12,
    color: "#c8a97e",
    background: "#2a2520",
    padding: "3px 8px",
    borderRadius: 4,
    fontFamily: "'JetBrains Mono', monospace",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tagRemove: {
    background: "none",
    border: "none",
    color: "#7a5a3a",
    fontSize: 10,
    cursor: "pointer",
    padding: 0,
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "16px 24px 20px",
    borderTop: "1px solid #2a2a28",
  },
  cancelBtn: {
    background: "none",
    border: "1px solid #2a2a28",
    borderRadius: 6,
    padding: "8px 18px",
    color: "#7a7772",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  saveBtn: {
    background: "#c8a97e",
    color: "#111110",
    border: "none",
    borderRadius: 6,
    padding: "8px 22px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity 0.2s",
  },
};
