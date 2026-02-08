document.addEventListener('DOMContentLoaded', () => {
  // Load saved settings
  loadSettings();

  // Set up event listeners
  setupEventListeners();

  // Check if we're on Spotify
  checkSpotifyStatus();
});

function loadSettings() {
  chrome.storage.sync.get({
    showPanel: true,
    autoTranslate: false,
    fetchMetadata: true,
    translationLang: 'en',
    crossfadeDuration: 5
  }, (settings) => {
    document.getElementById('toggle-panel').checked = settings.showPanel;
    document.getElementById('toggle-translate').checked = settings.autoTranslate;
    document.getElementById('toggle-metadata').checked = settings.fetchMetadata;
    document.getElementById('translation-lang').value = settings.translationLang;
    document.getElementById('crossfade-duration').value = settings.crossfadeDuration;
  });
}

function setupEventListeners() {
  // Toggle switches
  document.getElementById('toggle-panel').addEventListener('change', (e) => {
    saveSetting('showPanel', e.target.checked);
    notifyContentScript({ action: 'togglePanel', enabled: e.target.checked });
  });

  document.getElementById('toggle-translate').addEventListener('change', (e) => {
    saveSetting('autoTranslate', e.target.checked);
    notifyContentScript({ action: 'toggleAutoTranslate', enabled: e.target.checked });
  });

  document.getElementById('toggle-metadata').addEventListener('change', (e) => {
    saveSetting('fetchMetadata', e.target.checked);
    notifyContentScript({ action: 'toggleMetadata', enabled: e.target.checked });
  });

  // Select dropdowns
  document.getElementById('translation-lang').addEventListener('change', (e) => {
    saveSetting('translationLang', e.target.value);
    notifyContentScript({ action: 'updateTranslationLang', lang: e.target.value });
  });

  document.getElementById('crossfade-duration').addEventListener('change', (e) => {
    saveSetting('crossfadeDuration', parseInt(e.target.value));
    notifyContentScript({ action: 'updateCrossfade', duration: parseInt(e.target.value) });
  });
}

function saveSetting(key, value) {
  const setting = {};
  setting[key] = value;
  chrome.storage.sync.set(setting, () => {
    console.log(`Setting saved: ${key} = ${value}`);
    showStatus('Settings saved!', 'success');
  });
}

function notifyContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Could not send message to content script:', chrome.runtime.lastError);
        }
      });
    }
  });
}

function checkSpotifyStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url && currentTab.url.includes('open.spotify.com')) {
      showStatus('✓ Connected to Spotify', 'success');
    } else {
      showStatus('⚠ Open Spotify Web Player to use this extension', 'warning');
    }
  });
}

function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  
  // Update style based on type
  if (type === 'success') {
    statusDiv.style.background = 'rgba(30, 215, 96, 0.1)';
    statusDiv.style.borderColor = 'rgba(30, 215, 96, 0.3)';
    statusDiv.style.color = '#1ed760';
  } else if (type === 'warning') {
    statusDiv.style.background = 'rgba(255, 193, 7, 0.1)';
    statusDiv.style.borderColor = 'rgba(255, 193, 7, 0.3)';
    statusDiv.style.color = '#ffc107';
  } else {
    statusDiv.style.background = 'rgba(33, 150, 243, 0.1)';
    statusDiv.style.borderColor = 'rgba(33, 150, 243, 0.3)';
    statusDiv.style.color = '#2196f3';
  }

  // Auto-hide success messages
  if (type === 'success') {
    setTimeout(() => {
      checkSpotifyStatus();
    }, 2000);
  }
}