'use strict';

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
        messageType: 'newPrediction',
        identifier: identifier_field.value,
        diagnosis: diagnosis_field.value,
        confidence: confidence_field.value,
        deadline_text: deadline_field.value,
    }, response => {
        if (chrome.runtime.lastError) show_status(chrome.runtime.lastError);
        else if (response.error) show_status(response.error);
        else if (response.message) show_status(response.message);
    });
}

const identifier_field = document.getElementById('identifier');
const diagnosis_field = document.getElementById('diagnosis');
const confidence_field = document.getElementById('confidence');
const deadline_field = document.getElementById('deadline');
document.getElementById('newPredictionForm').addEventListener('submit', onFormSubmit);