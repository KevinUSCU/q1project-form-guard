// Enable fg-popup.js to be able to interact with fg-event-page.js ?????
var eventPage = chrome.extension.getBackgroundPage();


// Check if this tab has recoverable data



// Button Listeners
var recoverButton = document.getElementById("recover");
var enableButton = document.getElementById("enable");
var disableButton = document.getElementById("disable");
var deleteButton = document.getElementById("delete");

recoverButton.addEventListener("click", function() {
    // Get id for active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Send message to injector on active tab
        chrome.tabs.sendMessage(tabs[0].id, ["recover", null], function(response) {
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
        chrome.tabs.sendMessage(tabs[0].id, ["activate", null], function(response) {
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
        chrome.tabs.sendMessage(tabs[0].id, ["deactivate", null], function(response) {
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
        chrome.tabs.sendMessage(tabs[0].id, ["delete", null], function(response) {
            // Display status message in popup
            let status = document.getElementById("status");
            if (response[0] === "deleted") status.innerText = "Data was deleted";
            else status.innerText = "There was no saved data"; // not currently verified
            status.style.display = "block"; // make visible
        });
    });
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