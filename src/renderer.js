const { ipcRenderer } = require("electron")

var btn=document.querySelector('#mini')
btn.onclick=function(){
    ipcRenderer.send('mini')
}