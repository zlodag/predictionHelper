importScripts('crypto-aes-gcm.js');

function decrypt(cipher, password) {
    return aesGcmDecrypt(cipher, password)
        .then(cleartext => ({decrypted: true, cleartext: cleartext}))
        .catch(() => ({decrypted: false}));
}

function addPrediction(api_token, group_number, encryptedIdentifier, diagnosis, confidence, deadline_text){
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    return fetch('https://predictionbook.com/api/prediction_groups', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            api_token: api_token,
            prediction_group: {
                description: encryptedIdentifier,
                deadline_text: deadline_text,
                visibility: 'visible_to_group_' + group_number,
                notify_creator: true,
                prediction_0_description: diagnosis,
                prediction_0_initial_confidence: confidence,
                // predictions: [{
                //     description: diagnosis,
                //     initial_confidence: confidence,
                // }],
            },
        }),
    }).then(response => {
        if (response.status === 200) {
            return response;
        } else {
            console.error(response.body.toString());
            throw Error("Server request failed. Check the error log for details")
        }
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.messageType === 'newPrediction') {
            const optionsPromise = new Promise((resolve, reject) => {
                chrome.storage.sync.get({
                    api_token: '',
                    password: '',
                    group_number: '',
                }, function (options) {
                    if (chrome.lastError) {
                        reject(chrome.lastError.message);
                    } else if (!options.api_token) {
                        reject('API token not configured - enter it in settings page');
                    } else if (!options.password) {
                        reject('Password not configured - enter it in settings page');
                    } else if (!options.group_number) {
                        reject('Group number not configured - enter it in settings page');
                    } else {
                        resolve(options);
                    }
                });
            });
            const encryptedIdentifierPromise = optionsPromise
                .then(options => aesGcmEncrypt(request.identifier, options.password));
            Promise.all([optionsPromise, encryptedIdentifierPromise])
                .then(([options, encryptedIdentifier]) => addPrediction(options.api_token, options.group_number, encryptedIdentifier, request.diagnosis, request.confidence, request.deadline_text))
                .then(() => sendResponse({message: "Success!"}), reason => sendResponse({error: reason}));
            return true;
        } else if (request.messageType === 'decrypt'){
            decrypt(request.cipher, request.password).then(sendResponse);
            return true;
        }
    }
);
