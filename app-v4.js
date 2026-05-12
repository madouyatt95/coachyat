// V4 Logic for FitCoach AI

document.addEventListener('DOMContentLoaded', () => {
  
  // 6. Photos avant/après
  // We'll inject a grid inside the "Photos" tab of Progression screen
  const progressionScreen = document.getElementById('screen-progress');
  const tabs = progressionScreen.querySelectorAll('.tab');
  
  // Create the photo grid container
  const photoContainer = document.createElement('div');
  photoContainer.id = 'photo-container';
  photoContainer.className = 'photo-grid mt-16 hidden'; // Hidden by default
  photoContainer.innerHTML = `
    <div class="photo-grid-item" style="background: url('images/workout-hero.png') center/cover;"></div>
    <div class="photo-grid-item" style="background: url('images/workout-hero.png') center/cover; opacity: 0.8"></div>
    <div class="photo-grid-item add" onclick="alert('Ouverture de l\\'appareil photo...')">+</div>
  `;
  progressionScreen.appendChild(photoContainer);

  // Bind tabs logic to show/hide the correct content
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      // Hide all standard progression content if we click "Photos"
      const isPhotos = e.target.innerText === "Photos";
      progressionScreen.querySelectorAll('.card, .stats-row').forEach(el => {
        el.style.display = isPhotos ? 'none' : '';
      });
      if (isPhotos) {
        photoContainer.classList.remove('hidden');
      } else {
        photoContainer.classList.add('hidden');
      }
    });
  });

  // 14. Weekly Adaptation Review
  // Trigger it for demonstration purposes after 3 seconds on load (only once)
  if (!localStorage.getItem('fc_review_shown')) {
    setTimeout(() => {
      document.getElementById('overlay-review').classList.remove('hidden');
      localStorage.setItem('fc_review_shown', 'true');
    }, 3000);
  }

  // 15. Social Share
  // Override finishSession to include the share button in the end screen
  const v3FinishSession = window.finishSession;
  window.finishSession = function() {
    v3FinishSession(); // sets XP
    // Inject share button into the finished session screen
    const liveOverlay = document.getElementById('overlay-live');
    const shareBtn = document.createElement('button');
    shareBtn.className = "btn btn-outline mt-12";
    shareBtn.innerText = "Partager ma perf 📸";
    shareBtn.onclick = () => {
      document.getElementById('overlay-share').classList.remove('hidden');
    };
    liveOverlay.querySelector('div').appendChild(shareBtn);
  }
  
  // 18. View Transitions API 
  // Wrap `showScreen` in startViewTransition if available
  const originalShowScreen = window.showScreen;
  window.showScreen = function(id) {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        originalShowScreen(id);
      });
    } else {
      originalShowScreen(id);
    }
  }

});

// Function to simulate native sharing
function shareToSocial() {
  if (navigator.share) {
    navigator.share({
      title: 'FitCoach AI',
      text: 'Je viens de détruire ma séance Push Upper Body de 45 min ! 🔥',
      url: 'https://fitcoach-ai.app',
    }).catch(console.error);
  } else {
    alert("Partage simulé. Sur mobile, cela ouvrira Instagram/WhatsApp.");
  }
  document.getElementById('overlay-share').classList.add('hidden');
}

// 16. IndexedDB Simulation & Wrapper
const dbWrapper = {
  save: (key, data) => {
    // In a real app this would use indexedDB
    console.log(`[IndexedDB] Saved ${key}`);
    localStorage.setItem(key, JSON.stringify(data));
  },
  load: (key) => {
    console.log(`[IndexedDB] Loaded ${key}`);
    return JSON.parse(localStorage.getItem(key));
  }
};
