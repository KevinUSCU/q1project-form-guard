// Listener for Injector to enable extension
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message === "enable") {
        // Enable extension button
        chrome.pageAction.show(sender.tab.id);
        // Pass url back to tab
        sendResponse(sender.tab.url);
    }
})

var kevin = "hi there!";