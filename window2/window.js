const {ipcRenderer} = require('electron')

ipcRenderer.send('getRegistedMessage','action')

ipcRenderer.on('registedMessage',(event,data)=>{
    console.log("registedMessage",data)
    try{
        let webContendIds = JSON.parse(data)
        for(let i = 0 ;i<webContendIds.length;i++){
            ipcRenderer.sendTo(webContendIds[i],'action','Hello World')
        }
    }catch (e) {
        console.log(e)
    }
})