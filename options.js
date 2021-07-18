'use strict';

function show_status(msg) {
    const status = document.getElementById('status');
    status.textContent = msg;
    setTimeout(function() {
        status.textContent = '';
    }, 5000);
}

function restore_options() {
    chrome.storage.sync.get({
        api_token: '',
        password: '',
        group_number: '',
    }, function(options) {
        if (chrome.lastError) {
            show_status(chrome.lastError.message);
        } else {
            api_token.value = options.api_token;
            password.value = options.password;
            group_number.value = options.group_number;
        }
    });
}

function onFormSubmit(event) {
    event.preventDefault();
    const options = {};

    if (api_token.value) options.api_token = api_token.value;

    if (password.value) options.password = password.value;

    const group_number_value = parseInt(group_number.value);
    if (Number.isSafeInteger(group_number_value) && group_number_value > 0) options.group_number = group_number_value;

    if (Object.keys(options).length) {
        chrome.storage.sync.set(options, function () {
            show_status(chrome.lastError ? chrome.lastError.message : 'Options saved');
            restore_options();
        });
    }

}

const api_token = document.getElementById('api_token');
const password = document.getElementById('password');
const group_number = document.getElementById('group_number');
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('optionsForm').addEventListener('submit', onFormSubmit);