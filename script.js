/* ============================================================
   script.js — MOON × Ritika  v3.0
   Full logic: audio, stages, photos, wishes, videos, final
   ============================================================ */

function initApp() {

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
let currentStageIndex = 0;
let isMuted           = false;
let started           = false;
let nicknameIdx       = 0;
let nicknameTimer     = null;
let wishAutoTimer     = null;

/* ══════════════════════════════════════════════
   AUDIO ENGINE  — smooth crossfade
══════════════════════════════════════════════ */
const audio    = new Audio();
audio.loop     = true;
audio.volume   = 0;
let fadeHandle = null;

// Dedicated soundtrack for Special Moments videos ("Lag Jaa Gale Instrumental Mix")
const videoSongAudio = new Audio((typeof CONFIG !== 'undefined' && CONFIG.videoSong) || 'assets/songs/lag_jaa_gale_mix.mp3');
videoSongAudio.preload = 'auto';
videoSongAudio.volume  = 0.75;

// When the video soundtrack ends, pause the looping video and resume theme song
videoSongAudio.addEventListener('ended', () => {
  document.querySelectorAll('video').forEach(v => {
    v.pause();
    v.currentTime = 0;
  });
  if (!isMuted) {
    audio.play().catch(() => {});
    fadeTo(0.62);
  }
});

let currentValidSong = (typeof CONFIG !== 'undefined' && CONFIG.stages?.[0]?.song) || 'assets/songs/song1.mp3';

// Dedicated audio player for Chapter-specific songs (Pehli Nazar, Maula Mere, etc.)
const chapterAudio = new Audio();
chapterAudio.loop = true;
chapterAudio.volume = 0;
let currentPlayingChapter = null;

window.toggleChapterSong = function(si) {
  if (currentPlayingChapter === si) {
    stopChapterSong(true);
  } else {
    playChapterSong(si);
  }
};

window.playChapterSong = function(si) {
  const stage = CONFIG.stages?.[si];
  if (!stage || !stage.chapterSong) return;
  currentPlayingChapter = si;

  // Smoothly fade down & pause default background song
  fadeTo(0, () => {
    audio.pause();
  });

  chapterAudio.src = stage.chapterSong;
  chapterAudio.currentTime = 0;
  chapterAudio.volume = isMuted ? 0 : 0.75;
  chapterAudio.muted = isMuted;

  chapterAudio.play().then(() => {
    updateChapterSongUI();
    sparkleRing(window.innerWidth / 2, window.innerHeight * 0.22);
  }).catch(err => {
    console.warn('Chapter song play error:', err);
    stopChapterSong(true);
  });
};

window.stopChapterSong = function(resumeDefault = true) {
  currentPlayingChapter = null;
  chapterAudio.pause();
  chapterAudio.currentTime = 0;
  updateChapterSongUI();

  if (resumeDefault && !isMuted) {
    if (audio.paused) {
      audio.play().then(() => fadeTo(0.62)).catch(() => {});
    } else {
      fadeTo(0.62);
    }
  }
};

function updateChapterSongUI() {
  if (!CONFIG.stages) return;
  CONFIG.stages.forEach((s, i) => {
    const wrap = document.getElementById(`chapter-title-wrap-${i}`);
    const cue = document.getElementById(`song-cue-${i}`);
    if (!wrap || !cue) return;
    if (currentPlayingChapter === i) {
      wrap.classList.add('is-playing');
      cue.innerHTML = `
        <span class="cue-icon">🎶</span>
        <span class="cue-text">Playing: <em>${s.songName || 'song'}</em> · tap to pause</span>
        <span class="cue-equalizer" aria-hidden="true"><span></span><span></span><span></span></span>
      `;
    } else {
      wrap.classList.remove('is-playing');
      cue.innerHTML = `
        <span class="cue-icon">🎵</span>
        <span class="cue-text">tap title to play <em>${s.songName || 'song'}</em></span>
        <span class="cue-equalizer" aria-hidden="true"><span></span><span></span><span></span></span>
      `;
    }
  });
}

function fadeTo(target, cb) {
  if (fadeHandle) clearInterval(fadeHandle);
  const step = target > audio.volume ? 0.035 : -0.035;
  fadeHandle = setInterval(() => {
    const diff = target - audio.volume;
    if (Math.abs(diff) < 0.035) {
      audio.volume = Math.max(0, Math.min(1, target));
      clearInterval(fadeHandle); fadeHandle = null;
      if (cb) cb();
    } else {
      audio.volume = Math.max(0, Math.min(1, audio.volume + step));
    }
  }, 55);
}

function loadSong(src) {
  if (!src) return;
  const target = isMuted ? 0 : 0.62;
  if (audio.src && audio.src.endsWith(src) && !audio.paused) {
    fadeTo(target);
    return;
  }
  fadeTo(0, () => {
    audio.pause();
    audio.currentTime = 0;
    audio.src = src;
    audio.play().then(() => {
      currentValidSong = src;
      fadeTo(target);
    }).catch(() => {
      // Graceful fallback if file not found or browser blocks
      if (currentValidSong && !src.endsWith(currentValidSong)) {
        audio.src = currentValidSong;
        audio.play().then(() => fadeTo(target)).catch(() => {});
      }
    });
  });
}

// Fallback if audio fails during stage switch
audio.addEventListener('error', () => {
  if (currentValidSong && (!audio.src || !audio.src.endsWith(currentValidSong))) {
    audio.src = currentValidSong;
    audio.play().then(() => fadeTo(isMuted ? 0 : 0.62)).catch(() => {});
  }
});

function startAudio(src) {
  if (!src) return;
  audio.src = src;
  audio.volume = isMuted ? 0 : 0.62;
  const p = audio.play();
  if (p && typeof p.then === 'function') {
    p.then(() => {
      currentValidSong = src;
    }).catch(e => {
      console.warn('Playback warning:', e);
    });
  }
}

/* ══════════════════════════════════════════════
   DOM REFS
══════════════════════════════════════════════ */
const muteBtn     = document.getElementById('mute-btn');
const progressBar = document.getElementById('progress-bar');
const loading     = document.getElementById('loading');
const floatersEl  = document.getElementById('floaters');
const nickTicker  = document.getElementById('nickname-ticker');

/* ══════════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════════ */
setTimeout(() => {
  loading.classList.add('hidden');
  setTimeout(() => loading.remove(), 750);
}, 1300);

/* ══════════════════════════════════════════════
   PARTICLE CANVAS  (floating bokeh background)
══════════════════════════════════════════════ */
/* ══════════════════════════════════════════════
   CELESTIAL STARDUST & AMBIENT SPARKLES (CLASSY CANVAS)
   High-end, delicate stardust & diamond star glints.
   Pure canvas, zero DOM bloat, 100% non-intrusive.
══════════════════════════════════════════════ */
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let interactiveSparkles = [];

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Dreamy stardust palette
const STARDUST_COLORS = [
  'rgba(235, 215, 255, ', // Soft lavender
  'rgba(255, 225, 240, ', // Rose petal
  'rgba(255, 242, 215, ', // Warm starlight gold
  'rgba(215, 235, 255, ', // Moonlight mist
  'rgba(255, 255, 255, '  // Pure diamond white
];

function resetP(p) {
  p.x     = Math.random() * window.innerWidth;
  p.y     = window.innerHeight + 12;
  p.r     = Math.random() * 2.0 + 0.6;
  p.vx    = (Math.random() - 0.5) * 0.22;
  p.vy    = -(Math.random() * 0.38 + 0.14);
  p.alpha = Math.random() * 0.45 + 0.15;
  p.maxAlpha = p.alpha;
  p.color = STARDUST_COLORS[Math.floor(Math.random() * STARDUST_COLORS.length)];
  p.twinkleSpeed = Math.random() * 0.02 + 0.008;
  p.twinklePhase = Math.random() * Math.PI * 2;
  p.isStar = Math.random() < 0.28; // Subtle 4-pointed diamond glints
  p.starSize = Math.random() * 3.5 + 2.2;
  p.rot = Math.random() * Math.PI;
  p.rotSpeed = (Math.random() - 0.5) * 0.006;
}

for (let i = 0; i < 65; i++) {
  const p = {};
  resetP(p);
  p.y = Math.random() * window.innerHeight;
  particles.push(p);
}

// 4-pointed diamond glint
function drawStarGlint(x, y, r, rot, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  const inner = r * 0.22;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    const aIn = a + Math.PI / 4;
    ctx.lineTo(Math.cos(aIn) * inner, Math.sin(aIn) * inner);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

// Interactive touch / cursor micro-stardust trail
function addInteractiveSparkle(x, y) {
  if (interactiveSparkles.length > 30) return;
  for (let i = 0; i < 2; i++) {
    interactiveSparkles.push({
      x: x + (Math.random() - 0.5) * 14,
      y: y + (Math.random() - 0.5) * 14,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6 - 0.2,
      r: Math.random() * 1.8 + 0.8,
      alpha: 0.6,
      decay: Math.random() * 0.025 + 0.015,
      color: STARDUST_COLORS[Math.floor(Math.random() * STARDUST_COLORS.length)]
    });
  }
}

let lastTrailTime = 0;
window.addEventListener('mousemove', e => {
  const now = performance.now();
  if (now - lastTrailTime > 45) {
    addInteractiveSparkle(e.clientX, e.clientY);
    lastTrailTime = now;
  }
}, { passive: true });

window.addEventListener('touchmove', e => {
  const now = performance.now();
  if (now - lastTrailTime > 55 && e.touches[0]) {
    addInteractiveSparkle(e.touches[0].clientX, e.touches[0].clientY);
    lastTrailTime = now;
  }
}, { passive: true });

(function drawCelestialCanvas() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // 1. Draw ambient stardust
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.twinklePhase += p.twinkleSpeed;
    p.rot += p.rotSpeed;

    const currentAlpha = p.maxAlpha * (0.6 + 0.4 * Math.sin(p.twinklePhase));
    if (p.y < -12 || currentAlpha <= 0.02) resetP(p);

    if (p.isStar) {
      drawStarGlint(p.x, p.y, p.starSize, p.rot, p.color + currentAlpha + ')');
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + currentAlpha + ')';
      ctx.fill();
    }
  });

  // 2. Draw interactive trail sparkles
  for (let i = interactiveSparkles.length - 1; i >= 0; i--) {
    const s = interactiveSparkles[i];
    s.x += s.vx;
    s.y += s.vy;
    s.alpha -= s.decay;
    if (s.alpha <= 0) {
      interactiveSparkles.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.color + s.alpha + ')';
    ctx.fill();
  }

  requestAnimationFrame(drawCelestialCanvas);
})();

