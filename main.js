// 主进程
const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const {ipcMain} = require('electron')
const Store = require('electron-store')
const store = new Store()
let window = null

const winTheLock = app.requestSingleInstanceLock();  //给应用加抢占琐  即使用单例模式保证同一个app只能打开一个

if(winTheLock){
    // 若app被第二次尝试打开，则弹出最先打开的，并聚焦
    app.on("second-instance", ()=>{
        if(window){
            if(window.isMinimizable()){
                window.restore()
            }
            window.focus()
        }
    })

    function createNewWindow(url) {
        // 主窗口 相关设置参见 https://www.electronjs.org/zh/docs/latest/api/browser-window#new-browserwindowoptions
        window = new BrowserWindow({
            width: 600,
            height: 400,
            webPreferences:{
                nodeIntegration:true, //允许渲染进程调用nodejs模块
                contextIsolation: false,
                webviewTag:true, //为了webview正常显示内容
                enableRemoteModule: true //开启remote配置 以允许渲染进程使用remote模块（远程调用）
            }
        })

        window.loadURL(url).then(()=>{
            window.webContents.openDevTools()
        })

        window.on("close", function () {
            window = null
        })
    }
    // 监听所有窗口关闭事件
    app.on('window-all-closed',()=>{
        app.quit()
    })
    // 应用准备好 主进程准备完毕
    app.on("ready", ()=>{
        // 第一个渲染进程的窗口文件路径
        const url1 = url.format({
            protocol: 'file',
            pathname: path.join(__dirname,'window1/index.html')
        })

        // 第二个渲染进程的窗口文件路径
        const url2 = url.format({
            protocol: 'file',
            pathname: path.join(__dirname,'window2/index.html')
        })
        // 创建第一个窗口
        createNewWindow(url1)

        // 创建第二个窗口
        setTimeout(createNewWindow,2000,url2)
    })
}else {
    app.quit() // 退出app
}


ipcMain.on('system-message',(event, args)=>{
    console.log('i am from Renderer')
})
ipcMain.on('devTool',(event, args)=>{
    if(args){
        window.webContents.openDevTools()
    }else {
        window.webContents.closeDevTools()
    }})

ipcMain.on('data',(event, data)=>{
    console.log(event, data)
    try{
        store.set('cache-data',data)
        event.reply('data-res','success')
    }catch (e) {
        console.log(e)
        event.reply('data-res','fail')
    }
})

const messageChannelMap = {}

function registMessageChannel(channel,webContentId) {
    if(messageChannelMap[channel] !== undefined){
        let alreadyHas = false
        for(let i =0;i<messageChannelMap[channel][i].length;i++){
            if(messageChannelMap[channel][i] === webContentId){
                alreadyHas = true
            }
            if(!alreadyHas){
                messageChannelMap[channel].push(webContentId)
            }
        }
    }else {
        messageChannelMap[channel] = [webContentId]
    }
}

function getMessageChannel(channel) {
    return messageChannelMap[channel] || []
}

// 监听注册消息事件
ipcMain.on('registMessageChannel',(event, data)=>{
    console.log('registMessage',data)
    try{
        registMessageChannel(data,event.sender.id)
    }catch (e) {
        console.log(e)
    }
})

// 监听getRegisteMessage事件
ipcMain.on('getRegistedMessage',(event, data)=>{
    try {
        // 触发渲染进程registedMessage，并返回contentId数据
        event.reply('registedMessage',JSON.stringify(getMessageChannel(data)))
    }catch (e) {
        console.log(e)
    }
})