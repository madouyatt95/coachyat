// ========== OPEN FOOD FACTS API SERVICE ==========
// Free food database — https://world.openfoodfacts.org
// No API key required, just a User-Agent

const OFF_BASE = 'https://world.openfoodfacts.org';
const OFF_USER_AGENT = 'COACHYAT-PWA/1.0 (contact@coachyat.app)';

/**
 * Search food products by name
 * Returns array of { name, calories, proteins, carbs, fat, fiber, brand }
 */
async function searchFood(query) {
  if (!query || query.length < 2) return [];

  try {
    const url = `${OFF_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,nutriments,brands,image_front_small_url`;

    const res = await fetch(url, {
      headers: { 'User-Agent': OFF_USER_AGENT }
    });

    if (!res.ok) throw new Error(`OFF HTTP ${res.status}`);
    const json = await res.json();

    if (!json.products) return [];

    return json.products
      .filter(p => p.product_name && p.nutriments)
      .map(p => ({
        name: p.product_name,
        brand: p.brands || '',
        image: p.image_front_small_url || null,
        calories: Math.round(p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal'] || 0),
        proteins: Math.round(p.nutriments.proteins_100g || p.nutriments.proteins || 0),
        carbs: Math.round(p.nutriments.carbohydrates_100g || p.nutriments.carbohydrates || 0),
        fat: Math.round(p.nutriments.fat_100g || p.nutriments.fat || 0),
        fiber: Math.round(p.nutriments.fiber_100g || p.nutriments.fiber || 0),
      }))
      .filter(p => p.calories > 0); // Only items with valid nutrition data

  } catch (err) {
    console.error('[OpenFoodFacts] Search error:', err);
    return [];
  }
}

/**
 * Get product by barcode
 */
async function getProductByBarcode(barcode) {
  try {
    const res = await fetch(`${OFF_BASE}/api/v2/product/${barcode}?fields=product_name,nutriments,brands,image_front_small_url`, {
      headers: { 'User-Agent': OFF_USER_AGENT }
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.product) return null;

    const p = json.product;
    return {
      name: p.product_name || 'Produit inconnu',
      brand: p.brands || '',
      image: p.image_front_small_url || null,
      calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
      proteins: Math.round(p.nutriments?.proteins_100g || 0),
      carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
      fat: Math.round(p.nutriments?.fat_100g || 0),
    };
  } catch (err) {
    console.error('[OpenFoodFacts] Barcode error:', err);
    return null;
  }
}

// ========== AUTOCOMPLETE UI HELPER ==========
let offDebounceTimer = null;

function setupFoodAutocomplete(inputId, resultsContainerId, onSelect) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(resultsContainerId);
  if (!input || !container) return;

  input.addEventListener('input', () => {
    clearTimeout(offDebounceTimer);
    const query = input.value.trim();

    if (query.length < 2) {
      container.innerHTML = '';
      container.classList.add('hidden');
      return;
    }

    offDebounceTimer = setTimeout(async () => {
      container.innerHTML = '<div class="off-loading">Recherche en cours...</div>';
      container.classList.remove('hidden');

      const results = await searchFood(query);

      if (results.length === 0) {
        container.innerHTML = '<div class="off-no-result">Aucun résultat. Saisis les macros manuellement.</div>';
        return;
      }

      container.innerHTML = results.map((food, i) => `
        <div class="off-result-item" data-idx="${i}">
          ${food.image ? `<img src="${food.image}" class="off-result-img" alt="">` : '<div class="off-result-img off-placeholder">🥗</div>'}
          <div class="off-result-info">
            <div class="off-result-name">${food.name}</div>
            <div class="off-result-brand">${food.brand || 'Générique'}</div>
            <div class="off-result-macros">
              <span>${food.calories} kcal</span>
              <span class="off-p">${food.proteins}g P</span>
              <span class="off-c">${food.carbs}g G</span>
              <span class="off-f">${food.fat}g L</span>
            </div>
          </div>
        </div>
      `).join('');

      // Bind clicks
      container.querySelectorAll('.off-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.idx);
          onSelect(results[idx]);
          container.innerHTML = '';
          container.classList.add('hidden');
        });
      });
    }, 400); // Debounce 400ms
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && e.target !== input) {
      container.innerHTML = '';
      container.classList.add('hidden');
    }
  });
}
