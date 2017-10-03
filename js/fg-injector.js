// Dummy check to make sure injector is running
console.log("I'm running on this page!");

// At page load, establish if forms are present and existence of previously saved data
var recoveredFormData = null; //will hold previously saved data
var formFields = getFormFields(); //holds the current fields found and read on the page
if (formFields.length > 0) {
    // Send message to Event Page to enable extension for user
    chrome.runtime.sendMessage(["enable", null], function(response) {
        // Check for previously stored form data
        console.log(response)
        if (response[0] === true) {
            // Stored data exists and has been returned
            recoveredFormData = response[1];
            displayAlert();
        }
    })
}

// Listener for main extension requests
// (messages and responses are arrays where index 0 is the command, and index 1 carries data)
var intervalID = null;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message[0] === "activate") {
        // Start recording form data on page
        if (!intervalID) {
            intervalID = window.setInterval(function() {
                readFormFields(formFields);
                chrome.runtime.sendMessage(["save", formFields]);
            }, 30000);
        }
    } else if (message[0] === "deactivate") {
        // Stop recording form data on page
        if (intervalID) {
            window.clearInterval(intervalID);
        }
    } else if (message[0] === "recover") {
        // Recover most recently saved form data on page
        chrome.runtime.sendMessage(["fetch", null], function(response) {
            if (response[0] === true) {
                // Write data back to page
                writeFormFields(response[1]);
            }
        })
    } else if (message[0] === "delete") {
        // Delete previously saved data on page by sending request to event-page
        chrome.runtime.sendMessage(["erase", null]);
    } else if (message[0] === "isThereRecoveredData") {
        // Answer request about whether there is recovered data at startup
        if (recoveredFormData) sendResponse([true, null]);
        else sendResponse([false, null]);
    }
})

// Function to Grab Form Fields and set up our data structure
// (Note that a custom structure is needed because it needs to be "JSONifiable")
function getFormFields() {
    let formArray = []; // this is an array of objects, each with a name key and a value
    
    // Eliminate anything in a <header>. Would also be worth eliminating footer fields, but
    // combining these seems messy, so will revisit later.
    let inputItems = document.querySelectorAll("body > *:not(header) input");
    let selectItems = document.querySelectorAll("body > *:not(header) select");
    let textareaItems = document.querySelectorAll("body > *:not(header) textarea");

    inputItems.forEach(function(item) {
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
        if (validTypes.includes(item.type.toLowerCase())) parseItem(item);
    });
    selectItems.forEach(parseItem);
    textareaItems.forEach(parseItem);

    function parseItem(item) {
        let object = {
            name: "",
            id: "",
            value: ""
        }
        object.name = item.name;
        object.id = item.id;
        object.value = item.value;

        let isValidItem = true;

        // Only add items that have a useable name and/or id
        if (object.name.length === 0 && object.id.length === 0) isValidItem = false;
        
        // Set lexicon of excluded terms
        let invalidTerms = [
            "search",
            "credit",
            "cvc",
            "password"
        ];

        // Filter out items containing excluded terms
        for (let i = 0; i < invalidTerms.length; i++) {
            if (object.name.toLowerCase().includes(invalidTerms[i])) isValidItem = false;
            else if (object.id.toLowerCase().includes(invalidTerms[i])) isValidItem = false;
        }
                    
        if (isValidItem) formArray.push(object);
    }

    return formArray;
}

// Function to Read Form Data from DOM
function readFormFields(formFields) {
    formFields.forEach(function(item) {
        if (item.id.length > 0) { // if id is present, use that to locate DOM element
            let fieldTarget = document.getElementById(item.id);
            item.value = fieldTarget.value;
        } else { // in absence of id, use name field
            let fieldTarget = document.getElementsByName(item.name);
            item.value = fieldTarget.value;
        }
    });
}

// Function to Populate Form Data into DOM
function writeFormFields(formFields) {
    formFields.forEach(function(item) {
        if (item.id.length > 0) { // if id is present, use that to locate DOM element
            let fieldTarget = document.getElementById(item.id);
            fieldTarget.value = item.value;
        } else { // in absence of id, use name field
            let fieldTarget = document.getElementsByName(item.name);
            fieldTarget.value = item.value;
        }
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

        To recover now, please click here:
        `;
    alertbox.appendChild(message);

    let button = document.createElement("button");
    button.innerText = "Recover";
    alertbox.appendChild(button);
    
    document.body.appendChild(alertbox);

    // Set listener for recover button
    button.addEventListener("click", function() {
        writeFormFields(recoveredFormData);
    })

    // Set listener to remove alert on click inside it
    alertbox.addEventListener("click", function() {
        alertbox.style.animationName = "slideup";
        setTimeout(function() {
            document.body.removeChild(alertbox);
        }, 395);
    })
}
