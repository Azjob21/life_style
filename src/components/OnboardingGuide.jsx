import React, { useState, useEffect } from "react";

/**
 * Onboarding / Empty State Guidance
 * Shows a guided walkthrough when a new user has no data.
 * Steps: 1. Create a template, 2. Add to schedule, 3. Complete it.
 */
function OnboardingGuide({
  commitmentTemplates,
  dayInstances,
  completedInstances,
  onCreateTemplate,
  onDismiss,
}) {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("onboarding-dismissed");
    if (wasDismissed) setDismissed(true);
  }, []);

  // Auto-advance steps
  useEffect(() => {
    if (commitmentTemplates.length > 0 && step === 0) setStep(1);
    const totalInstances = Object.values(dayInstances).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0,
    );
    if (totalInstances > 0 && step === 1) setStep(2);
    const totalCompleted = Object.values(completedInstances).reduce(
      (sum, day) => {
        if (typeof day === "object" && day !== null)
          return sum + Object.values(day).filter(Boolean).length;
        return sum + (day ? 1 : 0);
      },
      0,
    );
    if (totalCompleted > 0 && step === 2) setStep(3);
  }, [commitmentTemplates, dayInstances, completedInstances, step]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("onboarding-dismissed", "true");
    onDismiss?.();
  };

  // Don't show if dismissed or completed
  if (dismissed || step >= 3) return null;
  // Don't show if user already has data
  if (commitmentTemplates.length > 0 && Object.keys(dayInstances).length > 0)
    return null;

  const steps = [
    {
      title: "Create Your First Template",
      description:
        'Templates are reusable commitment blocks. Click the sidebar\'s "+ New" button to create one — give it a name, color, time, and category.',
      icon: "fa-solid fa-layer-group",
      color: "blue",
      action: onCreateTemplate,
      actionLabel: "Create Template",
    },
    {
      title: "Add It to Your Schedule",
      description:
        "Drag your template from the sidebar onto any day in the calendar, or click a day to open the day view and add blocks.",
      icon: "fa-solid fa-calendar-plus",
      color: "green",
    },
    {
      title: "Complete & Track",
      description:
        "Click the check button on a commitment block to mark it complete. Watch your stats and streaks grow!",
      icon: "fa-solid fa-check-circle",
      color: "purple",
    },
  ];

  const current = steps[step];
  const colorMap = { blue: "blue", green: "green", purple: "purple" };
  const c = colorMap[current.color];

  return (
    <div className="mb-6 relative">
      <div
        className={`rounded-2xl border-2 border-dashed border-${c}-300 dark:border-${c}-700 bg-${c}-50/50 dark:bg-${c}-900/10 p-6 onboard-pulse`}
      >
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx < step
                  ? "bg-green-500"
                  : idx === step
                    ? `bg-${c}-500 scale-125`
                    : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
          ))}
          <span className="text-[10px] text-slate-400 ml-2 font-bold">
            Step {step + 1} of {steps.length}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-${c}-100 dark:bg-${c}-900/30 flex items-center justify-center flex-shrink-0`}
          >
            <i className={`${current.icon} text-${c}-500 text-2xl`}></i>
          </div>
          <div className="flex-1">
            <h3
              className={`text-lg font-black text-${c}-700 dark:text-${c}-300 mb-1`}
            >
              {current.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {current.description}
            </p>
            <div className="flex items-center gap-3 mt-4">
              {current.action && (
                <button
                  onClick={current.action}
                  className={`px-4 py-2 rounded-xl bg-${c}-600 hover:bg-${c}-500 text-white text-sm font-bold transition onboard-pulse`}
                >
                  <i className="fa-solid fa-plus mr-1.5"></i>
                  {current.actionLabel}
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                Skip Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingGuide;
