<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MixxClub Studio – Preview Launch</title>
<style>
  /* =========================
     THEME & ROOT VARIABLES
     ========================= */
  :root{ --mcx-white:#e9ecff; --mcx-bg:#0b0f16; --mcx-card:#111828; --edge:rgba(255,255,255,.08);
         --mcx-mag:#D06BFF; --mcx-cyan:#70E6FF; --text-dim:rgba(233,236,255,.75);
         --theme-glow1:#A76BFF; --theme-glow2:#70E6FF; --parx:0; --pary:0; }
  :root[data-theme="light"]{ --mcx-bg:#f6f7fb; --mcx-card:rgba(255,255,255,.58); --mcx-white:#0a0e18;
         --text-dim:rgba(10,14,24,.65); --edge:rgba(10,14,24,.08);
         --theme-glow1:#8A6BFF; --theme-glow2:#A5E6FF; }
  html,body{height:100%; margin:0; font-family:Inter, system-ui, -apple-system, Segoe UI, Roboto, "Plus Jakarta Sans", Arial, sans-serif; color:var(--mcx-white); background:var(--mcx-bg);
    transition: background-color 1s ease, color 1s ease; }
  .mcx-root{min-height:100%; display:flex; flex-direction:column;
    background:
      radial-gradient(1000px 500px at 70% -10%, color-mix(in oklab, var(--mcx-mag) 25%, transparent), transparent 70%),
      radial-gradient(900px 600px at 10% 110%, color-mix(in oklab, var(--mcx-cyan) 20%, transparent), transparent 60%),
      var(--mcx-bg);
  }
  .mcx-top{display:flex; align-items:center; gap:12px; padding:16px 18px; position:sticky; top:0; z-index:20;
    background:linear-gradient(180deg, rgba(0,0,0,.32), rgba(0,0,0,0)); backdrop-filter: blur(6px);}
  .mcx-title{font-weight:700; letter-spacing:.5px;}
  .mcx-sub{color:var(--text-dim); font-size:12px;}
  .spacer{flex:1}

  /* Buttons */
  .mcx-btn{border:1px solid var(--edge); background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
    color:var(--mcx-white); border-radius:12px; padding:8px 12px; cursor:pointer; outline:none;
    transition:box-shadow .4s ease, background .4s ease, transform .12s ease;}
  .mcx-btn:hover{box-shadow:0 0 16px color-mix(in srgb, var(--theme-glow1) 25%, transparent);}
  .mcx-btn:active{transform:scale(.96);}
  #themeCycle{position:relative; overflow:hidden;}
  #themeCycle::after{content:""; position:absolute; inset:-1px; border-radius:inherit;
    background: radial-gradient(circle at 30% 30%, var(--theme-glow1), var(--theme-glow2));
    opacity:0; filter:blur(6px); transition:opacity .6s ease;}
  #themeCycle.active::after{opacity:.35;}

  /* Power-up flash */
  @keyframes mcxPowerFlash { 0%{opacity:0} 10%{opacity:1} 50%{opacity:.4} 100%{opacity:0}}
  .mcx-power-flash{position:fixed; inset:0; pointer-events:none; z-index:9999;
    background: radial-gradient(circle at 50% 50%,
      color-mix(in srgb, var(--theme-glow1) 40%, transparent) 0%,
      color-mix(in srgb, var(--theme-glow2) 35%, transparent) 35%, transparent 70%);
    mix-blend-mode:screen; filter:blur(60px); animation:mcxPowerFlash 1s ease forwards;}

  /* Layout */
  .mcx-grid{display:grid; grid-template-columns: 360px 1fr 380px; gap:16px; padding:16px; align-items:start;}
  .mcx-card{background:linear-gradient(180deg,var(--mcx-card), color-mix(in srgb, var(--mcx-card) 60%, transparent));
    border:1px solid var(--edge); border-radius:16px; padding:14px; box-shadow:0 0 24px rgba(0,0,0,.2);}
  .mcx-card h3{margin:0 0 6px 0; font-size:14px; letter-spacing:.6px; text-transform:uppercase; color:var(--mcx-white);}
  .row{display:flex; gap:14px; flex-wrap:wrap;}
  .sep{height:1px; background:linear-gradient(90deg, transparent, var(--edge), transparent); margin:10px 0;}

  /* Knob + value */
  .knob{width:72px; display:flex; flex-direction:column; align-items:center; gap:6px;}
  .k-canvas{width:64px; height:64px; display:block;}
  .k-label{font-size:11px; color:var(--text-dim); text-transform:uppercase; letter-spacing:.06em;}
  .k-val{font-variant-numeric:tabular-nums; font-size:12px; opacity:.85;}

  /* Smooth toggle */
  .toggle{display:flex; align-items:center; gap:8px;}
  .tgl{width:46px; height:26px; background:rgba(255,255,255,.08); border:1px solid var(--edge); border-radius:99px; position:relative; cursor:pointer; transition:background .25s ease, box-shadow .25s ease;}
  .tgl::after{content:""; position:absolute; top:2px; left:2px; width:22px; height:22px; background:linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.6));
    border-radius:50%; transition:transform .25s cubic-bezier(.25,.1,.25,1), box-shadow .25s;}
  .tgl.active{background:linear-gradient(90deg, color-mix(in srgb, var(--theme-glow1) 40%, transparent), color-mix(in srgb, var(--theme-glow2) 40%, transparent)); box-shadow:0 0 18px color-mix(in srgb, var(--theme-glow2) 25%, transparent);}
  .tgl.active::after{transform:translateX(20px); box-shadow:0 0 12px color-mix(in srgb, var(--theme-glow2) 40%, transparent);}
  .tgl-label{font-size:12px; color:var(--text-dim);}

  /* MixxPort */
  .drop{border:1px dashed var(--edge); border-radius:12px; padding:16px; text-align:center; color:var(--text-dim);}
  .drop.hover{background:rgba(255,255,255,.06);}
  .filelist{margin-top:10px; max-height:160px; overflow:auto; font-size:12px;}
  .fileitem{display:flex; justify-content:space-between; padding:6px 8px; border-radius:8px; background:rgba(255,255,255,.04); margin-bottom:6px;}

  /* Version panel */
  .ver-list{max-height:220px; overflow:auto;}
  .ver-row{display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px; background:rgba(255,255,255,.05); border-radius:10px; margin-bottom:8px; font-size:12px;}
  .ver-row .actions{display:flex; gap:8px;}

  /* Meters */
  .meters{display:flex; gap:10px; align-items:flex-end; height:68px;}
  .bar{flex:1; background:rgba(255,255,255,.06); border:1px solid var(--edge); border-radius:8px; position:relative; overflow:hidden;}
  .bar .fill{position:absolute; bottom:0; left:0; right:0; height:20%; background:linear-gradient(180deg, var(--theme-glow1), var(--theme-glow2)); transition:height .1s linear;}
  .bar .label{position:absolute; top:4px; left:6px; font-size:11px; color:var(--text-dim);}

  /* Ripple overlay */
  .ripple-layer{position:fixed; inset:0; pointer-events:none; z-index:5; mix-blend-mode:screen; opacity:.22; display:none;}
  .ripple-layer.active{display:block;}
  .ripple-layer::before{content:""; position:absolute; inset:-20%; background:
    radial-gradient(800px 400px at 10% 120%, color-mix(in srgb, var(--theme-glow1) 25%, transparent), transparent 60%),
    radial-gradient(900px 500px at 90% -10%, color-mix(in srgb, var(--theme-glow2) 22%, transparent), transparent 65%);
    filter:blur(30px); opacity:.9; animation:drift 4s ease-in-out infinite alternate;}
  @keyframes drift{from{transform:translate(-10px,8px)} to{transform:translate(10px,-8px)}}

  /* Prime placeholder (MixxBot orb muted) */
  .orb{position:fixed; right:20px; bottom:20px; width:72px; height:72px; border-radius:50%;
    background:radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--theme-glow2) 60%, transparent), color-mix(in srgb, var(--theme-glow1) 40%, transparent) 60%, transparent 70%);
    box-shadow:0 0 28px color-mix(in srgb, var(--theme-glow2) 35%, transparent);
    opacity:.85; animation:orbBreath 1.2s ease-in-out infinite; filter:saturate(1.2) blur(.2px);}
  @keyframes orbBreath{0%{transform:scale(.98)} 50%{transform:scale(1.02)} 100%{transform:scale(.98)}}

  /* Tiny helpers */
  .muted{opacity:.6}
