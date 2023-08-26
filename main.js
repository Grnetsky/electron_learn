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

    function createNewWindow() {
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
        require('@electron/remote/main').initialize()
        require("@electron/remote/main").enable(window.webContents)

        window.webContents.openDevTools()
        const urls = url.format({
            protocol: 'file',
            pathname: path.join(__dirname,'index.html')
        })

        window.loadURL(urls)
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
        if(window === null){
            createNewWindow()
        }
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