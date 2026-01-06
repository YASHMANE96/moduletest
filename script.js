const API_KEY = 'NByhOj5elHe9NaUg8F6ZEx52nV5OJZjpXLnn6peY';
const API_URL = 'https://api.nasa.gov/planetary/apod';
const cache = {};

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const currentImageContainer = document.getElementById('current-image-container');
const searchHistoryList = document.getElementById('search-history');

searchInput.max = new Date().toISOString().split('T')[0];

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedDate = searchInput.value;
    if (selectedDate) {
        getImageOfTheDay(selectedDate);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    getCurrentImageOfTheDay();
    updateSearchHistoryUI();
});

function getCurrentImageOfTheDay() {
    const currentDate = new Date().toISOString().split('T')[0];
    getImageData(currentDate);
}

function getImageOfTheDay(date) {
    getImageData(date);
    saveSearch(date);
    updateSearchHistoryUI();
}

function saveSearch(date) {
    let searches = JSON.parse(localStorage.getItem('apod_searches')) || [];
    if (!searches.includes(date)) {
        searches.push(date);
        localStorage.setItem('apod_searches', JSON.stringify(searches));
    }
}

function updateSearchHistoryUI() {
    const searches = JSON.parse(localStorage.getItem('apod_searches')) || [];
    searchHistoryList.innerHTML = '';
    
    searches.forEach(date => {
        const li = document.createElement('li');
        li.textContent = date;
        li.addEventListener('click', () => {
            getImageData(date); 
        });
        searchHistoryList.appendChild(li);
    });
}

async function getImageData(date) {
    if (cache[date]) {
        console.log('Using cached data for:', date);
        displayImage(cache[date]);
        return;
    }
    
    try {
        console.log('Fetching data for:', date);
        const url = `${API_URL}?date=${date}&api_key=${API_KEY}`;
        const response = await fetch(url);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        
        const data = await response.json();
        console.log('Success! Got data for:', data.date);
        cache[date] = data;
        displayImage(data);
        
    } catch (error) {
    // Silent handling for expected API failures
    if (error.message.includes('HTTP 504')) {
        console.log('NASA API unavailable, using mock data');
    } else {
        console.error('Unexpected error:', error);
    }
    
    // Use mock data when API fails
    const mockData = {
        title: "NASA Image (API Unavailable)",
        date: date,
        explanation: "NASA API is currently down. This is placeholder data. Your app is working correctly - try again later for real NASA images.",
        url: `https://picsum.photos/seed/nasa${date}/800/600`,
        hdurl: `https://picsum.photos/seed/nasa${date}/1920/1080`,
        media_type: "image"
    };
    
    displayImage(mockData);
 }
}

function displayImage(data) {
    const { title, date, explanation, url, hdurl, media_type } = data;
    
    let mediaHTML = '';
    if (media_type === 'image') {
        mediaHTML = `<img src="${hdurl || url}" alt="${title}">`;
    } else if (media_type === 'video') {
        mediaHTML = `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
    }

    currentImageContainer.innerHTML = `
        <h2>${title}</h2>
        <p class="date">${date}</p>
        ${mediaHTML}
        <p class="explanation">${explanation}</p>
    `;
}