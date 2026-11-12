const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron')
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { useActionState } = require('react');

let janela = null;
let sessao = null;

function caminho(pagina) {
    return path.join(__dirname, 'html/' + pagina + '.html');
}

function abrirTela(pagina) {
    janela.loadFile(caminho(pagina)).catch(erro => {
        console.error('Falha ao abrir tela:', pagina, erro.code)
    });
}

function criarJanela() {
    janela = new BrowserWindow({
        width: 500,
        height: 650,
        minWidth: 550,
        minHeight: 650,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });
    janela.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    janela.webContents.on('will-navigate', evento => evento.preventDefault());
    janela.on('closed', () => {
        janela = null;
        sessao = null;
    });
    abrirTela('login');
}

app.whenReady().then( () => {
    Menu.setApplicationMenu(null);
    criarJanela()
    app.on('activate', () => {
        if(!janela){
            criarJanela();
        }
    });
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit();
    }
})