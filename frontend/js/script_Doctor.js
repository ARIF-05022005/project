/**
 * Doctor Finder Application - Complete Implementation
 */

// Constants
const SPECIALTIES = [
  'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 
  'Orthopedics', 'Gynecology', 'Psychology', 'General'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'Mandarin', 
  'Hindi', 'Bengali', 'Arabic', 'Russian'
];

const INSURANCE_PROVIDERS = [
  'BlueCross', 'Aetna', 'Cigna', 'United Healthcare',
  'Medicare', 'Medicaid', 'Kaiser', 'Humana'
];


// Fetch real nearby doctors using Google Places API
async function fetchNearbyDoctors(userLocation, radius = 5000) {
  const apiKey = "AIzaSyDJLn3hR4dbAXjIZ4On6_K0EyxsqIMqRPQ";
  const endpoint = `https://places.googleapis.com/v1/places:searchNearby`;
  const body = {
    includedTypes: ["doctor"],
    locationRestriction: {
      circle: {
        center: {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        },
        radius: radius,
      }
    }
  };
  let allDoctors = [];
  let pageToken = null;
  let pageCount = 0;
  do {
    let fetchBody = { ...body };
    if (pageToken) {
      fetchBody.pageToken = pageToken;
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.location,places.rating,places.photos,places.formattedAddress,places.nationalPhoneNumber,places.currentOpeningHours",
      },
      body: JSON.stringify(fetchBody),
    });
    if (!response.ok) {
      console.error("Nearby Search API error:", await response.text());
      throw new Error("Nearby Search API failed");
    }
    const data = await response.json();
    if (data.places && Array.isArray(data.places)) {
      allDoctors = allDoctors.concat(data.places);
    }
    pageToken = data.nextPageToken || null;
    pageCount++;
    // Google API may require a short delay before using nextPageToken
    if (pageToken) {
      await new Promise(res => setTimeout(res, 1500));
    }
  } while (pageToken && pageCount < 5); // limit to 5 pages for safety
  return allDoctors;
}

