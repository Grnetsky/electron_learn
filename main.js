// 主进程
const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const winsMap = new Map()
const winTheLock = app.requestSingleInstanceLock();  //给应用加抢占琐  即使用单例模式保证同一个app只能打开一个

if(winTheLock){

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

    function createNewWindow(windowName,group,url) {
        // 主窗口 相关设置参见 https://www.electronjs.org/zh/docs/latest/api/browser-window#new-browserwindowoptions
        let window = new BrowserWindow({
            title:'当html文件没有title标签时则显示此title', //优先级： HTML title>BrowserWindow>package.json name属性 > Electron 默认   另外还提供了setTitle方法 来动态改变窗口标题
            width: 1000, // 指定窗口的宽
            height: 600, // 指定窗口的高
            maxWidth:1000, // 窗口的最大宽度
            maxHeight: 800, //窗口的最大高度
            minWidth: 300, //窗口的最小宽度
            minHeight: 200, // 窗口的最小高度
            resizable: true, // 是否可以缩放窗口
            frame:false, // false隐藏窗口标题栏，菜单栏以及边框
            parent:null, // 设置父窗口引用
            x: 400,
            y: 600, // 在屏幕中的位置 默认为正中间
            icon: path.join(__dirname,'logo.jpg'), // 指定标题栏图标 默认使用应用可执行文件的图片作为图标
            transparent: false, // 设置窗口透明
            alwaysOnTop: false, // 是否常置于顶层
            webPreferences:{
                nodeIntegration:true, //允许渲染进程调用nodejs模块
                contextIsolation: false,
                webviewTag:true, //为了webview正常显示内容
                enableRemoteModule: true, //开启remote配置 以允许渲染进程使用remote模块（远程调用）
            }
        })
        require("@electron/remote/main").enable(window.webContents)
        // 开启控制台
        window.loadURL(url).then(()=>{
        })
        // 关闭窗口 清空指针，防止内存泄露
        window.on("close", function () {
            window = null
        })

        const windowObj = {windowName,window}
        let groupWindows = winsMap.get(group);
        if(groupWindows){ // 存在
            groupWindows.push(windowObj); // 放入组中
        }else{ // 不存在
            groupWindows = [windowObj]
        }
        winsMap.set(group,groupWindows)
    }

    function closeWindowByGroup(group) {
        const groupWindows = winsMap.get(group)
        if(groupWindows){
            for(let i = 0;i<groupWindows.length;i++){
                groupWindows[i].window.close()
            }
        }else{
            console.log(`${group} not existed`)
        }
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
        createNewWindow('window1','main',url1)
        // 第二个渲染进程的窗口文件路径
        const url2 = url.format({
            protocol: 'file',
            pathname: path.join(__dirname,'window2/index.html')
        })
        // 创建第二个窗口
        createNewWindow('window2','group2',url2)
        createNewWindow('window3','group2',url2)

        setTimeout(closeWindowByGroup,2000,'group2')
        // setTimeout(closeWindowByName,2000,'window2')
    })
}else {
    app.quit() // 退出app
}