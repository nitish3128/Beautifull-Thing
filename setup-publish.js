const fs = require('fs');
const path = require('path');

// Fallback for when Render has "npm run dev" configured as Publish Directory
const targetDir = path.join(__dirname, 'npm run dev');

try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const itemsToCopy = [
    'index.html',
    'style.css',
    'script.js',
    'config.js',
    'manifest.json',
    'assets'
  ];

  for (const item of itemsToCopy) {
    const src = path.join(__dirname, item);
    const dest = path.join(targetDir, item);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true, force: true });
    }
  }
  console.log('✅ Fallback publish directory created successfully: "npm run dev"');
} catch (err) {
  console.error('Notice: Could not mirror to "npm run dev":', err.message);
}
