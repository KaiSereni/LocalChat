// language: JavaScript
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let backendProcess;

function startBackend() {
  // Spawn the Python backend
  backendProcess = spawn('python', [path.join(__dirname, 'app.py')]);

  // Log output for debugging
  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });
  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend error: ${data}`);
  });
  backendProcess.on('close', (code) => {
    console.log(`Backend exited with code ${code}`);
  });
}

function createWindow() {
  // Create the Electron browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // Disable Node integration for security
      nodeIntegration: false,
    },
  });

  // Load the Next UI (served by the Python backend)
  mainWindow.loadURL('http://localhost:3001');
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // On non-macOS platforms, quit when all windows are closed.
  if (process.platform !== 'darwin') {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});