// Global Variables
var domMap = getDomMap(); // map of all possible DOM form elements
var formData = getFormFields(domMap); // current collected form data (subset of domMap)
var priorData = null; // will hold save data from prior visit
var intervalID = null; // variable to reference interval timer; also indicates if page is actively recording
var savedDataPresent = false; // tracks whether there is currently any saved data (prior or current) for the page

// At page load, establish if forms are present and existence of previously saved data
if (domMap.length > 0) {
    // Send message to Event Page to enable extension in toolbar for user
    chrome.runtime.sendMessage(["enable"], function(response) {
        // Check for previously stored form data
        if (response[0] === true) {
            // Stored data exists and has been returned
            priorData = response[1];
            savedDataPresent = true;
            displayAlert();
        }
    })
}

// Listener for main extension requests
// (all messages and responses are arrays where index 0 is the command, and index 1 carries data when needed)
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message[0] === "activate") {
        // Start recording form data on page
        if (!intervalID) {
            // Regrab domMap and formData to fix edge cases where form was generated after page load by JS
            var domMap = getDomMap();
            var formData = getFormFields(domMap);
            // Save once immediately
            readFormFields(formData, domMap);
            chrome.runtime.sendMessage(["save", formData]);
            // Start interval recording
            intervalID = window.setInterval(function() {
                readFormFields(formData, domMap);
                chrome.runtime.sendMessage(["save", formData]);
            }, 5000);
            savedDataPresent = true; // flag that there will now be saved data
            sendResponse(["recording"]);
        }
    } else if (message[0] === "deactivate") {
        // Stop recording form data on page
        if (intervalID) {
            window.clearInterval(intervalID);
            intervalID = null;
        }
        sendResponse(["stopped"]);
    } else if (message[0] === "recover") {
        // Regrab domMap to fix edge cases where form was generated after page load by JavaScript
        var domMap = getDomMap();
        // Recover most recently saved form data on page
        chrome.runtime.sendMessage(["fetch"], function(response) {
            if (response[0] === true) {
                // Write data back to page
                writeFormFields(response[1], domMap);
                sendResponse([true]);
            }
        })
        return true; // to make async to handle waiting for fetch response
    } else if (message[0] === "delete") {
        // Delete previously saved data on page by sending request to event-page
        chrome.runtime.sendMessage(["erase"]);
        priorData = null; // remove fetched data from prior visit
        savedDataPresent = false; // set flag for no saved data
        sendResponse(["deleted"]);
    } else if (message[0] === "pageState") {
        // Answer request about page state
        // This response will hold [<is there saved data?>, <is it recording?>]
        let response = [];
        response[0] = savedDataPresent;
        if (intervalID) response[1] = true;
        else response[1] = false;
        sendResponse(response);
    }
})

// Function to grab all possible form fields on the page
// (also used as a reference when putting stuff back)
function getDomMap() {
    var domArray = [];

    // Eliminate anything in a <header>. Would also be worth eliminating footer fields, but
    // combining these is messy, so may revisit later.
    let inputItems = document.querySelectorAll("body > *:not(header) input");
    let selectItems = document.querySelectorAll("body > *:not(header) select");
    let textareaItems = document.querySelectorAll("body > *:not(header) textarea");

    // Combine these from Node Lists to a single array
    let indexCounter = 0;
    for (let i = 0; i < inputItems.length; i++) {
        domArray[indexCounter] = inputItems[i];
        indexCounter++;
    }
    for (let i = 0; i < selectItems.length; i++) {
        domArray[indexCounter] = selectItems[i];
        indexCounter++;
    }
    for (let i = 0; i < textareaItems.length; i++) {
        domArray[indexCounter] = textareaItems[i];
        indexCounter++;
    }

    return domArray;
}

// Function to extract Form Fields and set up our data structure
// Note the returned structure needs to be "JSONifiable" for Chrome storage (which it is) 
function getFormFields(nodeList) {
    let formArray = []; // This will be an array of objects, each with a name key and a value
    
    for (let i = 0; i < nodeList.length; i++) {
        let item = nodeList[i];
        // For <input> items, check for valid type before sending to parseItem
        let validTypes = [
            "checkbox",
            "color", 
            "date", 
            "datetime-local",
            "email",
            "month",
            "number",
            "radio",
            "range",
            "tel",
            "text",
            "time",
            "url",
            "week"
        ];
        if (item.nodeName === "INPUT") {
            if (validTypes.includes(item.type.toLowerCase())) parseItem(i, item);
        } else parseItem(i, item); // For select and textarea items
    }

    function parseItem(position, item) {
        // Set lexicon of excluded terms
        let invalidTerms = [
            "search",
            "credit",
            "cvc",
            "password",
            "account",
            "ssn",
            "security",
            "card"
        ];

        // Filter out items containing excluded terms
        let isValidItem = true;

        for (let i = 0; i < invalidTerms.length; i++) {
            if (item.name.toLowerCase().includes(invalidTerms[i])) isValidItem = false;
            else if (item.id.toLowerCase().includes(invalidTerms[i])) isValidItem = false;
        }
                    
        if (isValidItem) {
            let object = {
                index: position,
                checked: item.checked,
                value: item.value
            }

            formArray.push(object);
        }
    }

    return formArray;
}

// Function to Read Form Data from DOM
function readFormFields(formFields, domRef) {
    formFields.forEach(function(item) {
        item.checked = domRef[item.index].checked;
        item.value = domRef[item.index].value;
    });
}

// Function to Populate Form Data into DOM
function writeFormFields(formFields, domRef) {
    formFields.forEach(function(item) {
        domRef[item.index].checked = item.checked;
        domRef[item.index].value = item.value;
    });
}

// Function to display user alert that saved data is present
function displayAlert() {
    // Create alert object in DOM
    let alertbox = document.createElement("aside");
    alertbox.id = "form-guard-alert";

    let header = document.createElement("header");
    header.innerText = "Form Guard";
    alertbox.appendChild(header);
    
    let message = document.createElement("p");
    message.innerText = `
        There is saved form data for this page!
        To recover data from your prior visit,
        please click here:
        `;
    alertbox.appendChild(message);

    let button = document.createElement("button");
    button.innerText = "Recover Last Session";
    alertbox.appendChild(button);
    
    document.body.appendChild(alertbox);

    // Set listener for recover button
    button.addEventListener("click", function() {
        // Regrab domMap to fix edge cases where form was generated after page load by JS
        var domMap = getDomMap();
        // Write form back to page DOM
        writeFormFields(priorData, domMap);
    })

    // Set listener to remove alert box on click inside it
    alertbox.addEventListener("click", function() {
        alertbox.style.animationName = "slideup";
        setTimeout(function() {
            document.body.removeChild(alertbox);
        }, 395);
    })
}
