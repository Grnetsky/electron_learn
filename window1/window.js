const remote = require('@electron/remote')
const {ipcRenderer} = require("electron")
const curWin = remote.getCurrentWindow()
const HIDDEN = 0;
const AMIMATING = 1;
const SHOWED = 2;
let status = SHOWED;
const barEle = $("#bar");
ipcRenderer.on('toggleBar',(event)=>{
    if(status === SHOWED){
        barEle.animate({
            top:'600px',
            height:'100px',
        },'fast',function () {
            status = HIDDEN;
            const position = curWin.getPosition();
            curWin.setSize(100,100);
            curWin.setPosition(position[0],position[1]+600)
        })
        status = AMIMATING;
    }else if(status === HIDDEN){
        const position = curWin.getPosition();
        curWin.setSize(100,700);
        curWin.setPosition(position[0],position[1]-600);
        barEle.animate({
            top:'0px',
            height:'700px',
        },'fast',function () {
            status = SHOWED
        })
        status = AMIMATING
    }})

