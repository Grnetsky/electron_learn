const remote = require('@electron/remote')
$(function () {
    const HIDDEN = 0;
    const AMIMATING = 1;
    const SHOWED = 2;
    let status = SHOWED;
    const iconElem = $("#icon");
    const barEle = $("#bar");

    function onIconClick() {
        console.log(remote,'remote')
        let curWin = remote.getCurrentWindow()
        console.log(curWin,'curMin')
        if(status === SHOWED){
            barEle.animate({
                top:'600px',
                height:'100px',
            },'fast',function () {
                status = HIDDEN;
                const position = curWin.getPosition()
                curWin.setSize(100,100)
                curWin.setPosition(position[0],position[1]+600)
                iconElem.css({
                    bottom:'auto',
                    top:'0px'
                })
            })
            status = AMIMATING
        }else if(status === HIDDEN){
            const position = curWin.getPosition()
            curWin.setSize(100,700)
            curWin.setPosition(position[0],position[1]-600)
            iconElem.css({
                bottom:'0px',
                top:'auto'
            })
            barEle.animate({
                top:'0px',
                height: '700px'
            },'fast',function () {
                status = SHOWED;
            })
            status = AMIMATING;
        }
    }
    iconElem.click(onIconClick)
})