</style>
</head>
<body>
  <div class="mcx-root">
    <div class="mcx-top">
      <div class="mcx-title">MixxClub Studio <span class="mcx-sub">Preview Launch</span></div>
      <div class="spacer"></div>
      <button class="mcx-btn" id="themeCycle" title="Theme">🌀 Auto</button>
      <button class="mcx-btn" id="rippleBtn" title="Ripple Mode">Ripple: Off</button>
    </div>

    <div class="mcx-grid">
      <!-- LEFT: MixxPort (Upload / Transport) -->
      <div class="mcx-card" id="mixxport">
        <h3>MixxPort</h3>
        <div class="drop" id="drop">Drop audio here or click to select</div>
        <input type="file" id="fileInput" accept="audio/*" hidden />
        <div class="filelist" id="fileList"></div>
        <div class="sep"></div>
        <div class="row">
          <div class="knob" data-plugin="Port" data-param="gain" data-min="0" data-max="2" data-step="0.01">
            <canvas class="k-canvas"></canvas><div class="k-label">Input</div><div class="k-val">1.00</div>
          </div>
          <div class="knob" data-plugin="Port" data-param="width" data-min="-1" data-max="1" data-step="0.01">
            <canvas class="k-canvas"></canvas><div class="k-label">Width</div><div class="k-val">0.00</div>
          </div>
          <div class="toggle">
            <div class="tgl" id="normalizeTgl"></div><div class="tgl-label">Normalize</div>
          </div>
        </div>
        <div class="sep"></div>
        <div class="meters">
          <div class="bar"><div class="label">RMS</div><div class="fill" id="rmsFill"></div></div>
          <div class="bar"><div class="label">Peak</div><div class="fill" id="peakFill"></div></div>
          <div class="bar"><div class="label">LU-ish</div><div class="fill" id="lufsFill"></div></div>
        </div>
      </div>

      <!-- CENTER: Core Rack (EQ / Comp / Vintage) -->
      <div class="mcx-card">
        <h3>Core Rack</h3>
        <div class="row">
          <!-- EQ -->
          <div>
            <div class="mcx-sub">EQ (Band)</div>
            <div class="row">
              <div class="knob" data-plugin="EQ" data-param="freq" data-min="20" data-max="20000" data-step="1">
                <canvas class="k-canvas"></canvas><div class="k-label">Freq</div><div class="k-val">1000 Hz</div>
              </div>
              <div class="knob" data-plugin="EQ" data-param="gain" data-min="-15" data-max="15" data-step="0.1">
                <canvas class="k-canvas"></canvas><div class="k-label">Gain</div><div class="k-val">0.0 dB</div>
              </div>
              <div class="knob" data-plugin="EQ" data-param="q" data-min="0.1" data-max="18" data-step="0.1">
                <canvas class="k-canvas"></canvas><div class="k-label">Q</div><div class="k-val">1.0</div>
              </div>
            </div>
          </div>
          <!-- Comp -->
          <div>
            <div class="mcx-sub">Glue (Comp)</div>
            <div class="row">
              <div class="knob" data-plugin="Comp" data-param="threshold" data-min="-60" data-max="0" data-step="0.1">
                <canvas class="k-canvas"></canvas><div class="k-label">Thresh</div><div class="k-val">-24.0 dB</div>
              </div>
              <div class="knob" data-plugin="Comp" data-param="ratio" data-min="1" data-max="20" data-step="0.1">
                <canvas class="k-canvas"></canvas><div class="k-label">Ratio</div><div class="k-val">2.0:1</div>
              </div>
              <div class="knob" data-plugin="Comp" data-param="attack" data-min="0.001" data-max="1" data-step="0.001">
                <canvas class="k-canvas"></canvas><div class="k-label">Attack</div><div class="k-val">0.025 s</div>
              </div>
              <div class="knob" data-plugin="Comp" data-param="release" data-min="0.01" data-max="1" data-step="0.001">
                <canvas class="k-canvas"></canvas><div class="k-label">Release</div><div class="k-val">0.100 s</div>
              </div>
            </div>
          </div>
          <!-- Vintage -->
          <div>
            <div class="mcx-sub">Vintage (Drive)</div>
            <div class="row">
              <div class="knob" data-plugin="Vintage" data-param="drive" data-min="0" data-max="1" data-step="0.01">
                <canvas class="k-canvas"></canvas><div class="k-label">Drive</div><div class="k-val">0.00</div>
              </div>
              <div class="knob" data-plugin="Vintage" data-param="tone" data-min="-6" data-max="6" data-step="0.1">
                <canvas class="k-canvas"></canvas><div class="k-label">Tone</div><div class="k-val">0.0 dB</div>
              </div>
            </div>
          </div>
        </div>
        <div class="sep"></div>
        <!-- Send/Return -->
        <div class="row">
          <div>
            <div class="mcx-sub">Reverb Send</div>
            <div class="knob" data-plugin="Send" data-param="revSend" data-min="0" data-max="1" data-step="0.01">
              <canvas class="k-canvas"></canvas><div class="k-label">Amount</div><div class="k-val">0.00</div>
            </div>
          </div>
          <div>
            <div class="mcx-sub">Delay Send</div>
            <div class="knob" data-plugin="Send" data-param="dlySend" data-min="0" data-max="1" data-step="0.01">
              <canvas class="k-canvas"></canvas><div class="k-label">Amount</div><div class="k-val">0.00</div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Master & Versions -->
      <div class="mcx-card">
        <h3>Master Bus</h3>
        <div class="row">
          <div class="knob" data-plugin="Master" data-param="output" data-min="0" data-max="2" data-step="0.01">
            <canvas class="k-canvas"></canvas><div class="k-label">Output</div><div class="k-val">1.00</div>
          </div>
          <div class="knob" data-plugin="Master" data-param="ceiling" data-min="-1" data-max="0" data-step="0.01">
            <canvas class="k-canvas"></canvas><div class="k-label">Ceiling</div><div class="k-val">-0.2 dB</div>
          </div>
          <div class="knob" data-plugin="Master" data-param="target" data-min="-18" data-max="-8" data-step="0.1">
            <canvas class="k-canvas"></canvas><div class="k-label">LU Target</div><div class="k-val">-14.0</div>
          </div>
        </div>
        <div class="row" style="margin-top:6px;">
          <div class="toggle">
            <div class="tgl active" id="autoGainTgl"></div><div class="tgl-label">Auto-Gain</div>
          </div>
          <div class="toggle">
            <div class="tgl" id="switchyTgl"></div><div class="tgl-label">Power</div>
          </div>
        </div>
        <div class="sep"></div>
        <div class="row">
          <div class="toggle">
            <div class="tgl" id="rippleCycle"></div><div class="tgl-label">Ripple Mode (tap)</div>
          </div>
        </div>
        <div class="sep"></div>
        <h3>Versions</h3>
        <div class="row">
          <button class="mcx-btn" id="saveVersionBtn">Save Version</button>
          <button class="mcx-btn" id="restoreLastBtn">Restore Last</button>
        </div>
        <div class="ver-list" id="verList"></div>
      </div>
    </div>

    <div class="ripple-layer" id="rippleLayer"></div>
    <div class="orb muted" title="MixxBot (muted for this preview)"></div>
  </div>

