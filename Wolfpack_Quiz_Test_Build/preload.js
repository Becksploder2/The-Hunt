'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('wolfThemes',{
 list:()=>ipcRenderer.invoke('wolf-themes:list'),
 save:(hunter,name,base64,ext)=>ipcRenderer.invoke('wolf-themes:save',{hunter,name,base64,ext}),
 remove:hunter=>ipcRenderer.invoke('wolf-themes:remove',{hunter})
});
