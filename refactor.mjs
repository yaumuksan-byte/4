/**
 * Refactoring script for Terraria Ultra
 * 
 * Reads the original 25K-line "index (81).html" and produces a clean,
 * consolidated index.html with properly organized sections.
 */

import fs from 'fs';

const src = fs.readFileSync('index (81).html', 'utf8');
const lines = src.split('\n');

function extract(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join('\n');
}

/**
 * Extract JS code from a range, stripping any nested <script>/<\/script> tags
 * and HTML comments that would break the outer script block.
 */
function extractJS(startLine, endLine) {
  let code = lines.slice(startLine - 1, endLine).join('\n');
  // Remove nested script tags
  code = code.replace(/<\/?script[^>]*>/gi, '');
  // Remove HTML comments
  code = code.replace(/<!--[\s\S]*?-->/g, '');
  return code;
}

let out = '';

// ============================================================
// PART 1: HTML Head + CSS (lines 1-2139)
// ============================================================
out += extract(1, 2139);

// ============================================================
// PART 2: Consolidated Utility Module
// ============================================================
out += `
<script>
'use strict';
window.TU = window.TU || {};
const TU = window.TU;

// --- Error tracking ---
window.__TU_ERROR_COUNT__ = 0;
window.__TU_MAX_ERRORS__ = 100;
window.__TU_FATAL_ERROR__ = false;

window.onerror = function(msg, url, line, col, error) {
    window.__TU_ERROR_COUNT__++;
    console.error('[Error #' + window.__TU_ERROR_COUNT__ + ']', { msg, url, line, col, error });
    if (window.__TU_ERROR_COUNT__ > window.__TU_MAX_ERRORS__) {
        window.__TU_FATAL_ERROR__ = true;
        console.error('[CRITICAL] Error count exceeded threshold');
        if (window.game && typeof window.game.pause === 'function') window.game.pause();
    }
    return false;
};

window.addEventListener('unhandledrejection', function(event) {
    window.__TU_ERROR_COUNT__++;
    console.error('[Unhandled Rejection]', event.reason);
    event.preventDefault();
});

// --- Lean Math & Access Helpers ---
const SafeMath = {
    clamp(val, min, max) { return (typeof val !== 'number' || !isFinite(val)) ? min : (val < min ? min : val > max ? max : val); },
    clampInt(val, min, max) { return !Number.isInteger(val) ? min : (val < min ? min : val > max ? max : val); },
    toInt32(val) { const n = Number(val); return Number.isFinite(n) ? n | 0 : 0; }
};

const WorldAccess = {
    getTile(world, x, y, def = 0) {
        if (!world || !world.tiles) return def;
        x = x | 0; y = y | 0;
        if (x < 0 || x >= world.w || y < 0 || y >= world.h) return def;
        const col = world.tiles[x];
        return col ? (col[y] !== undefined ? col[y] : def) : def;
    },
    setTile(world, x, y, value) {
        if (!world || !world.tiles) return false;
        x = x | 0; y = y | 0;
        if (x < 0 || x >= world.w || y < 0 || y >= world.h) return false;
        const col = world.tiles[x]; if (!col) return false;
        col[y] = value; return true;
    },
    getLight(world, x, y, def = 0) {
        if (!world || !world.light) return def;
        x = x | 0; y = y | 0;
        if (x < 0 || x >= world.w || y < 0 || y >= world.h) return def;
        const col = world.light[x];
        return col ? (col[y] !== undefined ? col[y] : def) : def;
    },
    setLight(world, x, y, value) {
        if (!world || !world.light) return false;
        x = x | 0; y = y | 0;
        if (x < 0 || x >= world.w || y < 0 || y >= world.h) return false;
        const col = world.light[x]; if (!col) return false;
        col[y] = value; return true;
    }
};

const SafeJSON = {
    parse(str, def = null) { try { return JSON.parse(str); } catch { return def; } },
    stringify(obj, def = '{}') { try { return JSON.stringify(obj); } catch { return def; } }
};

// Global convenience (backward compat)
window.safeGet = (arr, idx, def) => (!arr || idx < 0 || idx >= arr.length) ? def : arr[idx];
window.safeGetProp = (obj, prop, def) => (obj && typeof obj === 'object') ? (obj[prop] !== undefined ? obj[prop] : def) : def;
window.safeJSONParse = SafeJSON.parse;
window.safeJSONStringify = SafeJSON.stringify;
window.clamp = (v, min, max) => Math.max(min, Math.min(max, v));
window.lerp = (a, b, t) => a + (b - a) * t;
window.worldGetTile = WorldAccess.getTile;
window.worldSetTile = WorldAccess.setTile;
window.worldGetLight = WorldAccess.getLight;
window.worldSetLight = WorldAccess.setLight;

window.TU_SAFE = { reportError(err, ctx) { console.error('[TU Error]', err, ctx); } };
window.TU_DEFENSIVE = { SafeMath, WorldAccess, SafeJSON };
window.TU_Defensive = window.TU_DEFENSIVE;
Object.assign(TU, { SafeMath, WorldAccess, SafeJSON });

// Loading timeout protection
(function() {
    const TIMEOUT = 30000;
    let start = Date.now(), lastP = 0, stuck = 0;
    const check = () => {
        const el = document.getElementById('loading');
        if (!el || el.style.display === 'none') return;
        const p = parseInt((document.getElementById('load-progress') || {}).style?.width || '0') || 0;
        if (p === lastP) stuck++; else { stuck = 0; lastP = p; }
        if (Date.now() - start > TIMEOUT || stuck > 10) {
            const s = document.getElementById('load-status');
            if (s) s.textContent = '加载遇到问题，请刷新页面重试';
            const c = document.querySelector('.loading-content');
            if (c && !document.getElementById('loading-retry-btn')) {
                const btn = document.createElement('button');
                btn.id = 'loading-retry-btn'; btn.textContent = '重试';
                btn.style.cssText = 'margin-top:20px;padding:10px 20px;font-size:16px;cursor:pointer;';
                btn.onclick = () => window.location.reload();
                c.appendChild(btn);
            }
        } else setTimeout(check, 1000);
    };
    setTimeout(check, 1000);
})();
</script>
`;

