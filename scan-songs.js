const fs = require('fs');
const path = require('path');

const SONGS_DIR = path.join(__dirname, 'assets', 'songs');
const OUT_JS = path.join(__dirname, 'songs-manifest.js');
const OUT_JSON = path.join(__dirname, 'assets', 'songs.json');

// Curated artist & note map for known songs to give them the ultimate romantic polish
const CURATED_META = {
  'song1': { title: 'Kabhi To Nazar Milao', artist: 'Adnan Sami & Asha Bhosle', note: 'Our main journey soundtrack 🪻' },
  'lag jaa gale mix': { title: 'Lag Jaa Gale (Instrumental Mix)', artist: 'Lata Mangeshkar (Master Mix)', note: 'Special Moments soundtrack 🎬✨' },
  'lagan': { title: 'Lagi Tumse Man Ki Lagan', artist: 'Rahat Fateh Ali Khan', note: 'Soulful Sufi classic 🕊️' },
  'aarzu 1': { title: 'Aarzoo', artist: 'Pritam', note: 'Sweet heartfelt melody 🌸' },
  'barsaat kabhi to nazar milao': { title: 'Barsaat (Kabhi To Nazar Milao)', artist: 'Adnan Sami', note: 'A nostalgic rainy confession 🌧️' },
  'by moonlight l.o.v.e': { title: 'By Moonlight L.O.V.E', artist: 'Moonlight Vibes', note: 'Gentle night-time rhythm 🌙' },
  'chura liya hai tumne jo dil ko yaadon ki baaraat': { title: 'Chura Liya Hai Tumne Jo Dil Ko', artist: 'Asha Bhosle & Mohd. Rafi', note: 'Timeless retro romantic classic 💫' },
  'cinnamon girl lana del rey slowed n reverb': { title: 'Cinnamon Girl (Slowed + Reverb)', artist: 'Lana Del Rey', note: 'Dreamy aesthetic mood 🕯️' },
  'deewane house navior': { title: 'Deewane', artist: 'House Navior', note: 'Smooth romantic rhythm ✨' },
  'ek tera pyar': { title: 'Ek Tera Pyar', artist: 'Bohemia ft. Devika', note: 'Memorable soulful vibe 💜' },
  'high on you': { title: 'High On You', artist: 'Jassa Dhillon', note: 'Upbeat romantic vibe ⚡' },
  'kabhi to nazar milao asha bhosle': { title: 'Kabhi To Nazar Milao (Original Duet)', artist: 'Adnan Sami & Asha Bhosle', note: 'The melody that started everything 🪻' },
  'kangna dr zeus': { title: 'Kangna', artist: 'Dr. Zeus', note: 'Classic Punjabi melody 🪕' },
  'lag jaa gale': { title: 'Lag Jaa Gale', artist: 'Lata Mangeshkar', note: 'Woh haseen raat jo shayad phir na aaye... 🌙' },
  'lata mangeshker aisa sama na hota': { title: 'Aisa Sama Na Hota', artist: 'Lata Mangeshkar', note: 'Kuch na hota agar tu na hoti... 🌸' },
  'main jo shaair kabhi mehdi hassan': { title: 'Main Jo Shaair Kabhi', artist: 'Mehdi Hassan', note: 'Ghazal of pure poetry 👑' },
  'mann ki lagan paap': { title: 'Mann Ki Lagan', artist: 'Rahat Fateh Ali Khan', note: 'Lagi tumse man ki lagan... 🕊️' },
  'o re piya aaja nachle': { title: 'O Re Piya', artist: 'Rahat Fateh Ali Khan', note: 'Tere bina jiya laage na... 💜' },
  'piche tere': { title: 'Piche Tere', artist: 'Alka Yagnik & Udit Narayan', note: 'Sweet nostalgic melody 🌷' },
  'piya ghar aaya homecoming awarapan 2': { title: 'Piya Ghar Aaya (Homecoming)', artist: 'Farhan Saeed (Awarapan)', note: 'Poetic Sufi homecoming 🌙' },
  'rahat fateh ali khan lagi tum se mann ki lagan': { title: 'Lagi Tum Se Mann Ki Lagan', artist: 'Rahat Fateh Ali Khan', note: 'Soulful devotion 🕊️' },
  'roop kumar rathod maula mere maula': { title: 'Maula Mere Maula', artist: 'Roop Kumar Rathod (Anwar)', note: 'Aankhein teri kitni haseen... 👁️✨' },
  'samjho na': { title: 'Samjho Na', artist: 'Aditya Rikhari', note: 'Acoustic confession 🎸' },
  'tera chehra adnan sami': { title: 'Tera Chehra', artist: 'Adnan Sami', note: 'Teri aankhon ke noor se... 🌙' },
  'tere nahin khyaal bhulde nusrat fateh ali khan': { title: 'Tere Nahin Khyaal Bhulde', artist: 'Nusrat Fateh Ali Khan', note: 'Eternal Qawwali classic 🕊️' },
  'toh phir aao awarapan': { title: 'Toh Phir Aao', artist: 'Mustafa Zahid (Awarapan)', note: 'Deep emotion & soul 🌧️' },
  'wang sukha': { title: 'WANG', artist: 'Sukha', note: 'Modern melodic vibe 💫' },
  'zara sa jannat': { title: 'Zara Sa', artist: 'KK (Jannat)', note: 'Zara sa jhoom loon main... 🌸' }
};

