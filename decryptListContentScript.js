chrome.storage.sync.get('password', options => {
    if (!options.password) {
        console.error('Password not configured - enter it in settings page');
        return;
    }
    const decrypted = {};
    document.querySelectorAll('.prediction .title').forEach(titleElement => {
        const linkElement = titleElement.querySelector('a');
        const match = linkElement.textContent.match(/^\[([-A-Za-z0-9+/]*={0,3})] /);
        if (!match) return;
        const cipher = match[1];
        if (!decrypted[cipher]) {
            decrypted[cipher] = new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    messageType: 'decrypt',
                    cipher: cipher,
                    password: options.password,
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else if (response.error) {
                        reject(response.error);
                    } else resolve(response);
                });
            });
        }
        decrypted[cipher].then(response => {
            if (response.decrypted) {
                linkElement.textContent = match.input.substring(match[0].length);
                const identifierElement = document.createElement('samp');
                identifierElement.textContent = response.cleartext;
                identifierElement.title = 'Encrypted as: ' + cipher;
                titleElement.before(identifierElement);
            } else {
                console.log(`Unable to decrypt: "${cipher}"`);
            }
        });
    });
});

