import React, { useState, useEffect } from "react";

// ─── Platforms ───
const PLATFORMS = [
  {
    id: "youtube",
    label: "YouTube",
    icon: "fa-brands fa-youtube",
    color: "#FF0000",
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: "fa-brands fa-tiktok",
    color: "#000000",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "fa-brands fa-instagram",
    color: "#E1306C",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    icon: "fa-brands fa-x-twitter",
    color: "#1DA1F2",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "fa-brands fa-linkedin",
    color: "#0A66C2",
  },
  {
    id: "blog",
    label: "Blog / Article",
    icon: "fa-solid fa-pen-nib",
    color: "#22c55e",
  },
  {
    id: "podcast",
    label: "Podcast",
    icon: "fa-solid fa-podcast",
    color: "#8b5cf6",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    icon: "fa-solid fa-envelope",
    color: "#f97316",
  },
];

const CONTENT_TYPES = [
  "Video",
  "Short / Reel",
  "Post",
  "Story",
  "Article",
  "Thread",
  "Carousel",
  "Live",
  "Podcast Episode",
  "Newsletter",
];

const STATUS_MAP = {
  idea: {
    label: "Idea",
    color: "text-slate-400 bg-slate-100 dark:bg-slate-800",
    icon: "fa-lightbulb",
  },
  planned: {
    label: "Planned",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    icon: "fa-calendar-check",
  },
  scripting: {
    label: "Scripting",
    color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
    icon: "fa-pen",
  },
  recording: {
    label: "Recording",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
    icon: "fa-microphone",
  },
  editing: {
    label: "Editing",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
    icon: "fa-scissors",
  },
  scheduled: {
    label: "Scheduled",
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20",
    icon: "fa-clock",
  },
  published: {
    label: "Published",
    color: "text-green-500 bg-green-50 dark:bg-green-900/20",
    icon: "fa-check-circle",
  },
};

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ContentView({
  commitmentTemplates,
  onCreateCommitment,
  onApplyContentPlan,
}) {
  // ─── State ───
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Content item editor
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Builder
  const [builderData, setBuilderData] = useState({
    name: "",
    durationType: "weekly",
    customDays: 7,
    color: "#8b5cf6",
    items: [],
  });

  // Item form
  const [itemForm, setItemForm] = useState({
    title: "",
    platform: "youtube",
    contentType: "Video",
    description: "",
    dayIndex: 0,
    startTime: "10:00",
    endTime: "11:30",
    status: "idea",
    notes: "",
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("content-plans");
      if (saved) setPlans(JSON.parse(saved));
    } catch (e) {
      console.error("Error loading content plans:", e);
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem("content-plans", JSON.stringify(plans));
  }, [plans]);

  // ═══════════════════════════════════════
  //  PLAN CRUD
  // ═══════════════════════════════════════

  const getDurationDays = (plan) => {
    if (plan.durationType === "weekly") return 7;
    if (plan.durationType === "biweekly") return 14;
    if (plan.durationType === "monthly") return 30;
    return plan.customDays || 7;
  };

  const openBuilder = (existing = null) => {
    if (existing) {
      setBuilderData({ ...existing });
      setEditingPlan(existing.id);
    } else {
      setBuilderData({
        name: "",
        durationType: "weekly",
        customDays: 7,
        color: "#8b5cf6",
        items: [],
      });
      setEditingPlan(null);
    }
    setShowPlanBuilder(true);
  };

  const savePlan = () => {
    if (!builderData.name.trim()) return alert("Enter a plan name");

    const plan = {
      ...builderData,
      id: editingPlan || Date.now(),
      createdAt: editingPlan
        ? plans.find((p) => p.id === editingPlan)?.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingPlan) {
      setPlans((prev) => prev.map((p) => (p.id === editingPlan ? plan : p)));
      if (selectedPlan?.id === editingPlan) setSelectedPlan(plan);
    } else {
      setPlans((prev) => [...prev, plan]);
    }
    setShowPlanBuilder(false);
    setEditingPlan(null);
  };

  const deletePlan = (planId) => {
    if (!confirm("Delete this content plan?")) return;
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    if (selectedPlan?.id === planId) setSelectedPlan(null);
  };

  // ═══════════════════════════════════════
  //  ITEMS CRUD
  // ═══════════════════════════════════════

  const openItemEditor = (item = null) => {
    if (item) {
      setItemForm({ ...item });
      setEditingItem(item.id);
    } else {
      setItemForm({
        title: "",
        platform: "youtube",
        contentType: "Video",
        description: "",
        dayIndex: 0,
        startTime: "10:00",
        endTime: "11:30",
        status: "idea",
        notes: "",
      });
      setEditingItem(null);
    }
    setShowItemEditor(true);
  };

  const saveItem = () => {
    if (!itemForm.title.trim()) return alert("Enter a content title");
    if (!selectedPlan) return;

    const item = {
      ...itemForm,
      id: editingItem || Date.now(),
    };

    const updatedPlan = { ...selectedPlan };
    if (editingItem) {
      updatedPlan.items = updatedPlan.items.map((i) =>
        i.id === editingItem ? item : i,
      );
    } else {
      updatedPlan.items = [...(updatedPlan.items || []), item];
    }

    setPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)),
    );
    setSelectedPlan(updatedPlan);
    setShowItemEditor(false);
    setEditingItem(null);
  };

  const deleteItem = (itemId) => {
    if (!selectedPlan) return;
    const updatedPlan = {
      ...selectedPlan,
      items: selectedPlan.items.filter((i) => i.id !== itemId),
    };
    setPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)),
    );
    setSelectedPlan(updatedPlan);
  };

  const cycleStatus = (itemId) => {
    if (!selectedPlan) return;
    const statusOrder = Object.keys(STATUS_MAP);
    const updatedPlan = {
      ...selectedPlan,
      items: selectedPlan.items.map((item) => {
        if (item.id !== itemId) return item;
        const idx = statusOrder.indexOf(item.status);
        const next = statusOrder[(idx + 1) % statusOrder.length];
        return { ...item, status: next };
      }),
    };
    setPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)),
    );
    setSelectedPlan(updatedPlan);
  };

  // ═══════════════════════════════════════
  //  APPLY PLAN TO SCHEDULE
  // ═══════════════════════════════════════

  const applyPlanToSchedule = () => {
    if (!selectedPlan || !selectedPlan.items?.length) {
      return alert("Add content items to the plan first");
    }

    // 1) Create commitment templates for each unique platform+contentType combo
    const templateMap = {};
    selectedPlan.items.forEach((item) => {
      const platform = PLATFORMS.find((p) => p.id === item.platform);
      const tplKey = `content-${selectedPlan.id}-${item.platform}-${item.contentType}`;

      if (!templateMap[tplKey]) {
        templateMap[tplKey] = {
          id: tplKey,
          name: `📹 ${platform?.label || item.platform} — ${item.contentType}`,
          description: `Content creation: ${item.contentType} for ${platform?.label || item.platform}`,
          color: platform?.color || selectedPlan.color,
          priority: "medium",
          startTime: item.startTime || "10:00",
          endTime: item.endTime || "11:30",
          category: "content",
          icon: platform?.icon || "fa-video",
          sourceContentPlan: selectedPlan.id,
        };
      }
    });

    // 2) Create templates via callback
    if (onCreateCommitment) {
      Object.values(templateMap).forEach((tpl) => {
        const exists = (commitmentTemplates || []).find(
          (t) => String(t.id) === String(tpl.id),
        );
        if (!exists) {
          onCreateCommitment(tpl);
        }
      });
    }

    // 3) Build instances array: each item → a schedule instance on its dayIndex
    const instances = selectedPlan.items.map((item) => {
      const platform = PLATFORMS.find((p) => p.id === item.platform);
      const tplKey = `content-${selectedPlan.id}-${item.platform}-${item.contentType}`;
      return {
        templateId: tplKey,
        dayIndex: item.dayIndex % 7, // map to 0–6 for the weekly view
        startTime: item.startTime,
        endTime: item.endTime,
        contentTitle: item.title,
        contentDescription: item.description,
      };
    });

    // 4) Push to App.jsx via callback
    if (onApplyContentPlan) {
      onApplyContentPlan(instances);
      alert(
        `✅ Applied ${instances.length} content item(s) to the weekly schedule!`,
      );
    }
  };

  // ═══════════════════════════════════════
  //  Helper: get platform info
  // ═══════════════════════════════════════
  const getPlatform = (id) =>
    PLATFORMS.find((p) => p.id === id) || PLATFORMS[0];

  // ═══════════════════════════════════════
  //  RENDER — PLAN LIST
  // ═══════════════════════════════════════

  if (!showPlanBuilder && !selectedPlan) {
    return (
      <div className="pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <i className="fa-solid fa-video text-purple-500"></i>
              Content Studio
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Plan content across platforms, apply to your weekly schedule
            </p>
          </div>
          <button
            onClick={() => openBuilder()}
            className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            New Content Plan
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <i className="fa-solid fa-film text-5xl text-slate-300 dark:text-slate-700 mb-4"></i>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No Content Plans Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Create a content plan to organize your ideas across YouTube,
              TikTok, Instagram, and more. Apply the plan to fill your weekly
              schedule automatically.
            </p>
            <button
              onClick={() => openBuilder()}
              className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
            >
              <i className="fa-solid fa-plus mr-2"></i>Create Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const totalItems = plan.items?.length || 0;
              const published = (plan.items || []).filter(
                (i) => i.status === "published",
              ).length;
              const platforms = [
                ...new Set((plan.items || []).map((i) => i.platform)),
              ];
              return (
                <div
                  key={plan.id}
                  className="glass-card p-5 cursor-pointer hover:shadow-lg transition group"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                        style={{ background: plan.color }}
                      >
                        <i className="fa-solid fa-video"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {plan.durationType === "custom"
                            ? `${plan.customDays} days`
                            : plan.durationType.charAt(0).toUpperCase() +
                              plan.durationType.slice(1)}{" "}
                          • {totalItems} item{totalItems !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openBuilder(plan);
                        }}
                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlan(plan.id);
                        }}
                        className="p-1.5 rounded bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 text-xs"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  {/* Platform icons */}
                  <div className="flex items-center gap-2 mb-2">
                    {platforms.map((pid) => {
                      const p = getPlatform(pid);
                      return (
                        <span
                          key={pid}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ background: p.color }}
                          title={p.label}
                        >
                          <i className={p.icon}></i>
                        </span>
                      );
                    })}
                    {platforms.length === 0 && (
                      <span className="text-xs text-slate-400 italic">
                        No platforms yet
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {totalItems > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>
                          {published}/{totalItems} published
                        </span>
                        <span>
                          {Math.round((published / totalItems) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{
                            width: `${(published / totalItems) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  RENDER — PLAN BUILDER
  // ═══════════════════════════════════════

  if (showPlanBuilder) {
    return (
      <div className="pb-20 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              setShowPlanBuilder(false);
              setEditingPlan(null);
            }}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            {editingPlan ? "Edit Plan" : "New Content Plan"}
          </h2>
        </div>

        <div className="glass-card p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider">
              Plan Name *
            </label>
            <input
              type="text"
              value={builderData.name}
              onChange={(e) =>
                setBuilderData((p) => ({ ...p, name: e.target.value }))
              }
              placeholder='e.g., "February Content Sprint"'
              className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-purple-500 outline-none"
            />
          </div>

          {/* Duration Type */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider">
              Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "weekly", label: "Weekly", sub: "7 days" },
                { id: "biweekly", label: "Bi-weekly", sub: "14 days" },
                { id: "monthly", label: "Monthly", sub: "30 days" },
                { id: "custom", label: "Custom", sub: "Set days" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setBuilderData((p) => ({ ...p, durationType: opt.id }))
                  }
                  className={`p-3 rounded-lg border text-center transition text-sm ${
                    builderData.durationType === opt.id
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs opacity-70">{opt.sub}</div>
                </button>
              ))}
            </div>
            {builderData.durationType === "custom" && (
              <div className="mt-3">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={builderData.customDays}
                  onChange={(e) =>
                    setBuilderData((p) => ({
                      ...p,
                      customDays: parseInt(e.target.value) || 7,
                    }))
                  }
                  className="w-32 bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-purple-500 outline-none"
                />
                <span className="text-xs text-slate-400 ml-2">days</span>
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider">
              Theme Color
            </label>
            <div className="flex gap-2">
              {[
                "#8b5cf6",
                "#ec4899",
                "#ef4444",
                "#f97316",
                "#22c55e",
                "#3b82f6",
                "#06b6d4",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => setBuilderData((p) => ({ ...p, color: c }))}
                  className={`w-8 h-8 rounded-lg transition ${
                    builderData.color === c
                      ? "ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-slate-900"
                      : "hover:scale-110"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={savePlan}
              className="flex-1 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
            >
              <i className="fa-solid fa-save mr-2"></i>
              {editingPlan ? "Update Plan" : "Create Plan"}
            </button>
            <button
              onClick={() => {
                setShowPlanBuilder(false);
                setEditingPlan(null);
              }}
              className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  RENDER — PLAN DETAIL VIEW
  // ═══════════════════════════════════════

  if (selectedPlan) {
    const plan = plans.find((p) => p.id === selectedPlan.id) || selectedPlan;
    const items = plan.items || [];
    const durationDays = getDurationDays(plan);
    const numWeeks = Math.ceil(durationDays / 7);

    // Group items by day
    const itemsByDay = {};
    items.forEach((item) => {
      const d = item.dayIndex ?? 0;
      if (!itemsByDay[d]) itemsByDay[d] = [];
      itemsByDay[d].push(item);
    });
    // Sort each day's items by startTime
    Object.values(itemsByDay).forEach((arr) =>
      arr.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")),
    );

    return (
      <div className="pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedPlan(null)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
              style={{ background: plan.color }}
            >
              <i className="fa-solid fa-video"></i>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {plan.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {plan.durationType === "custom"
                  ? `${plan.customDays} days`
                  : plan.durationType.charAt(0).toUpperCase() +
                    plan.durationType.slice(1)}{" "}
                • {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => openItemEditor()}
              className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition"
            >
              <i className="fa-solid fa-plus mr-1"></i>Add Content
            </button>
            <button
              onClick={() => openBuilder(plan)}
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <i className="fa-solid fa-pen mr-1"></i>Edit Plan
            </button>
            <button
              onClick={applyPlanToSchedule}
              className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition"
            >
              <i className="fa-solid fa-calendar-plus mr-1"></i>Apply to
              Schedule
            </button>
          </div>
        </div>

        {/* Weekly grid view */}
        {items.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <i className="fa-solid fa-film text-4xl text-slate-300 dark:text-slate-700 mb-4"></i>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Plan is empty
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Add content items to fill your plan's weekly grid.
            </p>
            <button
              onClick={() => openItemEditor()}
              className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
            >
              <i className="fa-solid fa-plus mr-2"></i>Add Content
            </button>
          </div>
        ) : (
          <>
            {/* Status overview bar */}
            <div className="glass-card p-4 mb-6">
              <div className="flex flex-wrap gap-3">
                {Object.entries(STATUS_MAP).map(([key, val]) => {
                  const count = items.filter((i) => i.status === key).length;
                  if (count === 0) return null;
                  return (
                    <span
                      key={key}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${val.color}`}
                    >
                      <i className={`fa-solid ${val.icon}`}></i>
                      {val.label}: {count}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Weekly grids */}
            {Array.from({ length: numWeeks }).map((_, weekIdx) => (
              <div key={weekIdx} className="mb-8">
                {numWeeks > 1 && (
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Week {weekIdx + 1}
                  </h3>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {DAY_SHORT.map((dayLabel, dayOff) => {
                    const dayIdx = weekIdx * 7 + dayOff;
                    if (dayIdx >= durationDays) return null;
                    const dayItems = itemsByDay[dayIdx] || [];

                    return (
                      <div
                        key={dayIdx}
                        className="glass-card p-3 min-h-[140px] flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                            {dayLabel}
                          </span>
                          <button
                            onClick={() => {
                              setItemForm((prev) => ({
                                ...prev,
                                dayIndex: dayIdx,
                              }));
                              openItemEditor();
                              // Pre-set the dayIndex in the form
                              setTimeout(() => {
                                setItemForm((prev) => ({
                                  ...prev,
                                  dayIndex: dayIdx,
                                }));
                              }, 0);
                            }}
                            className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-purple-500 flex items-center justify-center text-xs"
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        </div>
                        <div className="space-y-1.5 flex-1">
                          {dayItems.map((item) => {
                            const plat = getPlatform(item.platform);
                            const st =
                              STATUS_MAP[item.status] || STATUS_MAP.idea;
                            return (
                              <div
                                key={item.id}
                                onClick={() => openItemEditor(item)}
                                className="p-2 rounded-lg border cursor-pointer hover:shadow transition group"
                                style={{
                                  borderColor: `${plat.color}40`,
                                  background: `${plat.color}08`,
                                }}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <i
                                    className={`${plat.icon} text-xs`}
                                    style={{ color: plat.color }}
                                  ></i>
                                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate flex-1">
                                    {item.title}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteItem(item.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 text-xs"
                                  >
                                    <i className="fa-solid fa-xmark"></i>
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-slate-400">
                                    {item.startTime}–{item.endTime}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cycleStatus(item.id);
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${st.color}`}
                                    title="Click to cycle status"
                                  >
                                    <i
                                      className={`fa-solid ${st.icon} mr-0.5`}
                                    ></i>
                                    {st.label}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Item Editor Modal */}
        {showItemEditor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  <i className="fa-solid fa-film text-purple-500 mr-2"></i>
                  {editingItem ? "Edit Content" : "Add Content"}
                </h3>
                <button
                  onClick={() => {
                    setShowItemEditor(false);
                    setEditingItem(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                  Title *
                </label>
                <input
                  type="text"
                  value={itemForm.title}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder='e.g., "How I built an AI bot in 48 hours"'
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-purple-500 outline-none"
                />
              </div>

              {/* Platform */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                  Platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        setItemForm((prev) => ({ ...prev, platform: p.id }))
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                        itemForm.platform === p.id
                          ? "text-white border-transparent"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                      }`}
                      style={
                        itemForm.platform === p.id
                          ? { background: p.color }
                          : {}
                      }
                    >
                      <i className={p.icon}></i>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Type & Status */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                    Type
                  </label>
                  <select
                    value={itemForm.contentType}
                    onChange={(e) =>
                      setItemForm((p) => ({
                        ...p,
                        contentType: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 outline-none"
                  >
                    {CONTENT_TYPES.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                    Status
                  </label>
                  <select
                    value={itemForm.status}
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, status: e.target.value }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 outline-none"
                  >
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day & Time */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                    Day
                  </label>
                  <select
                    value={itemForm.dayIndex}
                    onChange={(e) =>
                      setItemForm((p) => ({
                        ...p,
                        dayIndex: parseInt(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 outline-none"
                  >
                    {Array.from({ length: durationDays }).map((_, i) => (
                      <option key={i} value={i}>
                        {DAY_SHORT[i % 7]}
                        {numWeeks > 1 ? ` (W${Math.floor(i / 7) + 1})` : ""} —
                        Day {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                    Start
                  </label>
                  <input
                    type="time"
                    value={itemForm.startTime}
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, startTime: e.target.value }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                    End
                  </label>
                  <input
                    type="time"
                    value={itemForm.endTime}
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, endTime: e.target.value }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                  Description / Script Notes
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows="3"
                  placeholder="Outline, script, talking points, or ideas..."
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-purple-500 outline-none resize-none"
                />
              </div>

              {/* Save */}
              <div className="flex gap-3">
                <button
                  onClick={saveItem}
                  className="flex-1 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
                >
                  <i className="fa-solid fa-save mr-2"></i>
                  {editingItem ? "Update" : "Add to Plan"}
                </button>
                {editingItem && (
                  <button
                    onClick={() => {
                      deleteItem(editingItem);
                      setShowItemEditor(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold transition"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default ContentView;
