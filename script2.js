document.addEventListener("DOMContentLoaded", () => {
  // --- Select main elements ---
  const filterButtons = document.querySelectorAll(".p-4.flex.gap-2 button");
  const searchInput = document.querySelector('input[placeholder="Search destinations..."]');
  const sortButton = document.querySelector('.flex.items-center.gap-2 button');
  const loadMoreBtn = document.querySelector('.flex.justify-center.p-8 button');
  const cards = Array.from(document.querySelectorAll(".grid.grid-cols-1 > div"));

  // --- Initial setup ---
  let currentCategory = "All";
  let sortAscending = true;
  const itemsPerPage = 3;
  let visibleCount = itemsPerPage;

  // --- Helper functions ---
  const getCategory = (card) => card.querySelector(".absolute").textContent.trim();
  const getTitle = (card) => card.querySelector("h3").textContent.trim();
  const getDescription = (card) => card.querySelector("p").textContent.trim();

  // --- Core update function ---
  function updateCards() {
    const searchTerm = searchInput.value.toLowerCase();

    // Filter by category + search
    let filtered = cards.filter((card) => {
      const cat = getCategory(card).toLowerCase();
      const title = getTitle(card).toLowerCase();
      const desc = getDescription(card).toLowerCase();

      const matchCategory =
        currentCategory === "All" || cat === currentCategory.toLowerCase();
      const matchSearch =
        title.includes(searchTerm) || desc.includes(searchTerm);

      return matchCategory && matchSearch;
    });

    // Sort alphabetically
    filtered.sort((a, b) => {
      const nameA = getTitle(a).toLowerCase();
      const nameB = getTitle(b).toLowerCase();
      return sortAscending
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    // Hide all
    cards.forEach((c) => (c.style.display = "none"));

    // Show visible ones
    filtered.slice(0, visibleCount).forEach((c) => (c.style.display = "flex"));

    // Handle "Load more" button visibility
    loadMoreBtn.style.display = filtered.length > visibleCount ? "flex" : "none";
  }

  // --- Filter buttons ---
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        b.classList.remove("bg-primary", "text-white");
        b.classList.add(
          "bg-white",
          "dark:bg-gray-800",
          "text-gray-800",
          "dark:text-gray-300"
        );
      });

      btn.classList.add("bg-primary", "text-white");
      btn.classList.remove("bg-white", "dark:bg-gray-800");
      currentCategory = btn.textContent.trim();
      visibleCount = itemsPerPage;
      updateCards();
    });
  });

  // --- Search input ---
  searchInput.addEventListener("input", () => {
    visibleCount = itemsPerPage;
    updateCards();
  });

  // --- Sort button ---
  sortButton.addEventListener("click", () => {
    sortAscending = !sortAscending;
    const label = sortButton.querySelector("span");
    label.textContent = sortAscending ? "Sort A–Z" : "Sort Z–A";
    updateCards();
  });

  // --- Load More ---
  loadMoreBtn.addEventListener("click", () => {
    visibleCount += itemsPerPage;
    updateCards();
  });

  // --- Initial render ---
  updateCards();
});
