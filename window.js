
// 渲染进程
const os = require("os")
const {ipcRenderer} = require("electron")
const http = require('http')

const option = {
    hostname:'localhost',
    port: 8000,
    path:'/api/user',
    method:'GET',
    headers: {
        'Content-Type': 'application/x-www.form-urlencoded'

    }}
const req = http.request(option,function (res) {
    res.setEncoding('utf8');
    res.on('data',(data)=>{
        console.log("数据为",data)
        try{
            ipcRenderer.send('data',JSON.stringify(data))
        }catch (e){
            console.log(e)
        }
    })
})
ipcRenderer.on('data-res',function (event,data) {
    console.log("收到主进程返回消息",data)
})

req.write('');
req.end();