// Low-perf CSS
out += extract(2558, 2561);
out += '\n</head>\n';

// ============================================================
// PART 3: Core Modules (EventManager, RingBuffer, ParticlePool, PerfMonitor)
// ============================================================
out += `<script>
class EventManager {
    constructor() { this.listeners = []; this._destroyed = false; }
    add(target, event, handler, options) { if (this._destroyed) return; target.addEventListener(event, handler, options); this.listeners.push({target, event, handler, options}); }
    removeAll() { for (const {target, event, handler} of this.listeners) { try { target.removeEventListener(event, handler); } catch {} } this.listeners = []; }
    destroy() { this.removeAll(); this._destroyed = true; }
}
TU.EventManager = EventManager;

class RingBuffer {
    constructor(size) { this.size = size; this.buffer = new Array(size); this.head = 0; this.count = 0; }
    push(item) { this.buffer[this.head] = item; this.head = (this.head + 1) % this.size; if (this.count < this.size) this.count++; }
    get(index) { if (index < 0 || index >= this.count) return null; return this.buffer[(this.head - this.count + index + this.size) % this.size]; }
    clear() { this.head = 0; this.count = 0; }
}
window.RingBuffer = RingBuffer;

class ParticlePool {
    constructor(maxSize = 500) { this.maxSize = maxSize; this.pool = []; this.active = []; this._createPool(); }
    _createPool() { for (let i = 0; i < this.maxSize; i++) this.pool.push({x:0,y:0,vx:0,vy:0,life:0,maxLife:0,color:'',size:0,active:false}); }
    spawn(x,y,vx,vy,color,size,life) { let p = this.pool.length > 0 ? this.pool.pop() : (this.active.length > 0 ? this.active.shift() : null); if (!p) return null; p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.color=color;p.size=size;p.life=life;p.maxLife=life;p.active=true; this.active.push(p); return p; }
    update(dt) { for (let i=this.active.length-1;i>=0;i--) { const p=this.active[i]; p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt; if(p.life<=0){p.active=false;this.active.splice(i,1);this.pool.push(p);}} }
    render(ctx,camX,camY) { for(const p of this.active){ctx.globalAlpha=p.life/p.maxLife;ctx.fillStyle=p.color;ctx.fillRect(p.x-camX,p.y-camY,p.size,p.size);} ctx.globalAlpha=1; }
}
TU.ParticlePool = ParticlePool;

window.PERF_MONITOR = {
    frames: [], maxFrames: 60,
    record(ft) { this.frames.push(ft); if (this.frames.length > this.maxFrames) this.frames.shift(); },
    getAverageFPS() { return this.frames.length ? Math.round(1000 / (this.frames.reduce((a,b)=>a+b,0)/this.frames.length)) : 60; }
};
</script>
`;

