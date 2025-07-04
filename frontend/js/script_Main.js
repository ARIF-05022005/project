// ========== Carousel Setup ==========
const carouselSlide = document.getElementById('carouselSlide');
const items = carouselSlide ? carouselSlide.children : [];
const itemCount = items.length;
let index = 0;

function updateCarouselPosition() {
  if (itemCount === 0) return;
  const itemWidth = items[0].clientWidth;
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

function resetInterval() {
  clearInterval(carouselInterval);
  carouselInterval = setInterval(moveNext, 2000);
}

// Event listeners
const carouselContainer = document.querySelector('.carousel-container');
if (carouselContainer) {
  carouselContainer.addEventListener('mouseenter', () => clearInterval(carouselInterval));
  carouselContainer.addEventListener('mouseleave', resetInterval);

  document.querySelector('.next-btn').addEventListener('click', () => {
    moveNext();
    resetInterval();
  });
  document.querySelector('.prev-btn').addEventListener('click', () => {
    movePrev();
    resetInterval();
  });

  window.addEventListener('resize', updateCarouselPosition);
  updateCarouselPosition();
}

// ========== Leaflet Map Setup ==========
const locationSection = document.getElementById('locationSection');
const locationText = document.getElementById('locationText');
const mapPopup = document.getElementById('mapPopup');
const closeMapBtn = document.getElementById('closeMapBtn');
const mapContainer = document.getElementById('map');
const mapStatus = document.getElementById('mapStatus');

let map;    // Leaflet map instance
let marker; // User location marker

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

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      mapStatus.style.display = 'none';

      map = L.map(mapContainer).setView([latitude, longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      marker = L.marker([latitude, longitude]).addTo(map)
                .bindPopup('You are here')
                .openPopup();

      locationText.textContent = 'Your Location';
    },
    error => {
      mapStatus.textContent = 'Unable to retrieve your location. Please allow access.';
      console.error('Geolocation error:', error);
    }
  );
}

// Map event listeners
if (locationSection && mapPopup) {
  locationSection.addEventListener('click', showMapPopup);
  locationSection.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showMapPopup();
    }
  });

  closeMapBtn.addEventListener('click', hideMapPopup);
  closeMapBtn.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideMapPopup();
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mapPopup.getAttribute('aria-hidden') === 'false') {
      hideMapPopup();
    }
  });

  window.addEventListener('click', e => {
    if (!mapPopup.contains(e.target) && !locationSection.contains(e.target) &&
        mapPopup.getAttribute('aria-hidden') === 'false') {
      hideMapPopup();
    }
  });
}

// ========== Optional: Future focus trap ==========
/*
function trapFocus(element) {
  // Advanced: keep tab focus inside modal while open
}
*/

console.log('Main script loaded successfully');
