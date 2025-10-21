document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".p-4.flex.gap-2 button");
  const mainSearch = document.querySelector('input[placeholder="Search destinations..."]');
  const navSearch = document.querySelector("#nav-search");
  const sortButton = document.querySelector('.flex.items-center.gap-2 button');
  const loadMoreBtn = document.querySelector('.flex.justify-center.p-8 button');
  const cards = Array.from(document.querySelectorAll(".grid.grid-cols-1 > div"));

  let currentCategory = "All";
  let sortAscending = true;
  const itemsPerPage = 3;
  let visibleCount = itemsPerPage;

  const getCategory = (card) => card.querySelector(".absolute").textContent.trim();
  const getTitle = (card) => card.querySelector("h3").textContent.trim();
  const getDescription = (card) => card.querySelector("p").textContent.trim();

  function getSearchTerm() {
    return (navSearch.value || mainSearch.value || "").toLowerCase();
  }

  function updateCards() {
    const term = getSearchTerm();
    let filtered = cards.filter((card) => {
      const cat = getCategory(card).toLowerCase();
      const title = getTitle(card).toLowerCase();
      const desc = getDescription(card).toLowerCase();
      const matchCategory = currentCategory === "All" || cat === currentCategory.toLowerCase();
      const matchSearch = title.includes(term) || desc.includes(term);
      return matchCategory && matchSearch;
    });

    filtered.sort((a, b) => {
      const nameA = getTitle(a).toLowerCase();
      const nameB = getTitle(b).toLowerCase();
      return sortAscending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    cards.forEach((c) => (c.style.display = "none"));
    filtered.slice(0, visibleCount).forEach((c) => (c.style.display = "flex"));
    loadMoreBtn.style.display = filtered.length > visibleCount ? "flex" : "none";
  }

  // Filters
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        b.classList.remove("bg-primary", "text-white");
        b.classList.add("bg-white", "dark:bg-gray-800", "text-gray-800", "dark:text-gray-300");
      });
      btn.classList.add("bg-primary", "text-white");
      btn.classList.remove("bg-white", "dark:bg-gray-800");
      currentCategory = btn.textContent.trim();
      visibleCount = itemsPerPage;
      updateCards();
    });
  });

  // Search (both bars)
  [mainSearch, navSearch].forEach((input) => {
    if (input) input.addEventListener("input", updateCards);
  });

  // Sort
  sortButton.addEventListener("click", () => {
    sortAscending = !sortAscending;
    const label = sortButton.querySelector("span");
    label.textContent = sortAscending ? "Sort A–Z" : "Sort Z–A";
    updateCards();
  });

  // Load More
  loadMoreBtn.addEventListener("click", () => {
    visibleCount += itemsPerPage;
    updateCards();
  });

  updateCards();
});
