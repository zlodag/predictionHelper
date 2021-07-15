'use strict';

function show_status(msg) {
  const status = document.getElementById('status');
  status.textContent = msg;
  setTimeout(function() {
    status.textContent = '';
  }, 750);
}

function save_options() {
  chrome.storage.sync.set({
    api_token: document.getElementById('api_token').value,
    password: document.getElementById('password').value,
  }, function() {
    show_status(chrome.lastError ? chrome.lastError.message : 'Options saved');
  });
}

function restore_options() {
  chrome.storage.sync.get({
    api_token: '',
    password: '',
  }, function(options) {
    if (chrome.lastError) {
      show_status(chrome.lastError.message);
    } else {
      document.getElementById('api_token').value = options.api_token;
      document.getElementById('password').value = options.password;
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);