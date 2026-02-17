/**
 * Database API - Frontend wrapper for Electron IPC database operations
 * Provides a clean interface for React components to interact with the backend
 */

import { isElectron } from "./electronAPI";

class DatabaseAPI {
  // ============ COMMITMENT OPERATIONS ============

  static async addCommitment(commitment) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-add-commitment",
      commitment,
    );
  }

  static async updateCommitment(id, updates) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-update-commitment",
      id,
      updates,
    );
  }

  static async deleteCommitment(id) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest("db-delete-commitment", id);
  }

  static async getCommitments() {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest("db-get-commitments");
  }

  // ============ SCHEDULE INSTANCE OPERATIONS ============

  static async addScheduleInstance(instance) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-add-schedule-instance",
      instance,
    );
  }

  static async updateScheduleInstance(id, updates) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-update-schedule-instance",
      id,
      updates,
    );
  }

  static async getScheduleInstancesForWeek(weekId) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-get-schedule-instances-week",
      weekId,
    );
  }

  static async getScheduleInstancesForDay(weekId, dayIndex) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-get-schedule-instances-day",
      weekId,
      dayIndex,
    );
  }

  // ============ COMPLETION TRACKING OPERATIONS ============

  static async markCompletion(completion) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-mark-completion",
      completion,
    );
  }

  static async getCompletionsForWeek(weekId) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-get-completions-week",
      weekId,
    );
  }

  static async getCompletionStats(commitmentId, weekId) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-get-completion-stats",
      commitmentId,
      weekId,
    );
  }

  // ============ PROGRESS TRACKING OPERATIONS ============

  static async updateProgress(progress) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-update-progress",
      progress,
    );
  }

  static async getProgress(commitmentId, weekId) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-get-progress",
      commitmentId,
      weekId,
    );
  }

  static async getProgressForCommitment(commitmentId) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-get-progress-commitment",
      commitmentId,
    );
  }

  // ============ STATISTICS OPERATIONS ============

  static async updateStatistics(stats) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-update-statistics",
      stats,
    );
  }

  static async getStatistics(commitmentId) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-get-statistics",
      commitmentId,
    );
  }

  static async getAllStatistics() {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest("db-get-all-statistics");
  }

  // ============ DAILY NOTES OPERATIONS ============

  static async saveDailyNote(note) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest("db-save-daily-note", note);
  }

  static async getDailyNote(weekId, dayIndex) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-get-daily-note",
      weekId,
      dayIndex,
    );
  }

  static async getWeeklyNotes(weekId) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-get-weekly-notes",
      weekId,
    );
  }

  // ============ DATA EXPORT/IMPORT OPERATIONS ============

  static async exportAllData() {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest("db-export-all-data");
  }

  static async importData(data) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest("db-import-data", data);
  }

  // ============ BACKUP OPERATIONS ============

  static async createBackup(backupInfo) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "db-create-backup",
      backupInfo,
    );
  }

  static async getBackupHistory() {
    if (!isElectron()) {
      return {
        success: false,
        error: "Database operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest("db-get-backup-history");
  }
}

export default DatabaseAPI;
