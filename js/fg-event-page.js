// Listener for Injector to enable extension
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message === "enable") {
        // Enable extension button
        chrome.pageAction.show(sender.tab.id);
        // Check for recoverable form data
        sendResponse("found-saved-data");
    }
})

var kevin = "hi there!";