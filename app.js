// ========== STATE ==========
const state = {
  user: JSON.parse(localStorage.getItem('fc_user') || 'null'),
  day: 12, streak: 12, disciplineScore: 87,
  weight: [82.6,82.1,81.5,81.0,80.5,80.2,79.8,79.5,79.2,79.0,78.7,78.4],
  sessionsCompleted: 18, sessionsTarget: 20
};

const exercises = [
  // Pectoraux / Triceps
  {name:'Développé couché',detail:'4 séries x 8-10 reps',icon:'🏋️',equip:'gym'},
  {name:'Développé incliné',detail:'4 séries x 10 reps',icon:'💪',equip:'gym'},
  {name:'Écartés couché',detail:'3 séries x 12 reps',icon:'🦋',equip:'dumbbells'},
  {name:'Pompes (Push-ups)',detail:'3 séries x Max',icon:'🔥',equip:'none'},
  {name:'Dips',detail:'3 séries x 12 reps',icon:'⚡',equip:'none'},
  {name:'Extensions Triceps',detail:'3 séries x 15 reps',icon:'💪',equip:'dumbbells'},
  // Dos / Biceps
  {name:'Tirage vertical',detail:'4 séries x 10 reps',icon:'🦍',equip:'gym'},
  {name:'Rowing barre',detail:'4 séries x 8 reps',icon:'🚣',equip:'gym'},
  {name:'Tractions (Pull-ups)',detail:'3 séries x Max',icon:'🧗',equip:'none'},
  {name:'Tirage horizontal',detail:'3 séries x 12 reps',icon:'🛶',equip:'gym'},
  {name:'Rowing haltères',detail:'3 séries x 12 reps',icon:'🚣',equip:'dumbbells'},
  {name:'Curl Biceps barre',detail:'3 séries x 12 reps',icon:'💪',equip:'gym'},
  {name:'Curl marteau',detail:'3 séries x 15 reps',icon:'🔨',equip:'dumbbells'},
  // Jambes
  {name:'Squat barre',detail:'4 séries x 8 reps',icon:'🦵',equip:'gym'},
  {name:'Presse à cuisses',detail:'4 séries x 10 reps',icon:'🧱',equip:'gym'},
  {name:'Goblet Squat',detail:'4 séries x 12 reps',icon:'🏋️',equip:'dumbbells'},
  {name:'Fentes marchées',detail:'3 séries x 20 pas',icon:'🚶‍♂️',equip:'none'},
  {name:'Leg Extension',detail:'3 séries x 15 reps',icon:'🦵',equip:'gym'},
  {name:'Leg Curl',detail:'3 séries x 15 reps',icon:'🦵',equip:'gym'},
  {name:'Mollets debout',detail:'4 séries x 20 reps',icon:'🦶',equip:'none'},
  // Épaules
  {name:'Développé militaire',detail:'4 séries x 10 reps',icon:'🏋️',equip:'gym'},
  {name:'Développé haltères',detail:'4 séries x 10 reps',icon:'🏋️',equip:'dumbbells'},
  {name:'Élévations latérales',detail:'4 séries x 15 reps',icon:'🦅',equip:'dumbbells'},
  {name:'Oiseau (Face pull)',detail:'3 séries x 15 reps',icon:'🦉',equip:'gym'},
  {name:'Shrugs',detail:'3 séries x 15 reps',icon:'🤷‍♂️',equip:'dumbbells'},
  // Core / Cardio
  {name:'Gainage (Planche)',detail:'3 séries x 45 sec',icon:'🧱',equip:'none'},
  {name:'Crunch poulie',detail:'3 séries x 15 reps',icon:'🍫',equip:'gym'},
  {name:'Crunch au sol',detail:'3 séries x 20 reps',icon:'🍫',equip:'none'},
  {name:'Jumping Jacks',detail:'Circuit 45 sec',icon:'🤸',equip:'none'},
  {name:'Mountain Climbers',detail:'Circuit 45 sec',icon:'⛰️',equip:'none'},
  {name:'Burpees',detail:'Circuit 45 sec',icon:'🤢',equip:'none'}
];

const coachReplies = [
  "Merci de me le dire 🏃\nJe vais adapter ta séance aujourd'hui pour que tu restes efficace sans te surmener.",
  "C'est normal d'avoir des jours comme ça. L'important c'est d'être là ! 💪",
  "Je comprends. On va ajuster l'intensité. Ta santé passe avant tout. 🙏",
  "Super état d'esprit ! On va en profiter pour pousser un peu plus aujourd'hui ! 🔥",
  "Pas de souci, je te propose une séance adaptée. Chaque petit effort compte !"
];

