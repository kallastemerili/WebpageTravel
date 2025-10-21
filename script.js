function scrollToSearch() {
  document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

function performSearch() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  const filtered = destinations.filter(dest => 
    dest.name.toLowerCase().includes(input) || dest.type.includes(input)
  );

  if(filtered.length === 0) {
    resultsDiv.innerHTML = '<p>No destinations found.</p>';
    return;
  }

  filtered.forEach(dest => {
    const localTime = new Date().toLocaleString("en-US", { timeZone: dest.timeZone });
    const card = document.createElement('div');
    card.classList.add('card');
    
    let imagesHTML = dest.images.map(img => 
      `<img src="${img}" alt="${dest.name}" class="dest-image">`
    ).join('');
    
    card.innerHTML = `
      <h3>${dest.name}</h3>
      <p>${dest.description}</p>
      <p>Local Time: ${localTime}</p>
      <div class="images">${imagesHTML}</div>
    `;
    resultsDiv.appendChild(card);
  });
}