/* ══════════════════════════════════════════════
   BOKEH CANVAS  (cover screen only)
══════════════════════════════════════════════ */
const bokeh = document.getElementById('bokeh-canvas');
if (bokeh) {
  const bctx = bokeh.getContext('2d');
  let boks = [];
  function resizeBokeh() { bokeh.width = window.innerWidth; bokeh.height = window.innerHeight; }
  resizeBokeh(); window.addEventListener('resize', resizeBokeh);
  for (let i = 0; i < 55; i++) {
    boks.push({
      x: Math.random() * bokeh.width, y: Math.random() * bokeh.height,
      r: Math.random() * 22 + 7, alpha: Math.random() * 0.28 + 0.05,
      hue: Math.random() * 90 + 265, dy: (Math.random() - 0.5) * 0.14,
      phase: Math.random() * Math.PI * 2,
    });
  }
  let bFrame = 0;
  (function drawBokeh() {
    bctx.clearRect(0, 0, bokeh.width, bokeh.height);
    bFrame += 0.012;
    boks.forEach(b => {
      const a  = b.alpha * (0.65 + 0.35 * Math.sin(bFrame + b.phase));
      const rg = bctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      rg.addColorStop(0, `hsla(${b.hue},85%,82%,${a})`);
      rg.addColorStop(1, `hsla(${b.hue},85%,82%,0)`);
      bctx.beginPath(); bctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      bctx.fillStyle = rg; bctx.fill();
      b.y += b.dy;
      if (b.y < -b.r * 2)             { b.y = bokeh.height + b.r; b.x = Math.random() * bokeh.width; }
      if (b.y > bokeh.height + b.r*2) { b.y = -b.r; b.x = Math.random() * bokeh.width; }
    });
    requestAnimationFrame(drawBokeh);
  })();
}

/* ══════════════════════════════════════════════
   FLOATING STICKERS
══════════════════════════════════════════════ */
const STICKERS = ['🌸','💜','✨','🌷','💫','🦋','🌺','⭐','🍀','🌙','💝','🌈','🎀','🌻','💎','🕊️','🌟','💐','🪻','👑','🌹','🎵','🌼','💖'];
function buildStickers() {
  // Floating stickers disabled as requested
  if (floatersEl) floatersEl.innerHTML = '';
}
buildStickers();

/* ══════════════════════════════════════════════
   NICKNAME TICKER
══════════════════════════════════════════════ */
function startNicknameTicker() {
  if (!nickTicker || !CONFIG.nicknames?.length) return;
  if (nicknameTimer) clearInterval(nicknameTimer);
  nicknameIdx = 0;
  nickTicker.textContent = CONFIG.nicknames[0];
  nickTicker.classList.remove('fading');
  nicknameTimer = setInterval(() => {
    nickTicker.classList.add('fading');
    setTimeout(() => {
      nicknameIdx = (nicknameIdx + 1) % CONFIG.nicknames.length;
      nickTicker.textContent = CONFIG.nicknames[nicknameIdx];
      nickTicker.classList.remove('fading');
    }, 440);
  }, 2600);
}
startNicknameTicker();

/* ══════════════════════════════════════════════
   BURST HELPERS
══════════════════════════════════════════════ */
const BURST = ['💜','🌸','✨','💫','🌷','🦋','⭐','💝','🎀','💖','🪻','👑','🌹','🌟','🕊️'];

