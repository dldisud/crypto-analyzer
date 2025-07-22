import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('gemini', {
  invoke: (channel, ...args) => {
    const validChannels = ['fetch-analysis-stream'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },
  on: (channel, callback) => {
    const validChannels = ['stream-chunk', 'stream-error', 'stream-end'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      const newCallback = (_, data) => callback(data);
      ipcRenderer.on(channel, newCallback);
      // Return a function to remove the listener
      return () => ipcRenderer.removeListener(channel, newCallback);
    }
  },
});
