const { ipcRenderer} = require('electron')
ipcRenderer.on('action',(event, data)=>{
    console.log("收到",data)
    document.body.innerHTML = data
})


ipcRenderer.send('registMessageChannel','action')