// Tap-anywhere burst (after started)
document.addEventListener('click', e => {
  if (!started) return;
  // Ignore bursts on interactive controls to keep clicks snappy
  if (e.target.closest('button, .video-card, .chapter-pill, .photo-nav-btn, .wish-btn')) return;
  const count = 6 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const el  = document.createElement('div'); el.className = 'tap-burst';
    el.textContent = BURST[Math.floor(Math.random() * BURST.length)];
    const a  = Math.random() * Math.PI * 2;
    const d1 = 55 + Math.random() * 85, d2 = d1 + 42 + Math.random() * 55;
    el.style.cssText = [
      `left:${e.clientX}px`, `top:${e.clientY}px`,
      `--tx:${Math.cos(a)*d1}px`, `--ty:${Math.sin(a)*d1}px`,
      `--tx2:${Math.cos(a)*d2}px`, `--ty2:${Math.sin(a)*d2}px`,
      `animation-delay:${i * 0.038}s`,
      `font-size:${1 + Math.random() * 0.9}rem`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
});

const CONFETTI_C = ['#FFB5C8','#C9B8F5','#FFD6B0','#B3E0FF','#FFD700','#FF80C0','#9FE8A0','#FF9EC8','#E0C0FF','#FFC0D8'];
function launchConfetti(cx, cy, count = 100) {
  for (let i = 0; i < count; i++) {
    const el  = document.createElement('div'); el.className = 'confetti-piece';
    const a   = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const sp  = 115 + Math.random() * 110;
    el.style.background = CONFETTI_C[Math.floor(Math.random() * CONFETTI_C.length)];
    el.style.cssText += [
      `left:${cx}px`, `top:${cy}px`,
      `--tx:${Math.cos(a)*sp}px`,
      `--dur:${1.6 + Math.random() * 0.9}s`,
      `--delay:${Math.random() * 0.32}s`,
      `width:${6 + Math.random() * 9}px`,
      `height:${6 + Math.random() * 9}px`,
      `border-radius:${Math.random() > .5 ? '50%' : '2px'}`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }
}

function sparkleRing(cx, cy) {
  const ring = document.createElement('div'); ring.className = 'sparkle-ring';
  const SP = ['✨','💫','🌟','⭐','💜','🌸','💖','🦋','🪻','👑','🌹','🌙'];
  for (let i = 0; i < 14; i++) {
    const sp = document.createElement('span');
    sp.textContent = SP[i % SP.length];
    const a = (Math.PI * 2 * i) / 14;
    const r = 95 + Math.random() * 65;
    sp.style.cssText = `--sx:${Math.cos(a)*r}px;--sy:${Math.sin(a)*r}px;animation-delay:${i * 0.045}s;font-size:${1.2 + Math.random() * 0.8}rem;`;
    ring.appendChild(sp);
  }
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 1600);
}

function heartRain(count = 30) {
  const H = ['💜','🌸','💖','✨','🦋','⭐','💝','🌷','🪻','👑','🌙','🎀','🌹','💫','🌟'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div'); el.className = 'heart-rain';
    el.textContent = H[Math.floor(Math.random() * H.length)];
    el.style.cssText = `left:${Math.random() * 100}%;--dur:${2.2 + Math.random() * 2.8}s;--delay:${Math.random() * 4}s;font-size:${1 + Math.random() * 1.4}rem;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 7200);
  }
}

/* ══════════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════════ */
function updateProgress() {
  const total = CONFIG.stages.length + (CONFIG.videos?.length ? 1 : 0) + 2;
  let currentStep = 0;
  if (currentStageIndex === 'videos') {
    currentStep = 3;
  } else if (typeof currentStageIndex === 'number') {
    currentStep = currentStageIndex + (currentStageIndex >= 2 && CONFIG.videos?.length ? 2 : 1);
  }
  const pct = Math.round((currentStep / total) * 100);
  progressBar.style.width = `${Math.min(pct, 100)}%`;
}

/* ══════════════════════════════════════════════
   SCREEN SWITCHER
══════════════════════════════════════════════ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active'); s.style.display = 'none';
  });
  const t = document.getElementById(id);
  if (!t) return;
  t.style.display = 'flex';
  void t.offsetWidth; // force reflow for animation restart
  t.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  t.scrollTop = 0;
  document.querySelectorAll('video').forEach(v => {
    v.pause();
    v.currentTime = 0;
  });
  if (typeof videoSongAudio !== 'undefined' && videoSongAudio && !videoSongAudio.paused) {
    videoSongAudio.pause();
    videoSongAudio.currentTime = 0;
  }
  if (typeof currentJukeboxAudio !== 'undefined' && currentJukeboxAudio && !currentJukeboxAudio.paused) {
    currentJukeboxAudio.pause();
    isJukeboxPlaying = false;
  }
}

/* ══════════════════════════════════════════════
   CHAPTER PILLS (fixed bottom nav)
══════════════════════════════════════════════ */
function buildChapterPills() {
  let el = document.getElementById('chapter-pills');
  if (!el) {
    el = document.createElement('div');
    el.className = 'chapter-pills'; el.id = 'chapter-pills';
    document.body.appendChild(el);
  }
  el.style.display = 'flex';
  let html = '';
  CONFIG.stages.forEach((s, i) => {
    html += `<button class="chapter-pill${i === currentStageIndex ? ' active' : ''}" onclick="goToStage(${i})">${s.emoji} Ch.${i + 1}</button>`;
    if (i === 1 && CONFIG.videos?.length) {
      html += `<button class="chapter-pill${currentStageIndex === 'videos' ? ' active' : ''}" onclick="goToVideos()">🎬 Moments</button>`;
    }
  });
  html += `<button class="chapter-pill${currentStageIndex === 'capsule' ? ' active' : ''}" onclick="goToCapsule()">💌 11:11 Space</button>`;
  el.innerHTML = html;

  // Auto-scroll active pill into view smoothly on phone
  requestAnimationFrame(() => {
    const activePill = el.querySelector('.chapter-pill.active');
    if (activePill && typeof activePill.scrollIntoView === 'function') {
      activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
}

/* ══════════════════════════════════════════════
   PLACEHOLDER SVG
══════════════════════════════════════════════ */
function ph() {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="#FFE0EE"/><text x="200" y="230" text-anchor="middle" font-size="88">🌸</text><text x="200" y="300" text-anchor="middle" font-family="Georgia" font-size="18" fill="#9B7CC8">Drop photo here</text></svg>`
  );
}

/* ══════════════════════════════════════════════
   LANGUAGE HELPERS
══════════════════════════════════════════════ */
function isHindi(t)  { return /[\u0900-\u097F]/.test(t || ''); }
function isPoetry(t) { return (t || '').includes('\n') || (t || '').startsWith('"'); }
// helper: get text from wish object or string
const wText = w => typeof w === 'string' ? w : (w?.text || '');
const wBy   = w => (typeof w === 'object' && w?.by) ? w.by : '';

/* ══════════════════════════════════════════════
   BUILD STAGE SCREENS
══════════════════════════════════════════════ */
function buildStages() {
  const container = document.getElementById('stages-container');
  const pLen = CONFIG.photos.length;
  const wLen = CONFIG.wishes.length;
  const sLen = CONFIG.stages.length;

  // Distribute photos & wishes evenly across stages
  CONFIG.stages.forEach((stage, si) => {
    const div = document.createElement('div');
    div.className = 'screen stage-screen';
    div.id = `screen-stage-${si}`;

    const startP = Math.floor(si * pLen / sLen);
    const endP   = Math.floor((si + 1) * pLen / sLen);
    let photos   = CONFIG.photos.slice(startP, endP);
    if (!photos.length) photos = [CONFIG.photos[si % pLen] || CONFIG.photos[0]];

    const startW = Math.floor(si * wLen / sLen);
    const endW   = Math.floor((si + 1) * wLen / sLen);
    let wishes   = CONFIG.wishes.slice(startW, endW);
    if (!wishes.length) wishes = [CONFIG.wishes[0]];

    const isLast = si === sLen - 1;

    const firstPhoto = photos[0];
    const firstWish  = wishes[0] || {};
    const fwText = wText(firstWish);
    const fwBy   = wBy(firstWish);

    // Choose wish text classes
    const wishClass = [
      'wish-text',
      isHindi(fwText) ? 'hindi' : '',
      (!isHindi(fwText) && isPoetry(fwText)) ? 'serif' : '',
    ].filter(Boolean).join(' ');

    div.innerHTML = `
      <div class="stage-title-wrap chapter-title-interactive" id="chapter-title-wrap-${si}" onclick="toggleChapterSong(${si})" role="button" tabindex="0" title="Tap title to play ${stage.songName || 'song'}">
        <span class="stage-emoji-big">${stage.emoji}</span>
        <div class="stage-title-col">
          <h2 class="stage-title">${stage.title}</h2>
          <div class="chapter-song-cue" id="song-cue-${si}">
            <span class="cue-icon">🎵</span>
            <span class="cue-text">tap title to play <em>${stage.songName || 'song'}</em></span>
            <span class="cue-equalizer" aria-hidden="true"><span></span><span></span><span></span></span>
          </div>
        </div>
      </div>

      <div class="photo-stage" id="pstage-${si}">
        <div class="photo-bg-blur" id="pbg-${si}" style="background-image:url('${firstPhoto.src}')"></div>
        <div class="photo-frame">
          <img id="pimg-${si}" src="${firstPhoto.src}" alt="memory" onerror="this.src='${ph()}'">
          <div class="photo-caption${isHindi(firstPhoto.caption) ? ' hindi-cap' : ''}" id="pcap-${si}">${firstPhoto.caption}</div>
        </div>
      </div>

      <div class="photo-nav">
        <button class="photo-nav-btn" aria-label="Previous photo" onclick="prevPhoto(${si})">‹</button>
        <span class="photo-counter" id="pcnt-${si}">1 / ${photos.length}</span>
        <button class="photo-nav-btn" aria-label="Next photo" onclick="nextPhoto(${si})">›</button>
      </div>
      <div class="photo-dots" id="pdots-${si}">
        ${photos.map((_, i) => `<div class="photo-dot${i === 0 ? ' active' : ''}"></div>`).join('')}
      </div>

      <div class="wish-card" id="wcard-${si}">
        <span class="wish-ornament">✦ ✦ ✦</span>
        <div class="wish-quote-top">"</div>
        <div class="${wishClass}" id="wtxt-${si}">${fwText.replace(/\n/g,'<br>')}</div>
        <div class="wish-quote-bot">"</div>
        <div class="wish-by" id="wby-${si}">${fwBy}</div>
        <div class="wish-controls">
          <button class="wish-btn" onclick="prevWish(${si})">‹ Prev</button>
          <span class="wish-progress" id="wprog-${si}">1 / ${wishes.length}</span>
          <button class="wish-btn" onclick="nextWish(${si})">Next ›</button>
        </div>
      </div>

      <button class="next-stage-btn" onclick="${(si === 1 && CONFIG.videos?.length) ? 'goToVideos()' : (isLast ? 'goToFinal()' : `goToStage(${si + 1})`)}">
        ${(si === 1 && CONFIG.videos?.length) ? 'Special Moments 🎬✨' : (isLast ? 'See the finale 💖' : 'Next Chapter ✨')}
      </button>
    `;

    // Store state on element
    div._photos = photos;
    div._wishes = wishes;
    div._pIdx   = 0;
    div._wIdx   = 0;

    container.appendChild(div);

    // ── Insert Video Moments screen after Chapter II (si=1) ──
    if (si === 1 && CONFIG.videos?.length) {
      const vdiv = document.createElement('div');
      vdiv.className = 'screen stage-screen video-screen';
      vdiv.id = 'screen-videos';

      vdiv.innerHTML = `
        <div class="stage-title-wrap">
          <span class="stage-emoji-big">🎬</span>
          <h2 class="stage-title">Special Moments · In Motion 🎥</h2>
        </div>
        <p class="video-screen-sub">Kyunki kuch pal sirf yaad nahi, mahsoos bhi hote hain 🌸</p>
        <div class="video-actions-bar">
          <button class="publish-moment-btn" onclick="openPublishVideoModal()">
            <span class="btn-icon">📹</span> Publish Our Video Moment ✨
          </button>
        </div>
        <div class="video-grid" id="video-grid">
          ${CONFIG.videos.map((v, vi) => `
            <div class="video-card" id="vcard-${vi}">
              <div class="video-wrap">
                <video id="vid-${vi}" src="${v.src}" poster="${v.poster || ''}"
                  preload="metadata" loop muted
                  onerror="this.closest('.video-card').classList.add('vid-error')">
                </video>
                <div class="vid-overlay" id="voverlay-${vi}" onclick="toggleVideo(${vi})">
                  <div class="vid-play-btn">▶</div>
                </div>
                <button class="vid-fs-btn" id="vfs-${vi}" title="Fullscreen" onclick="requestVidFullscreen(${vi})">⛶</button>
              </div>
              <div class="video-label">${v.label}</div>
              <div class="video-caption">${v.caption}</div>
            </div>
          `).join('')}
        </div>
        <button class="next-stage-btn" onclick="goToStage(2)">Next Chapter ✨</button>
      `;
      container.appendChild(vdiv);
      renderUserVideos();
    }
  });
}

/* ══════════════════════════════════════════════
   USER SPECIAL MOMENTS VIDEO PUBLISHING (IndexedDB)
══════════════════════════════════════════════ */
const MOMENTS_DB_NAME = 'MoonRitikaMomentsDB';
const MOMENTS_DB_VER = 1;
const MOMENTS_STORE = 'moments_videos';

function openMomentsDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const req = indexedDB.open(MOMENTS_DB_NAME, MOMENTS_DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(MOMENTS_STORE)) {
        db.createObjectStore(MOMENTS_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function saveUserMomentRecord(record) {
  try {
    const db = await openMomentsDB();
    if (!db) {
      const list = JSON.parse(localStorage.getItem('user_moment_videos') || '[]');
      list.push(record);
      localStorage.setItem('user_moment_videos', JSON.stringify(list));
      return true;
    }
    return new Promise((resolve) => {
      const tx = db.transaction(MOMENTS_STORE, 'readwrite');
      tx.objectStore(MOMENTS_STORE).put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.error('Error saving user moment:', err);
    return false;
  }
}

async function loadAllUserMoments() {
  try {
    const db = await openMomentsDB();
    if (!db) {
      return JSON.parse(localStorage.getItem('user_moment_videos') || '[]');
    }
    return new Promise((resolve) => {
      const tx = db.transaction(MOMENTS_STORE, 'readonly');
      const req = tx.objectStore(MOMENTS_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Error loading moments:', err);
    return [];
  }
}

async function deleteUserMomentRecord(id) {
  try {
    const db = await openMomentsDB();
    if (!db) {
      let list = JSON.parse(localStorage.getItem('user_moment_videos') || '[]');
      list = list.filter(m => m.id !== id);
      localStorage.setItem('user_moment_videos', JSON.stringify(list));
      return true;
    }
    return new Promise((resolve) => {
      const tx = db.transaction(MOMENTS_STORE, 'readwrite');
      tx.objectStore(MOMENTS_STORE).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.error('Error deleting moment:', err);
    return false;
  }
}

let pendingVideoBlob = null;
let pendingVideoUrl = '';

window.openPublishVideoModal = () => {
  const modal = document.getElementById('publish-video-modal');
  if (modal) modal.style.display = 'flex';
  pendingVideoBlob = null;
  pendingVideoUrl = '';
  const label = document.getElementById('vid-file-label');
  if (label) label.textContent = 'Choose video file (MP4, MOV, WebM)';
  const prevBox = document.getElementById('vid-preview-box');
  if (prevBox) prevBox.style.display = 'none';
  const fileInput = document.getElementById('user-vid-file');
  if (fileInput) fileInput.value = '';
  const urlInput = document.getElementById('user-vid-url');
  if (urlInput) urlInput.value = '';
  const titleInput = document.getElementById('user-vid-title');
  if (titleInput) titleInput.value = '';
  const captionInput = document.getElementById('user-vid-caption');
  if (captionInput) captionInput.value = '';
};

window.closePublishVideoModal = () => {
  const modal = document.getElementById('publish-video-modal');
  if (modal) modal.style.display = 'none';
  const prevVid = document.getElementById('vid-preview-el');
  if (prevVid) { prevVid.pause(); prevVid.src = ''; }
};

window.handleModalBackdropClick = (e) => {
  if (e.target.id === 'publish-video-modal') {
    closePublishVideoModal();
  }
};

window.switchVideoSourceTab = (tab) => {
  const btnUp = document.getElementById('btn-src-upload');
  const btnUrl = document.getElementById('btn-src-url');
  const paneUp = document.getElementById('video-upload-pane');
  const paneUrl = document.getElementById('video-url-pane');
  if (tab === 'upload') {
    btnUp.classList.add('active');
    btnUrl.classList.remove('active');
    paneUp.style.display = 'block';
    paneUrl.style.display = 'none';
  } else {
    btnUrl.classList.add('active');
    btnUp.classList.remove('active');
    paneUrl.style.display = 'block';
    paneUrl.style.display = 'none';
  }
};

window.handleUserVidSelected = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  pendingVideoBlob = file;
  pendingVideoUrl = '';
  const label = document.getElementById('vid-file-label');
  if (label) label.textContent = `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
  
  const blobUrl = URL.createObjectURL(file);
  const prevBox = document.getElementById('vid-preview-box');
  const prevVid = document.getElementById('vid-preview-el');
  if (prevBox && prevVid) {
    prevVid.src = blobUrl;
    prevBox.style.display = 'block';
  }
};

window.handleUserVidUrlInput = (url) => {
  pendingVideoUrl = url.trim();
  pendingVideoBlob = null;
  const prevBox = document.getElementById('vid-preview-box');
  const prevVid = document.getElementById('vid-preview-el');
  if (prevBox && prevVid && pendingVideoUrl) {
    prevVid.src = pendingVideoUrl;
    prevBox.style.display = 'block';
  }
};

window.submitPublishVideo = async () => {
  const title = document.getElementById('user-vid-title')?.value.trim() || 'Our Special Moment 🌸';
  const caption = document.getElementById('user-vid-caption')?.value.trim() || 'A memory that lives forever in motion ✨';
  const keepSound = !!document.getElementById('user-vid-audio-opt')?.checked;

  if (!pendingVideoBlob && !pendingVideoUrl) {
    alert('Please choose a video file or paste a video link first! 📹');
    return;
  }

  const id = 'usr_' + Date.now();
  const record = {
    id,
    label: title,
    caption: caption,
    videoBlob: pendingVideoBlob,
    videoUrl: pendingVideoUrl,
    useOriginalAudio: keepSound,
    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  const btn = document.getElementById('btn-submit-publish');
  if (btn) btn.textContent = 'Saving moment… 💫';

  await saveUserMomentRecord(record);

  if (btn) btn.textContent = 'Publish Moment 🚀✨';
  closePublishVideoModal();

  // Render immediately to video grid
  await renderUserVideos();

  // Celebration
  launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 80);
  heartRain(18);

  // Scroll to new video
  setTimeout(() => {
    const newEl = document.getElementById(`vcard-${id}`);
    if (newEl) newEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 350);
};

window.deleteUserVideo = async (id) => {
  if (!confirm('Are you sure you want to remove this video moment? 🎬')) return;
  await deleteUserMomentRecord(id);
  const el = document.getElementById(`vcard-${id}`);
  if (el) {
    el.style.transition = 'all .4s ease';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.8)';
    setTimeout(() => el.remove(), 400);
  }
};

async function renderUserVideos() {
  const grid = document.getElementById('video-grid');
  if (!grid) return;

  grid.querySelectorAll('.user-published-card').forEach(c => c.remove());

  const moments = await loadAllUserMoments();
  moments.forEach(m => {
    let videoSrc = m.videoUrl;
    if (m.videoBlob) {
      videoSrc = URL.createObjectURL(m.videoBlob);
    }
    if (!videoSrc) return;

    const card = document.createElement('div');
    card.className = 'video-card user-published-card';
    card.id = `vcard-${m.id}`;
    card.innerHTML = `
      <div class="user-video-badge">
        <span>💜 Published Moment · ${m.timestamp || ''}</span>
        <button class="delete-user-vid-btn" onclick="deleteUserVideo('${m.id}')" title="Delete moment">×</button>
      </div>
      <div class="video-wrap">
        <video id="vid-${m.id}" src="${videoSrc}" preload="metadata" loop muted
          ${m.useOriginalAudio ? 'data-original-audio="true"' : ''}
          onerror="this.closest('.video-card').classList.add('vid-error')">
        </video>
        <div class="vid-overlay" id="voverlay-${m.id}" onclick="toggleVideo('${m.id}')">
          <div class="vid-play-btn">▶</div>
        </div>
        <button class="vid-fs-btn" id="vfs-${m.id}" title="Fullscreen" onclick="requestVidFullscreen('${m.id}')">⛶</button>
      </div>
      <div class="video-label">${m.label}</div>
      <div class="video-caption">${m.caption}</div>
    `;
    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════════
   VIDEO FULLSCREEN
══════════════════════════════════════════════ */
window.requestVidFullscreen = vi => {
  const vid = document.getElementById(`vid-${vi}`);
  if (!vid) return;
  if (vid.requestFullscreen)            vid.requestFullscreen();
  else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen();
  else if (vid.webkitEnterFullscreen)   vid.webkitEnterFullscreen(); // iOS Safari
  else if (vid.mozRequestFullScreen)    vid.mozRequestFullScreen();
  else if (vid.msRequestFullscreen)     vid.msRequestFullscreen();
};

/* ══════════════════════════════════════════════
   VIDEO TOGGLE  (synced with "Lag Jaa Gale Instrumental Mix")
══════════════════════════════════════════════ */
window.toggleVideo = vi => {
  const vid     = document.getElementById(`vid-${vi}`);
  const overlay = document.getElementById(`voverlay-${vi}`);
  const wrap    = vid?.closest('.video-wrap');
  if (!vid) return;

  if (vid.paused) {
    // 1. Pause any other video
    document.querySelectorAll('video').forEach(v => {
      if (v !== vid) {
        v.pause();
      }
    });

    // 2. Configure video loop and audio
    const useOrig = vid.getAttribute('data-original-audio') === 'true';
    vid.loop = true;
    vid.muted = !useOrig;
    vid.controls = true;
    if (wrap) wrap.classList.add('has-played');
    if (overlay) {
      overlay.classList.add('playing');
      overlay.style.display = 'none';
    }

    // 3. Pause background theme song
    fadeTo(0, () => {
      audio.pause();
    });

    // 4. Start soundtrack if original audio is NOT used
    if (!useOrig && typeof videoSongAudio !== 'undefined' && videoSongAudio) {
      videoSongAudio.muted = isMuted;
      videoSongAudio.play().catch(() => {});
    }

    vid.play().catch(() => {});
  } else {
    vid.pause();
    if (typeof videoSongAudio !== 'undefined' && videoSongAudio && !videoSongAudio.paused) {
      videoSongAudio.pause();
    }
    if (!isMuted) {
      audio.play().catch(() => {});
      fadeTo(0.62);
    }
  }
};

// Global video events
document.addEventListener('play', e => {
  if (e.target.tagName !== 'VIDEO') return;
  const vid = e.target;
  const vi = vid.id.replace('vid-', '');
  const overlay = document.getElementById(`voverlay-${vi}`);
  const wrap = vid.closest('.video-wrap');

  // Pause other videos
  document.querySelectorAll('video').forEach(v => {
    if (v !== vid) v.pause();
  });

  vid.loop = true;
  vid.muted = true;
  vid.controls = true;
  if (wrap) wrap.classList.add('has-played');
  if (overlay) {
    overlay.classList.add('playing');
    overlay.style.display = 'none';
  }

  // Fade out main background song and play video song
  fadeTo(0, () => {
    audio.pause();
  });
  if (typeof videoSongAudio !== 'undefined' && videoSongAudio) {
    videoSongAudio.muted = isMuted;
    videoSongAudio.play().catch(() => {});
  }
}, true);

document.addEventListener('pause', e => {
  if (e.target.tagName !== 'VIDEO') return;
  const anyPlaying = Array.from(document.querySelectorAll('video')).some(v => !v.paused);
  if (!anyPlaying) {
    if (typeof videoSongAudio !== 'undefined' && videoSongAudio && !videoSongAudio.paused) {
      videoSongAudio.pause();
    }
    if (!isMuted) {
      audio.play().catch(() => {});
      fadeTo(0.62);
    }
  }
}, true);

document.addEventListener('ended', e => {
  if (e.target.tagName !== 'VIDEO') return;
  // If video reached end but song is still playing, loop video continuously!
  if (typeof videoSongAudio !== 'undefined' && videoSongAudio && !videoSongAudio.paused) {
    e.target.currentTime = 0;
    e.target.play().catch(() => {});
  } else {
    const anyPlaying = Array.from(document.querySelectorAll('video')).some(v => !v.paused);
    if (!anyPlaying) {
      if (typeof videoSongAudio !== 'undefined' && videoSongAudio) videoSongAudio.pause();
      if (!isMuted) {
        audio.play().catch(() => {});
        fadeTo(0.62);
      }
    }
  }
}, true);

/* ══════════════════════════════════════════════
   PHOTO NAVIGATION
══════════════════════════════════════════════ */
window.prevPhoto = si => changePhoto(si, -1);
window.nextPhoto = si => changePhoto(si, +1);

function changePhoto(si, dir) {
  const stage  = document.getElementById(`screen-stage-${si}`);
  if (!stage) return;
  const photos = stage._photos;
  stage._pIdx  = (stage._pIdx + dir + photos.length) % photos.length;
  const idx    = stage._pIdx;
  const p      = photos[idx];

  const img  = document.getElementById(`pimg-${si}`);
  const bg   = document.getElementById(`pbg-${si}`);
  const cap  = document.getElementById(`pcap-${si}`);
  const cnt  = document.getElementById(`pcnt-${si}`);

  img.classList.add('exiting');
  setTimeout(() => {
    img.src = p.src;
    bg.style.backgroundImage = `url('${p.src}')`;
    cap.textContent = p.caption;
    cnt.textContent = `${idx + 1} / ${photos.length}`;
    img.classList.remove('exiting');
    cap.style.animation = 'none'; void cap.offsetWidth; cap.style.animation = '';
    cap.classList.toggle('hindi-cap', isHindi(p.caption));
    img.onerror = () => { img.src = ph(); };
  }, 360);

  document.querySelectorAll(`#pdots-${si} .photo-dot`)
    .forEach((d, i) => d.classList.toggle('active', i === idx));
}

/* ══════════════════════════════════════════════
   WISH NAVIGATION
══════════════════════════════════════════════ */
window.prevWish = si => changeWish(si, -1);
window.nextWish = si => changeWish(si, +1);

function changeWish(si, dir) {
  const stage  = document.getElementById(`screen-stage-${si}`);
  if (!stage) return;
  const wishes = stage._wishes;
  stage._wIdx  = (stage._wIdx + dir + wishes.length) % wishes.length;
  const idx    = stage._wIdx;
  const w      = wishes[idx];
  const text   = wText(w);
  const by     = wBy(w);

  const txtEl  = document.getElementById(`wtxt-${si}`);
  const byEl   = document.getElementById(`wby-${si}`);
  const progEl = document.getElementById(`wprog-${si}`);
  if (!txtEl) return;

  // fade out
  txtEl.style.transition = 'opacity .28s ease, transform .28s ease';
  txtEl.style.opacity    = '0';
  txtEl.style.transform  = dir > 0 ? 'translateX(-18px)' : 'translateX(18px)';
  if (byEl) { byEl.style.transition = 'opacity .22s ease'; byEl.style.opacity = '0'; }

  setTimeout(() => {
    txtEl.innerHTML = text.replace(/\n/g, '<br>');
    // Update classes
    txtEl.className = [
      'wish-text',
      isHindi(text)                       ? 'hindi' : '',
      (!isHindi(text) && isPoetry(text))  ? 'serif' : '',
    ].filter(Boolean).join(' ');

    progEl.textContent = `${idx + 1} / ${wishes.length}`;
    if (byEl) byEl.textContent = by;

    txtEl.style.transform  = dir > 0 ? 'translateX(18px)' : 'translateX(-18px)';
    // tick to trigger transition
    void txtEl.offsetWidth;
    txtEl.style.transition = 'opacity .42s ease, transform .42s ease';
    txtEl.style.opacity    = '1';
    txtEl.style.transform  = 'translateX(0)';
    if (byEl) {
      byEl.style.transition = 'opacity .48s ease .1s';
      byEl.style.opacity    = '1';
    }
  }, 300);
}

/* ══════════════════════════════════════════════
   STAGE NAVIGATION
══════════════════════════════════════════════ */
window.goToStage = idx => {
  stopChapterSong(true);
  currentStageIndex = idx;
  const stage = CONFIG.stages[idx];
  if (!stage) return;
  document.body.className = stage.theme || 'theme-blush';

  // "Kabhi To Nazar Milao" plays continuously and uninterrupted!
  if (audio.paused && !isMuted) {
    startAudio('assets/songs/song1.mp3');
  } else if (!isMuted && audio.volume < 0.2) {
    fadeTo(0.62);
  }

  showScreen(`screen-stage-${idx}`);
  buildStickers(); buildChapterPills(); updateProgress();

  // Auto-rotate wishes every 10s
  if (wishAutoTimer) clearInterval(wishAutoTimer);
  wishAutoTimer = setInterval(() => {
    const active = document.querySelector('.stage-screen.active');
    if (!active || active.id === 'screen-videos') return;
    const i = parseInt(active.id.split('-').pop());
    if (!isNaN(i)) changeWish(i, 1);
  }, 10000);
};

window.goToVideos = () => {
  stopChapterSong(false);
  currentStageIndex = 'videos';
  document.body.className = 'theme-lavender';
  showScreen('screen-videos');
  renderUserVideos();
  buildStickers();
  buildChapterPills();
  updateProgress();
};

/* ══════════════════════════════════════════════
   FINAL SCREEN
══════════════════════════════════════════════ */
window.goToFinal = () => {
  stopChapterSong(true);
  if (wishAutoTimer) clearInterval(wishAutoTimer);
  currentStageIndex = CONFIG.stages.length + 1;
  document.body.className = 'theme-blush';

  // Keep "Kabhi To Nazar Milao" playing continuously!
  if (audio.paused && !isMuted) {
    startAudio('assets/songs/song1.mp3');
  } else if (!isMuted && audio.volume < 0.2) {
    fadeTo(0.62);
  }

  // Nickname pills
  const scrollEl = document.getElementById('nickname-scroll-final');
  if (scrollEl && CONFIG.nicknames)
    scrollEl.innerHTML = CONFIG.nicknames
      .map((n, i) => `<div class="nickname-pill-final" style="--delay:${i * 0.13}s">${n}</div>`)
      .join('');

  // Hindi closing line
  const hindiEl = document.getElementById('final-hindi-line');
  if (hindiEl && CONFIG.finalHindiLine)
    hindiEl.innerHTML = CONFIG.finalHindiLine.replace(/\n/g, '<br>');

  // Celebration burst
  setTimeout(() => {
    launchConfetti(window.innerWidth / 2, window.innerHeight / 4, 140);
    sparkleRing(window.innerWidth / 2, window.innerHeight / 2);
    heartRain(32);
  }, 420);

  const pills = document.getElementById('chapter-pills');
  if (pills) pills.style.display = 'none';
  showScreen('screen-final'); buildStickers(); updateProgress();
};

/* ══════════════════════════════════════════════
   REPLAY
══════════════════════════════════════════════ */
window.replayAll = () => {
  if (wishAutoTimer) clearInterval(wishAutoTimer);
  currentStageIndex = 0; started = false;
  fadeTo(0, () => { audio.pause(); audio.currentTime = 0; audio.src = ''; });
  document.body.className = 'theme-blush';
  muteBtn.classList.remove('visible');
  progressBar.style.width = '0%';
  document.getElementById('chapter-pills')?.remove();
  // Reset per-stage indices
  document.querySelectorAll('.stage-screen').forEach(s => { s._pIdx = 0; s._wIdx = 0; });
  showScreen('screen-cover');
  startNicknameTicker();
};

/* ══════════════════════════════════════════════
   MUTE BUTTON
══════════════════════════════════════════════ */
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  fadeTo(isMuted ? 0 : 0.62);
  if (typeof chapterAudio !== 'undefined' && chapterAudio) {
    chapterAudio.muted = isMuted;
    chapterAudio.volume = isMuted ? 0 : 0.75;
  }
  if (typeof videoSongAudio !== 'undefined' && videoSongAudio) {
    videoSongAudio.muted = isMuted;
  }
  if (typeof currentJukeboxAudio !== 'undefined' && currentJukeboxAudio) {
    currentJukeboxAudio.muted = isMuted;
  }
  muteBtn.querySelector('.note').textContent = isMuted ? '🔇' : '🎵';
});

/* ══════════════════════════════════════════════
   ANIMATE COVER NAME  (letter-by-letter)
══════════════════════════════════════════════ */
function animateCoverName() {
  const nameEl = document.getElementById('cover-name-el');
  if (!nameEl) return;
  nameEl.innerHTML = CONFIG.name.split('').map((ch, i) =>
    `<span class="letter" style="--ld:${0.55 + i * 0.09}s">${ch}</span>`
  ).join('');
}

/* ══════════════════════════════════════════════
   COVER SETUP (CLEAN & MINIMAL CELESTIAL)
══════════════════════════════════════════════ */
function setupCover() {
  animateCoverName();
  const tagEl = document.querySelector('.cover-glass-badge');
  if (tagEl && CONFIG.coverTagline) tagEl.textContent = CONFIG.coverTagline;
  const dateEl = document.querySelector('.date-badge');
  if (dateEl && CONFIG.coverDate) dateEl.textContent = CONFIG.coverDate;

  // Periodic ambient shooting stars on the cover
  setInterval(() => {
    if (started) return;
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.cssText = `top:${Math.random() * 45}%;left:${Math.random() * 55}%;--dur:${1.2 + Math.random() * 0.8}s;--delay:0s;`;
    document.getElementById('screen-cover')?.appendChild(star);
    setTimeout(() => star.remove(), 2200);
  }, 4200);
}

/* ══════════════════════════════════════════════
   AUTO-START "Kabhi To Nazar Milao" WITH PROJECT
══════════════════════════════════════════════ */
function autoStartThemeSong() {
  if (audio.paused && !isMuted) {
    startAudio('assets/songs/song1.mp3');
  }
}

// 1. Try starting right on load
setTimeout(autoStartThemeSong, 400);

// 2. Browser autoplay fallback: start on any first touch, click, or tap anywhere
['click', 'touchstart', 'touchend', 'pointerdown'].forEach(evt => {
  window.addEventListener(evt, () => {
    autoStartThemeSong();
  }, { once: true, passive: true });
});

/* ══════════════════════════════════════════════
   OPEN BUTTON  — the magic tap
══════════════════════════════════════════════ */
window.openExperience = function(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  if (started) return;
  started = true;
  if (nicknameTimer) clearInterval(nicknameTimer);

  const cx = (e && typeof e.clientX === 'number' && e.clientX > 0) ? e.clientX : window.innerWidth / 2;
  const cy = (e && typeof e.clientY === 'number' && e.clientY > 0) ? e.clientY : window.innerHeight / 2;

  // 1. Activate card split opening (half towards right, half towards left)
  const card = document.getElementById('cover-card');
  if (card) {
    card.classList.add('doors-active');
    void card.offsetWidth;
    card.classList.add('doors-opening');
  }

  // 2. Confetti + sparkle + start default background audio ("Kabhi To Nazar Milao")
  setTimeout(() => {
    launchConfetti(cx, cy, 140);
    sparkleRing(cx, cy);
    heartRain(16);

    if (CONFIG.stages[0]?.song) {
      startAudio(CONFIG.stages[0].song);
    }
  }, 250);

  // 3. Smoothly navigate into Chapter 1
  setTimeout(() => {
    goToStage(0);
    muteBtn.classList.add('visible');
  }, 850);
};

const openBtn = document.getElementById('open-btn');
if (openBtn) {
  openBtn.addEventListener('click', window.openExperience);
  openBtn.addEventListener('touchend', window.openExperience, { passive: false });
}

// Tapping anywhere on the cover card also opens it like a card
const coverCard = document.getElementById('cover-card');
if (coverCard) {
  coverCard.addEventListener('click', e => {
    if (!started && e.target !== openBtn) {
      window.openExperience(e);
    }
  });
  coverCard.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') window.openExperience(e);
  });
}

/* ══════════════════════════════════════════════
   SWIPE  (touch)
══════════════════════════════════════════════ */
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 55 || Math.abs(dy) > Math.abs(dx) * 0.9) return; // ignore vertical / small swipes
  const active = document.querySelector('.stage-screen.active');
  if (!active || active.id === 'screen-videos') return;
  const i = parseInt(active.id.split('-').pop());
  if (!isNaN(i)) changePhoto(i, dx < 0 ? 1 : -1);
}, { passive: true });

/* ══════════════════════════════════════════════
   KEYBOARD  (desktop)
══════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  const active = document.querySelector('.stage-screen.active');
  if (!active || active.id === 'screen-videos') return;
  const i = parseInt(active.id.split('-').pop());
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') changePhoto(i, 1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   changePhoto(i, -1);
  if (e.key === 'w' || e.key === 'W') changeWish(i, 1);
  if (e.key === 'q' || e.key === 'Q') changeWish(i, -1);
});

/* ══════════════════════════════════════════════
   IMAGE ERROR FALLBACK
══════════════════════════════════════════════ */
document.addEventListener('error', e => {
  if (e.target.tagName === 'IMG') e.target.src = ph();
}, true);

/* ══════════════════════════════════════════════
   THE 11:11 SPACE · SHARED NOTES & JUKEBOX LOGIC
══════════════════════════════════════════════ */
let selectedNoteColor = 'lavender';
let uploadedAudioBlobUrl = null;
let uploadedAudioName = '';
let currentJukeboxAudio = null;
let currentJukeboxIdx = 0;
let isJukeboxPlaying = false;

window.goToCapsule = () => {
  // Show card-closing animation before entering 11:11 Space
  triggerCardClosing(() => {
    currentStageIndex = 'capsule';
    document.body.className = 'theme-lavender';
    const pills = document.getElementById('chapter-pills');
    if (pills) pills.style.display = 'flex';
    showScreen('screen-capsule');
    buildStickers();
    buildChapterPills();
    initCapsuleSpace();
    sparkleRing(window.innerWidth / 2, window.innerHeight / 3);
  });
};

function triggerCardClosing(onComplete) {
  stopChapterSong(false);
  const overlay = document.getElementById('card-closing-overlay');
  if (!overlay) { onComplete?.(); return; }

  const card3d = overlay.querySelector('.closing-card-3d');
  const seal   = overlay.querySelector('.closing-card-seal');
  if (card3d) card3d.classList.remove('card-closed');
  if (seal)   seal.classList.remove('sealed');
  overlay.classList.remove('fade-out');

  // Show overlay
  overlay.style.display = 'flex';
  void overlay.offsetWidth; // force reflow so CSS animation fires

  // 200ms — card flaps swing shut together from left and right (NO RIBBON)
  setTimeout(() => {
    if (card3d) card3d.classList.add('card-closed');
  }, 200);

  // 900ms — celestial seal lights up in the center (NO RIBBON) + confetti & heart rain
  setTimeout(() => {
    if (seal) seal.classList.add('sealed');
    heartRain(12);
    launchConfetti(window.innerWidth / 2, window.innerHeight * 0.42, 90);
    sparkleRing(window.innerWidth / 2, window.innerHeight * 0.42);
  }, 900);

  // 2400ms — fade out overlay
  setTimeout(() => {
    overlay.classList.add('fade-out');
  }, 2400);

  // 3000ms — hide overlay, transition into 11:11 Space
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.classList.remove('fade-out');
    if (card3d) card3d.classList.remove('card-closed');
    if (seal)   seal.classList.remove('sealed');
    onComplete?.();
  }, 3000);
}

