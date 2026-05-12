// V3 Logic for FitCoach AI

// 5. Intelligent Notifications (Simulated)
function scheduleSmartNotification() {
  setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification("FitCoach AI", {
        body: "Il est l'heure de ta séance ! 💪 10 min de Quick Workout ?",
        icon: "images/workout-hero.png"
      });
    } else {
      // Fallback in-app notification
      showInAppNotification("🔥 Mode Urgence", "Tu n'as pas fait ta séance hier. Faisons juste 10 minutes aujourd'hui !");
    }
  }, 10000); // simulate after 10s for demo
}

function showInAppNotification(title, body) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed; top: 20px; left: 20px; right: 20px; z-index: 9999;
    background: var(--bg-card-solid); border: 1px solid var(--glass-border);
    border-radius: var(--radius); padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    animation: slideUp 0.3s ease; display: flex; align-items: center; gap: 12px;
  `;
  notif.innerHTML = `
    <div style="font-size: 24px;">🚨</div>
    <div style="flex: 1;">
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${body}</div>
    </div>
  `;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = "slideOutLeft 0.3s ease";
    setTimeout(() => notif.remove(), 300);
  }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  // Request notification permission on load
  if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
  
  scheduleSmartNotification();
  
  // 13. Paywall intelligent (Lock feature)
  // Lock the 'Progression - Details' tab as a premium feature
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t => {
    if (t.innerText === "Détails") {
      t.innerHTML = `Détails 🔒`;
      t.style.color = "var(--purple)";
      t.onclick = (e) => {
        e.stopPropagation();
        openPaywall();
      };
    }
  });
  
  // 7. XP System simulation
  // Update XP dynamically when a session finishes
  const oldFinishSession = window.finishSession;
  window.finishSession = function() {
    oldFinishSession();
    // Simulate XP gain
    const xpBar = document.querySelector('.xp-bar-fill');
    if(xpBar) {
      xpBar.style.width = "65%";
      const xpInfo = document.querySelector('.xp-info');
      if(xpInfo) xpInfo.innerHTML = `<span>Niveau 12</span><span class="text-green">650 / 1000 XP (+200)</span>`;
    }
  }
});
