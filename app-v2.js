// V2 Logic for FitCoach AI

// 11. Splash Screen logic moved to index.html for reliability


// 17. Offline Handling
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
  const badge = document.getElementById('offline-badge');
  if (badge) {
    if (navigator.onLine) {
      badge.classList.remove('show');
    } else {
      badge.classList.add('show');
    }
  }
}

// 1 & 2. Live Session & Quick Workout Timer
let liveInterval;
let liveState = {
  active: false,
  exerciseIdx: 0,
  setIdx: 0,
  isRest: false,
  timeLeft: 0,
  exercises: []
};

function startQuickWorkout() {
  closeOverlay('overlay-quick');
  liveState.exercises = [
    { name: 'Jumping Jacks', duration: 45, icon: '🏃' },
    { name: 'Pompes', duration: 45, icon: '💪' },
    { name: 'Squats', duration: 45, icon: '🦵' },
    { name: 'Gainage', duration: 45, icon: '🧱' },
    { name: 'Mountain Climbers', duration: 45, icon: '🧗' }
  ];
  startLiveSession(true);
}

function startDailyWorkout() {
  liveState.exercises = exercises.map(e => ({
    name: e.name,
    sets: parseInt(e.detail.charAt(0)) || 3,
    reps: e.detail.split('x')[1]?.trim() || '10 reps',
    icon: e.icon
  }));
  startLiveSession(false);
}

// Override button actions
document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('.btn-primary');
  btns.forEach(b => {
    if (b.innerText.includes('Commencer ma séance') || b.innerText.includes('Démarrer la séance')) {
      b.onclick = startDailyWorkout;
    }
    if (b.innerText.includes('Commencer') && b.closest('#overlay-quick')) {
      b.onclick = startQuickWorkout;
    }
  });
  
  // 4. Weight Tracking binding
  const weightPill = document.querySelector('.pill.text-xs');
  if (weightPill && weightPill.innerText.includes('30 jours')) {
    weightPill.innerText = '+ Ajouter poids';
    weightPill.onclick = openWeightModal;
  }
});

function startLiveSession(isQuick) {
  liveState.active = true;
  liveState.exerciseIdx = 0;
  liveState.setIdx = 0;
  liveState.isRest = false;
  liveState.isQuick = isQuick;
  
  document.getElementById('overlay-live').classList.remove('hidden');
  renderLiveState();
}

function renderLiveState() {
  const ex = liveState.exercises[liveState.exerciseIdx];
  if (!ex) return finishSession();

  document.getElementById('live-exercise-icon').innerText = ex.icon;
  document.getElementById('live-exercise-name').innerText = ex.name;

  const btn = document.getElementById('live-action-btn');
  const setsContainer = document.getElementById('live-sets');

  if (liveState.isQuick) {
    document.getElementById('live-exercise-detail').innerText = `Exercice ${liveState.exerciseIdx + 1} / ${liveState.exercises.length}`;
    liveState.timeLeft = ex.duration;
    updateLiveTimerUI();
    setsContainer.innerHTML = '';
    btn.innerText = "▶ Démarrer l'exercice";
    btn.className = "btn btn-primary mt-20";
    liveState.isRest = false;
  } else {
    document.getElementById('live-exercise-detail').innerText = `Objectif : ${ex.reps}`;
    
    // Render sets
    let setsHtml = '';
    for (let i = 0; i < ex.sets; i++) {
      let cls = 'live-set';
      if (i < liveState.setIdx) cls += ' done';
      if (i === liveState.setIdx && !liveState.isRest) cls += ' current';
      setsHtml += `<div class="${cls}">${i+1}</div>`;
    }
    setsContainer.innerHTML = setsHtml;

    if (liveState.isRest) {
      liveState.timeLeft = 60; // 60s rest
      updateLiveTimerUI();
      btn.innerText = "Sauter le repos ⏭";
      btn.className = "btn btn-outline mt-20";
    } else {
      document.getElementById('live-timer').innerText = "En cours";
      btn.innerText = "Série terminée ✓";
      btn.className = "btn btn-primary mt-20";
    }
  }
}

function nextLiveStep() {
  clearInterval(liveInterval);
  const ex = liveState.exercises[liveState.exerciseIdx];

  if (liveState.isQuick) {
    if (!liveState.isRest) {
      // Start counting down
      liveState.isRest = true; // reusing flag for "is playing"
      document.getElementById('live-action-btn').innerText = "Passer ⏭";
      liveInterval = setInterval(() => {
        liveState.timeLeft--;
        updateLiveTimerUI();
        if (liveState.timeLeft <= 0) nextLiveStep();
      }, 1000);
    } else {
      liveState.exerciseIdx++;
      liveState.isRest = false;
      renderLiveState();
    }
  } else {
    if (liveState.isRest) {
      // End rest
      liveState.isRest = false;
      liveState.setIdx++;
      if (liveState.setIdx >= ex.sets) {
        liveState.exerciseIdx++;
        liveState.setIdx = 0;
      }
      renderLiveState();
    } else {
      // End set
      liveState.isRest = true;
      renderLiveState();
      liveInterval = setInterval(() => {
        liveState.timeLeft--;
        updateLiveTimerUI();
        if (liveState.timeLeft <= 0) nextLiveStep();
      }, 1000);
    }
  }
}