window.switchCapsuleTab = tab => {
  document.querySelectorAll('.capsule-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.capsule-tab-content').forEach(c => c.classList.remove('active'));
  
  const targetBtn = document.getElementById(`tab-btn-${tab}`);
  const targetContent = document.getElementById(`tab-${tab}`);
  if (targetBtn) targetBtn.classList.add('active');
  if (targetContent) targetContent.classList.add('active');
};

window.selectNoteColor = (color, btn) => {
  selectedNoteColor = color;
  document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
  if (btn) btn.classList.add('active');
};

window.handleAuthorChange = select => {
  const customInput = document.getElementById('note-author-custom');
  if (!customInput) return;
  if (select.value === 'Custom') {
    customInput.style.display = 'inline-block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
  }
};

// ── Shared Notes State ────────────────────────
const DEFAULT_NOTES = [
  {
    id: 'note_1',
    author: 'Nitish 🌙',
    text: 'Ritika, thank you for being the wonderful, radiant soul you are. Having you in life makes everything lighter. Stay exactly the way you are! 🪻',
    color: 'lavender',
    likes: 5,
    timestamp: '11:11 PM · Special'
  },
  {
    id: 'note_2',
    author: 'Ritika 🪻',
    text: 'Bas yun hi hasste rehna hai... zindagi kitni bhi bhagti rahe, kuch pal theher kar yaad rakhne layak hote hain 🌸✨',
    color: 'rose',
    likes: 7,
    timestamp: '11:11 PM · Memory'
  },
  {
    id: 'note_3',
    author: 'The 11:11 Sanctuary 💫',
    text: 'This board belongs to both of us! Whenever you want to leave a thought, a memory, or an unsaid word, tap "✍️ Leave a Note" above. It stays pinned here forever. 💜',
    color: 'moon',
    likes: 3,
    timestamp: 'Always'
  }
];

