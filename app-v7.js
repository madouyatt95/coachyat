// V7 Logic (Phase 4 & 5)

// 1. STREAK FREEZE
function buyStreakFreeze() {
  const btn = document.querySelector('#modal-shop .btn-primary');
  if(state.disciplineScore >= 500) {
    // In a real app we'd deduct XP
    btn.innerText = "Immunité Achetée ✅";
    btn.style.background = "var(--green)";
    btn.style.color = "#000";
    setTimeout(() => {
      document.getElementById('modal-shop').classList.add('hidden');
      alert('Streak protégé ! Ton prochain jour manqué ne brisera pas ta série.');
    }, 1500);
  } else {
    alert("Tu n'as pas assez d'XP pour acheter cet objet.");
  }
}

// 2. SCAN FRIGO IA
function generateFridgeRecipe() {
  const inp = document.getElementById('fridge-input').value;
  if(!inp) return alert("Dis-moi d'abord ce que tu as dans le frigo !");
  
  const btn = document.querySelector('#modal-fridge .btn-primary');
  btn.innerText = "L'IA cuisine... 🧠";
  
  setTimeout(() => {
    document.getElementById('fridge-result').classList.remove('hidden');
    document.getElementById('fridge-recipe-name').innerText = "Bowl Protéiné Improvisé";
    document.getElementById('fridge-recipe-desc').innerText = `J'ai mixé ${inp}. Fais revenir le tout à la poêle avec un filet d'huile d'olive et des épices. Parfait pour ta prise de muscle !`;
    document.getElementById('fridge-p').innerText = "42g P";
    document.getElementById('fridge-g').innerText = "35g G";
    document.getElementById('fridge-l').innerText = "12g L";
    btn.innerText = "Générer une autre recette";
  }, 1500);
}

// 3. CARDIO AUDIO-GUIDÉ
function startAudioCardio() {
  alert("Démarrage du Cardio Audio-Guidé. Mets tes écouteurs. Ton écran va s'éteindre pour économiser la batterie.");
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance("Prêt pour ce run ? On commence avec 5 minutes de chauffe à petit trot. C'est parti !");
    u.lang = 'fr-FR';
    window.speechSynthesis.speak(u);
  }
}

// 4. CALCULATEUR 1RM
function calculate1RM() {
  const w = parseFloat(document.getElementById('rm-weight').value);
  const r = parseInt(document.getElementById('rm-reps').value);
  if(w && r) {
    // Brzycki formula
    const rm = w * (36 / (37 - r));
    document.getElementById('rm-result').classList.remove('hidden');
    document.getElementById('rm-value').innerText = `${Math.round(rm)} kg`;
    if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
  }
}

// 6. CERTIFICAT 90 JOURS
// Generate dynamically on Canvas
document.addEventListener('DOMContentLoaded', () => {
  const profileTab = document.querySelector('.nav-item:last-child');
  if(profileTab) {
    // Add hidden trigger in profile
    const btn = document.createElement('button');
    btn.className = "btn btn-outline w-full mt-16";
    btn.style.borderColor = "var(--orange)";
    btn.style.color = "var(--orange)";
    btn.innerText = "🏆 Voir mon Certificat (Jour 90)";
    btn.onclick = () => {
      document.getElementById('modal-certificate').classList.remove('hidden');
      drawCertificate();
    };
    document.getElementById('screen-profile').appendChild(btn);
  }
});

function drawCertificate() {
  const canvas = document.getElementById('cert-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // BG
  const grad = ctx.createLinearGradient(0,0,0,450);
  grad.addColorStop(0, '#1a2035');
  grad.addColorStop(1, '#0A0E1A');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,350,450);
  
  // Border
  ctx.strokeStyle = '#B6FF3B';
  ctx.lineWidth = 4;
  ctx.strokeRect(10,10,330,430);
  
  // Text
  ctx.fillStyle = '#B6FF3B';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COACHYAT', 175, 50);
  
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText('CERTIFICAT DE FIN', 175, 90);
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('90 JOURS', 175, 125);
  
  ctx.font = 'italic 16px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('Décerné à', 175, 180);
  
  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(state.user?.name?.toUpperCase() || 'CHAMPION', 175, 220);
  
  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'var(--cyan)';
  ctx.fillText(`+${state.sessionsCompleted} Séances complétées`, 175, 280);
  ctx.fillText(`Discipline : ${state.disciplineScore}%`, 175, 310);
  
  // Fake signature
  ctx.font = 'italic 24px serif';
  ctx.fillStyle = '#B6FF3B';
  ctx.fillText('FitCoach IA', 175, 380);
  ctx.beginPath();
  ctx.moveTo(100, 390);
  ctx.lineTo(250, 390);
  ctx.lineWidth = 1;
  ctx.stroke();
}

// 8. TINDER NUTRITION
let tinderMeals = [
  {n: "Poulet & Patate Douce", c: "620 kcal", p: "50g Protéines", img: "images/meal-chicken.png"},
  {n: "Omelette & Avocat", c: "450 kcal", p: "30g Protéines", img: "images/meal-omelette.png"},
  {n: "Bowl Saumon Quinoa", c: "580 kcal", p: "45g Protéines", img: "images/meal-salmon.png"}
];
let currentTinderIdx = 0;

function startTinderNutrition() {
  currentTinderIdx = 0;
  updateTinderCard();
  document.getElementById('modal-tinder').classList.remove('hidden');
}