function updateLiveTimerUI() {
  const m = Math.floor(liveState.timeLeft / 60).toString().padStart(2, '0');
  const s = (liveState.timeLeft % 60).toString().padStart(2, '0');
  document.getElementById('live-timer').innerText = `${m}:${s}`;
}

function finishSession() {
  clearInterval(liveInterval);
  state.sessionsCompleted++;
  document.getElementById('overlay-live').innerHTML = `
    <div style="text-align:center; padding: 40px 20px;">
      <div style="font-size:80px; margin-bottom:20px;">🏆</div>
      <div class="text-2xl fw-800">Séance Terminée !</div>
      <div class="text-md text-dim mt-8">Excellente session.</div>
      <div class="summary-stats mt-20">
        <div class="summary-stat"><div class="val">${liveState.isQuick ? '10' : '45'}</div><div class="lbl">MINUTES</div></div>
        <div class="summary-stat"><div class="val text-green">${liveState.isQuick ? '120' : '320'}</div><div class="lbl">KCAL</div></div>
      </div>
      <button class="btn btn-primary mt-20" onclick="closeLiveSession(); showScreen('screen-progress');">Voir ma progression</button>
    </div>
  `;
}

function closeLiveSession() {
  clearInterval(liveInterval);
  document.getElementById('overlay-live').classList.add('hidden');
}

// 4. Weight Modal
function openWeightModal() {
  document.getElementById('modal-weight').classList.remove('hidden');
}

function saveWeight() {
  const val = parseFloat(document.getElementById('weight-input').value);
  if (val) {
    state.weight.push(val);
    state.weight.shift(); // keep array size constant
    drawWeightChart(); // redraw
    // Update main text
    document.querySelector('.text-3xl.fw-900').innerText = val.toFixed(1).replace('.', ',');
  }
  document.getElementById('modal-weight').classList.add('hidden');
}

// 3. Contextual Coach override
const advancedReplies = {
  "fatigue": "Le repos fait partie de l'entraînement. On fait une séance très légère de stretching aujourd'hui ? 🧘",
  "mal": "Aïe, ne force surtout pas ! On va éviter cette zone aujourd'hui. Quelle partie te fait mal ?",
  "motiv": "C'est dans ces moments-là que le mental se forge ! Pense à ton objectif. Je te lance un défi : juste 10 minutes. 🔥",
  "temps": "Pas de problème, on passe en mode 'Quick Workout' de 10 min. Zéro excuse ! ⚡"
};

// Overriding sendChat from app.js without redefining it (just replace it in window if possible, or redefine if var/let)
window.sendChat = function() {
  const inp = document.getElementById('chat-input');
  const msg = inp.value.trim().toLowerCase();
  if (!msg) return;
  const box = document.getElementById('chat-messages');
  box.innerHTML += `<div class="chat-bubble user">${inp.value}<div class="chat-time" style="color:rgba(0,0,0,.5)">${new Date().toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit'})}</div></div>`;
  inp.value = '';
  
  setTimeout(() => {
    let reply = coachReplies[Math.floor(Math.random() * coachReplies.length)];
    
    if (msg.includes('fatigu') || msg.includes('dort') || msg.includes('dormi')) reply = advancedReplies["fatigue"];
    else if (msg.includes('mal') || msg.includes('douleur') || msg.includes('blessé')) reply = advancedReplies["mal"];
    else if (msg.includes('motiv') || msg.includes('flemme')) reply = advancedReplies["motiv"];
    else if (msg.includes('temps') || msg.includes('vite')) reply = advancedReplies["temps"];

    box.innerHTML += `<div class="chat-bubble coach">${reply}<div class="chat-time">${new Date().toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit'})}</div></div>`;
    
    // Suggest quick workout if time is mentioned
    if (reply === advancedReplies["temps"]) {
      box.innerHTML += `
        <div class="workout-suggestion-card" onclick="openQuickWorkout()">
          <div class="flex items-center gap-12">
            <div style="font-size:24px">⚡</div>
            <div><div class="fw-700">Séance express 10 min</div><div class="text-sm text-dim">Circuit complet</div></div>
          </div>
        </div>`;
    }
    
    box.scrollTop = box.scrollHeight;
  }, 800 + Math.random() * 800);
  box.scrollTop = box.scrollHeight;
};

// Add quick suggestions to coach UI
document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('chat-messages');
  if (box) {
    const suggDiv = document.createElement('div');
    suggDiv.style.padding = "10px 0";
    suggDiv.style.overflowX = "auto";
    suggDiv.style.whiteSpace = "nowrap";
    suggDiv.innerHTML = `
      <div class="chat-suggestion" onclick="document.getElementById('chat-input').value=this.innerText; sendChat()">J'ai pas la motiv</div>
      <div class="chat-suggestion" onclick="document.getElementById('chat-input').value=this.innerText; sendChat()">J'ai très peu de temps</div>
      <div class="chat-suggestion" onclick="document.getElementById('chat-input').value=this.innerText; sendChat()">Je suis fatigué</div>
    `;
    box.parentElement.insertBefore(suggDiv, document.querySelector('.chat-input-bar'));
  }
});
