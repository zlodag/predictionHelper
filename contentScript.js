chrome.storage.sync.get('password', options => {
    if (!options.password) {
        console.error('Password not configured - enter it in settings page');
        return;
    }
    const decrypted = {};
    document.querySelectorAll('.prediction').forEach(el => {
        const titleLink = el.querySelector('.title>a');
        const match = titleLink.textContent.match(/^\[([^\]]+)\] /);
        if (!match) return;
        const cipher = match[1];
        if (!decrypted[cipher]) {
            decrypted[cipher] = new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    messageType: 'encryptOrDecrypt',
                    string: cipher,
                    password: options.password,
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else if (!response.result) {
                        reject('No valid result');
                    } else {
                        resolve(response.result);
                    }
                });
            });
        }
        decrypted[cipher].then(cleartext => {
            titleLink.textContent = match.input.substring(match[0].length);
            const identifier = document.createElement('samp');
            identifier.textContent = cleartext;
            el.prepend(identifier);
        }).catch(console.error);
    });
});

