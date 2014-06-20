var onLoad = function () {
    if (document.body && !document.getElementById('hongx_inject')) {
        var button = document.createElement('button');
        button.textContent = "hongx";
        button.id = "hongx_inject"
        document.body.appendChild(button)
    }
}
setTimeout(onLoad, 1000);
chrome.extension.onConnect.addListener(function (info) {
    alert(info)
});
