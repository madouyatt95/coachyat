// ========== STATE (Secure) ==========
function getStorage(key, def) {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return def;
    try { return JSON.parse(val); } catch(e) { return val; }
  } catch(e) { return def; }
}

const state = {
  user: getStorage('fc_user', null),
  day: parseInt(getStorage('fc_day', '12')),
  streak: parseInt(getStorage('fc_streak', '12')),
  disciplineScore: parseInt(getStorage('fc_discipline', '87')),
  xp: parseInt(getStorage('fc_xp', '1450')),
  level: parseInt(getStorage('fc_level', '2')),
  workoutCompleted: getStorage('fc_workout_completed', 'false') === 'true',
  weight: getStorage('fc_weight', [82.6,82.1,81.5,81.0,80.5,80.2,79.8,79.5,79.2,79.0,78.7,78.4]),
  sessionsCompleted: parseInt(getStorage('fc_sessions', '18')),
  sessionsTarget: 20,
  equipment: getStorage('fc_equip', ['none', 'dumbbells']),
  prefs: getStorage('fc_prefs', { goal: 'Prise de masse', theme: 'dark', coachVoice: true }),
  notifs: getStorage('fc_notifs', { workout: true, meals: true, news: false })
};

function saveState() {
  localStorage.setItem('fc_day', state.day);
  localStorage.setItem('fc_streak', state.streak);
  localStorage.setItem('fc_discipline', state.disciplineScore);
  localStorage.setItem('fc_xp', state.xp);
  localStorage.setItem('fc_level', state.level);
  localStorage.setItem('fc_workout_completed', state.workoutCompleted);
  localStorage.setItem('fc_sessions', state.sessionsCompleted);
  localStorage.setItem('fc_equip', JSON.stringify(state.equipment));
  localStorage.setItem('fc_prefs', JSON.stringify(state.prefs));
  localStorage.setItem('fc_notifs', JSON.stringify(state.notifs));
}

function addXP(amount) {
  state.xp += amount;
  const nextLevelXP = state.level * 2000;
  if (state.xp >= nextLevelXP) {
    state.level++;
    showLevelUpModal();
  }
  saveState();
  updateProfileUI();
}

function showLevelUpModal() {
  alert(`FÉLICITATIONS ! Tu passes au Niveau ${state.level} 🏆`);
}

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
  try {
    if (!state.user) { 
      renderOnboarding(); 
    } else { 
      const onb = document.getElementById('onboarding');
      if (onb) onb.classList.add('hidden'); 
      initApp(); 
    }
  } catch (e) {
    console.error("App initialization error:", e);
  }
});

function initApp() {
  if (state.user?.name) {
    document.getElementById('profile-name').textContent = state.user.name;
    document.getElementById('dashboard-user-greeting').textContent = `Bonjour ${state.user.name.split(' ')[0]} 👋`;
  }
  
  updateDashboardWorkout();
  renderExercises();
  
  drawProgressRing('today-ring', 13, 50, 'var(--green)', '13%');
  drawMiniRing('nut-ring-p', 75, 'var(--green)', 'P');
  drawMiniRing('nut-ring-g', 60, 'var(--orange)', 'G');
  drawMiniRing('nut-ring-l', 45, 'var(--purple)', 'L');
  drawNutritionRing();
  drawDisciplineArc();
  drawWeightChart();
  updateProfileUI();
  renderTrainingCalendar();
}

let viewedDay = state.day;

