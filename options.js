function show_status(msg) {
    const status = document.getElementById('status');
    status.textContent = msg;
    setTimeout(function() {
        status.textContent = '';
    }, 5000);
}

function restore_options() {
    chrome.storage.sync.get('password', options => {
        if (chrome.runtime.lastError) {
            show_status(chrome.runtime.lastError.message);
        } else {
            password.value = options.password;
        }
    });
}

function onFormSubmit(event) {
    event.preventDefault();
    if (password.value) {
        chrome.storage.sync.set({password: password.value}, () => {
            show_status(chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Options saved');
        });
    }
}

const password = document.getElementById('password');
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('optionsForm').addEventListener('submit', onFormSubmit);