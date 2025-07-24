document.addEventListener('DOMContentLoaded', () => {
  const medicineForm = document.getElementById('medicineSearchForm');
  const medicinesGrid = document.getElementById('medicinesGrid');
  const resultsCount = document.querySelector('.results-count h3');

  let userLocation;

  async function nearbyPharmacySearchPromise(request) {
    const apiKey = "AIzaSyDJLn3hR4dbAXjIZ4On6_K0EyxsqIMqRPQ";
    const endpoint = `https://places.googleapis.com/v1/places:searchNearby`;

    const body = {
      includedTypes: ["pharmacy"],
      locationRestriction: {
        circle: {
          center: {
            latitude: request.location.lat,
            longitude: request.location.lng,
          },
          radius: request.radius,
        }
      }
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.location,places.rating,places.photos,places.formattedAddress,places.nationalPhoneNumber,places.currentOpeningHours",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Nearby Pharmacy Search API error:", await response.text());
      throw new Error("Nearby Pharmacy Search API failed");
    }

    const data = await response.json();
    return data.places || [];
  }

  function initMap() {
    const savedLat = localStorage.getItem("userLocationLat");
    const savedLng = localStorage.getItem("userLocationLon");
    const savedAddress = localStorage.getItem("userLocationAddress");

    if (savedLat && savedLng) {
      userLocation = {
        lat: parseFloat(savedLat),
        lng: parseFloat(savedLng),
      };
    } else {
      alert(
        "No user location found. Please allow location access or search for your address first."
      );
      return;
    }

    if (savedAddress) {
      const locText = document.getElementById("locationText");
      if (locText) locText.textContent = savedAddress;

      const resultCount = document.querySelector("#resultsCount strong");
      if (resultCount) resultCount.textContent = savedAddress;
    }

    document
      .getElementById("pharmacySearchForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        performPharmacySearch();
      });

    if (userLocation) {
      performPharmacySearch();
    }
  }

  async function performPharmacySearch() {
    if (!userLocation) {
      alert("User location not available.");
      return;
    }

    const distance = parseInt(document.getElementById("distance").value);
    const sortBy = document.getElementById("sortBy").value;

    const request = {
      location: userLocation,
      radius: distance
    };

    try {
      const places = await nearbyPharmacySearchPromise(request);
      renderPharmacyResults(places, sortBy);
    } catch (e) {
      console.error("Nearby pharmacy search error:", e);
      showNoPharmacyResults();
    }
  }

  function showNoPharmacyResults() {
    document.getElementById("pharmaciesGrid").innerHTML =
      "<p>No medical shops found.</p>";

    document.getElementById(
      "resultsCount"
    ).innerHTML = `
      <i class=\"fas fa-map-marker-alt\"></i> Showing 0 medical shops near <strong>${
        localStorage.getItem("userLocationAddress") || "Your Location"
      }</strong>`;
  }

  function renderPharmacyResults(places, sortBy) {
    const container = document.getElementById("pharmaciesGrid");
    container.innerHTML = "";

    const selectedType = document.getElementById("pharmacyType")?.value || "";

    // Sort places
    if (sortBy === "rating") {
      places.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortBy === "distance") {
      places.sort((a, b) =>
        distanceBetween(userLocation, a.location) - distanceBetween(userLocation, b.location)
      );
    }

    let shownCount = 0;

    for (const place of places) {
      const lat = place.location?.latitude;
      const lng = place.location?.longitude;

      let distanceKm = "Unknown";
      if (lat && lng) {
        const distanceMeters = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(userLocation),
          new google.maps.LatLng(lat, lng)
        );
        distanceKm = (distanceMeters / 1000).toFixed(2);
      }

      const name = place.displayName?.text || "Unnamed";
      const rating = place.rating ? ` ${place.rating}` : "No rating";

      // Determine pharmacy type
      const lowerName = name.toLowerCase();
      let type = "Pharmacy";
      if (lowerName.includes("chemist")) type = "Chemist";
      else if (lowerName.includes("medical")) type = "Medical Store";
      else if (lowerName.includes("pharmacy")) type = "Pharmacy";

      // Filter by selected type
      if (selectedType && type !== selectedType) continue;

      shownCount++;

      const photoUrl = place.photos?.[0]?.name
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&key=AIzaSyDJLn3hR4dbAXjIZ4On6_K0EyxsqIMqRPQ`
        : "https://placehold.co/400x300?text=No+Image+Available";

      const address = place.formattedAddress || "Address not available";
      let phone = "Phone not available";
      if (place.nationalPhoneNumber) {
        const cleaned = place.nationalPhoneNumber.replace(/\s+/g, "");
        phone = `<a href=\"tel:${cleaned}\" class=\"hospital-phone-link\">${place.nationalPhoneNumber}</a>`;
      }

      const isOpenNow = place.currentOpeningHours?.openNow;
      const openStatus = isOpenNow === true
        ? `<span class=\"open-now\">Open Now</span>`
        : isOpenNow === false
          ? `<span class=\"closed-now\">Closed</span>`
          : `<span class=\"unknown-status\">Hours Unknown</span>`;

      const card = `
        <div class=\"hospital-card\">
          <span class=\"hospital-badge\">${type}</span>
          <div class=\"hospital-image\" style=\"background-image: url('${photoUrl}')\"></div>
          <div class=\"hospital-info\">
            <h3 class=\"hospital-name\">${name}</h3>
            <div class=\"hospital-meta\">
              <div class=\"hospital-distance\">
                <i class=\"fas fa-location-arrow\"></i>
                <a href=\"https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}\" target=\"_blank\" class=\"distance-link\">
                  ${distanceKm} km away
                </a>
              </div>
              <div class=\"hospital-rating\"><i class=\"fas fa-star\"></i> ${rating}</div>
              <div class=\"hospital-address\"><i class=\"fas fa-map-marker-alt\"></i> ${address}</div>
              <div class=\"hospital-phone\"><i class=\"fas fa-phone-alt\"></i> ${phone}</div>
              <div class=\"hospital-status\">${openStatus}</div>
            </div>
          </div>
        </div>
      `;

      container.innerHTML += card;
    }

    document.getElementById("resultsCount").innerHTML = `
      <i class=\"fas fa-map-marker-alt\"></i> Showing <strong>${shownCount}</strong> medical shops near <strong>${
        localStorage.getItem("userLocationAddress") || "Your Location"
      }</strong>`;
  }

  function distanceBetween(from, to) {
    return google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(from),
      new google.maps.LatLng({ lat: to.latitude, lng: to.longitude })
    );
  }

  // Initial render
  initMap();

  // Handle form submit
  medicineForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameFilter = document.getElementById('medicineName').value.toLowerCase();
    const categoryFilter = document.getElementById('category').value;
    const brandFilter = document.getElementById('brand').value.toLowerCase();
    const availabilityFilter = document.getElementById('availability').value;

    const filtered = medicines.filter(med => {
      return (
        (nameFilter === '' || med.name.toLowerCase().includes(nameFilter)) &&
        (categoryFilter === '' || med.category === categoryFilter) &&
        (brandFilter === '' || med.brand.toLowerCase().includes(brandFilter)) &&
        (availabilityFilter === '' || med.availability === availabilityFilter)
      );
    });

    renderMedicines(filtered);
  });
});