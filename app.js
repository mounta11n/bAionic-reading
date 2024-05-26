document.addEventListener('DOMContentLoaded', (event) => {
    checkApiKey();
});

document.getElementById('saveApiKeyBtn').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value;
    if (apiKey) {
        localStorage.setItem('apiKey', apiKey);
        updateApiKeyStatus(true);
        document.getElementById('apiKey').value = ''; // Clear the input field
    } else {
        alert('Please enter a valid API key.');
    }
});

document.getElementById('submitBtn').addEventListener('click', function() {
    const inputText = document.getElementById('inputText').value;
    if (!localStorage.getItem('apiKey')) {
        alert('Please enter and save your API key first.');
        return;
    }
    processText(inputText);
});

function checkApiKey() {
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
        updateApiKeyStatus(true);
    } else {
        updateApiKeyStatus(false);
    }
}

function updateApiKeyStatus(isKeyPresent) {
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    if (isKeyPresent) {
        apiKeyStatus.innerText = 'API Key is saved';
        apiKeyStatus.style.color = 'green';
    } else {
        apiKeyStatus.innerText = 'API Key is missing';
        apiKeyStatus.style.color = 'red';
    }
}

async function processText(text) {
    try {
        const apiKey = localStorage.getItem('apiKey');
        console.log('Using API Key:', apiKey); // Debugging
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {"role": "system", "content": "You are an accurate reading assistant. Only return the most important key words that are particularly relevant for reading comprehension - in raw, plaintext format. The point is that the words you have selected are going to be integrated into the so-called bionic reading method and their syllables, they will automatically be marked in bold to improve the reader's reading flow. So don't mark it yourself in bold. Only return the plain words. And be sure to consider this aspect: which nouns, verbs, adjectives or other word types are relevant to improve the reader's reading flow and comprehension of the text? This also means that you must carefully consider for each statement whether and which word types could be relevant at all."},
                    {"role": "user", "content": text}
                ]
            })
        });

        console.log('Response Status:', response.status); // Debugging

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Check your API Key.');
            } else {
                throw new Error(`Error: ${response.statusText}`);
            }
        }

        const data = await response.json();
        console.log('Response Data:', data); // Debugging

        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            const keywords = data.choices[0].message.content.trim().split(', ');
            const formattedText = formatTextWithKeywords(text, keywords);
            document.getElementById('outputText').innerHTML = formattedText;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'An error occurred while processing the text.');
    }
}

function formatTextWithKeywords(text, keywords) {
    let formattedText = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formattedText = formattedText.replace(regex, `<b>${keyword}</b>`);
    });
    return formattedText;
}
