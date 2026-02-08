console.log('Spotify Companion: Background service worker started');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchGeniusSearch') {
    handleGeniusSearch(request.query, request.geniusKey)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'fetchGeniusPage') {
    handleFetchPage(request.url)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'translateText') {
    handleTranslation(request.text, request.targetLang)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Handle Genius API search
async function handleGeniusSearch(query, geniusKey) {
  const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${geniusKey}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Genius API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

// Handle fetching Genius page HTML
async function handleFetchPage(url) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }
  
  const html = await response.text();
  return html;
}

// Handle LibreTranslate translation
async function handleTranslation(text, targetLang) {
  const url = 'https://libretranslate.com/translate';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: 'auto',
      target: targetLang,
      format: 'text'
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Translation failed');
  }
  
  const data = await response.json();
  
  if (!data.translatedText) {
    throw new Error('No translation returned');
  }
  
  return data.translatedText;
}