function updateTinderCard() {
  if(currentTinderIdx >= tinderMeals.length) {
    document.getElementById('tinder-card').innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;text-align:center;padding:20px;">L'IA a assez de données ! Tes repas seront parfaits. 🎯</div>`;
    return;
  }
  const m = tinderMeals[currentTinderIdx];
  const card = document.getElementById('tinder-card');
  card.style.background = `url('${m.img}') center/cover`;
  card.style.transform = 'translateX(0) rotate(0deg)';
  document.getElementById('tinder-name').innerText = m.n;
  document.getElementById('tinder-name').nextElementSibling.innerText = `${m.c} · ${m.p}`;
}

function swipeTinder(dir) {
  const card = document.getElementById('tinder-card');
  card.style.transform = `translateX(${dir==='left'?'-200%':'200%'}) rotate(${dir==='left'?'-20deg':'20deg'})`;
  setTimeout(() => {
    currentTinderIdx++;
    updateTinderCard();
  }, 300);
}

// 9. MODE GOGGINS (Hardcore Persona)
function changeCoachPersona(val) {
  if (val === 'hardcore') {
    alert("🔥 MODE HARDCORE ACTIVÉ. Le coach n'acceptera plus aucune excuse.");
    // Override coach replies
    window.coachReplies = [
      "Tu es fatigué ? Tes concurrents s'entraînent. Lève-toi !",
      "Tes excuses sont pathétiques. Fais tes pompes.",
      "Le repos c'est pour les faibles. On y retourne !",
      "On ne s'arrête pas quand on est fatigué, on s'arrête quand on a FINI."
    ];
  } else {
    // Reset to normal
    window.coachReplies = [
      "C'est normal d'avoir des jours comme ça. L'important c'est d'être là ! 💪",
      "Je comprends. On va ajuster l'intensité. Ta santé passe avant tout. 🙏"
    ];
    alert("Mode normal activé. Bienveillance de retour.");
  }
}

// 11. E-COMMERCE SUPPLEMENTS POPUP
document.addEventListener('DOMContentLoaded', () => {
  // Simulate showing this after the app has been open for 15 seconds to demo the feature
  if (!localStorage.getItem('fc_ecommerce_shown')) {
    setTimeout(() => {
      document.getElementById('modal-ecommerce').classList.remove('hidden');
      localStorage.setItem('fc_ecommerce_shown', 'true');
    }, 15000);
  }
});

// 12. RAID MONDIAL (Live Multiplayer Event)
let raidInterval;
let raidGlobalProgress = 0;
let raidGlobalTarget = 1000000;
let raidLocalProgress = 0;

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function startRaidModal() {
  document.getElementById('modal-raid').classList.remove('hidden');
  
  // Randomize participants between 12,000 and 25,000
  const participants = Math.floor(Math.random() * 13000) + 12000;
  document.getElementById('raid-participants').innerText = `${formatNumber(participants)} Participants Actifs`;
  
  // Randomize challenge
  const challenges = ["POMPES", "SQUATS", "BURPEES", "ABDOS"];
  const currentChallenge = challenges[Math.floor(Math.random() * challenges.length)];
  
  // Dynamic Target based on participants (avg 50 reps per person)
  raidGlobalTarget = participants * 50;
  
  // Fake current progress (e.g., 60% already done)
  raidGlobalProgress = Math.floor(raidGlobalTarget * 0.6);
  raidLocalProgress = 0;
  
  document.getElementById('raid-title').innerText = `${formatNumber(raidGlobalTarget)} ${currentChallenge}`;
  document.getElementById('raid-global-target').innerText = `/ ${formatNumber(raidGlobalTarget)}`;
  document.getElementById('raid-local-progress').innerText = raidLocalProgress;
  
  updateRaidUI();
  
  // Simulate other players adding reps (100 to 500 reps per second globally)
  clearInterval(raidInterval);
  raidInterval = setInterval(() => {
    raidGlobalProgress += Math.floor(Math.random() * 400) + 100;
    if (raidGlobalProgress >= raidGlobalTarget) {
      raidGlobalProgress = raidGlobalTarget;
      clearInterval(raidInterval);
      celebrateRaid();
    }
    updateRaidUI();
  }, 1000);
}

function updateRaidUI() {
  document.getElementById('raid-global-progress').innerText = formatNumber(raidGlobalProgress);
  const pct = (raidGlobalProgress / raidGlobalTarget) * 100;
  document.getElementById('raid-progress-bar').style.width = `${pct}%`;
}

function addRaidReps(amount) {
  if (raidGlobalProgress >= raidGlobalTarget) return;
  
  raidLocalProgress += amount;
  raidGlobalProgress += amount;
  
  document.getElementById('raid-local-progress').innerText = raidLocalProgress;
  updateRaidUI();
  
  // Visual feedback
  const btn = document.getElementById('raid-btn-add');
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => btn.style.transform = 'scale(1)', 100);
  
  if(navigator.vibrate) navigator.vibrate(20);
}

function closeRaidModal() {
  document.getElementById('modal-raid').classList.add('hidden');
  clearInterval(raidInterval);
}

function celebrateRaid() {
  document.getElementById('raid-btn-add').style.display = 'none';
  document.getElementById('raid-title').innerText = "VICTOIRE MONDIALE ! 🌍";
  document.getElementById('raid-title').style.color = "var(--green)";
  document.getElementById('raid-progress-bar').style.background = "var(--green)";
  
  if(navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
  
  // Confetti simulation using alert for simplicity
  setTimeout(() => {
    alert(`INCROYABLE ! La communauté a réussi l'objectif.\n\nTa contribution : ${raidLocalProgress} reps.\nTu gagnes 1000 XP !`);
    closeRaidModal();
  }, 1000);
}
