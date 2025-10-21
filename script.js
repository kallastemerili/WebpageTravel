// Navbar Search
const navSearchInput = document.getElementById('nav-search-input');
const navSearchResults = document.getElementById('nav-search-results');
let countries = [];

fetch('https://restcountries.com/v3.1/all')
  .then(res => res.json())
  .then(data => {
    countries = data.map(c => c.name.common).sort();
  });

navSearchInput.addEventListener('input', () => {
  const query = navSearchInput.value.toLowerCase();
  navSearchResults.innerHTML = '';
  if(query) {
    const filtered = countries.filter(c => c.toLowerCase().includes(query));
    filtered.forEach(country => {
      const div = document.createElement('div');
      div.textContent = country;
      div.addEventListener('click', () => {
        navSearchInput.value = country;
        navSearchResults.innerHTML = '';
        alert(`You searched for ${country}. Recommendations will appear soon!`);
      });
      navSearchResults.appendChild(div);
    });
  }
});
document.addEventListener('click', (e) => {
  if(!navSearchInput.contains(e.target)) navSearchResults.innerHTML = '';
});

// Home Page Recommendations
const beachCards = document.getElementById('beach-cards');
const templeCards = document.getElementById('temple-cards');
const countryCards = document.getElementById('country-cards');

const beaches = [
  {name:"Maldives", img:"images/beach1.jpg"},
  {name:"Bora Bora", img:"images/beach2.jpg"}
];
const temples = [
  {name:"Angkor Wat, Cambodia", img:"images/temple1.jpg"},
  {name:"Golden Temple, India", img:"images/temple2.jpg"}
];
const cities = [
  {name:"Toronto, Canada", img:"images/country1.jpg"},
  {name:"Paris, France", img:"images/country2.jpg"}
];

// Function to add local time
function getLocalTime(countryName){
  const now = new Date();
  return now.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
}

function displayCards(container, items){
  if(!container) return;
  items.forEach(item=>{
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="card-content">
        <h3>${item.name}</h3>
        <p>Current Local Time: ${getLocalTime(item.name)}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

displayCards(beachCards, beaches);
displayCards(templeCards, temples);
displayCards(countryCards, countries);
