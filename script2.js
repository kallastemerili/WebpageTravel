/*
Complete JavaScript for the travel recommendations page.

Assumptions about HTML structure (IDs/classes/data-attributes):
- Filter buttons: .filter-btn with data-filter values like "all", "beach", "temple", "city"
- Search input: #searchInput
- Sort select: #sortSelect (options: "relevance", "name-asc", "name-desc", "time-asc", "time-desc")
- Cards container: #destinationsGrid
- Each card: .destination-card
  - data-title="..." (destination title)
  - data-category="beach|temple|city" (category lowercase)
  - data-time="HH:MM" (optional travel time string)
  - optionally .hidden-card class for cards initially not shown (for Load More)
- Load more button: #loadMoreBtn

Drop this file into your site (include as <script src="site-script.js" defer></script> )

This code provides:
- Category filtering
- Live search with debounce
- Sort by name or time
- "Load More" progressive reveal
- Accessible keyboard handlers for controls
- Small utility helpers
*/

(function () {
  'use strict';

  // ---------- Configuration ----------
  const INITIAL_VISIBLE = 6; // how many cards to show initially before "Load More"
  const LOAD_MORE_STEP = 3; // how many additional cards to reveal on each Load More click
  const SEARCH_DEBOUNCE_MS = 220;

  // ---------- Element refs ----------
  const grid = document.getElementById('destinationsGrid');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));

  if (!grid) {
    console.warn('site-script.js: #destinationsGrid not found — aborting script.');
    return;
  }

  const cards = Array.from(grid.querySelectorAll('.destination-card'));

  // normalize card data into objects we can sort/filter easily
  const cardData = cards.map((card, index) => {
    const title = card.getAttribute('data-title') || card.querySelector('.card-title')?.textContent?.trim() || '';
    const category = (card.getAttribute('data-category') || '').toLowerCase();
    const timeStr = card.getAttribute('data-time') || ''; // e.g. "14:30" or "2h 30m"
    const timeMinutes = parseTimeToMinutes(timeStr);

    return {
      index,
      element: card,
      title,
      category,
      timeStr,
      timeMinutes,
      visible: true // current visibility state
    };
  });

  // state
  const state = {
    activeFilter: 'all',
    searchQuery: '',
    sortBy: 'relevance',
    visibleCount: INITIAL_VISIBLE
  };

  // ---------- Initialization ----------
  function init() {
    // attach filter button handlers
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = btn.getAttribute('data-filter') || 'all';
        setFilter(filter);
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // search with debounce
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        applyFiltersAndSort();
      }, SEARCH_DEBOUNCE_MS));
    }

    // sort handler
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value || 'relevance';
        applyFiltersAndSort();
      });
    }

    // Load more
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        state.visibleCount += LOAD_MORE_STEP;
        applyFiltersAndSort();
      });
    }

    // initial render
    applyFiltersAndSort(true);
  }

  // ---------- Core: filter + sort + render ----------
  function applyFiltersAndSort(initial = false) {
    // filter
    const filtered = cardData.filter(cd => {
      // category filter
      if (state.activeFilter !== 'all' && cd.category !== state.activeFilter) return false;
      // search filter
      if (state.searchQuery) {
        const hay = (cd.title + ' ' + (cd.element.textContent || '')).toLowerCase();
        if (!hay.includes(state.searchQuery)) return false;
      }
      return true;
    });

    // sorting
    const sorted = filtered.slice();
    switch (state.sortBy) {
      case 'name-asc':
        sorted.sort((a,b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        sorted.sort((a,b) => b.title.localeCompare(a.title));
        break;
      case 'time-asc':
        sorted.sort((a,b) => (a.timeMinutes || Infinity) - (b.timeMinutes || Infinity));
        break;
      case 'time-desc':
        sorted.sort((a,b) => (b.timeMinutes || -Infinity) - (a.timeMinutes || -Infinity));
        break;
      default:
        // relevance (keep original document order)
        sorted.sort((a,b) => a.index - b.index);
    }

    // render: hide all first, then show up to state.visibleCount of sorted ones
    cards.forEach(c => c.classList.add('hidden-card'));

    // show only the first n
    const toShow = sorted.slice(0, state.visibleCount);
    toShow.forEach(cd => cd.element.classList.remove('hidden-card'));

    // update "Load More" button
    if (loadMoreBtn) {
      if (sorted.length > state.visibleCount) {
        loadMoreBtn.style.display = '';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    // if there are no results, show a friendly empty state
    updateEmptyState(sorted.length === 0);

    if (!initial) {
      // optionally smooth scroll first visible card into view — nice for accessibility
      const first = grid.querySelector('.destination-card:not(.hidden-card)');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------- Helpers ----------
  function setFilter(filter) {
    state.activeFilter = filter;
    // visual active class on buttons
    filterButtons.forEach(btn => {
      if ((btn.getAttribute('data-filter') || 'all') === filter) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
    // reset visible count when filter changes
    state.visibleCount = INITIAL_VISIBLE;
    applyFiltersAndSort();
  }

  function updateEmptyState(isEmpty) {
    let emptyEl = document.getElementById('emptyState');
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.id = 'emptyState';
      emptyEl.className = 'empty-state';
      emptyEl.textContent = 'No destinations match your filters.';
      emptyEl.style.padding = '2rem';
      emptyEl.style.textAlign = 'center';
      emptyEl.style.display = 'none';
      grid.parentNode.insertBefore(emptyEl, grid.nextSibling);
    }
    emptyEl.style.display = isEmpty ? '' : 'none';
  }

  function parseTimeToMinutes(timeStr) {
    // Accepts formats like "14:30" (HH:MM) or "2h 30m" or "150" (minutes)
    if (!timeStr) return null;
    timeStr = timeStr.trim();
    // HH:MM
    const mm = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (mm) {
      const h = parseInt(mm[1], 10);
      const m = parseInt(mm[2], 10);
      return h * 60 + m;
    }
    // 2h 30m
    const hm = timeStr.match(/(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:in(?:utes?)?)?)?/i);
    if (hm && (hm[1] || hm[2])) {
      const h = parseInt(hm[1] || '0', 10);
      const m = parseInt(hm[2] || '0', 10);
      return h * 60 + m;
    }
    // plain minutes
    if (/^\d+$/.test(timeStr)) return parseInt(timeStr, 10);
    return null;
  }

  function debounce(fn, wait) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ---------- Accessibility: keyboard shortcuts ----------
  document.addEventListener('keydown', (e) => {
    // Focus search with "/" key (like many sites)
    if (e.key === '/') {
      if (document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput?.focus();
        searchInput?.select();
      }
    }
  });

  // ---------- Small polish: badge anchors & clickable cards ----------
  cards.forEach(card => {
    // make whole card clickable if it contains an <a> with class .card-link
    const link = card.querySelector('a.card-link');
    if (link) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        // if user clicked on an interactive child (button etc.) allow it
        if ((e.target.closest('button') || e.target.closest('a')) && e.target.closest('a') !== link) return;
        // otherwise navigate
        const href = link.getAttribute('href');
        if (href) window.location.href = href;
      });
    }
  });

  // ---------- Init on DOM ready ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
