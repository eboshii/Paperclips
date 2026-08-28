const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1360,
        height: 800,
        minWidth: 1024,
        minHeight: 640,
        backgroundColor: '#07090e',
        title: 'Objective: Paperclips (Universal Paperclips 3D)',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load web interface
    mainWindow.loadFile(path.join(__dirname, 'web', 'index.html'));

    // Optional: Hide default application menu for clean full-screen game look
    // Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
