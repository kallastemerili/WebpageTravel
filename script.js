const destinations = {
  beach: [
    {name:"Sunny Beach", img:"img/beach1.jpg", description:"Relax under the sun and enjoy pristine sands."},
    {name:"Paradise Shore", img:"img/beach2.jpg", description:"A perfect getaway for beach lovers."}
  ],
  temple: [
    {name:"Golden Temple", img:"img/temple1.jpg", description:"A sacred place with rich history."},
    {name:"Lotus Temple", img:"img/temple2.jpg", description:"Architectural marvel with spiritual vibes."}
  ],
  country: [
    {name:"Toronto", img:"img/country1.jpg", description:"Vibrant city with diverse attractions."},
    {name:"Paris", img:"img/country2.jpg", description:"City of love and iconic landmarks."}
  ]
};

// Search Functionality
function searchDestinations() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const resultSection = document.getElementById("recommendations");
  resultSection.innerHTML = "";

  Object.keys(destinations).forEach(cat=>{
    destinations[cat].forEach(place=>{
      if(place.name.toLowerCase().includes(query) || cat.includes(query)){
        const card=document.createElement("div");
        card.className="destination-card";
        card.innerHTML=`
          <img src="${place.img}" alt="${place.name}">
          <h3>${place.name}</h3>
          <p>${place.description}</p>
        `;
        resultSection.appendChild(card);
      }
    });
  });

  displayLocalTime();
}

// Clear
function clearSearch(){
  document.getElementById("searchInput").value="";
  document.getElementById("recommendations").innerHTML="";
  document.getElementById("localTime").innerText="";
}

// Local Time
function displayLocalTime(){
  const now=new Date();
  document.getElementById("localTime").innerText=`Local Time: ${now.toLocaleTimeString()}`;
}

// Contact Form
document.getElementById("contactForm")?.addEventListener("submit",function(e){
  e.preventDefault();
  const name=document.getElementById("name").value;
  document.getElementById("formResponse").innerText=`Thank you, ${name}! We will get back to you soon.`;
  this.reset();
});