<script>
/* ===========================================================
   MixxClub Studio – Preview Runtime
   Everything is self-contained and launches on load.
   Supabase hooks are optional; localStorage works out-of-box.
   =========================================================== */

/* ---------- 0) Utilities ---------- */
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const lerp = (a,b,t)=>a+(b-a)*t;
const now = ()=>performance.now();

/* ---------- 1) Sandboxed MixxCore (Event Bus + State) ---------- */
const MixxCore = (() => {
  const events = new EventTarget();
  const state = {
    userRole: 'artist',
    projectID: 'local-demo',
    version: 1,
    theme: 'auto',
    rippleMode: 0, // 0 off, 1 local, 2 global
    params: {
      Port:{gain:1, width:0, normalize:false},
      EQ:{freq:1000, gain:0, q:1},
      Comp:{threshold:-24, ratio:2, attack:.025, release:.1},
      Vintage:{drive:0, tone:0},
      Send:{revSend:0, dlySend:0},
      Master:{output:1, ceiling:-0.2, target:-14, autoGain:true, power:false}
    }
  };
  const meters = {rms:-24, peak:-24, lufs:-24};
  const system = {ctx:null, nodes:{}};
  return {events,state,meters,system};
})();

/* ---------- 2) Telemetry Collector ---------- */
const mixxTelemetry = (() => {
  const BUFFER_LIMIT = 50, SEND_INTERVAL = 500;
  let telemetryBuffer = [], lastSend = 0;
  function emit(plugin, params={}, metrics={}) {
    const packet = { plugin, type:'telemetry', params, metrics, timestamp: Date.now() };
    telemetryBuffer.push(packet); if (telemetryBuffer.length>BUFFER_LIMIT) telemetryBuffer.shift();
    const t = Date.now(); if (t-lastSend>SEND_INTERVAL) { lastSend=t;
      MixxCore.events.dispatchEvent(new CustomEvent('mixxbot:telemetry',{detail:packet}));
    }
  }
  return { emit, getBuffer:()=>telemetryBuffer, clear:()=>telemetryBuffer=[] };
})();

