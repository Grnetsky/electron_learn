// 主进程
const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const {ipcMain} = require('electron')
const winsMap = new Map()
const winTheLock = app.requestSingleInstanceLock();  //给应用加抢占琐  即使用单例模式保证同一个app只能打开一个


console.log(process.argv)

function getProgressArgv() {
    const argv = {}
    process.argv.forEach(i=>{
        if(i.length>1){
            const rest = i.split("=")
            if(rest.length === 2){
                argv[rest[0]] = rest[1]
            }
        }
    })
    return argv
}
function getConfig() {
    const argv = getProgressArgv()
    let baseConfig = 'base.config.json'
    switch (argv.env){
        case 'test':
            baseConfig = 'test.config.json'
            break
        case 'dev':
            baseConfig = 'dev.config.json'
            break
        case 'prod':
        default:
            baseConfig = 'prod.config.json'
            break
    }
    let baseConfigs = require(path.join(__dirname,'config','base.config.json'))
    let curConfig = require(path.join(__dirname,'config',baseConfig))
    return Object.assign(baseConfigs,curConfig)
}

function getServerUrlEnv() {
    let config = getConfig()
    console.log(config,'999')
    return `${config.serverProto}://${config.serverHost}${config.serverBasePath}`
}
if(winTheLock){
    console.log(getServerUrlEnv())
    // 若app被第二次尝试打开，则弹出最先打开的，并聚焦
    app.on("second-instance", ()=>{
        if(winsMap.size>0){
            let mainWin = winsMap.get('main')
            if(mainWin){
                if(mainWin.isMinimizable()){
                    mainWin.restore()
                }
                mainWin.focus()
            }
        }

    })

    require('@electron/remote/main').initialize()

    function createNewWindow(windowName,options,htmlPath) {
        // 主窗口 相关设置参见 https://www.electronjs.org/zh/docs/latest/api/browser-window#new-browserwindowoptions
        let window = new BrowserWindow(options)
        require("@electron/remote/main").enable(window.webContents)
        let urls = url.format({
            protocol:'file',
            pathname:htmlPath
        })
        window.loadURL(urls)
        // 关闭窗口 清空指针，防止内存泄露
        window.on("close", function () {
            window = null
        })
        winsMap.set(windowName,window)
    }

    // 监听所有窗口关闭事件
    app.on('window-all-closed',()=>{
        app.quit()
    })
    // 应用准备好 主进程准备完毕
    app.on("ready", ()=>{
        // 第一个渲染进程的窗口文件路径
        createNewWindow('barWindow',{
            width:100,
            height:700,
            frame:false,
            transparent:true,
            alwaysOnTop:false,
            webPreferences:{
                nodeIntegration:true,
                contextIsolation:false,
            }
        },path.join(__dirname,'./window1/index.html'))
        // 创建第二个窗口
        createNewWindow('iconWindow',{
            width:100,
            height:100,
            x:winsMap.get('barWindow').getPosition()[0],
            y:winsMap.get('barWindow').getPosition()[1],
            frame:false,
            transparent:true,
            webPreferences:{
                nodeIntegration:true,
                contextIsolation: false
            }
        },path.join(__dirname,'./window2/index.html'))
        // winsMap.get('barWindow').setAlwaysOnTop(true,'modal-panel')
        // winsMap.get('iconWindow').setAlwaysOnTop(true,'main-menu')

    })

    ipcMain.on('toggleBar',(event)=>{
        winsMap.get('barWindow').webContents.send('toggleBar')
    })
}else {
    app.quit() // 退出app
}