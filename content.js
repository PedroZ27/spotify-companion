console.log('Spotify Companion: Initialized');

class SpotifyCompanion {
  constructor() {
    this.currentTrack = null;
    this.currentLyrics = null;
    this.observer = null;
    this.init();
  }

  init() {
    this.waitForSpotify();
    this.setupObserver();
  }

  waitForSpotify() {
    const checkInterval = setInterval(() => {
      const nowPlaying = document.querySelector('[data-testid="now-playing-widget"]');
      if (nowPlaying) {
        console.log('Spotify Companion: Spotify player detected');
        clearInterval(checkInterval);
        this.injectInfoPanel();
      }
    }, 1000);
  }

  setupObserver() {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    this.observer = new MutationObserver((mutations) => {
      const trackInfo = this.getCurrentTrackInfo();
      if (trackInfo && trackInfo.title !== this.currentTrack?.title) {
        this.currentTrack = trackInfo;
        this.onTrackChange(trackInfo);
      }
    });

    this.observer.observe(targetNode, config);
  }

  getCurrentTrackInfo() {
    try {
      const titleElement = document.querySelector('[data-testid="context-item-link"]');
      const artistElement = document.querySelector('[data-testid="context-item-info-subtitles"] a');
      
      if (!titleElement) return null;

      return {
        title: titleElement.textContent.trim(),
        artist: artistElement ? artistElement.textContent.trim() : 'Unknown Artist',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting track info:', error);
      return null;
    }
  }

  onTrackChange(trackInfo) {
    console.log('Track changed:', trackInfo);
    this.updateInfoPanel(trackInfo);
  }

  injectInfoPanel() {
    if (document.getElementById('spotify-companion-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'spotify-companion-panel';
    panel.className = 'companion-panel';
    panel.innerHTML = `
      <div class="companion-header">
        <div>
          <h3>Track Info</h3>
          <span class="version-badge">v1.0.1</span>
        </div>
        <button id="companion-toggle" class="companion-btn">−</button>
      </div>
      <div class="companion-content">
        <div id="companion-track-info">
          <p class="info-label">No track playing</p>
        </div>
        <div id="companion-metadata">
          <p class="loading">Waiting for track data...</p>
        </div>
        <div id="companion-lyrics">
          <button id="fetch-lyrics-btn" class="companion-btn translate-btn">📝 Get Lyrics</button>
          <button id="translate-btn" class="companion-btn translate-btn" style="display:none;">🌐 Translate</button>
          <select id="language-selector" style="display:none; margin-left: 8px; padding: 6px; background: #282828; color: #fff; border: 1px solid #404040; border-radius: 4px;">
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
            <option value="ar">Arabic</option>
            <option value="ru">Russian</option>
            <option value="hi">Hindi</option>
            <option value="nl">Dutch</option>
            <option value="tr">Turkish</option>
            <option value="pl">Polish</option>
            <option value="en">English</option>
          </select>
          <div id="lyrics-content"></div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    const toggleBtn = document.getElementById('companion-toggle');
    const content = document.querySelector('.companion-content');
    
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = content.style.display === 'none';
      content.style.display = isCollapsed ? 'block' : 'none';
      toggleBtn.textContent = isCollapsed ? '−' : '+';
    });

    const fetchLyricsBtn = document.getElementById('fetch-lyrics-btn');
    fetchLyricsBtn.addEventListener('click', () => {
      this.handleFetchLyrics();
    });

    const translateBtn = document.getElementById('translate-btn');
    translateBtn.addEventListener('click', () => {
      this.handleTranslation();
    });

    const currentTrack = this.getCurrentTrackInfo();
    if (currentTrack) {
      this.updateInfoPanel(currentTrack);
    }
  }

  async updateInfoPanel(trackInfo) {
    const trackInfoDiv = document.getElementById('companion-track-info');
    const metadataDiv = document.getElementById('companion-metadata');

    if (!trackInfoDiv || !metadataDiv) return;

    trackInfoDiv.innerHTML = `
      <p class="info-label">Now Playing:</p>
      <p class="info-title">${trackInfo.title}</p>
      <p class="info-artist">${trackInfo.artist}</p>
    `;

    metadataDiv.innerHTML = '<p class="loading">Loading track info...</p>';
    
    try {
      const metadata = await this.fetchTrackMetadata(trackInfo);
      this.displayMetadata(metadata);
    } catch (error) {
      metadataDiv.innerHTML = '<p class="error">Could not load additional info</p>';
    }

    const lyricsContent = document.getElementById('lyrics-content');
    const fetchBtn = document.getElementById('fetch-lyrics-btn');
    const translateBtn = document.getElementById('translate-btn');
    const languageSelector = document.getElementById('language-selector');
    
    if (lyricsContent) lyricsContent.innerHTML = '';
    if (fetchBtn) {
      fetchBtn.style.display = 'inline-block';
      fetchBtn.disabled = false;
      fetchBtn.textContent = '📝 Get Lyrics';
    }
    if (translateBtn) translateBtn.style.display = 'none';
    if (languageSelector) languageSelector.style.display = 'none';
    
    this.currentLyrics = null;
  }

  async getApiKeys() {
    const keys = await chrome.storage.sync.get(['geniusKey']);
    return {
      genius: keys.geniusKey || 'PUT_YOUR_API_KEY_HERE!'
    };
  }

  async fetchTrackMetadata(trackInfo) {
    try {
      const keys = await this.getApiKeys();
      const searchQuery = `${trackInfo.title} ${trackInfo.artist}`;
      
      const response = await chrome.runtime.sendMessage({
        action: 'fetchGeniusSearch',
        query: searchQuery,
        geniusKey: keys.genius
      });
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      const data = response.data;
      
      if (data.response.hits.length > 0) {
        const song = data.response.hits[0].result;
        return {
          album: song.album?.name || 'Unknown Album',
          year: song.release_date_for_display || 'N/A',
          artist: song.primary_artist.name,
          songId: song.id,
          lyricsUrl: song.url,
          thumbnail: song.song_art_image_thumbnail_url
        };
      }
      
      return {
        album: 'Unknown',
        year: 'N/A',
        artist: trackInfo.artist
      };
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return {
        album: 'Unknown',
        year: 'N/A',
        artist: trackInfo.artist
      };
    }
  }

  displayMetadata(metadata) {
    const metadataDiv = document.getElementById('companion-metadata');
    if (!metadataDiv) return;

    metadataDiv.innerHTML = `
      <div class="metadata-grid">
        <div class="metadata-item">
          <span class="meta-label">Album:</span>
          <span class="meta-value">${metadata.album}</span>
        </div>
        <div class="metadata-item">
          <span class="meta-label">Year:</span>
          <span class="meta-value">${metadata.year}</span>
        </div>
        <div class="metadata-item">
          <span class="meta-label">Artist:</span>
          <span class="meta-value">${metadata.artist}</span>
        </div>
      </div>
    `;
  }

  async handleFetchLyrics() {
    const lyricsContent = document.getElementById('lyrics-content');
    const fetchBtn = document.getElementById('fetch-lyrics-btn');
    const translateBtn = document.getElementById('translate-btn');
    const languageSelector = document.getElementById('language-selector');
    
    if (!this.currentTrack) {
      lyricsContent.innerHTML = '<p class="error">No track is currently playing</p>';
      return;
    }

    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Fetching...';
    lyricsContent.innerHTML = '<p class="loading">Searching for lyrics on Genius...<br><small>Trying multiple search methods...</small></p>';

    try {
      const lyrics = await this.fetchGeniusLyrics(this.currentTrack);
      
      if (!lyrics) {
        throw new Error('Lyrics not found on Genius');
      }

      this.currentLyrics = lyrics;

      lyricsContent.innerHTML = `
        <div style="margin-bottom: 12px;">
          <strong style="color: #1ed760;">Lyrics:</strong>
          <p style="margin-top: 8px; line-height: 1.8; white-space: pre-wrap; color: #b3b3b3;">${lyrics}</p>
        </div>
        <p style="margin-top: 12px; font-size: 11px; color: #666;">
          Source: Genius.com
        </p>
      `;

      fetchBtn.textContent = 'Refresh Lyrics';
      translateBtn.style.display = 'inline-block';
      languageSelector.style.display = 'inline-block';
    } catch (error) {
      console.error('Lyrics fetch error:', error);
      lyricsContent.innerHTML = `
        <p class="error">${error.message}</p>
        <p style="margin-top: 8px; font-size: 11px; color: #888;">
          Current search: "${this.currentTrack.title}" by "${this.currentTrack.artist}"
        </p>
      `;
      fetchBtn.textContent = '📝 Try Again';
      translateBtn.style.display = 'none';
      languageSelector.style.display = 'none';
    } finally {
      fetchBtn.disabled = false;
    }
  }

  async fetchGeniusLyrics(trackInfo) {
    try {
      const keys = await this.getApiKeys();
      
      const searchStrategies = [
        `${trackInfo.title} ${trackInfo.artist}`,
        trackInfo.title,
        `${this.cleanTrackTitle(trackInfo.title)} ${this.cleanArtistName(trackInfo.artist)}`,
        `${this.getMainArtist(trackInfo.artist)} ${this.cleanTrackTitle(trackInfo.title)}`
      ];

      let songUrl = null;
      
      for (const query of searchStrategies) {
        console.log(`Trying Genius search: "${query}"`);
        
        const response = await chrome.runtime.sendMessage({
          action: 'fetchGeniusSearch',
          query: query,
          geniusKey: keys.genius
        });
        
        if (!response.success) {
          console.error(`Search failed: ${response.error}`);
          continue;
        }
        
        const data = response.data;
        
        if (data.response.hits && data.response.hits.length > 0) {
          songUrl = data.response.hits[0].result.url;
          console.log(`✓ Found song on Genius: ${songUrl}`);
          break;
        }
      }

      if (!songUrl) {
        throw new Error('Song not found on Genius after trying multiple searches');
      }

      const lyrics = await this.scrapeLyricsFromGenius(songUrl);
      return lyrics;
    } catch (error) {
      console.error('Error fetching Genius lyrics:', error);
      throw error;
    }
  }

  cleanTrackTitle(title) {
    return title
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\s*-\s*.*$/, '')
      .replace(/feat\..*$/i, '')
      .replace(/ft\..*$/i, '')
      .replace(/with.*$/i, '')
      .trim();
  }

  cleanArtistName(artist) {
    return artist
      .split(',')[0]
      .split('&')[0]
      .split('feat')[0]
      .split('ft.')[0]
      .replace(/\s+/g, ' ')
      .trim();
  }

  getMainArtist(artist) {
    const separators = [',', '&', 'feat.', 'ft.', 'featuring', 'with'];
    let mainArtist = artist;
    
    for (const sep of separators) {
      if (mainArtist.includes(sep)) {
        mainArtist = mainArtist.split(sep)[0].trim();
        break;
      }
    }
    
    return mainArtist;
  }

  async scrapeLyricsFromGenius(url) {
    try {
      console.log(`Scraping lyrics from: ${url}`);
      
      const response = await chrome.runtime.sendMessage({
        action: 'fetchGeniusPage',
        url: url
      });
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      const html = response.data;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      let lyricsContainers = doc.querySelectorAll('[data-lyrics-container="true"]');
      
      if (lyricsContainers.length === 0) {
        console.log('Trying alternative selectors...');
        lyricsContainers = doc.querySelectorAll('.Lyrics__Container-sc-1ynbvzw-1');
      }
      
      if (lyricsContainers.length === 0) {
        lyricsContainers = doc.querySelectorAll('[class*="Lyrics__Container"]');
      }
      
      if (lyricsContainers.length === 0) {
        lyricsContainers = doc.querySelectorAll('.lyrics');
      }

      if (lyricsContainers.length === 0) {
        throw new Error('Could not find lyrics on the page');
      }

      console.log(`✓ Found ${lyricsContainers.length} lyrics containers`);

      let lyrics = '';
      lyricsContainers.forEach((container) => {
        const text = container.innerHTML
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/div>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\[.*?\]/g, match => `\n${match}\n`)
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        
        lyrics += text + '\n\n';
      });

      const finalLyrics = lyrics.trim();
      
      if (!finalLyrics || finalLyrics.length < 20) {
        throw new Error('Lyrics extracted but appear to be empty');
      }

      console.log(`✓ Successfully extracted ${finalLyrics.length} characters of lyrics`);
      return finalLyrics;
    } catch (error) {
      console.error('Error scraping lyrics:', error);
      throw error;
    }
  }

  async handleTranslation() {
    const lyricsContent = document.getElementById('lyrics-content');
    const translateBtn = document.getElementById('translate-btn');
    const languageSelector = document.getElementById('language-selector');
    
    if (!this.currentLyrics) {
      lyricsContent.innerHTML = '<p class="error">Please fetch lyrics first</p>';
      return;
    }

    const targetLang = languageSelector.value;
    
    translateBtn.disabled = true;
    const originalBtnText = translateBtn.textContent;
    translateBtn.textContent = 'Translating...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'translateText',
        text: this.currentLyrics,
        targetLang: targetLang
      });
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      const translation = response.data;

      const languageNames = {
        'en': 'English', 'es': 'Spanish', 'fr': 'French',
        'de': 'German', 'it': 'Italian', 'pt': 'Portuguese',
        'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese',
        'ar': 'Arabic', 'ru': 'Russian', 'hi': 'Hindi',
        'nl': 'Dutch', 'tr': 'Turkish', 'pl': 'Polish'
      };

      lyricsContent.innerHTML = `
        <div style="margin-bottom: 12px;">
          <strong style="color: #1ed760;">Original Lyrics:</strong>
          <p style="margin-top: 8px; line-height: 1.8; white-space: pre-wrap; font-size: 13px; color: #b3b3b3;">${this.currentLyrics}</p>
        </div>
        <div style="padding-top: 12px; border-top: 1px solid #404040; margin-top: 12px;">
          <strong style="color: #1ed760;">Translated to ${languageNames[targetLang] || targetLang}:</strong>
          <p style="margin-top: 8px; line-height: 1.8; white-space: pre-wrap; font-size: 13px; color: #8ab4f8;">${translation}</p>
        </div>
        <p style="margin-top: 12px; font-size: 11px; color: #666;">
          Translation powered by LibreTranslate (Free & Open Source)
        </p>
      `;

      translateBtn.textContent = '🌐 Translate Again';
    } catch (error) {
      lyricsContent.innerHTML += `<p class="error" style="margin-top: 12px;">Translation failed: ${error.message}</p>`;
      translateBtn.textContent = originalBtnText;
    } finally {
      translateBtn.disabled = false;
    }
  }
}

const companion = new SpotifyCompanion();