/* ---------- 3) Theme Cycle + Power Flash ---------- */
(function ThemeSystem(){
  const btn = document.getElementById('themeCycle');
  const root = document.documentElement;
  const modes = ['auto','dark','light'];
  function prefersDark(){ return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function apply(mode){
    let theme = mode; if (mode==='auto') theme = prefersDark() ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    localStorage.setItem('mixx_theme', mode);
    btn.textContent = (mode==='auto'?'🌀 Auto':(theme==='dark'?'🌙 Dark':'☀️ Light'));
    btn.classList.toggle('active', mode!=='auto');
    // flash
    const flash = document.createElement('div'); flash.className='mcx-power-flash';
    document.body.appendChild(flash); setTimeout(()=>flash.remove(), 1200);
  }
  const saved = localStorage.getItem('mixx_theme') || 'auto'; apply(saved);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{ if(localStorage.getItem('mixx_theme')==='auto') apply('auto'); });
  btn.addEventListener('click', ()=>{ const cur = localStorage.getItem('mixx_theme')||'auto';
    const next = modes[(modes.indexOf(cur)+1)%modes.length]; apply(next); });
})();

/* ---------- 4) Ripple Mode ---------- */
(function Ripple(){
  const btn = document.getElementById('rippleBtn');
  const tgl = document.getElementById('rippleCycle');
  const layer = document.getElementById('rippleLayer');
  function label(){ return ['Ripple: Off','Ripple: Local','Ripple: Global'][MixxCore.state.rippleMode]; }
  function apply(){
    btn.textContent = label();
    tgl.classList.toggle('active', MixxCore.state.rippleMode>0);
    layer.classList.toggle('active', MixxCore.state.rippleMode===2);
  }
  btn.addEventListener('click', ()=>{ MixxCore.state.rippleMode = (MixxCore.state.rippleMode+1)%3; apply(); });
  tgl.addEventListener('click', ()=>{ MixxCore.state.rippleMode = (MixxCore.state.rippleMode+1)%3; apply(); });
  apply();
})();

