console.log("I'm running on this page!");

if (window == top) {
    var formFields = getFormFields();
    console.log(formFields);
    console.log(formFields.length);
    // Send notification with found form data
    // a NodeList won't pass correctly as a message, so I'll need to convert
    // it to something else first (array, object)
    chrome.runtime.sendMessage(formFields, function(response) {
        console.log(response);
    });
}

function getFormFields() {
    let formArray = document.querySelectorAll("form input");

    return formArray;
}