// ============================================================
// PART 4: HTML Body elements
// ============================================================
out += extract(2716, 3165);

// ============================================================
// PART 5: All main JS code (utilities + class definitions)
// Each section in its own clean script block
// ============================================================

// 5a: Object pools, memory management, event utils, perf, texture cache, batch renderer, lazy loader
out += '<script>\n';
out += extractJS(3167, 3887);
out += '\n</script>\n';

// 5b: Utils, SafeAccess, DOM, UI_IDS, INPUT_KEYS (no PatchManager)
out += '<script>\n';
out += extractJS(3962, 4171);
// Add backdrop detection
out += `
(function() {
    try {
        const ok = !!(window.CSS && (CSS.supports('backdrop-filter: blur(1px)') || CSS.supports('-webkit-backdrop-filter: blur(1px)')));
        document.documentElement.classList.toggle('no-backdrop', !ok);
    } catch { document.documentElement.classList.add('no-backdrop'); }
})();
window.TU = window.TU || {};
`;
out += '\n</script>\n';

// 5c: GameSettings
out += '<script>\n';
out += extractJS(4222, 4390);
out += '\nwindow.TU = window.TU || {};\nObject.assign(window.TU, { GameSettings });\n';
out += '</script>\n';

// 5d: Toast
out += '<script>\n';
out += extractJS(4396, 4417);
out += '</script>\n';

// 5e: FullscreenManager
out += '<script>\n';
out += extractJS(4422, 4487);
out += '</script>\n';

// 5f: AudioManager + weather audio methods
out += '<script>\n';
out += extractJS(4491, 4610);
out += `
// --- Weather Audio (consolidated from weather_lighting_audio_sync_v1 patch) ---
AudioManager.prototype._makeLoopNoiseBuffer = function(seconds) {
    try {
        if (!this.ctx) return null;
        const ctx = this.ctx, sr = ctx.sampleRate || 44100;
        const len = Math.max(1, (sr * (seconds || 2)) | 0);
        const buf = ctx.createBuffer(1, len, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1);
        const fade = Math.min((sr * 0.02) | 0, (len / 2) | 0);
        for (let i = 0; i < fade; i++) { const t = i / fade; d[i] *= t; d[len - 1 - i] *= t; }
        return buf;
    } catch { return null; }
};

AudioManager.prototype._startRainSynth = function() {
    if (!this.ctx) return false;
    const ctx = this.ctx;
    if (ctx.state === 'suspended') return false;
    const st = this._rainSynth || (this._rainSynth = { active: false, dropAcc: 0 });
    if (st.active) return true;
    if (!st.buf) st.buf = this._makeLoopNoiseBuffer(2.0);
    if (!st.buf) return false;
    const src = ctx.createBufferSource(); src.buffer = st.buf; src.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 140;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
    const gain = ctx.createGain(); gain.gain.value = 0;
    src.connect(hp); hp.connect(lp); lp.connect(gain); gain.connect(ctx.destination);
    try { src.start(); } catch {}
    Object.assign(st, { src, hp, lp, gain, active: true, dropAcc: 0 });
    return true;
};

AudioManager.prototype._stopRainSynth = function() {
    const st = this._rainSynth;
    if (!st || !st.active) return;
    st.active = false;
    try { if (this.ctx && st.gain?.gain) { try { st.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08); } catch { st.gain.gain.value = 0; } } } catch {}
    const { src, hp, lp, gain } = st;
    st.src = st.hp = st.lp = st.gain = null;
    setTimeout(() => { try { src?.stop(); } catch {} try { src?.disconnect(); } catch {} try { hp?.disconnect(); } catch {} try { lp?.disconnect(); } catch {} try { gain?.disconnect(); } catch {} }, 520);
};

AudioManager.prototype.updateWeatherAmbience = function(dtMs, weather) {
    const wType = weather?.type || 'clear';
    const wInt = Number.isFinite(weather?.intensity) ? weather.intensity : 0;
    const wantRain = (wInt > 0.06) && (wType === 'rain' || wType === 'thunder');
    const thunder = (wType === 'thunder');
    if (!this.ctx || !this.enabled) return;
    const sv = Number.isFinite(this.settings?.sfxVolume) ? this.settings.sfxVolume : 0;
    if (sv <= 0.001) { if (this._rainSynth?.active) this._stopRainSynth(); return; }
    if (!wantRain) { if (this._rainSynth?.active) this._stopRainSynth(); return; }
    if (!this._startRainSynth()) return;
    const st = this._rainSynth;
    if (!st?.active || !this.ctx) return;
    const ctx = this.ctx, now = ctx.currentTime;
    const base = sv * (thunder ? 0.22 : 0.16);
    const targetVol = base * Math.min(1, Math.max(0, wInt));
    try { st.gain.gain.setTargetAtTime(targetVol, now, 0.08); } catch { st.gain.gain.value = targetVol; }
    try { st.hp.frequency.setTargetAtTime(110 + wInt * (thunder ? 260 : 200), now, 0.08); } catch {}
    try { st.lp.frequency.setTargetAtTime(2600 + wInt * (thunder ? 5200 : 4200), now, 0.08); } catch {}
    st.dropAcc = (st.dropAcc || 0) + (dtMs || 0);
    const rate = (thunder ? 3.2 : 2.2) + wInt * (thunder ? 7.0 : 5.0);
    const interval = 1000 / Math.max(0.8, rate);
    let fired = 0;
    while (st.dropAcc >= interval && fired < 4) {
        st.dropAcc -= interval; fired++;
        if (Math.random() < 0.35) continue;
        try { this.noise(0.018 + Math.random() * 0.03, (thunder ? 0.055 : 0.045) + wInt * 0.065); } catch {}
    }
};
`;
out += '</script>\n';

