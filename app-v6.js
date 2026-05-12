// V6 Features for COACHYAT

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // Feature 1: Coach IA Vocal (Text-to-Speech)
  // ==========================================
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // clear queue
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Hook into the existing Live Session Next Step
  const oldNextLiveStep = window.nextLiveStep;
  if (oldNextLiveStep) {
    window.nextLiveStep = function() {
      oldNextLiveStep(); // call original
      
      // Now check state and speak
      if (liveState && liveState.active) {
        if (liveState.isRest) {
          speak("Repos. Respire bien.");
          // Warn at 10 seconds left (we'd need to hook into the interval, but let's just do a timeout)
          setTimeout(() => {
            if (liveState.isRest && liveState.timeLeft <= 10) speak("On reprend dans 10 secondes.");
          }, (liveState.timeLeft - 10) * 1000);
        } else {
          speak(`C'est parti pour : ${liveState.exercises[liveState.exerciseIdx].name}. Let's go !`);
        }
      }
    };
  }
  
  // Hook into finishSession
  const oldFinishSession = window.finishSession;
  if (oldFinishSession) {
    window.finishSession = function() {
      oldFinishSession();
      speak("Séance terminée. Excellent travail. Ton coach est fier de toi.");
    };
  }

  // ==========================================
  // Feature 8: Micro-Habitudes (Hydratation)
  // ==========================================
  // Inject widget in 'screen-today'
  const todayScreen = document.getElementById('screen-today');
  if (todayScreen) {
    const hydroWidget = document.createElement('div');
    hydroWidget.className = "card mt-16";
    hydroWidget.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <div class="fw-700 mb-4">Hydratation 💧</div>
          <div class="text-xs text-dim">Objectif: 2.5L</div>
        </div>
        <div class="flex items-center gap-12">
          <div class="text-xl fw-800 text-cyan" id="water-count">0 L</div>
          <button class="btn btn-outline" style="padding: 8px 12px; border-radius: 50%;" id="btn-add-water">+</button>
        </div>
      </div>
      <div class="xp-bar-container mt-12">
        <div class="xp-bar"><div class="xp-bar-fill" id="water-bar" style="width: 0%; background: var(--cyan);"></div></div>
      </div>
    `;
    // Insert after the hero section
    const hero = todayScreen.querySelector('.workout-hero');
    if (hero) hero.after(hydroWidget);

    let currentWater = 0;
    document.getElementById('btn-add-water').addEventListener('click', () => {
      currentWater += 0.25;
      if (currentWater > 2.5) currentWater = 2.5;
      document.getElementById('water-count').innerText = `${currentWater.toFixed(2)} L`;
      document.getElementById('water-bar').style.width = `${(currentWater / 2.5) * 100}%`;
      // Haptic
      if (navigator.vibrate) navigator.vibrate(20);
    });
  }

  // ==========================================
  // Feature 3: Liste de Courses Automatique
  // ==========================================
  const nutritionScreen = document.getElementById('screen-nutrition');
  if (nutritionScreen) {
    const listBtn = document.createElement('button');
    listBtn.className = "btn btn-outline w-full mt-16 mb-16";
    listBtn.innerHTML = `🛒 Voir ma liste de courses IA`;
    listBtn.onclick = () => {
      alert("🛒 Liste de courses générée :\n\n- Poulet (1kg)\n- Riz complet (500g)\n- Œufs (Boîte de 12)\n- Brocolis\n- Saumon frais");
    };
    
    // Insert before suggestion grid
    const sugGrid = nutritionScreen.querySelector('.suggestion-grid');
    if (sugGrid) sugGrid.before(listBtn);
  }

  // ==========================================
  // Feature 7: Paiement 1-Click (Web Payment API)
  // ==========================================
  const payBtns = document.querySelectorAll('.pay-btn');
  payBtns.forEach(btn => {
    btn.onclick = async (e) => {
      e.preventDefault();
      
      if (!window.PaymentRequest) {
        alert("Paiement via Apple/Google Pay non supporté sur ce navigateur. Redirection vers Stripe...");
        return;
      }
      
      const supportedInstruments = [{ supportedMethods: 'https://apple.com/apple-pay' }, { supportedMethods: 'https://google.com/pay' }];
      const details = {
        total: { label: 'COACHYAT Premium (Abonnement)', amount: { currency: 'EUR', value: '19.99' } }
      };

      try {
        const request = new PaymentRequest(supportedInstruments, details);
        const response = await request.show();
        await response.complete('success');
        alert("Paiement réussi ! Bienvenue dans COACHYAT Premium 💎");
        // Hide paywall
        document.getElementById('screen-paywall').style.display = 'none';
        showScreen('screen-today');
      } catch (err) {
        console.log("Paiement annulé ou échoué", err);
      }
    };
  });

  // ==========================================
  // Feature 4 & 5: Santé & Squads (Simulated UIs)
  // ==========================================
  // 4. Santé in Profil
  const profileScreen = document.getElementById('screen-profile');
  if (profileScreen) {
    const healthSection = document.createElement('div');
    healthSection.innerHTML = `
      <div class="section-title mt-20">Apple Health / Google Fit ⌚</div>
      <div class="card flex justify-between items-center text-center">
        <div>
          <div class="text-2xl fw-800 text-green">8 432</div>
          <div class="text-xs text-dim">PAS AUJOURD'HUI</div>
        </div>
        <div style="width: 1px; height: 40px; background: var(--glass-border);"></div>
        <div>
          <div class="text-2xl fw-800 text-purple">7h12</div>
          <div class="text-xs text-dim">SOMMEIL</div>
        </div>
      </div>
    `;
    profileScreen.appendChild(healthSection);
  }

  // 5. Squads in Progression
  const progressScreen = document.getElementById('screen-progress');
  if (progressScreen) {
    const squadsTabBtn = document.createElement('div');
    squadsTabBtn.className = "tab";
    squadsTabBtn.innerText = "Squad";
    const tabsContainer = progressScreen.querySelector('.tabs');
    if (tabsContainer) tabsContainer.appendChild(squadsTabBtn);

    const squadsContent = document.createElement('div');
    squadsContent.className = "card mt-16 hidden";
    squadsContent.id = "squad-content";
    squadsContent.innerHTML = `
      <div class="flex justify-between items-center mb-16">
        <div class="fw-700">🏆 Classement "Alpha Squad"</div>
      </div>
      <div class="flex justify-between items-center mb-12">
        <div class="flex items-center gap-12"><div style="width:30px;height:30px;border-radius:50%;background:var(--green);color:#000;display:flex;align-items:center;justify-content:center;font-weight:bold;">1</div> <span>Mamadou</span></div>
        <div class="fw-700 text-green">1450 XP</div>
      </div>
      <div class="flex justify-between items-center mb-12">
        <div class="flex items-center gap-12"><div style="width:30px;height:30px;border-radius:50%;background:var(--glass);display:flex;align-items:center;justify-content:center;font-weight:bold;">2</div> <span>Alex</span></div>
        <div class="fw-700 text-dim">1200 XP</div>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-12"><div style="width:30px;height:30px;border-radius:50%;background:var(--glass);display:flex;align-items:center;justify-content:center;font-weight:bold;">3</div> <span>Sarah</span></div>
        <div class="fw-700 text-dim">980 XP</div>
      </div>
    `;
    progressScreen.appendChild(squadsContent);

    squadsTabBtn.addEventListener('click', (e) => {
      // Hide other things
      progressScreen.querySelectorAll('.card, .stats-row, .photo-grid').forEach(el => el.style.display = 'none');
      squadsContent.style.display = 'block';
    });
  }
});
