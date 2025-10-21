let places = [];

// Fetch the JSON file and save its contents to the `places` variable
fetch('travel_recommendation_api.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        places = data; // Save the JSON data to the `places` variable
        console.log('Places loadedaaaa:', places); // Log the data for debugging
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

function performSearch() {
    if (!places || Object.keys(places).length === 0) {
        console.error('Places data is not loaded yet.');
        return;
    }

    // Get the value from the search input
    const input = document.getElementById('searchInput').value.toLowerCase();

    // Define the terms to check for, including plural variations
    const terms = [
        { key: 'countries', singular: 'country', plural: 'countries' },
        { key: 'beaches', singular: 'beach', plural: 'beaches' },
        { key: 'temples', singular: 'temple', plural: 'temples' }
    ];

    // Check if the input contains any of the terms (singular or plural)
    const matchedTerm = terms.find(term =>
        input.includes(term.singular) || input.includes(term.plural)
    );

    // Clear any previous results
    const existingResults = document.querySelector('.results');
    if (existingResults) {
        existingResults.remove();
    }

    // Create the outer div with the class "results"
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'results';

    if (!matchedTerm) {
        // If no matching term is found, display a "No matching destinations" message
        const noMatchDiv = document.createElement('div');
        noMatchDiv.innerHTML = `<h3>No matching destinations</h3>`;
        resultsDiv.appendChild(noMatchDiv);
        document.body.appendChild(resultsDiv);
        return;
    }

    // Access the relevant array in the `places` object
    const categoryArray = places[matchedTerm.key];

    let randomPlaces;

    // Special handling for "countries"
    if (matchedTerm.key === 'countries') {
        // Flatten the cities from all countries into a single array
        const allCities = categoryArray.flatMap(country => country.cities);

        // Randomly select two cities
        randomPlaces = getRandomPlaces(allCities, 2);
    } else {
        // For other categories, randomly select two places
        randomPlaces = getRandomPlaces(categoryArray, 2);
    }

    // Iterate over the randomly selected places
    randomPlaces.forEach(place => {
        const placeDiv = document.createElement('div');
        placeDiv.innerHTML = `
            <img src="${place.imageUrl}" alt="${place.name}">
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <button>visit</button>
        `;
        resultsDiv.appendChild(placeDiv);
    });

    // Append the "results" div to the body
    document.body.appendChild(resultsDiv);
}

// Helper function to get random places
function getRandomPlaces(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, count); // Return the first `count` elements
}

function resetSearch() {
    // Clear the search input
    document.getElementById('searchInput').value = '';

    // Remove the outer div with the class "results"
    const existingResults = document.querySelector('.results');
    if (existingResults) {
        existingResults.remove();
    }
}
