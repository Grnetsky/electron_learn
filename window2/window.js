const {ipcRenderer} = require("electron")
$(function () {
    const iconEle = $("#icon")
    function onIconClick() {
        ipcRenderer.send('toggleBar')
    }
    iconEle.click(onIconClick)
})