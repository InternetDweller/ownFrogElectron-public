const { contextBridge, ipcRenderer, ipcMain } = require('electron');
const axiosRequest = require('axios');
const Toastify = require('toastify-js');
const fs = require('fs');

contextBridge.exposeInMainWorld('axiosRequest', {
    get: (link) => axiosRequest.get(link)
});

contextBridge.exposeInMainWorld('Toastify', {
    showToast: (options) => Toastify(options).showToast()
});

contextBridge.exposeInMainWorld('electronAPI', {
    onLoadProgress: (callback) => ipcRenderer.on('loadProgress', callback),
    onSaveProgress: (callback) => ipcRenderer.on('saveProgress', callback)
});

contextBridge.exposeInMainWorld('file', {
    read: (src) => {
        const file = fs.readFileSync(src, 'utf-8');
        return JSON.parse(file);
    },
    save: (src, data) => {
        const stringified = JSON.stringify(data, null, 2);
        fs.writeFileSync(src, stringified, 'utf-8');
    },
    readAndCheck: (src) => {
        if (!fs.existsSync(src)) {
            const data = {
                "visualWeather": true,
                "backgroundDiffColour": true
              };
            const stringified = JSON.stringify(data, null, 2);
            fs.writeFileSync(src, stringified, 'utf-8');
            return data;
        } else {
            const file = fs.readFileSync(src, 'utf-8');
            return JSON.parse(file);
        };
    }
});