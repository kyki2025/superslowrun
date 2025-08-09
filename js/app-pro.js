// 超慢跑 · 专业应用 - 轻量核心与交互
(function(){
  const cfg={min:100,max:300,initBpm:180,initMin:15,vol:0.65};
  const st={bpm:cfg.initBpm,running:false,vol:cfg.vol,sound:'click',timer:null,overlay:false,elapsed:0,duration:cfg.initMin*60,autoStart:false,stats:{sessions:0,totalSec:0,steps:0,avg:180,recent:[]}};
  let ac;
  function ensureAC(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}
  const sounds={click:{f:1200,d:0.08,type:'triangle'},beep:{f:800,d:0.1,type:'sine'},tick:{f:1000,d:0.05,type:'square'},bell:{f:600,d:0.2,type:'sine'},drum:{f:120,d:0.12,type:'sawtooth'}};
  function play(){if(!ac||st.vol===0) return;const s=sounds[st.sound]||sounds.click;try{const o=ac.createOscillator();const g=ac.createGain();o.connect(g);g.connect(ac.destination);o.frequency.setValueAtTime(s.f,ac.currentTime);o.type=s.type;g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(st.vol,ac.currentTime+0.01);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+s.d);o.start();o.stop(ac.currentTime+s.d);}catch(_){} }
  function tick(){play();const p=document.getElementById('pulse');if(p){p.classList.add('active');setTimeout(()=>p.classList.remove('active'),120);} }
  function startMetro(){if(st.running) return;ensureAC();if(ac&&ac.state==='suspended') ac.resume(); st.running=true; loop(); updMetroUI();}
  function loop(){if(!st.running) return; tick(); const iv=60000/st.bpm; st.timer=setTimeout(loop,iv);}
  function stopMetro(){st.running=false;clearTimeout(st.timer);st.timer=null;updMetroUI();}
  function setBpm(v){st.bpm=Math.max(cfg.min,Math.min(cfg.max,parseInt(v||0))); ui('#bpm').value=st.bpm; ui('#bpm-read').textContent=st.bpm; ui('#nowbpm').textContent=st.bpm; document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',parseInt(c.dataset.bpm)==st.bpm)); if(st.running){stopMetro();startMetro();} }
  function ui(sel){return document.querySelector(sel)}

  // Timer
  let exTimer=null,paused=false; function fmt(sec){sec=Math.max(0,sec|0);const m=Math.floor(sec/60),s=sec%60;return m+':'+String(s).padStart(2,'0');}
  function openOverlay(){st.overlay=true; ui('#overlay').style.display='flex'; updOverlay();}
  function closeOverlay(){st.overlay=false; ui('#overlay').style.display='none';}
  function updOverlay(){ui('#left').textContent=fmt(st.duration-st.elapsed); ui('#elapsed').textContent=fmt(st.elapsed); ui('#est').textContent=Math.round(st.elapsed*st.bpm/60); ui('#cal').textContent=Math.round(st.elapsed*0.05);}
  function startExercise(){if(st.overlay) return; st.elapsed=0; st.duration=(parseInt(ui('#mins').value)||cfg.initMin)*60; openOverlay(); if(!st.running){st.autoStart=true; startMetro();} tickExercise();}
  function tickExercise(){exTimer=setInterval(()=>{ if(paused) return; st.elapsed++; if(st.elapsed>=st.duration){ stopExercise(true); return;} updOverlay(); },1000);}
  function pauseExercise(){paused=!paused; ui('#btn-pause').textContent=paused?'继续':'暂停'; if(st.autoStart){ if(paused) stopMetro(); else startMetro(); }}
  function stopExercise(save){clearInterval(exTimer);exTimer=null; if(st.autoStart){stopMetro(); st.autoStart=false;} if(save){ const actual=st.elapsed; const steps=Math.round(actual*st.bpm/60); st.stats.sessions++; st.stats.totalSec+=actual; st.stats.steps+=steps; st.stats.avg=Math.round((st.stats.avg*0.7+st.bpm*0.3)); st.stats.recent.unshift({ts:Date.now(),sec:actual,bpm:st.bpm,steps}); st.stats.recent=st.stats.recent.slice(0,5); renderStats(); } closeOverlay();}

  // Stats render
  function renderStats(){ui('#s-count').textContent=st.stats.sessions; ui('#s-time').textContent=fmt(st.stats.totalSec); ui('#s-steps').textContent=st.stats.steps; ui('#s-bpm').textContent=st.stats.avg; const box=ui('#recent'); if(!box) return; box.innerHTML=st.stats.recent.map(r=>{const d=new Date(r.ts); const t=`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; return `<div class="item"><span>${t}</span><span>${fmt(r.sec)} · ${r.bpm} BPM · ${r.steps}步</span></div>`;}).join(''); save();}

  // Storage
  function save(){try{localStorage.setItem('ssr_pro',JSON.stringify({st,ver:1}));}catch(e){} }
  function load(){try{const d=JSON.parse(localStorage.getItem('ssr_pro')||'null'); if(d&&d.st){Object.assign(st,d.st); st.running=false; st.timer=null;}}catch(e){} }

  // UI bindings
  function bind(){
    document.querySelectorAll('.circle-btn').forEach(b=>b.addEventListener('click',()=>setBpm(st.bpm+parseInt(b.dataset.step))));
    document.querySelectorAll('#bpm-presets .chip').forEach(c=>c.addEventListener('click',()=>setBpm(parseInt(c.dataset.bpm))));
    ui('#btn-toggle').addEventListener('click',()=>{st.running?stopMetro():startMetro();});
    ui('#vol').addEventListener('input',e=>{st.vol=parseInt(e.target.value)/100; ui('#volp').textContent=Math.round(st.vol*100)+'%'; save();});
    document.querySelectorAll('#sound-select .sound').forEach(s=>s.addEventListener('click',()=>{document.querySelectorAll('#sound-select .sound').forEach(x=>x.classList.remove('active')); s.classList.add('active'); st.sound=s.dataset.sound; ui('#m-sound').textContent=s.textContent.trim(); play(); save();}));
    document.querySelectorAll('#time-presets .time').forEach(t=>t.addEventListener('click',()=>{document.querySelectorAll('#time-presets .time').forEach(x=>x.classList.remove('active')); t.classList.add('active'); ui('#mins').value=t.dataset.min; ui('#mins-label').textContent=t.dataset.min+' 分钟';}));
    ui('#mins').addEventListener('input',()=>{const v=Math.max(1,Math.min(999,parseInt(ui('#mins').value||'15'))); ui('#mins-label').textContent=v+' 分钟';});
    ui('#btn-start').addEventListener('click',startExercise); ui('#cta-start').addEventListener('click',()=>window.scrollTo({top:document.getElementById('timer-card').offsetTop-12,behavior:'smooth'}));
    ui('#btn-close').addEventListener('click',()=>stopExercise(false)); ui('#btn-stop').addEventListener('click',()=>stopExercise(true)); ui('#btn-pause').addEventListener('click',pauseExercise);
    document.addEventListener('keydown',e=>{if(e.code==='Space'&& !e.target.matches('input,textarea')){e.preventDefault(); st.running?stopMetro():startMetro();}});
  }

  function updMetroUI(){ui('#bpm-read').textContent=st.bpm; ui('#nowbpm').textContent=st.bpm; const btn=ui('#btn-toggle'); const state=ui('#m-state'); if(st.running){btn.classList.add('running'); btn.textContent='⏸'; state.textContent='正在播放';}else{btn.classList.remove('running'); btn.textContent='▶'; state.textContent='已停止';}}

  function init(){load(); setBpm(st.bpm); ui('#vol').value=st.vol*100; ui('#volp').textContent=Math.round(st.vol*100)+'%'; renderStats(); bind(); }
  document.addEventListener('DOMContentLoaded',init);
})();

