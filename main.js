// 主进程
const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const {ipcMain} = require('electron')
const Store = require('electron-store')
const store = new Store()
let windows = []

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
        let window = new BrowserWindow({
            title:'当html文件没有title标签时则显示此title', //优先级： HTML title>BrowserWindow>package.json name属性 > Electron 默认   另外还提供了setTitle方法 来动态改变窗口标题
            width: 600, // 指定窗口的宽
            height: 400, // 指定窗口的高
            maxWidth:1000, // 窗口的最大宽度
            maxHeight: 800, //窗口的最大高度
            minWidth: 300, //窗口的最小宽度
            minHeight: 200, // 窗口的最小高度
            resizable: true, // 是否可以缩放窗口
            x: 400,
            y: 600, // 在屏幕中的位置 默认为正中间
            webPreferences:{
                nodeIntegration:true, //允许渲染进程调用nodejs模块
                contextIsolation: false,
                webviewTag:true, //为了webview正常显示内容
                enableRemoteModule: true //开启remote配置 以允许渲染进程使用remote模块（远程调用）
            }
        })
        // 开启控制台
        window.loadURL(url).then(()=>{
            window.webContents.openDevTools()
        })
        // 关闭窗口 清空指针，防止内存泄露
        window.on("close", function () {
            window = null
        })
        return window
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

        windows.push(createNewWindow(url1))

        // 第二个渲染进程的窗口文件路径
        const url2 = url.format({
            protocol: 'file',
            pathname: path.join(__dirname,'window2/index.html')
        })
        // 创建第二个窗口
        setTimeout(
            ()=>{
                windows.push(createNewWindow(url2))
            },2000)
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
        }
    }
)

// 消息对应的窗口引用
const messageChannelMap = {}


/*
* @description 注册消息窗口 ： 消息名：[窗口列表]
* @param channel 消息名
* @param webContentId 窗口id
*
* */
function registMessageChannel(channel,webContentId) {
    if(messageChannelMap[channel] !== undefined){  // 存在该消息列表
        let alreadyHas = false
        for(let i =0;i<messageChannelMap[channel][i].length;i++){
            if(messageChannelMap[channel][i] === webContentId){  // 判断该列表是否有该窗口id
                alreadyHas = true
            }
            if(!alreadyHas){
                messageChannelMap[channel].push(webContentId)
            }
        }
    }else {
        // 若不存在该消息 则创建该消息列表
        messageChannelMap[channel] = [webContentId]  // TODO 这里似乎只能注册一个？
    }
}


// 监听注册消息事件
ipcMain.on('transMessage',(event, channel,data)=>{
    try{
        // 发送数据
    transMessage(getMessageChannel(channel),channel,data)
    }catch (e) {
        console.log(e)
    }
})

ipcMain.on('registMessageChannel',(event, data)=>{
    try{
        // 注册
        registMessageChannel(data,event.sender.id)
    }catch (e) {
        console.log(e)
    }
})

function transMessage(webContents,channel,data) {
    for(let i = 0;i<webContents.length;i++){
        for(let j = 0 ;j<windows.length;j++){
            if(webContents[i] === windows[i].webContents.id){
                windows[j].webContents.send(channel,data)
            }
        }
    }
}

function getMessageChannel(channel) {
    return messageChannelMap[channel] || []
}