/* ---------- 5) Audio Graph ---------- */
async function ensureAudio(){
  if (MixxCore.system.ctx) return MixxCore.system.ctx;
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  const nodes = {};
  // Port
  nodes.portGain = ctx.createGain(); nodes.portGain.gain.value = MixxCore.state.params.Port.gain;
  nodes.panner = ctx.createStereoPanner(); nodes.panner.pan.value = MixxCore.state.params.Port.width;

  // EQ (single peaking)
  nodes.eq = ctx.createBiquadFilter(); nodes.eq.type = 'peaking';
  nodes.eq.frequency.value = MixxCore.state.params.EQ.freq;
  nodes.eq.gain.value = MixxCore.state.params.EQ.gain;
  nodes.eq.Q.value = MixxCore.state.params.EQ.q;

  // Comp
  nodes.comp = ctx.createDynamicsCompressor();
  const C = MixxCore.state.params.Comp;
  nodes.comp.threshold.value = C.threshold;
  nodes.comp.ratio.value = C.ratio;
  nodes.comp.attack.value = C.attack;
  nodes.comp.release.value = C.release;

  // Vintage (waveshaper + tone tilt)
  nodes.driveGain = ctx.createGain();
  nodes.shaper = ctx.createWaveShaper();
  nodes.tone = ctx.createBiquadFilter(); nodes.tone.type='peaking'; nodes.tone.frequency.value=3000; nodes.tone.Q.value=0.7;

  function updateShaper(amount){
    const k = amount*100; const n = 8192; const curve = new Float32Array(n);
    for (let i=0;i<n;i++){ const x = i*2/n-1; curve[i] = (1+k)*x/(1+k*Math.abs(x)); }
    nodes.shaper.curve = curve; nodes.shaper.oversample='4x';
  }
  updateShaper(MixxCore.state.params.Vintage.drive);

  // Sends
  nodes.split = ctx.createGain();
  nodes.revSend = ctx.createGain(); nodes.revSend.gain.value = MixxCore.state.params.Send.revSend;
  nodes.dlySend = ctx.createGain(); nodes.dlySend.gain.value = MixxCore.state.params.Send.dlySend;
  nodes.merge = ctx.createGain();

  // Reverb
  nodes.reverb = ctx.createConvolver(); nodes.revGain = ctx.createGain(); nodes.revGain.gain.value=.6;
  // simple generated IR
  function makeIR(seconds=2, decay=3){
    const rate = ctx.sampleRate, len = rate*seconds, buf = ctx.createBuffer(2,len,rate);
    for(let ch=0; ch<2; ch++){
      const d=buf.getChannelData(ch);
      for(let i=0;i<len;i++){ d[i] = (Math.random()*2-1)*Math.pow(1-i/len, decay); }
    }
    return buf;
  }
  nodes.reverb.buffer = makeIR(2.2, 2.8);

  // Delay
  nodes.delay = ctx.createDelay(1.0); nodes.delay.delayTime.value=.35;
  nodes.fb = ctx.createGain(); nodes.fb.gain.value=.35; nodes.dlyGain = ctx.createGain(); nodes.dlyGain.gain.value=.6;
  nodes.delay.connect(nodes.fb).connect(nodes.delay);

  // Master
  nodes.masterGain = ctx.createGain(); nodes.masterGain.gain.value = MixxCore.state.params.Master.output;
  nodes.softClip = ctx.createWaveShaper();
  (function updateSoftClip(ceilDb){
    const ceil = Math.pow(10, ceilDb/20); const n=8192, c=new Float32Array(n);
    for(let i=0;i<n;i++){ const x=i*2/n-1; c[i] = Math.tanh(x/ceil)*ceil; } nodes.softClip.curve=c;
  })(MixxCore.state.params.Master.ceiling);

  // Analyser
  nodes.an = ctx.createAnalyser(); nodes.an.fftSize=2048;

  // Build routing: source -> port -> eq -> comp -> drive -> tone -> split -> merge -> softclip -> master -> an -> out
  nodes.portGain.connect(nodes.panner).connect(nodes.eq).connect(nodes.comp).connect(nodes.driveGain).connect(nodes.shaper).connect(nodes.tone).connect(nodes.split);
  // dry to merge
  nodes.split.connect(nodes.merge);
  // sends
  nodes.split.connect(nodes.revSend).connect(nodes.reverb).connect(nodes.revGain).connect(nodes.merge);
  nodes.split.connect(nodes.dlySend).connect(nodes.delay).connect(nodes.dlyGain).connect(nodes.merge);
  // delay feedback already connected

  nodes.merge.connect(nodes.softClip).connect(nodes.masterGain).connect(nodes.an).connect(ctx.destination);

  MixxCore.system.ctx = ctx; MixxCore.system.nodes = nodes;
  return ctx;
}

/* ---------- 6) MixxPort: upload & playback ---------- */
(function MixxPort(){
  const drop = document.getElementById('drop');
  const fileInput = document.getElementById('fileInput');
  const list = document.getElementById('fileList');
  const normalizeTgl = document.getElementById('normalizeTgl');
  let sourceNode = null;
  let currentBuffer = null;

  const openPicker = ()=>fileInput.click();
  drop.addEventListener('click', openPicker);
  drop.addEventListener('dragover', e=>{e.preventDefault(); drop.classList.add('hover');});
  drop.addEventListener('dragleave', ()=>drop.classList.remove('hover'));
  drop.addEventListener('drop', async e=>{
    e.preventDefault(); drop.classList.remove('hover');
    const f = e.dataTransfer.files?.[0]; if (f) await handleFile(f);
  });
  fileInput.addEventListener('change', async e=>{
    const f = e.target.files?.[0]; if (f) await handleFile(f);
  });

  async function handleFile(file){
    await ensureAudio();
    const ctx = MixxCore.system.ctx;
    const arr = await file.arrayBuffer();
    const buf = await ctx.decodeAudioData(arr);
    currentBuffer = buf;

    // stop old source
    sourceNode?.stop?.(0);
    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = buf; sourceNode.loop = true;

    // peak detect for normalize preview
    let peak = 0; for (let ch=0; ch<buf.numberOfChannels; ch++){
      const d = buf.getChannelData(ch); for (let i=0;i<d.length;i++) peak = Math.max(peak, Math.abs(d[i]));
    }
    const normalGain = peak>0 ? 1/peak : 1;
    if (MixxCore.state.params.Port.normalize) MixxCore.system.nodes.portGain.gain.value = normalGain * MixxCore.state.params.Port.gain;

    sourceNode.connect(MixxCore.system.nodes.portGain);
    if (ctx.state === 'suspended') await ctx.resume();
    sourceNode.start();

    appendFileRow(file.name, normalGain);
    MixxCore.events.dispatchEvent(new CustomEvent('mixxFileChange',{detail:{type:'audio', name:file.name}}));
  }

  function appendFileRow(name, ng){
    const row = document.createElement('div'); row.className='fileitem';
    row.innerHTML = `<span>${name}</span><span>${MixxCore.state.params.Port.normalize?`Norm x${ng.toFixed(2)}`:'—'}</span>`;
    list.prepend(row);
  }

  // normalize toggle
  normalizeTgl.addEventListener('click', ()=>{
    normalizeTgl.classList.toggle('active');
    MixxCore.state.params.Port.normalize = normalizeTgl.classList.contains('active');
    if (currentBuffer){
      // re-evaluate gain
      let peak=0; for (let ch=0; ch<currentBuffer.numberOfChannels; ch++){
        const d=currentBuffer.getChannelData(ch); for(let i=0;i<d.length;i++) peak = Math.max(peak, Math.abs(d[i]));
      }
      const normalGain = peak>0 ? 1/peak : 1;
      const base = MixxCore.state.params.Port.gain;
      MixxCore.system.nodes.portGain.gain.cancelScheduledValues(0);
      MixxCore.system.nodes.portGain.gain.linearRampToValueAtTime((MixxCore.state.params.Port.normalize? normalGain*base : base), MixxCore.system.ctx.currentTime+.05);
    }
  });
})();