function getStoredNotes() {
  try {
    const raw = localStorage.getItem('ritika_1111_notes');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_NOTES;
}

function saveStoredNotes(notes) {
  try {
    localStorage.setItem('ritika_1111_notes', JSON.stringify(notes));
  } catch (e) {}
}

window.saveNewNote = () => {
  const textarea = document.getElementById('note-textarea');
  const text = (textarea?.value || '').trim();
  if (!text) {
    if (textarea) textarea.focus();
    return;
  }

  const select = document.getElementById('note-author-select');
  const custom = document.getElementById('note-author-custom');
  let author = select?.value || 'Nitish 🌙';
  if (author === 'Custom' && custom && custom.value.trim()) {
    author = custom.value.trim();
  }

  const now = new Date();
  const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
                  now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const notes = getStoredNotes();
  const newNote = {
    id: 'note_' + Date.now(),
    author,
    text,
    color: selectedNoteColor,
    likes: 1,
    timestamp: timeStr
  };

  notes.unshift(newNote);
  saveStoredNotes(notes);
  if (textarea) textarea.value = '';

  renderNotes();
  launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 40);
  sparkleRing(window.innerWidth / 2, window.innerHeight / 2);
};

window.toggleNoteLike = id => {
  const notes = getStoredNotes();
  const note = notes.find(n => n.id === id);
  if (note) {
    note.likes = (note.likes || 0) + 1;
    saveStoredNotes(notes);
    renderNotes();
  }
};