const onboardingSteps = [
  {q:'Quel est ton objectif ?',sub:'Choisis celui qui te correspond le mieux',opts:[
    {emoji:'🔥',text:'Perte de poids'},{emoji:'💪',text:'Prise de masse'},{emoji:'⚡',text:'Recomposition corporelle'}
  ],key:'goal'},
  {q:'Quel est ton niveau ?',sub:'Sois honnête, on s\'adapte à toi',opts:[
    {emoji:'🌱',text:'Débutant'},{emoji:'📈',text:'Intermédiaire'},{emoji:'🏆',text:'Avancé'}
  ],key:'level'},
  {q:'Tes informations',sub:'Pour personnaliser ton programme',type:'form',fields:[
    {label:'Prénom',key:'name',type:'text',placeholder:'Ton prénom'},
    {label:'Âge',key:'age',type:'number',placeholder:'25'},
    {label:'Taille (cm)',key:'height',type:'number',placeholder:'175'},
    {label:'Poids (kg)',key:'weight',type:'number',placeholder:'82'}
  ]},
  {q:'Fréquence d\'entraînement ?',sub:'Combien de fois par semaine',opts:[
    {emoji:'2️⃣',text:'2 fois/semaine'},{emoji:'3️⃣',text:'3 fois/semaine'},
    {emoji:'4️⃣',text:'4 fois/semaine'},{emoji:'5️⃣',text:'5-6 fois/semaine'}
  ],key:'frequency'},
  {q:'Accès matériel ?',sub:'On adapte ton programme',opts:[
    {emoji:'🏠',text:'Maison (sans matériel)'},{emoji:'🏠',text:'Maison (avec haltères)'},
    {emoji:'🏋️',text:'Salle de sport'}
  ],key:'equipment'},
  {q:'Ta motivation actuelle ?',sub:'Aucun jugement, on s\'adapte',opts:[
    {emoji:'😴',text:'Faible'},{emoji:'🙂',text:'Moyenne'},{emoji:'🔥',text:'Élevée'}
  ],key:'motivation'}
];

let onbStep = 0, onbData = {};

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  if (!state.user) { renderOnboarding(); }
  else { document.getElementById('onboarding').classList.add('hidden'); initApp(); }
});

function initApp() {
  if (state.user?.name) {
    document.getElementById('profile-name').textContent = state.user.name;
  }
  renderExercises();
  drawProgressRing('today-ring', 13, 50, 'var(--green)', '13%');
  drawMiniRing('nut-ring-p', 75, 'var(--green)', 'P');
  drawMiniRing('nut-ring-g', 60, 'var(--orange)', 'G');
  drawMiniRing('nut-ring-l', 45, 'var(--purple)', 'L');
  drawNutritionRing();
  drawDisciplineArc();
  drawWeightChart();
}

// ========== ONBOARDING ==========
function renderOnboarding() {
  const prog = document.getElementById('onb-progress');
  prog.innerHTML = onboardingSteps.map((_, i) =>
    `<div class="onboarding-progress-bar ${i < onbStep ? 'done' : i === onbStep ? 'active' : ''}"></div>`
  ).join('');

  const c = document.getElementById('onb-content');
  const s = onboardingSteps[onbStep];
  if (!s) { finishOnboarding(); return; }

  let html = `<div class="onboarding-question">${s.q}</div><div class="onboarding-sub">${s.sub}</div><div class="onboarding-options">`;
  if (s.type === 'form') {
    s.fields.forEach(f => {
      html += `<div style="margin-bottom:4px"><label class="text-sm text-dim">${f.label}</label>
        <input class="onboarding-input" type="${f.type}" placeholder="${f.placeholder}" data-key="${f.key}"
        value="${onbData[f.key]||''}"></div>`;
    });
  } else {
    s.opts.forEach((o, i) => {
      const sel = onbData[s.key] === o.text ? 'selected' : '';
      html += `<div class="onboarding-option ${sel}" onclick="selectOption('${s.key}','${o.text}',this)">
        <span class="emoji">${o.emoji}</span><span>${o.text}</span></div>`;
    });
  }
  html += '</div>';
  
  // Add developer fast-track buttons on step 0
  if (onbStep === 0) {
    html += `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--glass-border);">
      <div class="text-xs text-dim mb-8" style="text-align:center;">MODE DÉVELOPPEUR : CONNEXION RAPIDE</div>
      <button class="btn btn-outline w-full mb-8" style="font-size:12px; padding: 8px;" onclick="demoLogin('Maison (sans matériel)')">Démo Sans Matériel</button>
      <button class="btn btn-outline w-full mb-8" style="font-size:12px; padding: 8px;" onclick="demoLogin('Maison (avec haltères)')">Démo Avec Haltères</button>
      <button class="btn btn-outline w-full" style="font-size:12px; padding: 8px;" onclick="demoLogin('Salle de sport')">Démo Salle de Sport</button>
    </div>`;
  }
  
  c.innerHTML = html;
  document.getElementById('onb-next').textContent = onbStep === onboardingSteps.length - 1 ? 'Commencer 🚀' : 'Continuer';
}

