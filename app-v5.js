// V5 Logic: Dynamic Onboarding

// 12. Dynamic Onboarding (Adjust macros and calories based on goal)
document.addEventListener('DOMContentLoaded', () => {
  const oldFinishOnboarding = window.finishOnboarding;
  window.finishOnboarding = function() {
    // Let the original logic run (it sets state.user and saves to localStorage, then calls initApp)
    oldFinishOnboarding();
    
    // Now apply dynamic changes based on what was saved in state.user
    applyDynamicUserStats();
  };

  // If already loaded, apply it
  if (state.user) {
    applyDynamicUserStats();
  }
});

function applyDynamicUserStats() {
  if (!state.user) return;
  
  // Base BMR approximation
  const weight = state.user.weight || 82;
  const height = state.user.height || 175;
  const age = state.user.age || 25;
  
  let bmr = 10 * weight + 6.25 * height - 5 * age + 5; // simplified formula
  
  // Activity multiplier based on frequency
  let multiplier = 1.375; // 3 times/week
  if (state.user.frequency === '5-6 fois/semaine') multiplier = 1.725;
  else if (state.user.frequency === '4 fois/semaine') multiplier = 1.55;
  else if (state.user.frequency === '2 fois/semaine') multiplier = 1.2;
  
  let tdee = bmr * multiplier;
  
  // Goal adjustment
  let targetCals = tdee;
  let p = 1.8 * weight; // 1.8g per kg bodyweight
  let f = 1.0 * weight; // 1.0g per kg
  let c = 0;

  if (state.user.goal === 'Perte de poids') {
    targetCals -= 500;
    p = 2.2 * weight; // higher protein for retention
    f = 0.8 * weight;
  } else if (state.user.goal === 'Prise de masse') {
    targetCals += 300;
  }

  // Calculate carbs to fill the rest
  c = (targetCals - (p * 4) - (f * 9)) / 4;
  
  targetCals = Math.round(targetCals);
  p = Math.round(p);
  f = Math.round(f);
  c = Math.round(c);

  // Update UI elements safely
  const calDisplay = document.querySelector('.text-2xl.fw-800.mt-8');
  if (calDisplay && calDisplay.innerText.includes('kcal')) {
    calDisplay.innerText = `${targetCals} kcal`;
  }
  
  const macroBadges = document.querySelectorAll('.macro-value');
  if (macroBadges.length >= 4) {
    // 0 is the center ring, 1 is P, 2 is C, 3 is F
    macroBadges[0].innerText = `${p}g`;
    macroBadges[1].innerText = `${p}g`;
    macroBadges[2].innerText = `${c}g`;
    macroBadges[3].innerText = `${f}g`;
  }
  
  const nutSummary = document.querySelector('.card .text-xs.text-dim');
  if (nutSummary && nutSummary.innerText.includes('200g P')) {
    nutSummary.innerText = `${p}g P · ${c}g G · ${f}g L`;
    // Also update the small card calories
    const smallCalDisplay = nutSummary.parentElement.querySelector('.text-lg.fw-700');
    if (smallCalDisplay) smallCalDisplay.innerText = `${targetCals} kcal`;
  }
}