// 5g: SaveSystem
out += '<script>\n';
out += extractJS(4614, 4921);
out += '</script>\n';

// 5h: CONFIG, BLOCK, BLOCK_DATA, lookup tables
out += '<script>\n';
out += extractJS(5400, 5740);
out += '</script>\n';

// 5i: NoiseGenerator
out += '<script>\n';
out += extractJS(5746, 5808);
out += '</script>\n';

// 5j: TextureGenerator
out += '<script>\n';
out += extractJS(5814, 6432);
out += '</script>\n';

// 5k: Structures JSON + StructureLibrary + WorldGenerator
out += extractJS(6435, 6515); // JSON block
out += '\n<script>\n';
out += extractJS(6520, 8746);
out += '</script>\n';

// 5l: ParticleSystem
out += '<script>\n';
out += extractJS(8755, 8865);
out += '</script>\n';

// 5m: DroppedItem + DroppedItemManager
out += '<script>\n';
out += extractJS(8872, 9260);
out += '</script>\n';

// 5n: AmbientParticles
out += '<script>\n';
out += extractJS(9267, 9423);
out += '</script>\n';

// 5o: Player
out += '<script>\n';
out += extractJS(9430, 9884);
out += '</script>\n';

// 5p: TouchController
out += '<script>\n';
out += extractJS(9891, 10073);
out += '</script>\n';

// 5q: Renderer (+ mountain rendering)
out += '<script>\n';
out += extractJS(10078, 11155);
out += '</script>\n';

// 5r: CraftingSystem
out += '<script>\n';
out += extractJS(11162, 11336);
out += '</script>\n';

// 5s: UIFlushScheduler
out += '<script>\n';
out += extractJS(11339, 11391);
out += '</script>\n';

// 5t: QualityManager
out += '<script>\n';
out += extractJS(11394, 11724);
out += '</script>\n';

// 5u: UIManager
out += '<script>\n';
out += extractJS(11731, 12220);
out += '</script>\n';

// 5v: Minimap
out += '<script>\n';
out += extractJS(12225, 12339);
out += '</script>\n';

// 5w: UX overlay / wireUXUI
out += '<script>\n';
out += extractJS(12342, 12430);
out += '</script>\n';

// 5x: InventoryUI
out += '<script>\n';
out += extractJS(12434, 13214);
out += '</script>\n';

// 5y: InputManager
out += '<script>\n';
out += extractJS(13228, 13494);
out += '</script>\n';

// 5z: InventorySystem
out += '<script>\n';
out += extractJS(13501, 13587);
out += '</script>\n';

// 5aa: Game class
out += '<script>\n';
out += extractJS(13594, 14582);
out += '</script>\n';

// ============================================================
// PART 6: Patches (consolidated - each in own script block, cleaned)
// ============================================================

// Experience optimized v2
out += '<script>\n';
out += extractJS(14589, 15341);
out += '</script>\n';

