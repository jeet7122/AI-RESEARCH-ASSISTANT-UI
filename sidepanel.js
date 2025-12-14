document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['researchNotes'], function(result) {
        if(result.researchNotes){
            document.getElementById('notes').value = result.researchNotes;
        }
    })
});

document.getElementById('summarizeBTN').addEventListener('click', summarizeText);
document.getElementById('saveNotesBTN').addEventListener('click', saveNotes);

const backendUrl = 'https://research-assistant-ext-v1-0-0.onrender.com/api/research/process';


async function summarizeText() {
    try{
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
        const [{result}] = await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: () => window.getSelection().toString()
        });
        if(!result){
            showResult("Please select some text first")
        }

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({content: result, operation: 'summarize'})
        });

        if(!response.ok){
            throw new Error(`API ERROR: ${response.status}`)
        }

        const text = await response.text();
        showResult(text.replace(/\n/g, '<br>'))

                
    }
    catch(error){
        showResult("error" + error.message)

    }

    
}

async function saveNotes() {
    const notes = document.getElementById('notes').value;
    chrome.storage.local.set({'researchNotes': notes}, function() {
        alert('Notes Saved successfully');
    })
    
}

function showResult(content){
    document.getElementById('results').innerHTML = `<div class="result-item"><div class="result-content">${content}</div></div>`

}