/**
 * Progress Tracker API - Frontend wrapper for progress tracking operations
 */

import { isElectron } from "./electronAPI";

class ProgressTrackerAPI {
  static async calculateStreak(completions, endDate = new Date()) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Progress tracking only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "progress-calculate-streak",
      completions,
      endDate,
    );
  }

  static async calculateAdvancementLevel(totalCompletions) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Progress tracking only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "progress-calculate-level",
      totalCompletions,
    );
  }

  static async calculateBadges(stats, progressHistory) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Progress tracking only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "progress-calculate-badges",
      stats,
      progressHistory,
    );
  }

  static async generateAdvancementReport(
    stats,
    progressHistory,
    currentCompletion,
  ) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Progress tracking only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "progress-generate-report",
      stats,
      progressHistory,
      currentCompletion,
    );
  }

  static async analyzeProductivityByDay(completions) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Progress tracking only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "progress-analyze-by-day",
      completions,
    );
  }
}

export default ProgressTrackerAPI;
