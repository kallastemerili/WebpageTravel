// site-script.js - tailored for the HTML you provided
(function () {
  'use strict';

  // CONFIG
  const INITIAL_VISIBLE = 6;
  const LOAD_MORE_STEP = 3;
  const SEARCH_DEBOUNCE_MS = 220;

  // HELPERS
  function qs(selector, root = document) { return root.querySelector(selector); }
  function qsa(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
  function debounce(fn, wait) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
  function parseTimeToMinutes(str) {
    if (!str) return null;
    str = String(str).trim();
    const hhmm = str.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmm) return parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);
    const hm = str.match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i);
    if (hm && (hm[1] || hm[2])) {
      return (parseInt(hm[1] || '0', 10) * 60) + (parseInt(hm[2] || '0', 10));
    }
    if (/^\d+$/.test(str)) return parseInt(str, 10);
    return null;
  }

  // LOCATE UI ELEMENTS BASED ON YOUR HTML
  const filterContainer = document.querySelector('.p-4 .flex.gap-2.overflow-x-auto, .p-4 > .flex.gap-2');
  // fallback: find the first .flex > button group near top that looks like filters
  const filterButtons = filterContainer ? Array.from(filterContainer.querySelectorAll('button')) : [];
  const searchInput = qs('input[placeholder="Search destinations..."]');
  const sortButton = (function () {
    // Find the "Sort by" button visually next to the search input in your markup
    const nodes = qsa('button');
    return nodes.find(b => b.textContent && b.textContent.trim().startsWith('Sort by')) || null;
  })();
  const grid = qs('div.grid.grid-cols-1, div.grid'); // your cards grid
  const cards = grid ? qsa('> div', grid) : [];

  // find the Load More button (in your markup it's the button text "Load More")
  const loadMoreBtn = Array.from(qsa('button')).find(b => b.textContent && b.textContent.trim() === 'Load More') || null;

  if (!grid || cards.length === 0) {
    console.warn('site-script.js: Could not find grid or cards — script aborted.');
    return;
  }

  // Build card meta
  const cardData = cards.map((card, idx) => {
    const titleEl = card.querySelector('h3');
    const descEl = card.querySelector('p');
    const badgeEl = card.querySelector('.absolute.top-2.right-2, .absolute > div'); // common absolute badge
    let badgeText = '';
    if (badgeEl) badgeText = badgeEl.textContent.trim();
    // find time inside card (span near schedule)
    const timeEl = card.querySelector('span');
    // More precise: find a sibling with schedule icon then span, but fallback to first span with HH:MM
    let timeText = '';
    if (timeEl && /^\d{1,2}:\d{2}$/.test(timeEl.textContent.trim())) timeText = timeEl.textContent.trim();
    else {
      // try to find any span that looks like time
      const spans = Array.from(card.querySelectorAll('span'));
      for (const s of spans) {
        const txt = s.textContent.trim();
        if (/^\d{1,2}:\d{2}$/.test(txt)) { timeText = txt; break; }
      }
    }

    return {
      index: idx,
      element: card,
      title: titleEl ? titleEl.textContent.trim() : '',
      description: descEl ? descEl.textContent.trim() : '',
      category: badgeText.toLowerCase(),
      timeRaw: timeText,
      timeMin: parseTimeToMinutes(timeText)
    };
  });

  // STATE
  const state = {
    activeFilter: 'all',
    searchQuery: '',
    sortBy: 'relevance', // relevance | name-asc | name-desc | time-asc | time-desc
    visibleCount: INITIAL_VISIBLE
  };

  // RENDERERS
  function render() {
    // filter
    let filtered = cardData.filter(cd => {
      if (state.activeFilter !== 'all' && cd.category !== state.activeFilter) return false;
      if (state.searchQuery) {
        const hay = (cd.title + ' ' + cd.description).toLowerCase();
        if (!hay.includes(state.searchQuery)) return false;
      }
      return true;
    });

    // sort
    if (state.sortBy === 'name-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (state.sortBy === 'name-desc') filtered.sort((a, b) => b.title.localeCompare(a.title));
    else if (state.sortBy === 'time-asc') filtered.sort((a, b) => (a.timeMin == null ? Infinity : a.timeMin) - (b.timeMin == null ? Infinity : b.timeMin));
    else if (state.sortBy === 'time-desc') filtered.sort((a, b) => (b.timeMin == null ? -Infinity : b.timeMin) - (a.timeMin == null ? -Infinity : a.timeMin));
    else filtered.sort((a, b) => a.index - b.index);

    // hide all, then show first N
    cardData.forEach(cd => cd.element.classList.add('hidden'));
    const toShow = filtered.slice(0, state.visibleCount);
    toShow.forEach(cd => cd.element.classList.remove('hidden'));

    // Load more visibility
    if (loadMoreBtn) {
      if (filtered.length > state.visibleCount) loadMoreBtn.classList.remove('hidden');
      else loadMoreBtn.classList.add('hidden');
    }

    // if nothing matches, show friendly empty state message below grid
    const existingEmpty = qs('#empty-state');
    if (filtered.length === 0) {
      if (!existingEmpty) {
        const el = document.createElement('div');
        el.id = 'empty-state';
        el.className = 'text-center text-gray-600 dark:text-gray-400 py-8';
        el.textContent = 'No destinations match your filters.';
        grid.parentNode.insertBefore(el, grid.nextSibling);
      }
    } else {
      if (existingEmpty) existingEmpty.remove();
    }
  }

  // UI interactions
  function setActiveFilter(filterText) {
    state.activeFilter = filterText;
    state.visibleCount = INITIAL_VISIBLE;
    // visual active on filter buttons
    filterButtons.forEach(btn => {
      if (btn.textContent && btn.textContent.trim().toLowerCase() === filterText) {
        btn.classList.add('bg-primary', 'text-white');
        btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-800', 'dark:text-gray-300');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-800', 'dark:text-gray-300');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
    render();
  }

  function attachFilterHandlers() {
    if (!filterButtons || filterButtons.length === 0) return;
    filterButtons.forEach(btn => {
      const raw = btn.textContent ? btn.textContent.trim().toLowerCase() : '';
      const map = {
        'all': 'all',
        'beaches': 'beach',
        'beach': 'beach',
        'temples': 'temple',
        'temple': 'temple',
        'cities': 'city',
        'city': 'city'
      };
      const filterKey = map[raw] || raw || 'all';
      btn.addEventListener('click', () => setActiveFilter(filterKey));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      });
    });
    // default active
    setActiveFilter('all');
  }

  function attachSearchHandler() {
    if (!searchInput) return;
    searchInput.addEventListener('input', debounce((e) => {
      state.searchQuery = (e.target.value || '').toLowerCase().trim();
      state.visibleCount = INITIAL_VISIBLE;
      render();
    }, SEARCH_DEBOUNCE_MS));
    // focus by '/' key
    document.addEventListener('keydown', (e) => {
      if (e.key === '/') {
        if (document.activeElement !== searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      }
    });
  }

  function createSortMenu() {
    if (!sortButton) return;
    // Create a small dropdown menu attached to sortButton
    const menu = document.createElement('div');
    menu.className = 'absolute z-50 mt-2 w-44 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 hidden';
    menu.style.minWidth = '160px';
    menu.style.padding = '4px';
    menu.innerHTML = `
      <button data-sort="relevance" class="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">Relevance</button>
      <button data-sort="name-asc" class="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">Name ↑</button>
      <button data-sort="name-desc" class="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">Name ↓</button>
      <button data-sort="time-asc" class="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">Time ↑</button>
      <button data-sort="time-desc" class="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">Time ↓</button>
    `;
    // position menu relative to button
    sortButton.style.position = 'relative';
    sortButton.appendChild(menu);

    sortButton.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });

    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-sort]');
      if (!btn) return;
      const val = btn.getAttribute('data-sort');
      state.sortBy = val || 'relevance';
      // close menu
      menu.classList.add('hidden');
      // reset visible count to show from start
      state.visibleCount = INITIAL_VISIBLE;
      render();
    });

    // close dropdown when clicking elsewhere
    document.addEventListener('click', () => menu.classList.add('hidden'));
  }

  function attachLoadMore() {
    if (!loadMoreBtn) return;
    loadMoreBtn.addEventListener('click', () => {
      state.visibleCount += LOAD_MORE_STEP;
      render();
      // after revealing, scroll the grid bottom into view a bit for feedback
      const firstVisible = grid.querySelector(':not(.hidden)');
      if (firstVisible) firstVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function makeCardsClickable() {
    // If a card contains a link (a.card-link), make the whole card clickable
    cardData.forEach(cd => {
      const link = cd.element.querySelector('a.card-link, a');
      if (link && link.getAttribute('href')) {
        cd.element.style.cursor = 'pointer';
        cd.element.addEventListener('click', (e) => {
          // ignore clicks on inner interactive elements to avoid double action
          if (e.target.closest('button') || e.target.closest('a')) return;
          window.location.href = link.getAttribute('href');
        });
      }
    });
  }

  // INITIALIZE
  attachFilterHandlers();
  attachSearchHandler();
  createSortMenu();
  attachLoadMore();
  makeCardsClickable();
  // initial render
  render();

})();
