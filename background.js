importScripts('crypto-aes-gcm.js');

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL){
        chrome.runtime.openOptionsPage();
    }
});

chrome.action.onClicked.addListener(() => chrome.tabs.create({
    url: 'https://predictionbook.com/prediction_groups/new',
}));

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.messageType === 'decrypt'){
            // noinspection JSUnresolvedFunction
            aesGcmDecrypt(request.cipher, request.password)
                .then(cleartext => ({decrypted: true, cleartext: cleartext}))
                .catch(() => ({decrypted: false}))
                .then(sendResponse);
            return true;
        } else if (request.messageType === 'encrypt'){
            // noinspection JSUnresolvedFunction
            aesGcmEncrypt(request.cleartext, request.password)
                .then(cipher => ({cipher: cipher}))
                .catch(reason => ({error: reason}))
                .then(sendResponse);
            return true;
        }
    }
);
