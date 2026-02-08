# 🚀 Quick Start Guide

Get Spotify Companion running in 5 minutes!

---

## Step 1: Get Genius API Key

1. Go to https://genius.com/api-clients
2. Sign in or create account
3. Click "New API Client"
4. Fill in:
   - **App Name:** `Spotify Companion`
   - **App Website:** `http://localhost`
   - **Redirect URI:** `http://localhost`
5. Click "Save"
6. **Copy your "Client Access Token"** (looks like: `abc123xyz456...`)

---

## Step 2: Install Extension

1. Download/clone this repository
2. Open `content.js` in a text editor
3. Find line 180: `genius: keys.geniusKey || 'YOUR_KEY_HERE'`
4. Replace `YOUR_KEY_HERE` with your Genius API token
5. Save the file

---

## Step 3: Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Turn on **"Developer mode"** (top right toggle)
3. Click **"Load unpacked"**
4. Select the `spotify-companion` folder
5. Extension should now appear in your extensions list

---

## Step 4: Test It!

1. Go to https://open.spotify.com
2. Play any song
3. You should see the **Track Info** panel on the right side
4. Click **"📝 Get Lyrics"**
5. Select a language and click **"🌐 Translate"**

---

## ✅ Success!

You're all set! Enjoy lyrics and translations for all your favorite songs.

---

## 🆘 Need Help?

**Panel not showing?**
- Refresh the Spotify page
- Check if extension is enabled in `chrome://extensions/`

**"401 Error"?**
- Your API key is wrong
- Make sure you used the **Client Access Token**

**"Lyrics not found"?**
- Song might not be on Genius
- Try a popular song to test

---

**Questions?** Check the [README.md](README.md) for full documentation!