/* ---------- 7) Universal Rotary Knob ---------- */
(function Knobs(){
  const PIX = Math.PI;
  const els = [...document.querySelectorAll('.knob')];
  els.forEach(el=>{
    const cv = el.querySelector('.k-canvas'); const ctx = cv.getContext('2d');
    const valEl = el.querySelector('.k-val');
    const plugin = el.dataset.plugin, param = el.dataset.param;
    const min = parseFloat(el.dataset.min), max = parseFloat(el.dataset.max);
    const step = parseFloat(el.dataset.step) || 0.01;
    const arc = 270 * (Math.PI/180); const start = - (arc/2), end = arc/2;

    // initial value from state
    let v = MixxCore.state.params[plugin]?.[param] ?? 0;
    let dragging=false, lastY=0, vel=0, lastT=0;

    function format(v){
      if (param==='freq') return `${Math.round(v)} Hz`;
      if (param==='gain'||param==='tone') return `${v.toFixed(1)} dB`;
      if (param==='q') return v.toFixed(1);
      if (param==='threshold') return `${v.toFixed(1)} dB`;
      if (param==='ratio') return `${v.toFixed(1)}:1`;
      if (param==='attack'||param==='release') return `${v.toFixed(3)} s`;
      if (param==='target') return v.toFixed(1);
      return v.toFixed(2);
    }

    function draw(){
      const w=cv.width, h=cv.height, r=w/2 - 4; ctx.clearRect(0,0,w,h);
      ctx.save(); ctx.translate(w/2,h/2);

      // track
      ctx.beginPath(); ctx.lineWidth=10; ctx.strokeStyle='rgba(255,255,255,.08)';
      ctx.arc(0,0,r,start,end); ctx.stroke();

      // value
      const t = (v-min)/(max-min); const ang = start + t*arc;
      const grad = ctx.createConicGradient(start,0,0);
      grad.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--theme-glow1') || '#D06BFF');
      grad.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--theme-glow2') || '#70E6FF');
      ctx.beginPath(); ctx.lineWidth=10; ctx.strokeStyle=grad;
      ctx.arc(0,0,r,start,ang); ctx.stroke();

      // pointer
      ctx.save(); ctx.rotate(ang);
      ctx.beginPath(); ctx.lineWidth=3; ctx.strokeStyle='rgba(255,255,255,.9)';
      ctx.moveTo(0, -r+4); ctx.lineTo(0, -r+16); ctx.stroke(); ctx.restore();

      // center glow
      ctx.beginPath(); ctx.fillStyle='rgba(255,255,255,.08)'; ctx.arc(0,0,20,0,2*Math.PI); ctx.fill();
      ctx.restore();
      valEl.textContent = format(v);
    }

    function applyDSP(val){
      // state
      MixxCore.state.params[plugin][param] = val;
      // DSP mapping
      const N = MixxCore.system.nodes; if (!N) return;
      if (plugin==='Port' && param==='gain') N.portGain.gain.linearRampToValueAtTime(val, N.an.context.currentTime+.05);
      if (plugin==='Port' && param==='width') N.panner.pan.linearRampToValueAtTime(val, N.an.context.currentTime+.05);

      if (plugin==='EQ' && param==='freq') N.eq.frequency.linearRampToValueAtTime(val, N.an.context.currentTime+.05);
      if (plugin==='EQ' && param==='gain') N.eq.gain.linearRampToValueAtTime(val, N.an.context.currentTime+.05);
      if (plugin==='EQ' && param==='q') N.eq.Q.linearRampToValueAtTime(val, N.an.context.currentTime+.05);

      if (plugin==='Comp' && param==='threshold') N.comp.threshold.linearRampToValueAtTime(val, N.an.context.currentTime+.05);
      if (plugin==='Comp' && param==='ratio') N.comp.ratio.value = val;
      if (plugin==='Comp' && param==='attack') N.comp.attack.linearRampToValueAtTime(val, N.an.context.currentTime+.05);
      if (plugin==='Comp' && param==='release') N.comp.release.linearRampToValueAtTime(val, N.an.context.currentTime+.05);

      if (plugin==='Vintage' && param==='drive'){ // update waveshaper
        const k = val*100; const n=8192, c=new Float32Array(n);
        for(let i=0;i<n;i++){ const x=i*2/n-1; c[i] = (1+k)*x/(1+k*Math.abs(x)); } N.shaper.curve=c;
      }
      if (plugin==='Vintage' && param==='tone') N.tone.gain.linearRampToValueAtTime(val, N.an.context.currentTime+.05);

      if (plugin==='Send' && param==='revSend') N.revSend.gain.linearRampToValueAtTime(val, N.an.context.currentTime+.05);
      if (plugin==='Send' && param==='dlySend') N.dlySend.gain.linearRampToValueAtTime(val, N.an.context.currentTime+.05);

      if (plugin==='Master' && param==='output') N.masterGain.gain.linearRampToValueAtTime(val, N.an.context.currentTime+.05);
      if (plugin==='Master' && param==='ceiling'){ const ceil = Math.pow(10, val/20); const n=8192, c=new Float32Array(n);
        for(let i=0;i<n;i++){ const x=i*2/n-1; c[i] = Math.tanh(x/ceil)*ceil; } N.softClip.curve=c;
      }
      if (plugin==='Master' && param==='target'){ /* used by AGC below */ }

      // telemetry
      mixxTelemetry.emit(plugin, {...MixxCore.state.params[plugin]}, {...MixxCore.meters});
    }

    // pointer → value map
    function onDown(e){ dragging=true; lastY=(e.touches?e.touches[0].clientY:e.clientY); lastT=now(); e.preventDefault(); }
    function onMove(e){
      if(!dragging) return; const y=(e.touches?e.touches[0].clientY:e.clientY); const t=now();
      const dy = lastY - y; const dt = Math.max(1, t-lastT);
      const sens = (e.shiftKey? 0.2 : 1);
      let nv = clamp(v + (max-min)*dy/600 * sens, min, max);
      // quantize to step
      nv = Math.round(nv/step)*step;
      vel = (nv - v) / dt; v = nv; lastY=y; lastT=t;
      applyDSP(v); draw();
    }
    function onUp(){ dragging=false; /* inertia visual only */ }

    cv.addEventListener('mousedown', onDown); cv.addEventListener('touchstart', onDown, {passive:false});
    window.addEventListener('mousemove', onMove, {passive:false}); window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('mouseup', onUp); window.addEventListener('touchend', onUp);

    // dblclick reset
    cv.addEventListener('dblclick', ()=>{ let def = (min+max)/2;
      if (param==='gain'||param==='output'||param==='revSend'||param==='dlySend') def=1;
      if (param==='width'||param==='tone'||param==='EQ.gain'||param==='Vintage.tone'||param==='gain') def=0;
      if (param==='freq') def=1000;
      if (param==='q') def=1;
      if (param==='threshold') def=-24;
      if (param==='ratio') def=2;
      if (param==='attack') def=.025;
      if (param==='release') def=.1;
      if (param==='ceiling') def=-0.2;
      if (param==='target') def=-14;
      v=clamp(def,min,max); applyDSP(v); draw();
    });

    draw();
  });
})();

