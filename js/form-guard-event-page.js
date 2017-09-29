chrome.runtime.onMessage.addListener(function(formFields, sender, sendResponse) {
    if (formFields.length > 0) {
        // Make extension button active for this page
        // pageAction.show requires the tab id, sender is a MessageSender object 
        // which has the id from the sending tab at tab.id
        chrome.pageAction.show(sender.tab.id);
        sendResponse(true);
    } else sendResponse(false);
})