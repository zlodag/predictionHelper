function show_status(msg) {
    const status = document.getElementById('status');
    status.textContent = msg;
    setTimeout(function() {
        status.textContent = '';
    }, 5000);
}

function onFormSubmit(event) {
    event.preventDefault();
    chrome.runtime.sendMessage({
        identifier: identifier_field.value,
        diagnosis: diagnosis_field.value,
        prediction: prediction_field.value,
        known_by: known_by_field.value,
    }, response => {
        show_status(chrome.runtime.lastError ? chrome.runtime.lastError.message : response);
    });
}

const identifier_field = document.getElementById('identifier');
const diagnosis_field = document.getElementById('diagnosis');
const prediction_field = document.getElementById('prediction');
const known_by_field = document.getElementById('known_by');
document.getElementById('entry').addEventListener('submit', onFormSubmit);