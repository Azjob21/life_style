/**
 * Supabase Database API
 * Replaces Electron IPC-based database operations with Supabase client calls.
 * All operations require the user to be authenticated (RLS enforced).
 */

import supabase from "./supabaseClient";

class SupabaseDatabaseAPI {
  // ---- Helper: get current user ID ----
  static async getUserId() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id;
  }

  // ============ COMMITMENT OPERATIONS ============

  static async addCommitment(commitment) {
    try {
      const userId = await this.getUserId();
      if (!userId) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("commitments")
        .upsert(
          {
            id: String(commitment.id),
            user_id: userId,
            name: commitment.name,
            category: commitment.category || "",
            icon: commitment.icon || "",
            color: commitment.color || "",
            default_duration: commitment.defaultDuration || 60,
            description: commitment.description || "",
            start_time: commitment.startTime || "",
            end_time: commitment.endTime || "",
          },
          { onConflict: "id" },
        )
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("addCommitment error:", error);
      return { success: false, error: error.message };
    }
  }

  static async updateCommitment(id, updates) {
    try {
      const { data, error } = await supabase
        .from("commitments")
        .update({
          name: updates.name,
          category: updates.category || "",
          icon: updates.icon || "",
          color: updates.color || "",
          default_duration: updates.defaultDuration || 60,
          description: updates.description || "",
          start_time: updates.startTime || "",
          end_time: updates.endTime || "",
        })
        .eq("id", String(id))
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("updateCommitment error:", error);
      return { success: false, error: error.message };
    }
  }

  static async deleteCommitment(id) {
    try {
      const { error } = await supabase
        .from("commitments")
        .delete()
        .eq("id", String(id));

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("deleteCommitment error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getCommitments() {
    try {
      const { data, error } = await supabase
        .from("commitments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map snake_case → camelCase for frontend compatibility
      const mapped = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        icon: c.icon,
        color: c.color,
        defaultDuration: c.default_duration,
        description: c.description,
        startTime: c.start_time,
        endTime: c.end_time,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      return { success: true, data: mapped };
    } catch (error) {
      console.error("getCommitments error:", error);
      return { success: false, error: error.message };
    }
  }

  // ============ SCHEDULE INSTANCE OPERATIONS ============

  static async addScheduleInstance(instance) {
    try {
      const userId = await this.getUserId();
      if (!userId) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("schedule_instances")
        .upsert(
          {
            id: String(instance.id),
            user_id: userId,
            commitment_id: String(
              instance.commitmentId || instance.templateId || "",
            ),
            template_id: String(instance.templateId || ""),
            week_id: instance.weekId,
            day_index: instance.dayIndex,
            start_time: instance.startTime || "",
            end_time: instance.endTime || "",
            notes: instance.notes || "",
          },
          { onConflict: "id" },
        )
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("addScheduleInstance error:", error);
      return { success: false, error: error.message };
    }
  }

  static async updateScheduleInstance(id, updates) {
    try {
      const { data, error } = await supabase
        .from("schedule_instances")
        .update({
          start_time: updates.startTime || "",
          end_time: updates.endTime || "",
          notes: updates.notes || "",
        })
        .eq("id", String(id))
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("updateScheduleInstance error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getScheduleInstancesForWeek(weekId) {
    try {
      const { data, error } = await supabase
        .from("schedule_instances")
        .select("*")
        .eq("week_id", weekId)
        .order("day_index")
        .order("start_time");

      if (error) throw error;

      const mapped = (data || []).map((i) => ({
        id: i.id,
        commitmentId: i.commitment_id,
        templateId: i.template_id,
        weekId: i.week_id,
        dayIndex: i.day_index,
        startTime: i.start_time,
        endTime: i.end_time,
        notes: i.notes,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      }));

      return { success: true, data: mapped };
    } catch (error) {
      console.error("getScheduleInstancesForWeek error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getScheduleInstancesForDay(weekId, dayIndex) {
    try {
      const { data, error } = await supabase
        .from("schedule_instances")
        .select("*")
        .eq("week_id", weekId)
        .eq("day_index", dayIndex)
        .order("start_time");

      if (error) throw error;

      const mapped = (data || []).map((i) => ({
        id: i.id,
        commitmentId: i.commitment_id,
        templateId: i.template_id,
        weekId: i.week_id,
        dayIndex: i.day_index,
        startTime: i.start_time,
        endTime: i.end_time,
        notes: i.notes,
      }));

      return { success: true, data: mapped };
    } catch (error) {
      console.error("getScheduleInstancesForDay error:", error);
      return { success: false, error: error.message };
    }
  }

  static async deleteScheduleInstance(id) {
    try {
      const { error } = await supabase
        .from("schedule_instances")
        .delete()
        .eq("id", String(id));

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("deleteScheduleInstance error:", error);
      return { success: false, error: error.message };
    }
  }

  // ============ COMPLETION TRACKING ============

  static async markCompletion(completion) {
    try {
      const userId = await this.getUserId();
      if (!userId) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("completions")
        .upsert(
          {
            id: String(completion.id),
            user_id: userId,
            instance_id: String(completion.instanceId),
            week_id: completion.weekId,
            day_index: completion.dayIndex ?? 0,
            completed: completion.completed,
            completion_time: completion.completionTime || null,
            actual_duration: completion.actualDuration || null,
            notes: completion.notes || "",
          },
          { onConflict: "instance_id,week_id" },
        )
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("markCompletion error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getCompletionsForWeek(weekId) {
    try {
      const { data, error } = await supabase
        .from("completions")
        .select("*")
        .eq("week_id", weekId)
        .order("day_index")
        .order("completion_time");

      if (error) throw error;

      const mapped = (data || []).map((c) => ({
        id: c.id,
        instanceId: c.instance_id,
        weekId: c.week_id,
        dayIndex: c.day_index,
        completed: c.completed,
        completionTime: c.completion_time,
        actualDuration: c.actual_duration,
        notes: c.notes,
      }));

      return { success: true, data: mapped };
    } catch (error) {
      console.error("getCompletionsForWeek error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getCompletionStats(commitmentId, weekId = null) {
    try {
      let query = supabase
        .from("completions")
        .select("*, schedule_instances!inner(commitment_id)")
        .eq("schedule_instances.commitment_id", String(commitmentId));

      if (weekId) {
        query = query.eq("week_id", weekId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const total = data?.length || 0;
      const completed = data?.filter((c) => c.completed).length || 0;

      return { success: true, data: { total, completed } };
    } catch (error) {
      console.error("getCompletionStats error:", error);
      return { success: false, error: error.message };
    }
  }

  // ============ PROGRESS TRACKING ============

  static async updateProgress(progress) {
    try {
      const userId = await this.getUserId();
      if (!userId) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("progress_tracking")
        .upsert(
          {
            id: String(progress.id),
            user_id: userId,
            commitment_id: String(progress.commitmentId),
            week_id: progress.weekId,
            total_scheduled: progress.totalScheduled || 0,
            total_completed: progress.totalCompleted || 0,
            completion_rate: progress.completionRate || 0,
            consistency_score: progress.consistencyScore || 0,
            streak_days: progress.streakDays || 0,
            longest_streak: progress.longestStreak || 0,
            last_completed_date: progress.lastCompletedDate || null,
          },
          { onConflict: "commitment_id,week_id" },
        )
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("updateProgress error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getProgress(commitmentId, weekId) {
    try {
      const { data, error } = await supabase
        .from("progress_tracking")
        .select("*")
        .eq("commitment_id", String(commitmentId))
        .eq("week_id", weekId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return { success: true, data: data || null };
    } catch (error) {
      console.error("getProgress error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getProgressForCommitment(commitmentId) {
    try {
      const { data, error } = await supabase
        .from("progress_tracking")
        .select("*")
        .eq("commitment_id", String(commitmentId))
        .order("week_id", { ascending: false })
        .limit(12);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("getProgressForCommitment error:", error);
      return { success: false, error: error.message };
    }
  }

  // ============ STATISTICS ============

  static async updateStatistics(stats) {
    try {
      const userId = await this.getUserId();
      if (!userId) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("statistics")
        .upsert(
          {
            id: String(stats.id),
            user_id: userId,
            commitment_id: String(stats.commitmentId),
            total_completions: stats.totalCompletions || 0,
            total_allotted: stats.totalAllotted || 0,
            average_completion_rate: stats.averageCompletionRate || 0,
            most_productive_day: stats.mostProductiveDay || null,
            total_time_spent: stats.totalTimeSpent || 0,
            record_streak: stats.recordStreak || 0,
          },
          { onConflict: "commitment_id" },
        )
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("updateStatistics error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getStatistics(commitmentId) {
    try {
      const { data, error } = await supabase
        .from("statistics")
        .select("*")
        .eq("commitment_id", String(commitmentId))
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return { success: true, data: data || null };
    } catch (error) {
      console.error("getStatistics error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getAllStatistics() {
    try {
      const { data, error } = await supabase
        .from("statistics")
        .select("*")
        .order("average_completion_rate", { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("getAllStatistics error:", error);
      return { success: false, error: error.message };
    }
  }

  // ============ DAILY NOTES ============

  static async saveDailyNote(note) {
    try {
      const userId = await this.getUserId();
      if (!userId) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("daily_notes")
        .upsert(
          {
            id: String(note.id),
            user_id: userId,
            week_id: note.weekId,
            day_index: note.dayIndex,
            notes: note.notes || "",
            day_status: note.dayStatus || "",
            mood: note.mood || null,
          },
          { onConflict: "week_id,day_index,user_id" },
        )
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("saveDailyNote error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getDailyNote(weekId, dayIndex) {
    try {
      const { data, error } = await supabase
        .from("daily_notes")
        .select("*")
        .eq("week_id", weekId)
        .eq("day_index", dayIndex)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return { success: true, data: data || null };
    } catch (error) {
      console.error("getDailyNote error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getWeeklyNotes(weekId) {
    try {
      const { data, error } = await supabase
        .from("daily_notes")
        .select("*")
        .eq("week_id", weekId)
        .order("day_index");

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("getWeeklyNotes error:", error);
      return { success: false, error: error.message };
    }
  }

  // ============ DAY PROPERTIES ============

  static async saveDayProperties(weekId, dayIndex, props) {
    try {
      const userId = await this.getUserId();
      if (!userId) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("day_properties")
        .upsert(
          {
            user_id: userId,
            week_id: weekId,
            day_index: dayIndex,
            available_time_start: props.availableTimeStart || "08:00",
            available_time_end: props.availableTimeEnd || "22:00",
          },
          { onConflict: "week_id,day_index,user_id" },
        )
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("saveDayProperties error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getDayProperties(weekId) {
    try {
      const { data, error } = await supabase
        .from("day_properties")
        .select("*")
        .eq("week_id", weekId)
        .order("day_index");

      if (error) throw error;

      // Convert to day-indexed object
      const result = {};
      (data || []).forEach((p) => {
        result[p.day_index] = {
          availableTimeStart: p.available_time_start,
          availableTimeEnd: p.available_time_end,
        };
      });

      return { success: true, data: result };
    } catch (error) {
      console.error("getDayProperties error:", error);
      return { success: false, error: error.message };
    }
  }

  // ============ DAY MARKED STATUS ============

  static async saveDayMarked(weekId, dayIndex, isMarked) {
    try {
      const userId = await this.getUserId();
      if (!userId) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("day_marked")
        .upsert(
          {
            user_id: userId,
            week_id: weekId,
            day_index: dayIndex,
            is_marked: isMarked,
          },
          { onConflict: "week_id,day_index,user_id" },
        )
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("saveDayMarked error:", error);
      return { success: false, error: error.message };
    }
  }

  static async getDayMarked(weekId) {
    try {
      const { data, error } = await supabase
        .from("day_marked")
        .select("*")
        .eq("week_id", weekId);

      if (error) throw error;

      const result = {};
      (data || []).forEach((d) => {
        result[d.day_index] = d.is_marked;
      });

      return { success: true, data: result };
    } catch (error) {
      console.error("getDayMarked error:", error);
      return { success: false, error: error.message };
    }
  }

  // ============ DATA EXPORT/IMPORT ============

  static async exportAllData() {
    try {
      const [commitments, instances, completions, progress, statistics, notes] =
        await Promise.all([
          supabase.from("commitments").select("*"),
          supabase.from("schedule_instances").select("*"),
          supabase.from("completions").select("*"),
          supabase.from("progress_tracking").select("*"),
          supabase.from("statistics").select("*"),
          supabase.from("daily_notes").select("*"),
        ]);

      return {
        success: true,
        data: {
          commitments: commitments.data || [],
          instances: instances.data || [],
          completions: completions.data || [],
          progress: progress.data || [],
          statistics: statistics.data || [],
          notes: notes.data || [],
          exportDate: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("exportAllData error:", error);
      return { success: false, error: error.message };
    }
  }

  static async importData(data) {
    try {
      // Note: For a full import you'd need to handle conflicts.
      // This is a simplified version.
      if (data.commitments) {
        for (const c of data.commitments) {
          await this.addCommitment(c);
        }
      }
      return { success: true, message: "Data imported successfully" };
    } catch (error) {
      console.error("importData error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default SupabaseDatabaseAPI;
