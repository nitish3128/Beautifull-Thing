const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { scanSongs } = require('./scan-songs');

const SONGS_DIR = path.join(__dirname, 'assets', 'songs');

console.log('🎵 Initializing 11:11 Song Vault Scanner...');
scanSongs();

// Start file watcher for automatic detection when user drops songs into assets/songs
let debounceTimer = null;
if (fs.existsSync(SONGS_DIR)) {
  fs.watch(SONGS_DIR, (eventType, filename) => {
    if (!filename || !/\.(mp3|aac|wav|m4a|ogg|flac)$/i.test(filename)) return;
    
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`\n🎵 Detected song file change (${eventType}): "${filename}"`);
      console.log('✨ Auto-syncing to Jukebox Vault...');
      scanSongs();
    }, 400);
  });
  console.log(`👀 Watching for new songs in: assets/songs (auto-add enabled)`);
}

// Launch the local web server
console.log('🚀 Starting web server on port 3000...');
const server = spawn('npx', ['serve', '-l', '3000'], { stdio: 'inherit', shell: true });

server.on('close', code => {
  process.exit(code);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit(0);
});
process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});
