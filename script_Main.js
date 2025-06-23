// Existing carousel code (unchanged)
const carouselSlide = document.getElementById('carouselSlide');
const items = carouselSlide.children;
const itemCount = items.length;
let index = 0;

function updateCarouselPosition() {
  const itemWidth = carouselSlide.clientWidth; // width of container
  carouselSlide.style.transform = `translateX(${-itemWidth * index}px)`;
}

function moveNext() {
  index = (index + 1) % itemCount;
  updateCarouselPosition();
}

function movePrev() {
  index = (index - 1 + itemCount) % itemCount;
  updateCarouselPosition();
}

let carouselInterval = setInterval(moveNext, 2000);
const carouselContainer = document.querySelector('.carousel-container');
carouselContainer.addEventListener('mouseenter', () => clearInterval(carouselInterval));
carouselContainer.addEventListener('mouseleave', () => {
  clearInterval(carouselInterval);
  carouselInterval = setInterval(moveNext, 2000);
});
document.querySelector('.next-btn').addEventListener('click', () => {
  moveNext();
  resetInterval();
});
document.querySelector('.prev-btn').addEventListener('click', () => {
  movePrev();
  resetInterval();
});
function resetInterval() {
  clearInterval(carouselInterval);
  carouselInterval = setInterval(moveNext, 2000);
}
window.addEventListener('resize', updateCarouselPosition);
updateCarouselPosition();

/* Leaflet map for live location */

const locationSection = document.getElementById('locationSection');
const locationText = document.getElementById('locationText');
const mapPopup = document.getElementById('mapPopup');
const closeMapBtn = document.getElementById('closeMapBtn');
const mapContainer = document.getElementById('map');
const mapStatus = document.getElementById('mapStatus');

let map;  // Leaflet map instance
let marker;  // Leaflet marker

function showMapPopup() {
  mapPopup.setAttribute('aria-hidden', 'false');
  locationSection.setAttribute('aria-expanded', 'true');
  closeMapBtn.focus();
  if (!map) {
    initMap();
  }
}

function hideMapPopup() {
  mapPopup.setAttribute('aria-hidden', 'true');
  locationSection.setAttribute('aria-expanded', 'false');
  locationSection.focus();
}

function initMap() {
  if (!navigator.geolocation) {
    mapStatus.textContent = 'Geolocation is not supported by your browser.';
    return;
  }
  mapStatus.textContent = 'Locating...';

  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;

    mapStatus.style.display = 'none';

    // Initialize Leaflet map
    map = L.map(mapContainer).setView([latitude, longitude], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add marker at user location
    marker = L.marker([latitude, longitude]).addTo(map)
      .bindPopup('You are here')
      .openPopup();

    // Update location text in navbar
    locationText.textContent = 'Your Location';
  }, error => {
    mapStatus.textContent = 'Unable to retrieve your location. Please allow location access or try again.';
    console.error('Geolocation error:', error);
  });
}

locationSection.addEventListener('click', showMapPopup);
locationSection.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    showMapPopup();
  }
});
closeMapBtn.addEventListener('click', hideMapPopup);
closeMapBtn.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hideMapPopup();
  }
});
window.addEventListener('click', e => {
  if (!mapPopup.contains(e.target) && !locationSection.contains(e.target)) {
    if (mapPopup.getAttribute('aria-hidden') === 'false') {
      hideMapPopup();
    }
  }
});
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mapPopup.getAttribute('aria-hidden') === 'false') {
    hideMapPopup();
  }
});