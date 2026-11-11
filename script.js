/* ============================================================
   script.js — MOON × Ritika  v3.0
   Full logic: audio, stages, photos, wishes, videos, final
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

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

let currentValidSong = (typeof CONFIG !== 'undefined' && CONFIG.stages?.[0]?.song) || 'assets/songs/song1.mp3';

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
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas(); window.addEventListener('resize', resizeCanvas);

function resetP(p) {
  p.x     = Math.random() * canvas.width;
  p.y     = canvas.height + 10;
  p.r     = Math.random() * 2.8 + 0.7;
  p.vx    = (Math.random() - 0.5) * 0.38;
  p.vy    = -(Math.random() * 0.55 + 0.18);
  p.alpha = Math.random() * 0.5 + 0.22;
  p.hue   = Math.floor(Math.random() * 80 + 270); // purples-pinks
}
for (let i = 0; i < 80; i++) {
  const p = {}; resetP(p); p.y = Math.random() * canvas.height;
  particles.push(p);
}
(function drawP() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.alpha -= 0.0009;
    if (p.alpha <= 0 || p.y < -10) resetP(p);
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue},78%,76%,${p.alpha})`;
    ctx.fill();
  });
  requestAnimationFrame(drawP);
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
  floatersEl.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const s   = document.createElement('span'); s.className = 'sticker';
    s.textContent = STICKERS[i % STICKERS.length];
    const left  = Math.random() * 94;
    const top   = Math.random() * 94;
    const dur   = (Math.random() * 6 + 4).toFixed(1);
    const delay = (Math.random() * 4).toFixed(1);
    const ty    = -(Math.random() * 44 + 10).toFixed(0);
    const rot0  = (Math.random() * 20 - 10).toFixed(0);
    const rot1  = (Math.random() * 20 - 10).toFixed(0);
    const sc    = (Math.random() * 0.4 + 0.88).toFixed(2);
    s.style.cssText = `left:${left}%;top:${top}%;--dur:${dur}s;--delay:${delay}s;--ty:${ty}px;--rot0:${rot0}deg;--rot1:${rot1}deg;--sc:${sc};`;
    floatersEl.appendChild(s);
  }
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
  document.querySelectorAll('video').forEach(v => v.pause());
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
  el.innerHTML = html;
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
  const ppp = Math.max(1, Math.ceil(pLen / sLen));
  const wpp = Math.ceil(wLen / sLen);

  CONFIG.stages.forEach((stage, si) => {
    const div = document.createElement('div');
    div.className = 'screen stage-screen';
    div.id = `screen-stage-${si}`;

    const photos = CONFIG.photos.slice(si * ppp, si * ppp + ppp);
    if (!photos.length) photos.push(CONFIG.photos[0]);

    const wishes = CONFIG.wishes.slice(si * wpp, si * wpp + wpp);
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
      <div class="stage-title-wrap">
        <span class="stage-emoji-big">${stage.emoji}</span>
        <h2 class="stage-title">${stage.title}</h2>
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
        <div class="video-grid" id="video-grid">
          ${CONFIG.videos.map((v, vi) => `
            <div class="video-card" id="vcard-${vi}">
              <div class="video-wrap">
                <video id="vid-${vi}" src="${v.src}" poster="${v.poster || ''}"
                  preload="metadata" playsinline webkit-playsinline
                  onerror="this.closest('.video-card').classList.add('vid-error')">
                </video>
                <div class="vid-overlay" id="voverlay-${vi}" onclick="toggleVideo(${vi})">
                  <div class="vid-play-btn">▶</div>
                </div>
              </div>
              <div class="video-label">${v.label}</div>
              <div class="video-caption">${v.caption}</div>
            </div>
          `).join('')}
        </div>
        <button class="next-stage-btn" onclick="goToStage(2)">Next Chapter ✨</button>
      `;
      container.appendChild(vdiv);
    }
  });
}

/* ══════════════════════════════════════════════
   VIDEO TOGGLE  (play / pause with audio duck)
══════════════════════════════════════════════ */
window.toggleVideo = vi => {
  const vid     = document.getElementById(`vid-${vi}`);
  const overlay = document.getElementById(`voverlay-${vi}`);
  if (!vid) return;

  if (vid.paused) {
    // Pause all other videos
    document.querySelectorAll('video').forEach((v, i) => {
      if (i !== parseInt(vi)) {
        v.pause();
        document.getElementById(`voverlay-${i}`)?.classList.remove('playing');
      }
    });
    if (!isMuted) fadeTo(0.14);
    vid.play().catch(() => {});
    overlay.classList.add('playing');
  } else {
    vid.pause();
    overlay.classList.remove('playing');
    if (!isMuted) fadeTo(0.62);
  }
};

