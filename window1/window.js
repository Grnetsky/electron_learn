const { ipcRenderer} = require('electron')
ipcRenderer.on('action',(event, data)=>{
    console.log("收到",data)
})

const main = require('@electron/remote') // 获取主线程对象
let window = main.getCurrentWindow() // 获取当前窗口
const el = document.querySelector("#window")
el.addEventListener('mouseenter',()=>{
    window.setIgnoreMouseEvents(false,) // 设置是否触发鼠标事件
})

el.addEventListener('mouseleave',()=>{
    window.setIgnoreMouseEvents(true,{forward: true},) // 设置是否触发鼠标事件 forward配置项保留窗口相应鼠标的时间 mouseleave和mouseenter等
})
ipcRenderer.send('registMessageChannel','action')
