function usePasswordWith(callback){
    chrome.storage.sync.get({password: ''}, options => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else if (!options.password) {
            alert('Password not configured - enter it in settings page');
        } else callback(options.password);
    });
}

document.querySelector("#content h2").textContent = 'Enter predictions';
const createLink = document.querySelector("#content [href='/predictions/new']");
if (createLink) createLink.remove();

const plaintextIdentifierContainer = document.createElement('p');
const plaintextIdentifierInput = document.createElement('input');
plaintextIdentifierInput.type = "text"
plaintextIdentifierInput.id = "plaintext_identifier";
plaintextIdentifierInput.required = true;

const plaintextIdentifierLabel = document.createElement('label');
plaintextIdentifierLabel.for = plaintextIdentifierInput.id;
plaintextIdentifierLabel.textContent = 'Case reference';
plaintextIdentifierContainer.append(plaintextIdentifierLabel, plaintextIdentifierInput);

const identifierInput = document.querySelector("#prediction_group_description");
identifierInput.parentElement.before(plaintextIdentifierContainer);

const encryptedIdentifierInput = identifierInput.cloneNode(true);
encryptedIdentifierInput.readOnly = true;
encryptedIdentifierInput.required = true;

identifierInput.replaceWith(encryptedIdentifierInput);


const plaintextIdentifierListener = (event) => {
    const cleartext = event.target.value;
    if (cleartext) usePasswordWith(password => chrome.runtime.sendMessage({
        messageType: 'encrypt',
        cleartext: cleartext,
        password: password,
    }, response => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else if (response.error) {
            console.error(response.error);
        } else if (response.cipher) {
            encryptedIdentifierInput.value = response.cipher;
        }
    }));
};

if (/[-A-Za-z0-9+/]+={0,3}/.test(encryptedIdentifierInput.value)){
    const cipher = encryptedIdentifierInput.value;
    usePasswordWith(password => chrome.runtime.sendMessage({
        messageType: 'decrypt',
        cipher: cipher,
        password: password,
    }, response => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else if (!response.decrypted) {
            console.log(`Unable to decrypt: "${cipher}"`);
        } else {
            plaintextIdentifierInput.value = response.cleartext;
        }
        plaintextIdentifierInput.addEventListener("input", plaintextIdentifierListener);
    }));
} else {
    plaintextIdentifierInput.addEventListener("input", plaintextIdentifierListener);
}

document.querySelector("label[for='prediction_group_description']").textContent = 'Encrypted value to be stored';
document.querySelectorAll(".prediction-group-prediction label[for$='_description']").forEach(el => el.textContent = 'Diagnosis');
document.querySelectorAll(".prediction-group-prediction label[for$='_initial_confidence']").forEach(el => el.textContent = 'Estimated probability');


