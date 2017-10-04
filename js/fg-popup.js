// Button DOM references
var recoverButton = document.getElementById("recover");
var enableButton = document.getElementById("enable");
var disableButton = document.getElementById("disable");
var deleteButton = document.getElementById("delete");
var delallButton = document.getElementById("delall");

// On load, check if this tab has recoverable data
// Get id for active tab
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // Send message to injector on active tab
    chrome.tabs.sendMessage(tabs[0].id, ["isThereSavedData"], function(response) {
        if (response[0] === false) { // hide recover & delete buttons
            recoverButton.style.display = "none";
            deleteButton.style.display = "none";
        }   
    });
});


// Button Listeners
recoverButton.addEventListener("click", function() {
    // Get id for active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Send message to injector on active tab
        chrome.tabs.sendMessage(tabs[0].id, ["recover"], function(response) {
            // Display status message in popup
            let status = document.getElementById("status");
            if (response[0] === true) status.innerText = "Data Recovered";
            else status.innerText = "There was no data to recover";
            status.style.display = "block"; // make visible
        });
    });
});

enableButton.addEventListener("click", function() {
    // Get id for active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Send message to injector on active tab
        chrome.tabs.sendMessage(tabs[0].id, ["activate"], function(response) {
            // Display status message in popup
            let status = document.getElementById("status");
            if (response[0] === "recording") status.innerText = "Form is being recorded";
            else if (response[0] === "alreadyRecording") status.innerText = "Form was already recording\n(and still is)";
            else status.innerText = "There has been an error";
            status.style.display = "block"; // make visible
        });
    });
});

disableButton.addEventListener("click", function() {
    // Get id for active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Send message to injector on active tab
        chrome.tabs.sendMessage(tabs[0].id, ["deactivate"], function(response) {
            // Display status message in popup
            let status = document.getElementById("status");
            status.innerText = "Form is no longer being recorded";
            status.style.display = "block"; // make visible
        });
    });
});

deleteButton.addEventListener("click", function() {
    // Get id for active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Send message to injector on active tab
        chrome.tabs.sendMessage(tabs[0].id, ["delete"], function(response) {
            // Display status message in popup
            let status = document.getElementById("status");
            if (response[0] === "deleted") status.innerText = "Data was deleted";
            else status.innerText = "There was no saved data"; // not currently verified
            status.style.display = "block"; // make visible
        });
    });
});

delallButton.addEventListener("click", function() {
    // Clear all storage data for this extension
    chrome.storage.local.clear();
    // Display status message in popup
    let status = document.getElementById("status");
    status.innerText = "All Form Guard data was deleted";
    status.style.display = "block"; // make visible
});

// Function to get URL of the current tab (async)
function getActiveTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // This is grabbing an array of tabs; but we'll only get one at index 0
    var tab = tabs[0];
    var url = tab.url;

    // This assert should only kickback if the activeTab permission is not
    // set in the manifest.json
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}