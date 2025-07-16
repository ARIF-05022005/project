let map, service, userLocation;

function initMap() {
  map = new google.maps.Map(document.getElementById("hospitalMap"), {
    center: { lat: 28.6139, lng: 77.2090 }, // Default: Delhi
    zoom: 13,
  });

  // Get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      userLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      map.setCenter(userLocation);
      document.getElementById('locationText').textContent = "Your Location";

      // Search initially with no query
      performSearch();
    });
  } else {
    alert("Geolocation not supported");
  }

  document.getElementById('hospitalSearchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch();
  });
}

function performSearch() {
  const searchQuery = document.getElementById('searchQuery').value.trim();
  const hospitalType = document.getElementById('hospitalType').value.trim();
  const distance = parseInt(document.getElementById('distance').value);
  const sortBy = document.getElementById('sortBy').value;

  const request = {
    location: userLocation,
    radius: distance,
    type: ['hospital'],
    keyword: [searchQuery, hospitalType].filter(Boolean).join(' ')
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      if (sortBy === 'rating') {
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else {
        results.sort((a, b) =>
          google.maps.geometry.spherical.computeDistanceBetween(a.geometry.location, userLocation) -
          google.maps.geometry.spherical.computeDistanceBetween(b.geometry.location, userLocation)
        );
      }
      renderResults(results);
    } else {
      document.getElementById('hospitalsGrid').innerHTML = '<p>No hospitals found.</p>';
    }
  });
}

function renderResults(hospitals) {
  const container = document.getElementById('hospitalsGrid');
  container.innerHTML = '';

  hospitals.forEach(place => {
    const distance = google.maps.geometry.spherical.computeDistanceBetween(place.geometry.location, userLocation) / 1000;
    const rating = place.rating ? `⭐ ${place.rating}` : 'No rating';

    const card = `
      <div class="hospital-card">
        <span class="hospital-badge">${place.types.includes('hospital') ? 'Hospital' : 'Clinic'}</span>
        <div class="hospital-image" style="background-image: url('${place.photos ? place.photos[0].getUrl({ maxWidth: 400 }) : 'https://via.placeholder.com/400x200'}')"></div>
        <div class="hospital-info">
          <h3 class="hospital-name">${place.name}</h3>
          <div class="hospital-meta">
            <div class="hospital-distance"><i class="fas fa-location-arrow"></i> ${distance.toFixed(2)} km away</div>
            <div class="hospital-wait-time"><i class="fas fa-star"></i> ${rating}</div>
          </div>
          <div class="hospital-actions">
            <a class="action-btn directions-btn" href="https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat()},${place.geometry.location.lng()}" target="_blank">
              <i class="fas fa-directions"></i> Directions
            </a>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });

  document.getElementById('resultsCount').innerHTML = `
    <i class="fas fa-map-marker-alt"></i> Showing <strong>${hospitals.length}</strong> hospitals near <strong>Your Location</strong>`;
}

// Needed for Google callback
window.initMap = initMap;