function demoLogin(equip) {
  onbData = {
    goal: "Perte de poids",
    level: "Intermédiaire",
    name: "Mamadou (Test)",
    age: "28",
    height: "180",
    weight: "85",
    frequency: "3 fois/semaine",
    equipment: equip,
    motivation: "Élevée"
  };
  finishOnboarding();
}

function selectOption(key, val, el) {
  onbData[key] = val;
  el.parentElement.querySelectorAll('.onboarding-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function nextOnboarding() {
  const s = onboardingSteps[onbStep];
  if (s?.type === 'form') {
    document.querySelectorAll('.onboarding-input').forEach(inp => { onbData[inp.dataset.key] = inp.value; });
  }
  if (s && !s.type && !onbData[s.key]) return;
  onbStep++;
  if (onbStep >= onboardingSteps.length) { finishOnboarding(); return; }
  renderOnboarding();
}

function finishOnboarding() {
  state.user = { ...onbData };
  localStorage.setItem('fc_user', JSON.stringify(state.user));
  document.getElementById('onboarding').classList.add('hidden');
  initApp();
}

// ========== NAVIGATION ==========
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach((n, i) => {
    const screens = ['screen-today','screen-training','screen-nutrition','screen-progress','screen-profile'];
    n.classList.toggle('active', screens[i] === id);
  });
  window.scrollTo(0, 0);
}

function openCoach() { document.getElementById('overlay-coach').classList.remove('hidden'); document.getElementById('fab-coach').style.display='none'; }
function openQuickWorkout() { document.getElementById('overlay-quick').classList.remove('hidden'); }
function openPaywall() { document.getElementById('overlay-paywall').classList.remove('hidden'); }
function closeOverlay(id) { document.getElementById(id).classList.add('hidden'); document.getElementById('fab-coach').style.display=''; }

// ========== EXERCISES ==========
function playVideo(name) {
  document.getElementById('video-title').innerText = name;
  document.getElementById('modal-video').classList.remove('hidden');
}

function renderExercises() {
  const el = document.getElementById('exercise-list');
  let allowedEquip = ['none'];
  const userEquip = state.user?.equipment || 'Maison (sans matériel)';
  
  if (userEquip === 'Maison (avec haltères)') allowedEquip = ['none', 'dumbbells'];
  if (userEquip === 'Salle de sport') allowedEquip = ['none', 'dumbbells', 'gym'];

  // Filter exercises
  let filteredExercises = exercises.filter(e => allowedEquip.includes(e.equip));
  
  // Pick 5 random or first 5 for the daily workout to not show 30 items
  // Simple randomization for demo
  filteredExercises = filteredExercises.sort(() => 0.5 - Math.random()).slice(0, 5);

  // Store them so live workout uses the right ones
  window.currentDailyWorkout = filteredExercises;

  el.innerHTML = filteredExercises.map((e, i) => `
    <div class="exercise-item" onclick="playVideo('${e.name.replace(/'/g, "\\'")}')">
      <div class="exercise-num">${i+1}</div>
      <div class="exercise-info"><div class="exercise-name">${e.name}</div><div class="exercise-detail">${e.detail}</div></div>
      <div class="video-thumbnail">
        <div class="play-icon">▶</div>
      </div>
    </div>`).join('');
}

