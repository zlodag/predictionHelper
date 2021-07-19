const decrypted = {};

function getDecrypted(cipher, password){
    if (!decrypted[cipher]) {
        decrypted[cipher] = new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                messageType: 'decrypt',
                cipher: cipher,
                password: password,
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else if (response.error) {
                    reject(response.error);
                } else {
                    if (!response.decrypted) {
                        console.log(`Unable to decrypt: "${cipher}"`);
                    }
                    resolve(response);
                }
            });
        });
    }
    return decrypted[cipher];
}

chrome.storage.sync.get('password', options => {
    if (!options.password) {
        console.error('Password not configured - enter it in settings page');
        return;
    }
    if (/^\/prediction_groups\/\d+\/?$/.test(window.location.pathname)) {
        const title = document.querySelector("#content > h1").lastChild;
        const match = title.textContent.match(/^\s*Prediction group\s+-\s+([-A-Za-z0-9+/]+={0,3})\s+\.+\s*$/);
        if (!match) return;
        const cipher = match[1];
        getDecrypted(cipher, options.password).then(response => {
            if (response.decrypted) {
                title.textContent = 'Predictions for ' + response.cleartext;
            }
        });
    } else if (/^\/predictions\/\d+\/?$/.test(window.location.pathname)) {
        const title = document.querySelector("#content > h1").lastChild;
        const match = title.textContent.match(/^\s*\[([-A-Za-z0-9+/]+={0,3})]\s/);
        if (!match) return;
        const cipher = match[1];
        getDecrypted(cipher, options.password).then(response => {
            if (response.decrypted) {
                title.textContent = match.input.replace(match[1], response.cleartext);
            }
        });
    }
    document.querySelectorAll('.prediction .title').forEach(titleElement => {
        const linkElement = titleElement.querySelector('a');
        const match = linkElement.textContent.match(/^\[([-A-Za-z0-9+/]+={0,3})] /);
        if (!match) return;
        const cipher = match[1];
        getDecrypted(cipher, options.password).then(response => {
            if (response.decrypted) {
                linkElement.textContent = match.input.substring(match[0].length);
                const identifierElement = document.createElement('samp');
                identifierElement.textContent = response.cleartext;
                identifierElement.title = 'Encrypted as: ' + cipher;
                titleElement.before(identifierElement);
            }
        });
    });
});