/* ---------- 8) Toggles: Power, Auto-Gain ---------- */
(function Toggles(){
  ensureAudio(); // prime context
  const N = ()=>MixxCore.system.nodes;
  const autoGain = document.getElementById('autoGainTgl');
  const power = document.getElementById('switchyTgl');

  autoGain.addEventListener('click', ()=>{
    autoGain.classList.toggle('active');
    MixxCore.state.params.Master.autoGain = autoGain.classList.contains('active');
  });

  power.addEventListener('click', ()=>{
    power.classList.toggle('active');
    MixxCore.state.params.Master.power = power.classList.contains('active');
    // visual flash already handled by theme button; here we can soft fade master
    if (N()){
      const g = N().masterGain.gain; const ctx = N().an.context;
      g.cancelScheduledValues(0);
      g.linearRampToValueAtTime(MixxCore.state.params.Master.power? MixxCore.state.params.Master.output : 0, ctx.currentTime + .2);
    }
  });
})();

/* ---------- 9) Meters + pseudo-LUFS ---------- */
(function MeterLoop(){
  let last = 0; function tick(ts){
    if (ts-last < 33) { requestAnimationFrame(tick); return; } last = ts;
    const N = MixxCore.system.nodes; if(!N) { requestAnimationFrame(tick); return; }
    // compute RMS/Peak quickly
    const buf = new Uint8Array(N.an.frequencyBinCount); N.an.getByteTimeDomainData(buf);
    let sum=0, pk=0; for (let i=0;i<buf.length;i++){ const x = (buf[i]-128)/128; sum += x*x; pk = Math.max(pk, Math.abs(x)); }
    const rms = Math.sqrt(sum/buf.length); const rmsDb = 20*Math.log10(rms+1e-6);
    const peakDb = 20*Math.log10(pk+1e-6);
    // rough LU-ish target estimator
    const lufs = rmsDb + 3.5; // simple offset to approximate perceived loudness

    MixxCore.meters.rms = rmsDb; MixxCore.meters.peak = peakDb; MixxCore.meters.lufs = lufs;

    // Auto-Gain towards target (-14)
    const M = MixxCore.state.params.Master;
    if (M.autoGain && M.power){
      const diff = (M.target - lufs); // if lufs higher than target, diff negative
      const desired = clamp(M.output * Math.pow(10, diff/20), 0, 2);
      const g = N.masterGain.gain; g.linearRampToValueAtTime(desired, N.an.context.currentTime + .08);
    }

    // UI bars
    const rmsFill = document.getElementById('rmsFill'), peakFill = document.getElementById('peakFill'), luFill = document.getElementById('lufsFill');
    const pct = v=>clamp((v+60)/60, 0, 1); // map -60..0 dB
    rmsFill.style.height = (pct(rmsDb)*100).toFixed(1)+'%';
    peakFill.style.height = (pct(peakDb)*100).toFixed(1)+'%';
    luFill.style.height = (pct(lufs)*100).toFixed(1)+'%';

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ---------- 10) Autosave / Recall / Versions (localStorage + hooks) ---------- */
(function Persistence(){
  const KEY = 'mixx_project_state';
  function saveSnapshot(label='Autosave'){
    const snap = {
      ts: Date.now(),
      label,
      project_id: MixxCore.state.projectID,
      version: ++MixxCore.state.version,
      plugin_states: JSON.parse(JSON.stringify(MixxCore.state.params)),
      meters: {...MixxCore.meters}
    };
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]'); arr.unshift(snap);
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0,50)));
    renderVersions(); return snap;
  }
  function loadLatest(){
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!arr.length) return;
    applySnapshot(arr[0]);
  }
  function applySnapshot(snap){
    MixxCore.state.params = JSON.parse(JSON.stringify(snap.plugin_states));
    // animate knobs visually by reassigning values through state + DSP
    const N = MixxCore.system.nodes; if (!N) return;
    // Apply each mapped param (reuse DSP mapping by dispatching synthetic changes)
    for (const [plugin, obj] of Object.entries(MixxCore.state.params)){
      for (const [param, val] of Object.entries(obj)){
        // directly call same DSP mapper via event (simplified)
        // (Reuse of knob code would require refs; we just set DSP targets here)
        if (plugin==='Port' && param==='gain') N.portGain.gain.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='Port' && param==='width') N.panner.pan.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='EQ' && param==='freq') N.eq.frequency.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='EQ' && param==='gain') N.eq.gain.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='EQ' && param==='q') N.eq.Q.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='Comp' && param==='threshold') N.comp.threshold.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='Comp' && param==='ratio') N.comp.ratio.value = val;
        if (plugin==='Comp' && param==='attack') N.comp.attack.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='Comp' && param==='release') N.comp.release.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='Vintage' && param==='drive'){ const k = val*100; const n=8192, c=new Float32Array(n);
          for(let i=0;i<n;i++){ const x=i*2/n-1; c[i] = (1+k)*x/(1+k*Math.abs(x)); } N.shaper.curve=c; }
        if (plugin==='Vintage' && param==='tone') N.tone.gain.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='Send' && param==='revSend') N.revSend.gain.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='Send' && param==='dlySend') N.dlySend.gain.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='Master' && param==='output') N.masterGain.gain.setTargetAtTime(val, N.an.context.currentTime, .08);
        if (plugin==='Master' && param==='ceiling'){ const ceil = Math.pow(10, val/20); const n=8192, c=new Float32Array(n);
          for(let i=0;i<n;i++){ const x=i*2/n-1; c[i] = Math.tanh(x/ceil)*ceil; } N.softClip.curve=c; }
      }
    }
  }
  function renderVersions(){
    const verList = document.getElementById('verList');
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    verList.innerHTML='';
    arr.slice(0,12).forEach(s=>{
      const row = document.createElement('div'); row.className='ver-row';
      const time = new Date(s.ts).toLocaleTimeString();
      row.innerHTML = `<div>v${s.version} · ${s.label} <span class="mcx-sub">(${time})</span></div>
                       <div class="actions">
                         <button class="mcx-btn mini" data-ver="${s.version}">Restore</button>
                       </div>`;
      row.querySelector('button').addEventListener('click', ()=>{
        applySnapshot(s); saveSnapshot(`Restored v${s.version}`); // create new head
      });
      verList.appendChild(row);
    });
  }
  // Schedule autosave every 60s while active
  setInterval(()=>saveSnapshot('Autosave'), 60000);

  document.getElementById('saveVersionBtn').addEventListener('click', ()=>saveSnapshot('Manual Save'));
  document.getElementById('restoreLastBtn').addEventListener('click', ()=>{
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]'); if (arr[1]) { applySnapshot(arr[1]); saveSnapshot(`Restored v${arr[1].version}`); }
  });

  // initial
  ensureAudio().then(loadLatest);
  renderVersions();

  // Expose minimal hooks to replace with Supabase later
  window.MIXX_SUPABASE = {
    pushSnapshot: (snap)=>{/* replace with RPC */},
    onStatus: (cb)=>{/* subscribe to realtime and call cb(payload) */}
  };
})();

/* ---------- 11) Kick context on first gesture ---------- */
window.addEventListener('click', ()=>ensureAudio(), {once:true});
</script>
</body>
</html>