function renderTrainingCalendar() {
  const container = document.querySelector('.week-calendar');
  if (!container) return;
  
  const days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  let html = '';
  
  // Show a range of 7 days around the current state.day
  for (let i = state.day - 3; i <= state.day + 3; i++) {
    if (i < 1) continue;
    const date = new Date();
    date.setDate(date.getDate() + (i - state.day));
    const dayLabel = days[date.getDay()];
    
    let cls = 'cal-day';
    if (i < state.day) cls += ' done';
    if (i === state.day) cls += ' today';
    if (i === viewedDay) cls += ' active';
    
    html += `
      <div class="${cls}" onclick="changeViewedDay(${i})">
        <span class="cal-day-label">${dayLabel}</span>
        <div class="cal-day-num">${i}</div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function changeViewedDay(day) {
  viewedDay = day;
  renderTrainingCalendar();
  renderExercises();
  
  const title = document.querySelector('#screen-training .section-title');
  const btn = document.getElementById('training-workout-btn');
  
  if (day === state.day) {
    title.textContent = "Programme du jour";
    btn.style.display = 'block';
  } else {
    title.textContent = `Programme du Jour ${day}`;
    btn.style.display = 'none'; // Only allow starting today's session
  }
}

function updateProfileUI() {
  if (!state.user) return;
  
  // Stats
  const dayValue = document.querySelector('.profile-stat-value');
  if (dayValue) dayValue.textContent = state.day;
  
  const progPct = Math.floor((state.day / 90) * 100);
  const progBar = document.querySelector('.profile-stat [style*="width"]');
  if (progBar) progBar.style.width = progPct + '%';
  
  const progText = document.querySelector('.profile-stat .text-xs');
  if (progText) progText.textContent = progPct + '%';

  // XP / Level
  const levelEl = document.getElementById('profile-level-badge');
  if (levelEl) levelEl.textContent = `Niveau ${state.level}`;
  
  const xpEl = document.getElementById('profile-xp-text');
  if (xpEl) {
    const nextLevelXP = state.level * 2000;
    xpEl.textContent = `${state.xp} / ${nextLevelXP} XP`;
    const xpBar = document.getElementById('profile-xp-bar');
    if (xpBar) xpBar.style.width = Math.min(100, (state.xp / nextLevelXP) * 100) + '%';
  }
}

function openPreferences() {
  document.getElementById('pref-goal').value = state.prefs.goal;
  document.getElementById('pref-voice').checked = state.prefs.coachVoice;
  document.getElementById('modal-prefs').classList.remove('hidden');
}

function savePreferences() {
  state.prefs.goal = document.getElementById('pref-goal').value;
  state.prefs.coachVoice = document.getElementById('pref-voice').checked;
  saveState();
  document.getElementById('modal-prefs').classList.add('hidden');
}

function openEquipment() {
  const container = document.getElementById('equip-list');
  const items = [
    {id:'none', label:'Poids du corps', emoji:'🏃'},
    {id:'dumbbells', label:'Haltères', emoji:'🏋️'},
    {id:'bench', label:'Banc de muscu', emoji:'🧱'},
    {id:'elastic', label:'Élastiques', emoji:'🎗️'},
    {id:'gym', label:'Salle de sport', emoji:'🏢'}
  ];
  
  container.innerHTML = items.map(item => `
    <label class="menu-item" style="cursor:pointer">
      <div class="menu-item-left">
        <div class="menu-icon">${item.emoji}</div>
        <div class="menu-label">${item.label}</div>
      </div>
      <input type="checkbox" value="${item.id}" ${state.equipment.includes(item.id) ? 'checked' : ''} onchange="toggleEquip('${item.id}', this.checked)">
    </label>
  `).join('');
  
  document.getElementById('modal-equipment').classList.remove('hidden');
}

function toggleEquip(id, checked) {
  if (checked) {
    if (!state.equipment.includes(id)) state.equipment.push(id);
  } else {
    state.equipment = state.equipment.filter(e => e !== id);
  }
  saveState();
}

function openNotifications() {
  document.getElementById('notif-workout').checked = state.notifs.workout;
  document.getElementById('notif-meals').checked = state.notifs.meals;
  document.getElementById('modal-notifs').classList.remove('hidden');
}

function saveNotifications() {
  state.notifs.workout = document.getElementById('notif-workout').checked;
  state.notifs.meals = document.getElementById('notif-meals').checked;
  saveState();
  document.getElementById('modal-notifs').classList.add('hidden');
}

function updateDashboardWorkout() {
  const statusLabel = document.getElementById('dashboard-workout-status-label');
  const workoutName = document.getElementById('dashboard-workout-name');
  const workoutBtn = document.getElementById('dashboard-workout-btn');
  const workoutCard = workoutName?.closest('.card');
  
  if (!statusLabel || !workoutName || !workoutBtn) return;

  if (state.workoutCompleted) {
    statusLabel.textContent = "SÉANCE TERMINÉE ✅";
    statusLabel.style.color = "var(--green)";
    workoutName.textContent = "Bien joué ! Récupération en cours.";
    workoutBtn.textContent = "Voir le récapitulatif";
    workoutBtn.onclick = () => showScreen('screen-progress');
    if (workoutCard) workoutCard.style.borderColor = "var(--green)";
  } else {
    statusLabel.textContent = "SÉANCE DU JOUR";
    statusLabel.style.color = "";
    // Dynamic naming based on day
    const dayMod = state.day % 4;
    const routineNames = ["Push Upper Body", "Legs & Glutes", "Pull & Back", "Full Body Core"];
    workoutName.textContent = routineNames[dayMod] || "Push Upper Body";
    workoutBtn.textContent = "▶ Commencer ma séance";
    workoutBtn.onclick = () => showScreen('screen-training');
    if (workoutCard) workoutCard.style.borderColor = "var(--glass-border)";
  }
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

function resetAccount() {
  if (confirm('Es-tu sûr de vouloir supprimer toutes tes données et réinitialiser ton compte ?')) {
    localStorage.clear();
    location.reload();
  }
}

function openPersonalInfo() {
  if (!state.user) return;
  document.getElementById('info-name').value = state.user.name || '';
  document.getElementById('info-age').value = state.user.age || '';
  document.getElementById('modal-personal-info').classList.remove('hidden');
}

function savePersonalInfo() {
  const name = document.getElementById('info-name').value;
  const age = document.getElementById('info-age').value;
  
  if (name) {
    state.user.name = name;
    state.user.age = age;
    localStorage.setItem('fc_user', JSON.stringify(state.user));
    document.getElementById('profile-name').textContent = name;
    document.getElementById('dashboard-user-greeting').textContent = `Bonjour ${name.split(' ')[0]} 👋`;
    document.getElementById('modal-personal-info').classList.add('hidden');
    alert("Informations mises à jour !");
  }
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
  if (!el) return;
  
  // Determine routine based on viewedDay (Modulo 4)
  const routineIdx = (viewedDay - 1) % 4;
  const routineNames = ["PUSH (Pectoraux/Triceps)", "LEGS (Jambes)", "PULL (Dos/Biceps)", "CORE & CARDIO"];
  
  let allowedEquip = ['none'];
  const userEquip = state.user?.equipment || 'Maison (sans matériel)';
  if (userEquip === 'Maison (avec haltères)') allowedEquip = ['none', 'dumbbells'];
  if (userEquip === 'Salle de sport') allowedEquip = ['none', 'dumbbells', 'gym'];

  // Filter exercises based on routine and equipment
  let filtered = [];
  if (routineIdx === 0) filtered = exercises.filter(e => ['Développé couché','Développé incliné','Pompes (Push-ups)','Dips','Extensions Triceps'].includes(e.name));
  else if (routineIdx === 1) filtered = exercises.filter(e => ['Squat barre','Presse à cuisses','Fentes marchées','Leg Extension','Mollets debout'].includes(e.name));
  else if (routineIdx === 2) filtered = exercises.filter(e => ['Tirage vertical','Rowing barre','Tractions (Pull-ups)','Curl Biceps barre','Curl marteau'].includes(e.name));
  else filtered = exercises.filter(e => ['Gainage (Planche)','Crunch poulie','Jumping Jacks','Mountain Climbers','Burpees'].includes(e.name));

  // Further filter by equipment
  filtered = filtered.filter(e => allowedEquip.includes(e.equip));

  // Store them for live session
  if (viewedDay === state.day) window.currentDailyWorkout = filtered;

  el.innerHTML = `
    <div class="fw-700 text-sm text-green mb-12">${routineNames[routineIdx]}</div>
    ${filtered.map((e, i) => `
      <div class="exercise-item" onclick="playVideo('${e.name.replace(/'/g, "\\'")}')">
        <div class="exercise-num">${i+1}</div>
        <div class="exercise-info"><div class="exercise-name">${e.name}</div><div class="exercise-detail">${e.detail}</div></div>
        <div class="video-thumbnail">
          <div class="play-icon">▶</div>
        </div>
      </div>`).join('')}
  `;
    
  const trainingBtn = document.getElementById('training-workout-btn');
  if (!trainingBtn) return;
  
  if (state.workoutCompleted && viewedDay === state.day) {
    trainingBtn.textContent = "Séance terminée ✅";
    trainingBtn.classList.add('btn-secondary');
    trainingBtn.disabled = true;
    trainingBtn.onclick = null;
  } else {
    trainingBtn.textContent = viewedDay === state.day ? "▶ Démarrer la séance" : "Aperçu de la séance";
    trainingBtn.classList.toggle('btn-secondary', viewedDay !== state.day);
    trainingBtn.disabled = viewedDay !== state.day;
    trainingBtn.onclick = viewedDay === state.day ? openLiveSession : null;
  }
}

// ========== LIVE SESSION ==========
let liveState = { active: false, exerciseIdx: 0, isRest: false, timeLeft: 0, interval: null };

function openLiveSession() {
  if (!window.currentDailyWorkout || window.currentDailyWorkout.length === 0) {
    alert("Aucune séance n'est prête. Réessaie.");
    return;
  }
  liveState = { active: true, exerciseIdx: 0, isRest: false, timeLeft: 0, interval: null };
  document.getElementById('overlay-live').classList.remove('hidden');
  updateLiveUI();
}

function closeLiveSession() {
  clearInterval(liveState.interval);
  document.getElementById('overlay-live').classList.add('hidden');
  liveState.active = false;
}

function updateLiveUI() {
  const ex = window.currentDailyWorkout[liveState.exerciseIdx];
  document.getElementById('live-exercise-name').textContent = ex.name;
  document.getElementById('live-exercise-icon').textContent = ex.icon;
  
  const actionBtn = document.getElementById('live-action-btn');
  
  if (liveState.isRest) {
    document.getElementById('live-exercise-detail').textContent = "REPOS";
    actionBtn.textContent = "Passer le repos";
    startTimer(45); // 45s rest
  } else {
    document.getElementById('live-exercise-detail').textContent = ex.detail;
    actionBtn.textContent = "Série terminée ✅";
    document.getElementById('live-timer').textContent = "00:00";
    clearInterval(liveState.interval);
  }
}

function startTimer(seconds) {
  liveState.timeLeft = seconds;
  clearInterval(liveState.interval);
  liveState.interval = setInterval(() => {
    liveState.timeLeft--;
    const m = Math.floor(liveState.timeLeft / 60);
    const s = liveState.timeLeft % 60;
    document.getElementById('live-timer').textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    if (liveState.timeLeft <= 0) {
      clearInterval(liveState.interval);
      nextLiveStep();
    }
  }, 1000);
}

function nextLiveStep() {
  if (liveState.isRest) {
    liveState.isRest = false;
    liveState.exerciseIdx++;
    if (liveState.exerciseIdx >= window.currentDailyWorkout.length) {
      finishSession();
      return;
    }
  } else {
    liveState.isRest = true;
  }
  updateLiveUI();
}

function finishSession() {
  closeLiveSession();
  state.workoutCompleted = true;
  state.sessionsCompleted++;
  localStorage.setItem('fc_workout_completed', 'true');
  localStorage.setItem('fc_sessions', state.sessionsCompleted);
  
  // XP Gain
  state.disciplineScore += 2;
  if (state.disciplineScore > 100) state.disciplineScore = 100;
  localStorage.setItem('fc_discipline', state.disciplineScore);
  
  updateDashboardWorkout();
  renderExercises();
  drawDisciplineArc();
  
  document.getElementById('overlay-share').classList.remove('hidden');
  document.getElementById('share-workout-name').textContent = "Séance terminée !";
}

// ========== NUTRITION ==========
let currentMealType = '';
function openAddMeal(type) {
  currentMealType = type;
  document.getElementById('add-meal-title').textContent = `Ajouter un ${type}`;
  document.getElementById('meal-name-input').value = '';
  document.getElementById('meal-cal-input').value = '';
  document.getElementById('meal-prot-input').value = '';
  document.getElementById('meal-carb-input').value = '';
  document.getElementById('meal-fat-input').value = '';
  document.getElementById('modal-add-meal').classList.remove('hidden');
}

function saveMeal() {
  const name = document.getElementById('meal-name-input').value;
  const cal = parseInt(document.getElementById('meal-cal-input').value || 0);
  const prot = parseInt(document.getElementById('meal-prot-input').value || 0);
  const carb = parseInt(document.getElementById('meal-carb-input').value || 0);
  const fat = parseInt(document.getElementById('meal-fat-input').value || 0);

  if (!name) return alert("Donne un nom à ton repas !");

  const meals = JSON.parse(localStorage.getItem('fc_logged_meals') || '[]');
  meals.push({ type: currentMealType, name, cal, prot, carb, fat, date: new Date().toISOString() });
  localStorage.setItem('fc_logged_meals', JSON.stringify(meals));

  document.getElementById('modal-add-meal').classList.add('hidden');
  alert(`Repas ${name} enregistré !`);
  
  // Update UI (simplified for demo)
  updateNutritionUI();
}

function updateNutritionUI() {
  const meals = JSON.parse(localStorage.getItem('fc_logged_meals') || '[]');
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(m => m.date.startsWith(today));
  
  const total = todayMeals.reduce((acc, m) => ({
    cal: acc.cal + m.cal,
    prot: acc.prot + m.prot,
    carb: acc.carb + m.carb,
    fat: acc.fat + m.fat
  }), { cal: 0, prot: 0, carb: 0, fat: 0 });

  // Update Rings (this would require more IDs in index.html, let's keep it simple)
  console.log("Total nutrition for today:", total);
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
    let reply = "";
    const lowerMsg = msg.toLowerCase();
    
    // Contextual Memory
    if (lowerMsg.includes("fatigué") || lowerMsg.includes("fatigue")) {
      reply = `Je vois que tu es fatigué, ${state.user.name.split(' ')[0]}. C'est normal à ce stade du programme (Jour ${state.day}). Est-ce que tu as bien dormi cette nuit ?`;
    } else if (lowerMsg.includes("poids") || lowerMsg.includes("maigri")) {
      reply = `Ton poids actuel est de ${state.weight[state.weight.length-1]} kg. Tu as perdu ${Math.abs(state.weight[0] - state.weight[state.weight.length-1]).toFixed(1)} kg depuis le début. Continue comme ça !`;
    } else if (lowerMsg.includes("manger") || lowerMsg.includes("faim")) {
      reply = "Pour ton objectif de " + state.user.goal.toLowerCase() + ", je te conseille de privilégier les protéines. Tu as encore de la marge sur tes macros aujourd'hui.";
    } else {
      reply = coachReplies[Math.floor(Math.random() * coachReplies.length)];
    }

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
