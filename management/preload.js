const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {
    login: dados => ipcRenderer.invoke('auth:login', dados),
    abrirPrincipal: () => ipcRenderer.send('auth:abrirPrincipal'),
    sair: () => ipcRenderer.send('auth:sair')
});