function cleanFilename(file) {
  let raw = file.replace(/\.(mp3|aac|wav|m4a|ogg|flac)$/i, '');
  raw = raw.replace(/\(KoshalWorld\.Com\)/gi, '')
           .replace(/\(DJJOhAL\.Com\)/gi, '')
           .replace(/\(mp3\.pm\)/gi, '')
           .replace(/320\s*Kbps/gi, '')
           .replace(/_320/gi, '')
           .replace(/\(\d+\)$/g, '')
           .replace(/[_\s]+/g, ' ')
           .trim();
  return raw;
}

function parseSongInfo(file) {
  const cleaned = cleanFilename(file);
  const key = cleaned.toLowerCase().replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim();

  // Check curated mapping
  if (CURATED_META[key]) {
    return {
      title: CURATED_META[key].title,
      artist: CURATED_META[key].artist,
      src: `assets/songs/${file}`,
      note: CURATED_META[key].note,
      file: file
    };
  }

  // Handle "Title - Artist" or "Artist - Title"
  if (cleaned.includes(' - ') || cleaned.includes(' – ')) {
    const parts = cleaned.split(/[-–]/).map(s => s.trim());
    return {
      title: parts[0] || cleaned,
      artist: parts[1] || 'Special Artist 🪻',
      src: `assets/songs/${file}`,
      note: 'Added to 11:11 Jukebox 🎵',
      file: file
    };
  }

  return {
    title: cleaned,
    artist: 'Special Melody 🪻',
    src: `assets/songs/${file}`,
    note: 'Added to 11:11 Jukebox 🎵',
    file: file
  };
}

function scanSongs() {
  if (!fs.existsSync(SONGS_DIR)) {
    console.warn('Assets/songs dir does not exist yet:', SONGS_DIR);
    return [];
  }

  const files = fs.readdirSync(SONGS_DIR);
  const audioExts = /\.(mp3|aac|wav|m4a|ogg|flac)$/i;
  const audioFiles = files.filter(f => audioExts.test(f));

  // Deduplicate songs by title
  const seenTitles = new Set();
  const songs = [];

  // Priority to song1 and lagan and lag_jaa_gale_mix first
  const priorityOrder = ['song1.mp3', 'lag_jaa_gale_mix.mp3', 'lagan.aac'];
  const orderedFiles = [
    ...priorityOrder.filter(f => audioFiles.includes(f)),
    ...audioFiles.filter(f => !priorityOrder.includes(f))
  ];

  for (const f of orderedFiles) {
    const info = parseSongInfo(f);
    const normTitle = info.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Skip exact duplicates (like .wav if .mp3 exists, or duplicate files)
    if (f.endsWith('.wav') && audioFiles.some(af => af.startsWith(f.replace('.wav', '')) && af.endsWith('.mp3'))) {
      continue;
    }
    if (seenTitles.has(normTitle)) {
      continue;
    }

    seenTitles.add(normTitle);
    songs.push(info);
  }

  // Write JS manifest for browser inclusion
  const jsContent = `/* Auto-generated by scan-songs.js · ${new Date().toISOString()} */\nwindow.AUTO_DISCOVERED_SONGS = ${JSON.stringify(songs, null, 2)};\n`;
  fs.writeFileSync(OUT_JS, jsContent, 'utf-8');

  // Write JSON
  fs.writeFileSync(OUT_JSON, JSON.stringify(songs, null, 2), 'utf-8');

  // Also sync to npm run dev folder if present
  const devFolder = path.join(__dirname, 'npm run dev');
  if (fs.existsSync(devFolder)) {
    fs.writeFileSync(path.join(devFolder, 'songs-manifest.js'), jsContent, 'utf-8');
    const devSongsDir = path.join(devFolder, 'assets', 'songs');
    if (!fs.existsSync(devSongsDir)) fs.mkdirSync(devSongsDir, { recursive: true });
    fs.writeFileSync(path.join(devFolder, 'assets', 'songs.json'), JSON.stringify(songs, null, 2), 'utf-8');
    
    // Copy any missing song files into devSongsDir
    for (const f of audioFiles) {
      const srcFile = path.join(SONGS_DIR, f);
      const dstFile = path.join(devSongsDir, f);
      if (!fs.existsSync(dstFile)) {
        try { fs.copyFileSync(srcFile, dstFile); } catch (e) {}
      }
    }
  }

  console.log(`✅ Scanned & generated ${songs.length} songs in manifest!`);
  return songs;
}

if (require.main === module) {
  scanSongs();
}

module.exports = { scanSongs, parseSongInfo };
