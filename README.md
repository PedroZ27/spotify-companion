# 🎵 Spotify Companion

**Enhance your Spotify Web Player experience with lyrics, translations, and extended track information.**

![Version](https://img.shields.io/badge/version-1.0.1-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Edge-orange)

---

## ✨ Features

- **📝 Genius Lyrics Integration** - Fetch lyrics from Genius.com for any playing track
- **🌐 Free Translations** - Translate lyrics to 15+ languages using LibreTranslate (no API cost!)
- **🎨 Beautiful UI** - Modern glassmorphism design that matches Spotify's aesthetic
- **📊 Extended Metadata** - View album info, release year, and artist details
- **🖥️ Fullscreen Support** - Compact mode automatically activates in fullscreen
- **⚡ Real-time Updates** - Track info updates automatically as you change songs
- **🎯 Multiple Search Strategies** - Intelligent search with fallback methods for better accuracy

---

## 🚀 Installation

### From Source (Recommended)

1. **Clone or download this repository:**
```bash
   git clone https://github.com/PedroZ27/spotify-companion.git
```

2. **Get your Genius API key:**
   - Visit [genius.com/api-clients](https://genius.com/api-clients)
   - Create a new API client
   - Copy your **Client Access Token**

3. **Add your API key:**
   - Open `content.js`
   - Find line ~180: `genius: keys.geniusKey || 'YOUR_KEY_HERE'`
   - Replace `YOUR_KEY_HERE` with your actual key

4. **Load the extension in Chrome:**
   - Open `chrome://extensions/`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `spotify-companion` folder

5. **Go to [open.spotify.com](https://open.spotify.com)**
   - The track info panel should appear on the right side
   - Play a song and click **"📝 Get Lyrics"**

---

## 📖 Usage

### Getting Lyrics

1. Play any song on Spotify Web Player
2. Click the **"📝 Get Lyrics"** button
3. Lyrics will be fetched from Genius.com
4. Click **"Refresh Lyrics"** to reload if needed

### Translating Lyrics

1. After fetching lyrics, select your target language from the dropdown
2. Click **"🌐 Translate"**
3. Both original and translated lyrics will be displayed

### Fullscreen Mode

- The panel automatically switches to **compact mode** when Spotify is in fullscreen
- All features remain accessible in a smaller, cleaner layout

---

## 🛠️ Configuration

### Supported Translation Languages

- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)
- Russian (ru)
- Hindi (hi)
- Dutch (nl)
- Turkish (tr)
- Polish (pl)
- English (en)

### Customization

You can modify `styles.css` to change:
- Panel position (change `top` and `right` values)
- Panel width (change `width` value)
- Colors (modify gradient and color values)
- Fonts (change `font-family` values)

---

## 🔧 Technical Details

### Architecture
```
spotify-companion/
├── manifest.json        # Extension configuration
├── background.js        # Service worker (handles API calls)
├── content.js           # Main logic (injected into Spotify)
├── styles.css           # Panel styling
├── popup.html           # Extension popup UI
├── popup.js             # Popup functionality
└── icons/               # Extension icons
```

### APIs Used

- **Genius API** - Lyrics and track metadata
- **LibreTranslate** - Free, open-source translation (no API key needed!)

### Why Background Service Worker?

Chrome extensions cannot make cross-origin API requests directly from content scripts due to CORS policies. The background service worker acts as a proxy to handle all external API calls.

---

## 🐛 Troubleshooting

### "Genius API error: 401"

**Solution:** Your API key is invalid or not properly set.
- Double-check you copied the **Client Access Token** (not Client ID or Secret)
- Make sure there are no extra spaces in the key
- Verify the key works: `https://api.genius.com/search?q=test&access_token=YOUR_KEY`

### "Lyrics not found"

**Solutions:**
- Song may not exist on Genius.com
- Try a different song to test
- Check browser console (F12) for detailed error logs
- The search tries 4 different strategies automatically

### Panel not appearing

**Solutions:**
- Refresh the Spotify page
- Reload the extension in `chrome://extensions/`
- Check if content script is running (look for "Spotify Companion: Initialized" in console)

### Translation fails

**Possible causes:**
- LibreTranslate public API might be temporarily down
- Lyrics text is too long (rare)
- Network connectivity issue

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This extension is not affiliated with, endorsed by, or connected to Spotify AB or Genius Media Group Inc. All trademarks are property of their respective owners.

---

## 🙏 Acknowledgments

- **Genius** for their comprehensive lyrics database
- **LibreTranslate** for free, open-source translation
- **Spotify** for their amazing music platform

---

## 📧 Support

If you encounter any issues or have questions:
- Open an issue on [GitHub](https://github.com/yourusername/spotify-companion/issues)
- Check existing issues for solutions

---

**Made with ♥ for Spotify lovers**

⭐ If you like this extension, please give it a star on GitHub!