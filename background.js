chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("Button Clicked")
    chrome.tabs.sendMessage(tab.id, {method: "toggle"})
});
