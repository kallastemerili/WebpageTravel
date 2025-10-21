const countryContainer = document.getElementById('country-cards');

fetch('https://restcountries.com/v3.1/all')
  .then(res => res.json())
  .then(data => {
    // Pick first 2 countries for demonstration
    const countries = data.slice(0, 2);
    countries.forEach(country => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <img src="${country.flags.png}" alt="${country.name.common}">
        <div class="card-content">
          <h3>${country.name.common}</h3>
          <p>Region: ${country.region}, Population: ${country.population.toLocaleString()}</p>
        </div>
      `;
      countryContainer.appendChild(card);
    });
  });
