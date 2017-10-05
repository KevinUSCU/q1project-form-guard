// DOM references
var recoverButton = document.getElementById("recover");
var enableButton = document.getElementById("enable");
var disableButton = document.getElementById("disable");
var deleteButton = document.getElementById("delete");
var delallButton = document.getElementById("delall");
var yesPageButton = document.getElementById("yes1");
var noPageButton = document.getElementById("no1");
var yesAllButton = document.getElementById("yes2");
var noAllButton = document.getElementById("no2");

var statusElement = document.getElementById("status");
var confirmPageElement = document.getElementById("confirm1");
var confirmAllElement = document.getElementById("confirm2");


// On LOAD, check if this tab:
//   has recoverable data
//   is recording
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // Send message to injector on active tab
    chrome.tabs.sendMessage(tabs[0].id, ["pageState"], function(response) {
        if (response[0] === true) {
            // Display recover & delete buttons
            recoverButton.style.display = "inline";
            deleteButton.style.display = "inline";
        }
        if (response[1] === true) {
            // Display status message
            statusElement.innerText = "Form backup is ON";
            // hide enable button; display disable button
            enableButton.style.display = "none";
            disableButton.style.display = "inline";
        }
    });
});


// Button Listeners
recoverButton.addEventListener("click", function() {
    // Get id for active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Send message to injector on active tab
        chrome.tabs.sendMessage(tabs[0].id, ["recover"], function(response) {
            // Display status message
            if (response[0] === true) statusElement.innerText = "Data Recovered";
            // Next line should no longer fire
            else statusElement.innerText = "There was no data to recover";
        });
    });
});

enableButton.addEventListener("click", function() {
    // Get id for active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Send message to injector on active tab
        chrome.tabs.sendMessage(tabs[0].id, ["activate"], function(response) {
            // Display status message
            if (response[0] === "recording") statusElement.innerText = "Form backup is ON";
            // Next two lines in theory never fire, leaving for possible future use
            else if (response[0] === "alreadyRecording") statusElement.innerText = "Form was already recording\n(and still is)";
            else statusElement.innerText = "There has been an error";
            // Swap button display states
            enableButton.style.display = "none";
            disableButton.style.display = "inline";
            recoverButton.style.display = "inline";
            deleteButton.style.display = "inline";
        });
    });
});

disableButton.addEventListener("click", function() {
    // Get id for active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Send message to injector on active tab
        chrome.tabs.sendMessage(tabs[0].id, ["deactivate"], function(response) {
            if (response[0] === "stopped") {
                // Display status message
                statusElement.innerText = "Form backup is OFF";
                // Swap display of enableButton and disableButton
                enableButton.style.display = "inline";
                disableButton.style.display = "none";
            }
        });
    });
});

deleteButton.addEventListener("click", function() {
    // Display confirm element
    deleteButton.style.display = "none";
    confirmPageElement.style.display = "inline";
});

yesPageButton.addEventListener("click", function() {
    // Get id for active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Send message to injector on active tab
        chrome.tabs.sendMessage(tabs[0].id, ["delete"], function(response) {
            // On delete confirm, stop recording
            if (response[0] === "deleted") { 
                chrome.tabs.sendMessage(tabs[0].id, ["deactivate"], function(response) {
                    if (response[0] === "stopped") {
                        // Display status message in popup
                        statusElement.innerText = "Data was deleted\nAND\nform backup is OFF";
                        // Swap button display states
                        enableButton.style.display = "inline";
                        disableButton.style.display = "none";
                        deleteButton.style.display = "none";
                        recoverButton.style.display = "none";
                        confirmPageElement.style.display = "none";
                    }
                });
            }
        });
    });
});

noPageButton.addEventListener("click", function() {
    // No action is taken other than to swap display elements
    deleteButton.style.display = "inline";
    confirmPageElement.style.display = "none";
});

delallButton.addEventListener("click", function() {
    // Display confirm element
    delallButton.style.display = "none";
    confirmAllElement.style.display = "inline";
});

yesAllButton.addEventListener("click", function() {
    // Clear all storage data for this extension
    chrome.storage.local.clear();
    // Display status message    let status = document.getElementById("status");
    statusElement.innerText = "ALL Form Guard data was deleted";
    // Swap display elements
    delallButton.style.display = "inline";
    confirmAllElement.style.display = "none";
});

noAllButton.addEventListener("click", function() {
    // No action is taken other than to swap display elements
    delallButton.style.display = "inline";
    confirmAllElement.style.display = "none";
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