window.deleteNote = id => {
  if (!confirm('Remove this note from the board?')) return;
  let notes = getStoredNotes();
  notes = notes.filter(n => n.id !== id);
  saveStoredNotes(notes);
  renderNotes();
};

window.exportNotes = () => {
  const notes = getStoredNotes();
  const exportText = notes.map(n => `[${n.author}] (${n.timestamp})\n${n.text}\n`).join('\n---\n\n');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(exportText).then(() => {
      alert('All shared notes copied to clipboard! 📋✨');
    });
  } else {
    alert(exportText);
  }
};

function renderNotes() {
  const wall = document.getElementById('notes-wall');
  const countLabel = document.getElementById('notes-count-label');
  if (!wall) return;

  const notes = getStoredNotes();
  if (countLabel) countLabel.textContent = `Shared Notes (${notes.length})`;

  wall.innerHTML = notes.map(n => `
    <div class="note-card ${n.color || 'lavender'}">
      <div class="note-header">
        <span class="note-author-badge">${n.author}</span>
        <button class="note-del-btn" onclick="deleteNote('${n.id}')" title="Delete note">×</button>
      </div>
      <div class="note-text">${n.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      <div class="note-footer">
        <span>${n.timestamp}</span>
        <button class="note-like-btn" onclick="toggleNoteLike('${n.id}')">
          ❤️ <span>${n.likes || 1}</span>
        </button>
      </div>
    </div>
  `).join('');
}

