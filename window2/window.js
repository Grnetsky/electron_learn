const {ipcRenderer} = require('electron')

ipcRenderer.send('transMessage','action','hello world Too')