// Restore music when video ends
document.addEventListener('ended', e => {
  if (e.target.tagName !== 'VIDEO') return;
  const vi = e.target.id.replace('vid-', '');
  document.getElementById(`voverlay-${vi}`)?.classList.remove('playing');
  if (!isMuted) fadeTo(0.62);
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
  currentStageIndex = idx;
  const stage = CONFIG.stages[idx];
  if (!stage) return;
  document.body.className = stage.theme || 'theme-blush';
  if (stage.song) {
    const isSame = audio.src && (audio.src.endsWith(stage.song) || audio.src === stage.song);
    if (!isSame) {
      loadSong(stage.song);
    } else {
      if (!isMuted && audio.volume < 0.2) fadeTo(0.62);
      if (audio.paused) audio.play().catch(() => {});
    }
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
  currentStageIndex = 'videos';
  document.body.className = 'theme-lavender';
  showScreen('screen-videos');
  buildStickers();
  buildChapterPills();
  updateProgress();
};

/* ══════════════════════════════════════════════
   FINAL SCREEN
══════════════════════════════════════════════ */
window.goToFinal = () => {
  if (wishAutoTimer) clearInterval(wishAutoTimer);
  currentStageIndex = CONFIG.stages.length + 1;
  document.body.className = 'theme-blush';
  // Replay first song softly on the final screen
  if (CONFIG.stages[0]?.song) loadSong(CONFIG.stages[0].song);

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
   COVER FLOATING EMOJIS + SHOOTING STARS
══════════════════════════════════════════════ */
function setupCover() {
  animateCoverName();
  const tagEl = document.querySelector('.cover-glass-badge');
  if (tagEl && CONFIG.coverTagline) tagEl.textContent = CONFIG.coverTagline;
  const coverEl = document.getElementById('screen-cover');
  const floats  = ['💜','🌸','✨','💫','🌷','🦋','⭐','💝','🎀','💖','🌈','🍀','🪻','👑','🌹','🌙'];
  const positions = [
    {top:'6%',left:'4%'},{top:'9%',right:'5%'},
    {top:'24%',left:'1.5%'},{top:'22%',right:'1.5%'},
    {top:'50%',left:'2%'},{top:'55%',right:'3%'},
    {top:'75%',left:'5%'},{top:'73%',right:'5%'},
    {top:'40%',left:'0%'},{top:'42%',right:'0%'},
    {top:'87%',left:'36%'},{top:'3%',left:'41%'},
    {top:'16%',left:'28%'},{top:'83%',right:'28%'},
    {top:'64%',left:'2%'},{top:'62%',right:'2%'},
  ];
  floats.forEach((em, i) => {
    const el  = document.createElement('div');
    el.className = 'float-emoji'; el.textContent = em;
    const p   = positions[i] || { top:`${8+Math.random()*80}%`, left:`${4+Math.random()*88}%` };
    const dur = (3.5 + Math.random() * 3.5).toFixed(1);
    const delay = (Math.random() * 2.5).toFixed(1);
    const tx  = ((Math.random() - .5) * 42).toFixed(0);
    const ty  = -(22 + Math.random() * 32).toFixed(0);
    const tx2 = ((Math.random() - .5) * 30).toFixed(0);
    const ty2 = (Math.random() * 22).toFixed(0);
    el.style.cssText = Object.entries(p).map(([k, v]) => `${k}:${v}`).join(';') +
      `;--dur:${dur}s;--delay:${delay}s;--tx:${tx}px;--ty:${ty}px;--tx2:${tx2}px;--ty2:${ty2}px;`;
    coverEl.appendChild(el);
  });

  // Periodic shooting stars on the cover
  setInterval(() => {
    if (started) return;
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.cssText = `top:${Math.random() * 45}%;left:${Math.random() * 55}%;--dur:${1 + Math.random() * 0.9}s;--delay:0s;`;
    document.getElementById('screen-cover')?.appendChild(star);
    setTimeout(() => star.remove(), 2200);
  }, 3800);
}

/* ══════════════════════════════════════════════
   OPEN BUTTON  — the magic tap
══════════════════════════════════════════════ */
document.getElementById('open-btn').addEventListener('click', e => {
  if (started) return;
  started = true;
  if (nicknameTimer) clearInterval(nicknameTimer);

  launchConfetti(e.clientX, e.clientY, 120);
  sparkleRing(e.clientX, e.clientY);

  if (CONFIG.stages[0]?.song) {
    startAudio(CONFIG.stages[0].song);
  }

  setTimeout(() => {
    goToStage(0);
    muteBtn.classList.add('visible');
  }, 680);
});

// Gift-box mini-burst on the cover even before tap
document.getElementById('gift-wrap')?.addEventListener('click', e => {
  if (!started) launchConfetti(e.clientX, e.clientY, 45);
});

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
   INIT
══════════════════════════════════════════════ */
buildStages();
setupCover();
showScreen('screen-cover');
updateProgress();

}); // end DOMContentLoaded
