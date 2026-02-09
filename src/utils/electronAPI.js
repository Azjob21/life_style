// Helper to detect if app is running in Electron
export const isElectron = () => {
  return window.electronAPI !== undefined;
};

// File saving in Electron or browser
export const saveScheduleFile = async (filename, data) => {
  if (isElectron()) {
    const content = JSON.stringify(data, null, 2);
    const result = await window.electronAPI.saveFile(filename, content);
    if (result.success) {
      alert(`Schedule saved to: ${result.path}`);
      return result;
    } else {
      alert(`Error saving file: ${result.error}`);
      return result;
    }
  } else {
    // Browser fallback - download as file
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true };
  }
};

// File loading in Electron or browser
export const loadScheduleFile = async (filename) => {
  if (isElectron()) {
    const result = await window.electronAPI.loadFile(filename);
    if (result.success) {
      return JSON.parse(result.content);
    } else {
      throw new Error(result.error);
    }
  } else {
    // Browser fallback - requires file picker
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }
};

// List saved files
export const listSavedSchedules = async () => {
  if (isElectron()) {
    const result = await window.electronAPI.listSavedFiles();
    if (result.success) {
      return result.files.map((file) => ({
        name: file.name,
        size: file.stats.size,
        modified: new Date(file.stats.mtimeMs).toLocaleDateString(),
      }));
    } else {
      throw new Error(result.error);
    }
  }
  return [];
};

// Delete saved file
export const deleteScheduleFile = async (filename) => {
  if (isElectron()) {
    const result = await window.electronAPI.deleteFile(filename);
    if (!result.success) {
      throw new Error(result.error);
    }
  }
};

// Get app version
export const getAppVersion = async () => {
  if (isElectron()) {
    return await window.electronAPI.getAppVersion();
  }
  return "Web Version";
};