// ========== CHAT ==========
function sendChat() {
  const inp = document.getElementById('chat-input');
  const msg = inp.value.trim();
  if (!msg) return;
  const box = document.getElementById('chat-messages');
  box.innerHTML += `<div class="chat-bubble user">${msg}<div class="chat-time" style="color:rgba(0,0,0,.5)">${new Date().toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit'})}</div></div>`;
  inp.value = '';
  setTimeout(() => {
    const reply = coachReplies[Math.floor(Math.random() * coachReplies.length)];
    box.innerHTML += `<div class="chat-bubble coach">${reply}<div class="chat-time">${new Date().toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit'})}</div></div>`;
    box.scrollTop = box.scrollHeight;
  }, 800 + Math.random() * 800);
  box.scrollTop = box.scrollHeight;
}

// ========== DRAWING ==========
function drawProgressRing(id, pct, size, color, label) {
  const el = document.getElementById(id);
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  el.innerHTML = `<svg width="${size}" height="${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="5"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="5"
      stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pct/100)}" stroke-linecap="round"/>
  </svg><span class="progress-ring-text" style="color:${color}">${label}</span>`;
}

function drawMiniRing(id, pct, color, label) {
  const el = document.getElementById(id);
  const s = 36, r = 13, c = 2 * Math.PI * r;
  el.innerHTML = `<svg width="${s}" height="${s}">
    <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>
    <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="${color}" stroke-width="3"
      stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pct/100)}" stroke-linecap="round"/>
  </svg><span class="progress-ring-text" style="font-size:9px;color:${color}">${label}</span>`;
}

function drawNutritionRing() {
  const cv = document.getElementById('nutrition-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d'), cx = 110, cy = 110, r = 95, lw = 12;
  ctx.clearRect(0, 0, 220, 220);
  const segs = [{pct:.4,color:'#B6FF3B'},{pct:.35,color:'#F97316'},{pct:.25,color:'#8B5CF6'}];
  let start = -Math.PI / 2;
  segs.forEach(s => {
    const end = start + s.pct * 2 * Math.PI;
    ctx.beginPath(); ctx.arc(cx, cy, r, start, end); ctx.strokeStyle = s.color;
    ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
    start = end + 0.04;
  });
}

function drawDisciplineArc() {
  const cv = document.getElementById('discipline-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d'), cx = 80, cy = 80, r = 70, lw = 10;
  ctx.clearRect(0, 0, 160, 160);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0.8 * Math.PI, 2.2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = lw; ctx.stroke();
  const pct = state.disciplineScore / 100;
  const range = 1.4 * Math.PI;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0.8 * Math.PI, 0.8 * Math.PI + range * pct);
  const grad = ctx.createLinearGradient(0, 0, 160, 160);
  grad.addColorStop(0, '#B6FF3B'); grad.addColorStop(1, '#06B6D4');
  ctx.strokeStyle = grad; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
}

function drawWeightChart() {
  const cv = document.getElementById('weight-chart');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const w = cv.parentElement.clientWidth, h = 180;
  cv.width = w * 2; cv.height = h * 2; cv.style.width = w + 'px'; cv.style.height = h + 'px';
  ctx.scale(2, 2);

  const data = state.weight, n = data.length;
  const mn = Math.min(...data) - 1, mx = Math.max(...data) + 1;
  const pad = {l: 0, r: 10, t: 10, b: 30};
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;

  const pts = data.map((v, i) => ({
    x: pad.l + (i / (n - 1)) * cw,
    y: pad.t + (1 - (v - mn) / (mx - mn)) * ch
  }));

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5;
  for (let i = 0; i < 4; i++) {
    const y = pad.t + (i / 3) * ch;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
  }

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.t, 0, h);
  grad.addColorStop(0, 'rgba(182,255,59,0.2)'); grad.addColorStop(1, 'rgba(182,255,59,0)');
  ctx.beginPath(); ctx.moveTo(pts[0].x, h - pad.b);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[n - 1].x, h - pad.b); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = '#B6FF3B'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();

  // Dot
  const last = pts[n - 1];
  ctx.beginPath(); ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#B6FF3B'; ctx.fill();
  ctx.beginPath(); ctx.arc(last.x, last.y, 8, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(182,255,59,0.3)'; ctx.lineWidth = 2; ctx.stroke();

  // Labels
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
  const labels = ['10/04','17/04','24/04','01/05','Aujourd\'hui'];
  [0, Math.floor(n*.25), Math.floor(n*.5), Math.floor(n*.75), n-1].forEach((idx, i) => {
    if (pts[idx]) ctx.fillText(labels[i], pts[idx].x, h - 8);
  });
}

// ========== TABS ==========
document.querySelectorAll('.tabs').forEach(tabs => {
  tabs.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
});

document.querySelectorAll('.paywall-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.paywall-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ========== PWA ==========
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
