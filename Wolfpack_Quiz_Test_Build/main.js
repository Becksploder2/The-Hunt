'use strict';
const {app, BrowserWindow, dialog} = require('electron');
const fs = require('fs');
const path = require('path');

// Conservative graphics mode helps avoid blank windows on troublesome GPU drivers.
app.disableHardwareAcceleration();
let mainWindow;
function record(message) {
  try {
    const file = path.join(app.getPath('userData'), 'startup.log');
    fs.mkdirSync(path.dirname(file), {recursive:true});
    fs.appendFileSync(file, new Date().toISOString() + ' ' + String(message) + '\n');
  } catch (_) {}
}
function report(message) {
  record(message);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(
      '<html><body style="background:#090909;color:white;font:18px Segoe UI,Arial;padding:40px">' +
      '<h1 style="color:#ff7900">Wolfpack Quiz Games could not start</h1>' +
      '<p>Please report the following error:</p><pre style="white-space:pre-wrap">' +
      String(message).replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])) +
      '</pre></body></html>'));
  } else {
    dialog.showErrorBox('Wolfpack Quiz Games - Startup Error', String(message));
  }
}
function launch() {
  mainWindow = new BrowserWindow({
    width:1280,height:850,minWidth:900,minHeight:650,show:true,
    backgroundColor:'#090909',autoHideMenuBar:true,
    webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}
  });
  const wc = mainWindow.webContents;
  wc.on('did-fail-load', (_event,code,description,url,isMainFrame)=>{
    if (isMainFrame) report('Failed loading application: '+code+' '+description+' '+url);
  });
  wc.on('render-process-gone', (_event,details)=>report('Renderer stopped: '+details.reason));
  wc.on('console-message', (_event,level,message)=>{if(level>=2)record('Renderer: '+message);});
  wc.on('preload-error', (_event,preloadPath,error)=>record('Preload error: '+preloadPath+' '+error));
  wc.loadFile(path.join(__dirname,'app','index.html')).catch(error=>report('Unable to load app: '+error.message));
}
process.on('uncaughtException', error=>{record('Main process error: '+(error.stack||error));dialog.showErrorBox('Wolfpack Quiz Games error',String(error.stack||error));});
app.whenReady().then(()=>{
  record('Launching version '+app.getVersion()+' on '+process.platform);
  launch();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0) launch();});
}).catch(error=>report(error.stack||error));
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