// ── Jukebox State ─────────────────────────────
const DEFAULT_PLAYLIST = [
  {
    title: 'Kabhi To Nazar Milao',
    artist: 'Adnan Sami & Asha Bhosle',
    src: 'assets/songs/song1.mp3',
    note: 'Our main journey soundtrack 🪻'
  },
  {
    title: 'Lag Jaa Gale (Instrumental Mix)',
    artist: 'Lata Mangeshkar (Master Mix)',
    src: 'assets/songs/lag_jaa_gale_mix.mp3',
    note: 'Special Moments soundtrack 🎬✨'
  },
  {
    title: 'Lagi Tumse Man Ki Lagan',
    artist: 'Rahat Fateh Ali Khan',
    src: 'assets/songs/lagan.aac',
    note: 'Soulful Sufi classic 🕊️'
  }
];

function getStoredPlaylist() {
  const autoSongs = (typeof window !== 'undefined' && window.AUTO_DISCOVERED_SONGS) || DEFAULT_PLAYLIST;
  try {
    const raw = localStorage.getItem('ritika_1111_playlist');
    if (raw) {
      const stored = JSON.parse(raw);
      // Automatically merge in any new songs found in assets/songs without losing user changes
      const storedSrcs = new Set(stored.map(s => s.src));
      let hasNew = false;
      autoSongs.forEach(song => {
        if (!storedSrcs.has(song.src)) {
          stored.push(song);
          hasNew = true;
        }
      });
      if (hasNew) {
        saveStoredPlaylist(stored);
      }
      return stored;
    }
  } catch (e) {}
  return autoSongs;
}

