const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {
    login: dados => ipcRenderer.invoke('auth:login', dados),
    abrirPrincipal: () => ipcRenderer.send('auth:abrirPrincipal'),
    sair: () => ipcRenderer.send('auth:sair')
});

contextBridge.exposeInMainWorld('menu', {
    abrir: destino => ipcRenderer.send('menu:abrir', destino),
    inicio: () => ipcRenderer.send('menu:inicio')
});

function apiCadastro(pagina){
    return {
        listar: () => ipcRenderer.invoke(pagina + ':listar'),
        criar: dados => ipcRenderer.invoke(pagina + ':criar', dados),
        atualizar: dados => ipcRenderer.invoke(pagina + ':atualizar', dados),
        excluir: id => ipcRenderer.invoke(pagina + ':excluir', id)
    };
}

contextBridge.exposeInMainWorld('alunos', apiCadastro('alunos'));