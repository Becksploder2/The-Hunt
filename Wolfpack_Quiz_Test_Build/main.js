const {app,BrowserWindow}=require('electron');
const path=require('path');
function launch(){const win=new BrowserWindow({width:1280,height:850,minWidth:900,minHeight:650,backgroundColor:'#090d1b',autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});win.loadFile(path.join(__dirname,'app','index.html'));}
app.whenReady().then(()=>{launch();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)launch();});});app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