// UI Controller
const UIController = (function() {
  // Private DOM elements
  const elements = {
    doctorSearchForm: document.getElementById('doctorSearchForm'),
    doctorsGrid: document.getElementById('doctorsGrid'),
    resultsCount: document.querySelector('.results-count'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    doctorTypeSelect: document.getElementById('doctorType'),
    distanceSelect: document.getElementById('distance'),
    sortBySelect: document.getElementById('sortBy')
  };

  // Private methods
  function showLoading(show) {
    elements.loadingIndicator.style.display = show ? 'block' : 'none';
    elements.doctorsGrid.style.display = show ? 'none' : 'grid';
  }

  // Make showError public
  function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;
    elements.doctorsGrid.innerHTML = '';
    elements.doctorsGrid.appendChild(errorEl);
  }

  function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return `
      ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
      ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
      ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
      <span>(${rating.toFixed(1)})</span>
    `;
  }

  function getConsultationBadge(type) {
    const types = {
      'Online': { class: 'online', text: 'Online' },
      'In-person': { class: 'in-person', text: 'In-person' },
      'Both': { class: 'both', text: 'Both options' }
    };
    const badge = types[type] || types['Both'];
    return `<span class="consultation-badge ${badge.class}">${badge.text}</span>`;
  }

  // Public methods
  return {
    // Initialize the UI
    init: function() {
      this.setupFilters();
      this.bindEvents();
      this.loadDoctors();
    },

    // Setup filter dropdowns with static options (already in HTML)
    setupFilters: function() {
      // No-op: options are static in HTML
    },

    // Bind event listeners
    bindEvents: function() {
      elements.doctorSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSearch();
      });
      // Add event delegation for doctor card buttons
      elements.doctorsGrid.addEventListener('click', (e) => {
        if (e.target.closest('.view-profile')) {
          const card = e.target.closest('.hospital-card');
          // No profile modal for real Google Places data
        }
        if (e.target.closest('.book-now')) {
          const card = e.target.closest('.hospital-card');
          // No booking modal for real Google Places data
        }
      });
    },
    showError,

    // Main function to load and display real nearby doctors
    loadDoctors: async function() {
      try {
        showLoading(true);
        // Get user location from localStorage
        const userLat = localStorage.getItem("userLocationLat");
        const userLng = localStorage.getItem("userLocationLon");
        if (!userLat || !userLng) {
          showError("No user location found. Please select your location first.");
          return;
        }
        const userLocation = { lat: parseFloat(userLat), lng: parseFloat(userLng) };
        const doctors = await fetchNearbyDoctors(userLocation, 5000);
        this.renderDoctors(doctors);
      } catch (error) {
        console.error('Error loading doctors:', error);
        showError('Failed to load doctors. Please try again later.');
      } finally {
        showLoading(false);
      }
    },

    // Handle search form submission
    handleSearch: async function() {
      try {
        showLoading(true);
        // Get filter values
        const doctorType = elements.doctorTypeSelect.value;
        const distance = parseInt(elements.distanceSelect.value, 10); // in meters or km
        const sortBy = elements.sortBySelect.value;
        // Get user location from localStorage
        const userLat = localStorage.getItem("userLocationLat");
        const userLng = localStorage.getItem("userLocationLon");
        if (!userLat || !userLng) {
          showError("No user location found. Please select your location first.");
          return;
        }
        const userLocation = { lat: parseFloat(userLat), lng: parseFloat(userLng) };
        // Fetch for all smaller radii up to the selected one, merge and deduplicate
        const availableRadii = [5000, 10000, 25000, 50000]; // adjust as per your dropdown values (meters)
        const selectedRadius = distance;
        let allDoctors = [];
        let seenPlaceIds = new Set();
        for (let r of availableRadii) {
          if (r > selectedRadius) break;
          let docs = await fetchNearbyDoctors(userLocation, r);
          for (let doc of docs) {
            // Use place_id or name+address as unique key
            let key = doc.id || (doc.displayName?.text + doc.formattedAddress);
            if (!seenPlaceIds.has(key)) {
              allDoctors.push(doc);
              seenPlaceIds.add(key);
            }
          }
        }
        let doctors = allDoctors;
        // Calculate distance for each doctor
        const uLat = userLocation.lat;
        const uLng = userLocation.lng;
        function haversine(lat1, lon1, lat2, lon2) {
          const R = 6371; // km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        }
        doctors.forEach(doc => {
          const lat = doc.location?.latitude;
          const lng = doc.location?.longitude;
          if (lat && lng) {
            doc._distance = haversine(uLat, uLng, lat, lng);
          } else {
            doc._distance = Infinity;
          }
        });
        // Filter by doctor type (simple name match)
        if (doctorType) {
          doctors = doctors.filter(doc => {
            const name = doc.displayName?.text?.toLowerCase() || "";
            return name.includes(doctorType.toLowerCase());
          });
        }
        // Always sort by distance (nearest first)
        doctors.sort((a, b) => a._distance - b._distance);
        // If user selected sort by rating, sort by rating but keep nearest first for equal ratings
        if (sortBy === "rating") {
          doctors.sort((a, b) => (b.rating || 0) - (a.rating || 0) || a._distance - b._distance);
        }
        this.renderDoctors(doctors);
      } catch (error) {
        console.error('Search error:', error);
        showError('An error occurred during search. Please try again.');
      } finally {
        showLoading(false);
      }
    },

    // Filter doctors based on criteria
    filterDoctors: function(doctors, filters) {
      return doctors.filter(doctor => {
        return (
          (!filters.specialty || doctor.specialty === filters.specialty) &&
          (!filters.location || doctor.location === filters.location) &&
          (!filters.language || doctor.languages.includes(filters.language)) &&
          (!filters.insurance || doctor.insurance.includes(filters.insurance))
        );
      });
    },

    // Render doctors to the grid
    renderDoctors: function(doctors) {
      elements.doctorsGrid.innerHTML = '';
      // Filter out hospitals, diagnostic centers, labs, etc.
      const filtered = doctors.filter(doctor => {
        const name = doctor.displayName?.text?.toLowerCase() || "";
        // Exclude if name contains hospital, diagnostic, lab, centre, center, medical, polyclinic, etc.
        return !/hospital|diagnostic|lab|centre|center|medical|polyclinic|nursing|emergency|pathology/.test(name);
      });
      // Update the results count to match the filtered doctors
      this.updateResultsCount(filtered.length);
      if (filtered.length === 0) {
        elements.doctorsGrid.innerHTML = `
          <div class="no-results">
            <i class="fas fa-user-md"></i>
            <p>No individual doctor clinics found near your location</p>
          </div>
        `;
        return;
      }
      filtered.forEach(doctor => {
        const doctorCard = this.createDoctorCard(doctor);
        elements.doctorsGrid.appendChild(doctorCard);
      });
    },

    // Create a doctor card element
    createDoctorCard: function(doctor) {
      // Use Google Places API fields
      const name = doctor.displayName?.text || "Unnamed";
      const rating = doctor.rating ? ` ${doctor.rating}` : "No rating";
      const address = doctor.formattedAddress || "Address not available";
      let phone = "Phone not available";
      if (doctor.nationalPhoneNumber) {
        const cleaned = doctor.nationalPhoneNumber.replace(/\s+/g, "");
        phone = `<a href="tel:${cleaned}" class="hospital-phone-link">${doctor.nationalPhoneNumber}</a>`;
      }
      let photoUrl = "https://placehold.co/400x300?text=No+Image+Available";
      if (doctor.photos && doctor.photos.length > 0 && doctor.photos[0].name) {
        const ref = doctor.photos[0].name;
        photoUrl = `https://places.googleapis.com/v1/${ref}/media?maxHeightPx=400&key=AIzaSyDJLn3hR4dbAXjIZ4On6_K0EyxsqIMqRPQ`;
      }
      const lat = doctor.location?.latitude;
      const lng = doctor.location?.longitude;
      let distanceKm = "Unknown";
      const userLat = localStorage.getItem("userLocationLat");
      const userLng = localStorage.getItem("userLocationLon");
      if (userLat && userLng && lat && lng) {
        const R = 6371;
        const dLat = (lat - parseFloat(userLat)) * Math.PI / 180;
        const dLng = (lng - parseFloat(userLng)) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(parseFloat(userLat) * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distanceKm = (R * c).toFixed(2);
      }
      // Open status
      const isOpenNow = doctor.currentOpeningHours?.openNow;
      const openStatus = isOpenNow === true
        ? `<span class="open-now">Open Now</span>`
        : isOpenNow === false
          ? `<span class="closed-now">Closed</span>`
          : `<span class="unknown-status">Hours Unknown</span>`;
      // Always use the same markup as hospital card
      const card = document.createElement('div');
      card.className = 'hospital-card';
      card.innerHTML = `
        <span class="hospital-badge">Doctor</span>
        <div class="hospital-image" style="background-image: url('${photoUrl}')"></div>
        <div class="hospital-info">
          <h3 class="hospital-name">${name}</h3>
          <div class="hospital-meta">
            <div class="hospital-distance">
              <i class="fas fa-location-arrow"></i>
              ${lat && lng ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="distance-link">${distanceKm} km away</a>` : 'Unknown'}
            </div>
            <div class="hospital-rating"><i class="fas fa-star"></i> ${rating}</div>
            <div class="hospital-address"><i class="fas fa-map-marker-alt"></i> ${address}</div>
            <div class="hospital-phone"><i class="fas fa-phone-alt"></i> ${phone}</div>
            <div class="hospital-status">${openStatus}</div>
          </div>
        </div>
      </div>
      `;
      return card;
    },

    // Update results count display
    updateResultsCount: function(count) {
      elements.resultsCount.innerHTML = `
        <h3>${count} ${count === 1 ? 'Doctor' : 'Doctors'} Available</h3>
      `;
    },

    // View doctor profile (would navigate to detail page in real app)
    viewDoctorProfile: function(doctorId) {
      console.log(`View profile for doctor ${doctorId}`);
      // In a real app, would navigate to doctor detail page
      alert(`Would navigate to profile page for doctor ${doctorId}`);
    },

    // Book appointment (would show booking modal in real app)
    bookAppointment: function(doctorId) {
      console.log(`Book appointment with doctor ${doctorId}`);
      // In a real app, would show booking modal
      alert(`Would show booking modal for doctor ${doctorId}`);
    }
  };
})();

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  UIController.init();
});

// Add error handling for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  UIController.showError('An unexpected error occurred. Please refresh the page.');
});
