importScripts('crypto-aes-gcm.js');

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.messageType === 'newPrediction') {
            chrome.storage.sync.get({
                api_token: '',
                password: '',
            }, async function (options) {
                if (chrome.lastError) {
                    sendResponse(chrome.lastError.message);
                } else if (!options.api_token) {
                    sendResponse('API token not configured - enter it in settings page');
                } else if (!options.password) {
                    sendResponse('Password not configured - enter it in settings page');
                } else try {
                    const encryptedIdentifier = await aesGcmEncrypt(request.identifier, options.password);
                    const data = new FormData();
                    data.append('api_token', options.api_token);
                    data.append('prediction_group[description]', encryptedIdentifier);
                    data.append('prediction_group[prediction_0_description]', request.diagnosis);
                    data.append('prediction_group[prediction_0_initial_confidence]', request.prediction);
                    data.append('prediction_group[deadline_text]', request.known_by);
                    data.append('prediction_group[notify_creator]', '1');
                    data.append('prediction_group[visibility]', 'visible_to_group_71');
                    fetch('https://predictionbook.com/api/prediction_groups', {
                        method: 'POST',
                        body: data,
                    }).then(response => {
                        if (response.status === 200) {
                            sendResponse("Success!");
                        } else {
                            console.error(response.body.toString());
                            sendResponse("Server request failed. Check the error log for details");
                        }
                    });
                } catch (err) {
                    console.error(err.message);
                    sendResponse("Something went wrong. Check the error log for details");
                }
            });
            return true;
        } else if (request.messageType === 'encryptOrDecrypt'){

            const urlencoded = new URLSearchParams();
            urlencoded.append("string", request.string);
            urlencoded.append("password", request.password);
            const requestOptions = {
                method: 'POST',
                body: urlencoded,
            };
            fetch("https://encryptstring.com/", requestOptions)
                .then(response => response.json())
                .then(data => {
                    if (data.result) sendResponse({result: data.result});
                });
            return true;
        }
    }
);
