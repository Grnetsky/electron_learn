const { ipcRenderer} = require('electron')

ipcRenderer.send('registMessageChannel','action')

ipcRenderer.on('action',(event, data)=>{
    console.log("收到",data)
    document.body.innerHTML = data
})