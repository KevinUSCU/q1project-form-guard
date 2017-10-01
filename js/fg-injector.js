// Dummy check to make sure injector is running
console.log("I'm running on this page!");

// At page load, get references and establish if forms are present
var tabURL = null;
var recoveredFormData = null;
var formFields = getFormFields();
if (formFields.length > 0) {
    // Send message to Event Page to enable extension for user
    chrome.runtime.sendMessage("enable", function(response) {
        tabURL = response;
        // Check for previously stored form data
        getSavedFormData(tabURL, (data) => {
            if (data) {
                recoveredFormData = data;
                displayAlert();
            }
        });
        // saveFormData(tabURL, formFields);
        chrome.storage.local.remove(tabURL);
    })
}

// Listener for main extension requests



// Function to Grab Form Fields and set up our data structure
// (Note that a custom structure is needed because DOM elements
// can't be passed via Chrome messages)
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

        // Only add items that have a useable name
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
        if (item.id.length > 0) {
            let fieldTarget = document.getElementById(item.id);
            item.value = fieldTarget.value;
        } else {
            let fieldTarget = document.getElementsByName(item.name);
            item.value = fieldTarget.value;
        }
    });
}

// Function to Populate Form Data into DOM
function writeFormFields(formFields) {
    formFields.forEach(function(item) {
        if (item.id.length > 0) {
            let fieldTarget = document.getElementById(item.id);
            fieldTarget.value = item.value;
        } else {
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
    let message = document.createElement("div");
    message.innerText = `
        There is saved form data for this page!

        To recover it, please use the Form Guard extension button.
        `;
    alertbox.appendChild(message);
    document.body.appendChild(alertbox);
    // Set listener to remove alert on click inside it
    alertbox.addEventListener("click", function() {
        alertbox.style.animationName = "slideup";
        setTimeout(function() {
            document.body.removeChild(alertbox);
        }, 400);
    })
}

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


// If forms are present, 
// check for saved data - populate or offer to?

// start interval timer to periodically grab form data and save

// var form = document.querySelector("form input")
// console.log(form)
// form.addEventListener("input", function() {
//     // console.log(this.value)
//     console.log(event.target.value)

// })


// if (window == top) {
//     var formFields = getFormFields();
//     console.log(formFields);
//     console.log(formFields.length);
//     // Send notification with found form data
//     // a NodeList won't pass correctly as a message, so I'll need to convert
//     // it to something else first (array, object)
//     chrome.runtime.sendMessage(formFields, function(response) {
//         console.log(response);
//     });
// }

