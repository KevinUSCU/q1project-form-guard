// Dummy check to make sure injector is running
console.log("I'm running on this page!");

// At page load, get references and establish if forms are present
var formFields = getFormFields();
if (formFields.length > 0) {
    // Send message to Event Page to enable extension for user
    chrome.runtime.sendMessage("enable", function(response) {
        if (response === "found-saved-data") {
            displayAlert();
        }
    })
}

// Listener for main extension requests



// Function to Grab Form Fields and set up our data structure
// (Note that a custom structure is needed because DOM elements
// can't be passed via Chrome messages)
function getFormFields() {
    let formArray = []; // this is an array of objects, each with a name key and a value
    let validTypes = [ //these are the input fields we'll consider
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
    let inputItems = document.querySelectorAll("form input"); 
    let selectItems = document.querySelectorAll("form select");
    let textareaItems = document.querySelectorAll("form textarea");
    inputItems.forEach(parseItem);
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
        // Only add items that have a useable name or id
        if (object.name.length > 0 || object.id.length > 0) formArray.push(object);
    }

    return formArray;
}

// Function to Read Form Data from DOM
function readFormFields(formFields) {

}

// Function to Populate Form Data into DOM
function writeFormFields(formFields) {

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

