# 🪻 My 11:11 — Birthday / Appreciation Website

A magical, mobile-first single-page experience built with pure HTML, CSS & JS. No frameworks, no paid services, works offline once assets are added.

---

## 🚀 Quick Start (Local)

Run in your terminal inside `d:\1 MOON🪻`:

```bash
# Option A — npm (configured and ready)
npm run dev

# Option B — Python
python -m http.server 5500
```

Then open your browser:
👉 **`http://localhost:5500`**

### 📱 Test on your phone right now (same Wi-Fi)
1. In PowerShell, run `ipconfig` to see your IPv4 address (e.g. `192.168.1.15`).
2. Run `npm run dev`.
3. On your phone's browser, open `http://<YOUR_IP>:5500` (e.g. `http://192.168.1.15:5500`).

> ⚠️ **Must** run from a local server (not `file://`) because of audio and image loading policies.

---

## 📁 Folder Structure

```
d:\1 MOON🪻\
├── index.html          ← main page
├── style.css           ← all visual styles
├── script.js           ← all interaction logic
├── config.js           ← ✏️  EDIT THIS FILE to personalise everything
├── README.md
└── assets/
    ├── photos/
    │   ├── cover.jpg   ← cover background photo (use a portrait, ~600×900px)
    │   ├── photo1.jpg  ← gallery photo 1
    │   ├── photo2.jpg  ← gallery photo 2
    │   ├── photo3.jpg  ← gallery photo 3
    │   ├── photo4.jpg  ← gallery photo 4
    │   └── photo5.jpg  ← gallery photo 5 (add more and update config.js)
    └── songs/
        ├── song1.mp3   ← Chapter I music  ✅ (already added from your upload)
        ├── song2.mp3   ← Chapter II music
        ├── song3.mp3   ← Chapter III music
        └── song4.mp3   ← Chapter IV music
```

---

## ✏️ How to Personalise

**All editable content lives in `config.js`** — you never need to touch `index.html` or `script.js`.

### Add / change photos
```js
photos: [
  { src: "assets/photos/photo1.jpg", caption: "Your caption here 🌸" },
  // add more lines…
],
```
Drop the `.jpg` files into `assets/photos/` with matching names.

### Add / change songs
```js
stages: [
  { title: "Chapter I · Hello, Sunshine ☀️", song: "assets/songs/song1.mp3", theme: "theme-blush", emoji: "🌸" },
  // …
],
```
Drop `.mp3` files into `assets/songs/`.  
**Song 1 is already there** (from your upload). Add `song2.mp3`, `song3.mp3`, `song4.mp3` to enable the other chapters.

### Add / change wishes
```js
wishes: [
  "Your wish here 💜",
  // add as many as you like
],
```

### Change her name
```js
name: "My 11:11 🪻",
coverTagline: "thanks for existing",
```

---

## 🌐 Deploy Free (3 options)

### Netlify (easiest, drag-and-drop)
1. Go to [netlify.com](https://netlify.com) → Sign up free
2. Drag the entire `1 MOON🪻` folder onto the Netlify deploy area
3. Done — you get a live `https://xxx.netlify.app` link instantly

### GitHub Pages
```bash
git init
git add .
git commit -m "✨ my 11:11"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/my-11-11.git
git push -u origin main
# In repo Settings → Pages → Source: main branch / root
```

### Vercel
```bash
npx vercel --prod
```

---

## 🎵 Music Tips
- Use `.mp3` for best compatibility
- Keep files under 8 MB each for fast loading
- Songs loop automatically; crossfade happens on stage change
- If only one song is provided, it loops through all chapters

## 📱 Browser Compatibility
- Chrome / Edge 90+ ✅
- Safari iOS 14+ ✅
- Firefox 88+ ✅
- Samsung Internet 14+ ✅

---

Made with 💜 and way too much love.