window.syncAllDiscoveredSongs = () => {
  const autoSongs = (typeof window !== 'undefined' && window.AUTO_DISCOVERED_SONGS) || DEFAULT_PLAYLIST;
  const current = getStoredPlaylist();
  const currentSrcs = new Set(current.map(s => s.src));
  let addedCount = 0;
  autoSongs.forEach(song => {
    if (!currentSrcs.has(song.src)) {
      current.push(song);
      addedCount++;
    }
  });
  saveStoredPlaylist(current);
  renderPlaylist();
  launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 70);
  alert(`✨ Synchronized! All ${current.length} songs are ready in your Song Vault.`);
};

function saveStoredPlaylist(pl) {
  try {
    localStorage.setItem('ritika_1111_playlist', JSON.stringify(pl));
  } catch (e) {}
}

window.handleSongFileUpload = e => {
  const file = e.target.files?.[0];
  const label = document.getElementById('uploaded-song-filename');
  if (!file) return;

  uploadedAudioBlobUrl = URL.createObjectURL(file);
  uploadedAudioName = file.name.replace(/\.[^/.]+$/, "");
  if (label) label.textContent = `Selected: ${file.name}`;

  const titleInput = document.getElementById('song-input-title');
  if (titleInput && !titleInput.value) {
    titleInput.value = uploadedAudioName;
  }
};

window.saveNewSong = () => {
  const titleInput  = document.getElementById('song-input-title');
  const artistInput = document.getElementById('song-input-artist');
  const noteInput   = document.getElementById('song-input-note');
  const urlInput    = document.getElementById('song-input-url');

  const title  = (titleInput?.value || '').trim() || 'Untitled Melody';
  const artist = (artistInput?.value || '').trim() || 'Special Dedication';
  const note   = (noteInput?.value || '').trim() || 'Added to our vault ✨';
  let src      = uploadedAudioBlobUrl || (urlInput?.value || '').trim();

  if (!src) {
    alert('Please pick an audio file or paste an audio URL!');
    return;
  }

  const playlist = getStoredPlaylist();
  playlist.push({ title, artist, note, src });
  saveStoredPlaylist(playlist);

  // Reset inputs
  if (titleInput) titleInput.value = '';
  if (artistInput) artistInput.value = '';
  if (noteInput) noteInput.value = '';
  if (urlInput) urlInput.value = '';
  const label = document.getElementById('uploaded-song-filename');
  if (label) label.textContent = 'No file chosen (or enter URL below)';
  uploadedAudioBlobUrl = null;

  renderPlaylist();
  // Play the newly added track
  playJukeboxTrack(playlist.length - 1);
};

window.playJukeboxTrack = idx => {
  const playlist = getStoredPlaylist();
  const track = playlist[idx];
  if (!track) return;

  currentJukeboxIdx = idx;

  // Pause main site song and video song
  fadeTo(0, () => audio.pause());
  if (typeof videoSongAudio !== 'undefined' && videoSongAudio && !videoSongAudio.paused) {
    videoSongAudio.pause();
  }

  if (currentJukeboxAudio) {
    currentJukeboxAudio.pause();
  }

  currentJukeboxAudio = new Audio(track.src);
  currentJukeboxAudio.volume = 0.75;
  currentJukeboxAudio.play().then(() => {
    isJukeboxPlaying = true;
    updateJukeboxUI(track, true);
  }).catch(() => {
    isJukeboxPlaying = false;
    updateJukeboxUI(track, false);
  });

  currentJukeboxAudio.onended = () => {
    isJukeboxPlaying = false;
    updateJukeboxUI(track, false);
    // Auto-play next track
    const nextIdx = (idx + 1) % playlist.length;
    playJukeboxTrack(nextIdx);
  };

  renderPlaylist();
};

window.toggleJukeboxPlay = () => {
  const playlist = getStoredPlaylist();
  const track = playlist[currentJukeboxIdx] || playlist[0];
  if (!track) return;

  if (isJukeboxPlaying && currentJukeboxAudio) {
    currentJukeboxAudio.pause();
    isJukeboxPlaying = false;
    updateJukeboxUI(track, false);
    if (!isMuted) fadeTo(0.62);
  } else {
    playJukeboxTrack(currentJukeboxIdx);
  }
};

function updateJukeboxUI(track, playing) {
  const titleEl  = document.getElementById('jb-track-title');
  const artistEl = document.getElementById('jb-track-artist');
  const tagEl    = document.getElementById('jb-status-tag');
  const btnEl    = document.getElementById('jb-main-play-btn');
  const disc     = document.getElementById('vinyl-disc');
  const card     = document.querySelector('.jukebox-player-card');

  if (titleEl)  titleEl.textContent = track.title;
  if (artistEl) artistEl.textContent = track.artist;
  if (tagEl)    tagEl.textContent = playing ? 'NOW PLAYING 🎶' : 'PAUSED';
  if (btnEl)    btnEl.textContent = playing ? '❚❚' : '▶';

  if (disc) {
    if (playing) disc.classList.add('spinning');
    else disc.classList.remove('spinning');
  }
  if (card) {
    if (playing) card.classList.add('playing');
    else card.classList.remove('playing');
  }
}

window.deleteJukeboxTrack = (idx, e) => {
  if (e) e.stopPropagation();
  let playlist = getStoredPlaylist();
  const track = playlist[idx];
  if (!track) return;

  if (!confirm(`Remove "${track.title}" from the playlist?`)) return;

  // If this track was currently playing, stop it
  if (currentJukeboxIdx === idx && isJukeboxPlaying && currentJukeboxAudio) {
    currentJukeboxAudio.pause();
    isJukeboxPlaying = false;
    updateJukeboxUI({ title: 'Select a melody', artist: '' }, false);
    if (!isMuted) fadeTo(0.62);
  } else if (currentJukeboxIdx > idx) {
    currentJukeboxIdx--;
  }

  playlist.splice(idx, 1);
  saveStoredPlaylist(playlist);
  renderPlaylist();
};

function renderPlaylist() {
  const listEl = document.getElementById('playlist-items');
  if (!listEl) return;
  const playlist = getStoredPlaylist();

  if (!playlist.length) {
    listEl.innerHTML = `
      <div class="playlist-empty-state">
        <span>🎶</span>
        <p>No songs in the vault yet. Upload or add one above!</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = playlist.map((t, i) => `
    <div class="playlist-card${i === currentJukeboxIdx && isJukeboxPlaying ? ' active-track' : ''}">
      <div class="track-main">
        <div class="track-index">${i + 1}</div>
        <div class="track-meta">
          <h5 class="track-name">${t.title}</h5>
          <p class="track-by">${t.artist}</p>
          ${t.note ? `<span class="track-dedication">"${t.note}"</span>` : ''}
        </div>
      </div>
      <div class="track-actions">
        <button class="track-play-btn" onclick="playJukeboxTrack(${i})" title="Play this song">
          ${(i === currentJukeboxIdx && isJukeboxPlaying) ? '❚❚' : '▶'}
        </button>
        <button class="track-del-btn" onclick="deleteJukeboxTrack(${i}, event)" title="Remove this song from vault">
          ×
        </button>
      </div>
    </div>
  `).join('');
}

// ── 11:11 Wish Jar State ──────────────────────
const DEFAULT_WISHES_JAR = [
  { text: 'May your smile always remain as effortless and radiant as it is today. 🪻', time: '11:11 PM' },
  { text: 'Every wish for endless laughter, peace of mind, and dreams taking flight. ✨', time: '11:11 PM' }
];

function getStoredWishesJar() {
  try {
    const raw = localStorage.getItem('ritika_1111_wishes_jar');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_WISHES_JAR;
}

window.submitWishJar = () => {
  const input = document.getElementById('wish-jar-input');
  const text = (input?.value || '').trim();
  if (!text) {
    if (input) input.focus();
    return;
  }

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const wishes = getStoredWishesJar();
  wishes.unshift({ text, time });
  try {
    localStorage.setItem('ritika_1111_wishes_jar', JSON.stringify(wishes));
  } catch (e) {}

  if (input) input.value = '';
  renderWishJar();
  launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 70);
  heartRain(16);
};

function renderWishJar() {
  const list = document.getElementById('wishes-list');
  if (!list) return;
  const wishes = getStoredWishesJar();
  list.innerHTML = wishes.map(w => `
    <div class="wish-bubble">
      <span>⭐ ${w.text}</span>
      <span class="wish-bubble-time">${w.time}</span>
    </div>
  `).join('');
}

function initCapsuleSpace() {
  renderNotes();
  renderPlaylist();
  renderWishJar();
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
buildStages();
setupCover();
showScreen('screen-cover');
updateProgress();

} // end initApp

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
