// The following functions are based on a sample extension on the Chrome website.
// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Get URL of the current tab; this request is async
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // This is grabbing an array of tabs; since there can be only one
    // active tab, that means the array will have one item in index [0]
    var tab = tabs[0];
    var url = tab.url;

    // This assert should only kickback if the activeTab permission is not
    // set in the manifest.json
    //actually ... activeTab might not be the way to go as it requires the user 
    // to invoke the extension
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

// Get saved form data
function getSavedFormData(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails. Returns null if item does not exist in storage.
  chrome.storage.sync.get(url, (formData) => {
    callback(chrome.runtime.lastError ? null : formData[url]);
  });
}

// Save form data to storage
function saveFormData(url, formFields) {
  var formData = {};
  formData[url] = formFields;
  chrome.storage.sync.set(formData);
}


//this is domcontentloaded of the *popup*
document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    var dropdown = document.getElementById('dropdown');

    // Load the saved background color for this page and modify the dropdown
    // value, if needed.
    getSavedBackgroundColor(url, (savedColor) => {
      if (savedColor) {
        changeBackgroundColor(savedColor);
        dropdown.value = savedColor;
      }
    });

    // Ensure the background color is changed and saved when the dropdown
    // selection changes.
    dropdown.addEventListener('change', () => {
      changeBackgroundColor(dropdown.value);
      saveBackgroundColor(url, dropdown.value);
    });
  });
});
