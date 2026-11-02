'use strict';
const {app, BrowserWindow, dialog, ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');

// Conservative graphics mode helps avoid blank windows on troublesome GPU drivers.
// Hardware acceleration is enabled for the 3D WebGL studio.
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
const THEMES=['The Professor','The Red Raider','El Jefe','The Jet','The Warden','The Girl Genius','The Raven'];
const THEME_EXT=['mp3','wav','ogg'];
function themeRoot(){return path.join(app.getPath('userData'),'hunter-themes')}
function themeIndex(){try{return JSON.parse(fs.readFileSync(path.join(themeRoot(),'index.json'),'utf8'))}catch{return {}}}
function writeThemeIndex(index){fs.mkdirSync(themeRoot(),{recursive:true});fs.writeFileSync(path.join(themeRoot(),'index.json'),JSON.stringify(index,null,2))}
ipcMain.handle('wolf-themes:list',()=>{
 const index=themeIndex(),out={};
 for(const hunter of THEMES){
  const meta=index[hunter];
  if(!meta||!THEME_EXT.includes(meta.ext))continue;
  const filename=path.join(themeRoot(),THEMES.indexOf(hunter)+'.'+meta.ext);
  if(!fs.existsSync(filename))continue;
  out[hunter]={name:meta.name,ext:meta.ext,base64:fs.readFileSync(filename).toString('base64')};
 }
 return out;
});
ipcMain.handle('wolf-themes:save',(_e,data)=>{
 const {hunter,name,base64,ext}=data||{};
 if(!THEMES.includes(hunter)||!THEME_EXT.includes(ext)||typeof name!=='string'||typeof base64!=='string'||base64.length>45000000||!/^[A-Za-z0-9+/]*={0,2}$/.test(base64))throw Error('Invalid Hunter audio file');
 const bytes=Buffer.from(base64,'base64');if(!bytes.length||bytes.length>30000000)throw Error('Hunter theme must be 30 MB or smaller');
 fs.mkdirSync(themeRoot(),{recursive:true});const index=themeIndex();
 for(const other of THEME_EXT){const old=path.join(themeRoot(),THEMES.indexOf(hunter)+'.'+other);if(fs.existsSync(old))fs.unlinkSync(old)}
 fs.writeFileSync(path.join(themeRoot(),THEMES.indexOf(hunter)+'.'+ext),bytes);
 index[hunter]={name:name.slice(0,150),ext};writeThemeIndex(index);return true;
});
ipcMain.handle('wolf-themes:remove',(_e,hunter)=>{
 if(!THEMES.includes(hunter))throw Error('Unknown Hunter');
 for(const ext of THEME_EXT){const file=path.join(themeRoot(),THEMES.indexOf(hunter)+'.'+ext);if(fs.existsSync(file))fs.unlinkSync(file)}
 const index=themeIndex();delete index[hunter];writeThemeIndex(index);return true;
});
function launch() {
  mainWindow = new BrowserWindow({
    width:1280,height:850,minWidth:900,minHeight:650,show:true,
    backgroundColor:'#090909',autoHideMenuBar:true,
    webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:false,preload:path.join(__dirname,'preload.js')}
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
