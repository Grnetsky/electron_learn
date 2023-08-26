
// 渲染进程
const os = require("os")
const Store = require('@electron/remote').require('electron-store') // 使用remote（渲染进程单方向向主进程通信）
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
            let store = new Store()
            store.set('cache-data',JSON.stringify(data))
            console.log(JSON.parse(store.get('cache-data')),"缓存成功")
        }catch (e){
            console.log(e)
        }
    })
})


req.write('');
req.end();
