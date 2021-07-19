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
    }, function(options) {
        if (chrome.runtime.lastError) {
            show_status(chrome.runtime.lastError.message);
        } else {
            api_token.value = options.api_token;
            password.value = options.password;
        }
    });
}

function onFormSubmit(event) {
    event.preventDefault();
    const options = {};
    if (api_token.value) options.api_token = api_token.value;
    if (password.value) options.password = password.value;
    if (Object.keys(options).length) {
        chrome.storage.sync.set(options, () => {
            show_status(chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Options saved');
            restore_options();
        });
    }
}

const api_token = document.getElementById('api_token');
const password = document.getElementById('password');
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('optionsForm').addEventListener('submit', onFormSubmit);