// Loading guard patches
out += '<script>\n';
out += extractJS(15345, 15744);
out += '</script>\n';

// Chunk batching + SaveSystem IDB patch + DroppedItem anim
out += '<script>\n';
out += extractJS(15748, 16646);
out += '</script>\n';

// TileLogicEngine v12
out += '<script>\n';
out += extractJS(16650, 17864);
out += '</script>\n';

// Weather lighting audio sync
out += '<script>\n';
out += extractJS(17868, 18169);
out += '</script>\n';

// Weather canvas FX
out += '<script>\n';
out += extractJS(18173, 18895);
out += '</script>\n';

// Experience v3
out += '<script>\n';
out += extractJS(18899, 19086);
out += '</script>\n';

// Misc patches
out += '<script>\n';
out += extractJS(19090, 20956);
out += '</script>\n';

out += '<script>\n';
out += extractJS(20960, 20979);
out += '</script>\n';

out += '<script>\n';
out += extractJS(20983, 21306);
out += '</script>\n';

out += '<script>\n';
out += extractJS(21310, 21880);
out += '</script>\n';

out += '<script>\n';
out += extractJS(21884, 22856);
out += '</script>\n';

out += '<script>\n';
out += extractJS(22862, 22895);
out += '</script>\n';

out += '<script>\n';
out += extractJS(22899, 23546);
out += '</script>\n';

out += '<script>\n';
out += extractJS(23550, 24200);
out += '</script>\n';

out += '<script>\n';
out += extractJS(24204, 24519);
out += '</script>\n';

// ============================================================
// PART 7: Clean Bootstrap
// ============================================================
out += `
<script>
// ═══════════════════════════════════════════════════════════════════════
// Bootstrap - Single clean init flow
// ═══════════════════════════════════════════════════════════════════════
window.addEventListener('load', () => {
    try {
        const game = new Game();
        window.__GAME_INSTANCE__ = game;
        window.game = game;
        const p = game.init();
        if (p && typeof p.catch === 'function') {
            p.catch((e) => { console.error('[Boot] Init failed:', e); });
        }
    } catch (e) {
        console.error('[Boot] Failed:', e);
    }
});
</script>

<script>
// ═══════════════════════════════════════════════════════════════════════
// Cleanup & Health Check
// ═══════════════════════════════════════════════════════════════════════
(function() {
    'use strict';
    
    window.addEventListener('beforeunload', function() {
        if (window.TU && TU._worldWorkerClient && TU._worldWorkerClient.worker) {
            try { TU._worldWorkerClient.worker.terminate(); } catch {}
        }
        if (window.TU_Defensive && window.TU_Defensive.ResourceManager) {
            try { window.TU_Defensive.ResourceManager.disposeAll(); } catch {}
        }
    });

    setInterval(function() {
        const game = window.__GAME_INSTANCE__;
        if (!game) return;
        if (game.player && game.world) {
            const { x, y } = game.player;
            if (typeof x !== 'number' || typeof y !== 'number' || !isFinite(x) || !isFinite(y)) {
                console.error('[HealthCheck] Invalid player position, resetting');
                game.player.x = game.world.w * 16 / 2;
                game.player.y = game.world.h * 16 / 2;
            }
        }
        if (game._lastFrameTime && Date.now() - game._lastFrameTime > 10000) {
            console.error('[HealthCheck] Game loop appears frozen');
            if (typeof game.loop === 'function' && !game._rafRunning) {
                game._rafRunning = true;
                requestAnimationFrame((ts) => game.loop(ts));
            }
        }
    }, 30000);
})();
</script>

</body>
</html>
`;

fs.writeFileSync('index.html', out, 'utf8');

const lineCount = out.split('\n').length;
console.log(`Refactored file written: index.html (${lineCount} lines)`);

// Validate script blocks
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let match;
let blockNum = 0;
let errors = 0;

while ((match = scriptRegex.exec(out)) !== null) {
    blockNum++;
    const code = match[1].trim();
    if (!code || match[0].includes('type="application/json"')) continue;
    try {
        new Function(code);
    } catch (e) {
        errors++;
        const lineInFile = out.substring(0, match.index).split('\n').length;
        console.log(`  JS Error in block #${blockNum} (line ~${lineInFile}): ${e.message.substring(0, 100)}`);
    }
}

console.log(`Total script blocks: ${blockNum}, Syntax errors: ${errors}`);
