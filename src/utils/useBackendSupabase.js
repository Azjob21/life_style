/**
 * useBackend Hook - Supabase Edition
 * Integrates Supabase database operations with React state.
 * Falls back to localStorage when Supabase is not configured.
 */

import { useState, useCallback, useEffect } from "react";
import SupabaseDatabaseAPI from "./supabaseDatabaseAPI";
import ProgressTracker from "./progressTracker";
import StatisticsCalculator from "./statisticsCalculator";
import supabase from "./supabaseClient";

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && !url.includes("YOUR_PROJECT_ID");
};

export const useBackend = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [useDatabase, setUseDatabase] = useState(isSupabaseConfigured());
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("anonymous");

  const userKey = useCallback((key) => `${userId}:${key}`, [userId]);

  useEffect(() => {
    setUseDatabase(isSupabaseConfigured());
    setIsInitialized(true);
    // Get userId from Supabase session
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user?.id) setUserId(data.session.user.id);
    });
  }, []);

  // Get week ID from date
  const getWeekId = useCallback((date) => {
    const year = date.getFullYear();
    const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
    return `${year}-W${weekNum}`;
  }, []);

  // ============ COMMITMENT OPERATIONS ============

  const saveCommitment = useCallback(
    async (commitment) => {
      try {
        if (useDatabase) {
          const result = await SupabaseDatabaseAPI.addCommitment(commitment);
          if (!result.success) {
            console.error("Database error:", result.error);
            setError(result.error);
          }
          return result;
        } else {
          const key = userKey("commitment-templates");
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          const updated = [
            ...existing.filter((c) => c.id !== commitment.id),
            commitment,
          ];
          localStorage.setItem(key, JSON.stringify(updated));
          return { success: true };
        }
      } catch (error) {
        console.error("Error saving commitment:", error);
        setError(error.message);
        return { success: false, error: error.message };
      }
    },
    [useDatabase],
  );

  const getCommitments = useCallback(async () => {
    try {
      if (useDatabase) {
        const result = await SupabaseDatabaseAPI.getCommitments();
        if (result.success) {
          return result.data || [];
        } else {
          console.error("Database error:", result.error);
          return [];
        }
      } else {
        return JSON.parse(
          localStorage.getItem(userKey("commitment-templates")) || "[]",
        );
      }
    } catch (error) {
      console.error("Error getting commitments:", error);
      return [];
    }
  }, [useDatabase]);

  const deleteCommitment = useCallback(
    async (id) => {
      try {
        if (useDatabase) {
          return await SupabaseDatabaseAPI.deleteCommitment(id);
        } else {
          const key = userKey("commitment-templates");
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          const updated = existing.filter((c) => c.id !== id);
          localStorage.setItem(key, JSON.stringify(updated));
          return { success: true };
        }
      } catch (error) {
        console.error("Error deleting commitment:", error);
        return { success: false, error: error.message };
      }
    },
    [useDatabase],
  );

  // ============ SCHEDULE INSTANCE OPERATIONS ============

  const saveScheduleInstance = useCallback(
    async (instance) => {
      try {
        if (useDatabase) {
          const result =
            await SupabaseDatabaseAPI.addScheduleInstance(instance);
          if (!result.success) setError(result.error);
          return result;
        } else {
          const weekId = instance.weekId;
          const key = userKey(`week-instances-${weekId}`);
          const existing = JSON.parse(localStorage.getItem(key) || "{}");
          const dayIdx = instance.dayIndex;
          existing[dayIdx] = [...(existing[dayIdx] || []), instance];
          localStorage.setItem(key, JSON.stringify(existing));
          return { success: true };
        }
      } catch (error) {
        console.error("Error saving instance:", error);
        return { success: false, error: error.message };
      }
    },
    [useDatabase],
  );

  const getScheduleInstancesForWeek = useCallback(
    async (weekId) => {
      try {
        if (useDatabase) {
          const result =
            await SupabaseDatabaseAPI.getScheduleInstancesForWeek(weekId);
          if (result.success) return result.data || [];
          return [];
        } else {
          const existing = JSON.parse(
            localStorage.getItem(userKey(`week-instances-${weekId}`)) || "{}",
          );
          const instances = [];
          Object.values(existing).forEach((dayInstances) => {
            if (Array.isArray(dayInstances)) instances.push(...dayInstances);
          });
          return instances;
        }
      } catch (error) {
        console.error("Error getting instances:", error);
        return [];
      }
    },
    [useDatabase],
  );

  const removeScheduleInstance = useCallback(
    async (weekId, dayIdx, instanceId) => {
      try {
        if (useDatabase) {
          return await SupabaseDatabaseAPI.deleteScheduleInstance(instanceId);
        } else {
          const key = userKey(`week-instances-${weekId}`);
          const existing = JSON.parse(localStorage.getItem(key) || "{}");
          if (existing[dayIdx]) {
            existing[dayIdx] = existing[dayIdx].filter(
              (i) => i.id !== instanceId,
            );
          }
          localStorage.setItem(key, JSON.stringify(existing));
          return { success: true };
        }
      } catch (error) {
        console.error("Error removing instance:", error);
        return { success: false, error: error.message };
      }
    },
    [useDatabase],
  );

  // ============ COMPLETION TRACKING ============

  const markCompletion = useCallback(
    async (completion) => {
      try {
        if (useDatabase) {
          const result = await SupabaseDatabaseAPI.markCompletion(completion);
          if (!result.success) setError(result.error);
          return result;
        } else {
          const weekId = completion.weekId;
          const key = userKey(`week-completed-${weekId}`);
          const existing = JSON.parse(localStorage.getItem(key) || "{}");
          existing[completion.instanceId] = completion.completed;
          localStorage.setItem(key, JSON.stringify(existing));
          return { success: true };
        }
      } catch (error) {
        console.error("Error marking completion:", error);
        return { success: false, error: error.message };
      }
    },
    [useDatabase],
  );

  const getCompletionsForWeek = useCallback(
    async (weekId) => {
      try {
        if (useDatabase) {
          const result =
            await SupabaseDatabaseAPI.getCompletionsForWeek(weekId);
          if (result.success) return result.data || [];
          return [];
        } else {
          return [];
        }
      } catch (error) {
        console.error("Error getting completions:", error);
        return [];
      }
    },
    [useDatabase],
  );

  // ============ DAY PROPERTIES ============

  const saveDayProperties = useCallback(
    async (weekId, dayIndex, props) => {
      try {
        if (useDatabase) {
          return await SupabaseDatabaseAPI.saveDayProperties(
            weekId,
            dayIndex,
            props,
          );
        } else {
          const key = userKey(`week-dayprops-${weekId}`);
          const existing = JSON.parse(localStorage.getItem(key) || "{}");
          existing[dayIndex] = props;
          localStorage.setItem(key, JSON.stringify(existing));
          return { success: true };
        }
      } catch (error) {
        console.error("Error saving day properties:", error);
        return { success: false, error: error.message };
      }
    },
    [useDatabase],
  );

  const getDayProperties = useCallback(
    async (weekId) => {
      try {
        if (useDatabase) {
          const result = await SupabaseDatabaseAPI.getDayProperties(weekId);
          if (result.success) return result.data || {};
          return {};
        } else {
          return JSON.parse(
            localStorage.getItem(userKey(`week-dayprops-${weekId}`)) || "{}",
          );
        }
      } catch (error) {
        console.error("Error getting day properties:", error);
        return {};
      }
    },
    [useDatabase],
  );

  // ============ DAY MARKED ============

  const saveDayMarked = useCallback(
    async (weekId, dayIndex, isMarked) => {
      try {
        if (useDatabase) {
          return await SupabaseDatabaseAPI.saveDayMarked(
            weekId,
            dayIndex,
            isMarked,
          );
        } else {
          const key = userKey(`week-marked-${weekId}`);
          const existing = JSON.parse(localStorage.getItem(key) || "{}");
          existing[dayIndex] = isMarked;
          localStorage.setItem(key, JSON.stringify(existing));
          return { success: true };
        }
      } catch (error) {
        console.error("Error saving day marked:", error);
        return { success: false, error: error.message };
      }
    },
    [useDatabase],
  );

  const getDayMarked = useCallback(
    async (weekId) => {
      try {
        if (useDatabase) {
          const result = await SupabaseDatabaseAPI.getDayMarked(weekId);
          if (result.success) return result.data || {};
          return {};
        } else {
          return JSON.parse(
            localStorage.getItem(userKey(`week-marked-${weekId}`)) || "{}",
          );
        }
      } catch (error) {
        console.error("Error getting day marked:", error);
        return {};
      }
    },
    [useDatabase],
  );

  // ============ PROGRESS & STATS ============

  const getAdvancementLevel = useCallback(
    async (commitmentId) => {
      try {
        if (useDatabase) {
          const statsResult =
            await SupabaseDatabaseAPI.getStatistics(commitmentId);
          if (!statsResult.success) return null;
          const levelResult = ProgressTracker.calculateAdvancementLevel(
            statsResult.data?.total_completions ||
              statsResult.data?.totalCompletions ||
              0,
          );
          if (levelResult.success) return levelResult.data;
        }
        return null;
      } catch (error) {
        console.error("Error getting advancement level:", error);
        return null;
      }
    },
    [useDatabase],
  );

  const getBadges = useCallback(
    async (commitmentId) => {
      try {
        if (useDatabase) {
          const statsResult =
            await SupabaseDatabaseAPI.getStatistics(commitmentId);
          const historyResult =
            await SupabaseDatabaseAPI.getProgressForCommitment(commitmentId);
          if (!statsResult.success || !historyResult.success) return [];
          const badgesResult = ProgressTracker.calculateBadges(
            statsResult.data,
            historyResult.data,
          );
          if (badgesResult.success) return badgesResult.data;
        }
        return [];
      } catch (error) {
        console.error("Error getting badges:", error);
        return [];
      }
    },
    [useDatabase],
  );

  const getWeeklyStats = useCallback(
    async (weekId) => {
      try {
        const instancesResult = await getScheduleInstancesForWeek(weekId);
        const completionsResult = await getCompletionsForWeek(weekId);

        const statsResult = StatisticsCalculator.generateWeeklySummary(
          instancesResult,
          completionsResult,
        );

        if (statsResult.success) return statsResult.data;
        return null;
      } catch (error) {
        console.error("Error getting weekly stats:", error);
        return null;
      }
    },
    [getScheduleInstancesForWeek, getCompletionsForWeek],
  );

  const getInsights = useCallback(
    async (weekId) => {
      try {
        const instancesResult = await getScheduleInstancesForWeek(weekId);
        const completionsResult = await getCompletionsForWeek(weekId);

        const weeklySummary = StatisticsCalculator.generateWeeklySummary(
          instancesResult,
          completionsResult,
        );

        const monthlySummary = StatisticsCalculator.generateMonthlySummary([]);

        let allStats = [];
        if (useDatabase) {
          const allStatsResult = await SupabaseDatabaseAPI.getAllStatistics();
          if (allStatsResult.success) allStats = allStatsResult.data;
        }

        const insightsResult = StatisticsCalculator.generateInsights(
          weeklySummary.data || {},
          monthlySummary.data || {},
          allStats,
        );

        if (insightsResult.success) return insightsResult.data;
        return [];
      } catch (error) {
        console.error("Error getting insights:", error);
        return [];
      }
    },
    [useDatabase, getScheduleInstancesForWeek, getCompletionsForWeek],
  );

  // ============ NOTES ============

  const saveDailyNote = useCallback(
    async (weekId, dayIndex, note) => {
      try {
        if (useDatabase) {
          return await SupabaseDatabaseAPI.saveDailyNote({
            id: `note-${weekId}-${dayIndex}`,
            weekId,
            dayIndex,
            notes: note,
          });
        } else {
          const key = userKey(`week-notes-${weekId}`);
          const existing = JSON.parse(localStorage.getItem(key) || "{}");
          existing[dayIndex] = note;
          localStorage.setItem(key, JSON.stringify(existing));
          return { success: true };
        }
      } catch (error) {
        console.error("Error saving note:", error);
        return { success: false, error: error.message };
      }
    },
    [useDatabase],
  );

  const getWeeklyNotes = useCallback(
    async (weekId) => {
      try {
        if (useDatabase) {
          const result = await SupabaseDatabaseAPI.getWeeklyNotes(weekId);
          if (result.success && result.data) {
            const notes = {};
            result.data.forEach((n) => {
              notes[n.day_index] = n.notes;
            });
            return notes;
          }
          return {};
        } else {
          return JSON.parse(
            localStorage.getItem(userKey(`week-notes-${weekId}`)) || "{}",
          );
        }
      } catch (error) {
        console.error("Error getting weekly notes:", error);
        return {};
      }
    },
    [useDatabase],
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isInitialized,
    useDatabase,
    error,
    clearError,
    getWeekId,

    // Commitments
    saveCommitment,
    getCommitments,
    deleteCommitment,

    // Instances
    saveScheduleInstance,
    getScheduleInstancesForWeek,
    removeScheduleInstance,

    // Completions
    markCompletion,
    getCompletionsForWeek,

    // Day Properties
    saveDayProperties,
    getDayProperties,

    // Day Marked
    saveDayMarked,
    getDayMarked,

    // Progress & Analytics
    getAdvancementLevel,
    getBadges,
    getWeeklyStats,
    getInsights,

    // Notes
    saveDailyNote,
    getWeeklyNotes,
  };
};

export default useBackend;
