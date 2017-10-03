// Listener for messages from Injector
// (messages and responses are arrays where index 0 is the command, and index 1 carries data)
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message[0] === "enable") {
        // Enable extension button
        chrome.pageAction.show(sender.tab.id);
        // Check for previously stored data
        getSavedFormData(sender.tab.url, (data) => {
            if (data) sendResponse([true, data]);
            else sendResponse([false, null]);
        });
        return true; //this is need to make this work async (getSavedFormData is async)
    } else if (message[0] === "fetch") {
        // Serve request to fetch previously stored data
        getSavedFormData(sender.tab.url, (data) => {
            if (data) sendResponse([true, data]);
            else sendResponse([false, null]);
        });
        return true; //this is need to make this work async (getSavedFormData is async)
    } else if (message[0] === "save") {
        // Serve request to save data
        saveFormData(sender.tab.url, message[1]);
    } else if (message[0] === "erase") {
        // Serve request to delete data for this page
        deleteFormData(sender.tab.url);
    }
})

// Function to read saved data from storage
function getSavedFormData(url, callback) {
    // chrome.runtime.lastError is true if item cannot be retrieved from storage
    chrome.storage.local.get(url, (items) => {
        callback(chrome.runtime.lastError ? null : items[url]);
    });
}

// Function to save form data to storage
function saveFormData(url, data) {
    var items = {};
    items[url] = data;
    chrome.storage.local.set(items);
}

// Function to delete form data from storage
function deleteFormData(url) {
    chrome.storage.local.remove(url);
}
