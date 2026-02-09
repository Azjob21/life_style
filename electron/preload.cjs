const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (filename, content) =>
    ipcRenderer.invoke("save-file", filename, content),
  loadFile: (filename) => ipcRenderer.invoke("load-file", filename),
  listSavedFiles: () => ipcRenderer.invoke("list-saved-files"),
  deleteFile: (filename) => ipcRenderer.invoke("delete-file", filename),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
});
