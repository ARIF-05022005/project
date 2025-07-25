// Use the REST API to fetch labs with photos, like the hospital search
async function fetchNearbyLabsREST(userLocation, radius, type) {
  const apiKey = "AIzaSyDJLn3hR4dbAXjIZ4On6_K0EyxsqIMqRPQ";
  const endpoint = `https://places.googleapis.com/v1/places:searchNearby`;
  let includedTypes = ["medical_lab"];
  if (type === "diagnostic") includedTypes = ["diagnostic_lab"];
  else if (type === "pathology") includedTypes = ["pathology_lab"];
  else if (type === "blood test") includedTypes = ["blood_testing_service"];

  const body = {
    includedTypes,
    locationRestriction: {
      circle: {
        center: {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        },
        radius: parseInt(radius),
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
    console.error("Nearby Search API error:", await response.text());
    throw new Error("Nearby Search API failed");
  }

  const data = await response.json();
  return data.places || [];
}
let map, service;

function getNearbyLabs() {
  const type = document.getElementById("labType").value;
  const radius = document.getElementById("distance").value;
  const sortBy = document.getElementById("sortBy").value;
  const locationText = document.getElementById("user-location").innerText;

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: locationText }, async function(results, status) {
    if (status === "OK") {
      const userLocation = {
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng(),
      };
      try {
        const labs = await fetchNearbyLabsREST(userLocation, radius, type);
        if (sortBy === "rating") {
          labs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === "distance") {
          // Precompute and store distance for each lab, then sort by it
          const userLat = userLocation.lat;
          const userLng = userLocation.lng;
          function haversine(lat1, lon1, lat2, lon2) {
            const R = 6371; // km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
          }
          labs.forEach(lab => {
            const lat = lab.location?.latitude;
            const lng = lab.location?.longitude;
            if (lat && lng) {
              lab._distance = haversine(userLat, userLng, lat, lng);
            } else {
              lab._distance = Infinity;
            }
          });
          labs.sort((a, b) => a._distance - b._distance);
        }
        displayLabs(labs.slice(0, 20), locationText);
      } catch (e) {
        alert("No labs found near this location.");
      }
    } else {
      alert("Geocode failed: " + status);
    }
  });
}

function displayLabs(labs, locationText) {
  // Debug: log labs data to check for photos property
  console.log('Labs data:', labs);
  const resultsHeader = document.getElementById("results-header");
  resultsHeader.style.display = labs.length ? "block" : "none";
  resultsHeader.innerHTML =
    `<div class="results-count"><i class='fas fa-map-marker-alt'></i> Showing ${labs.length} labs near <strong>${locationText}</strong></div>`;

  const container = document.getElementById("labResults");
  container.innerHTML = "";

  // Get user location for distance calculation
  const userLat = localStorage.getItem("userLocationLat");
  const userLng = localStorage.getItem("userLocationLon");
  let userLocation = null;
  if (userLat && userLng) {
    userLocation = { lat: parseFloat(userLat), lng: parseFloat(userLng) };
  }

  labs.forEach((lab) => {
    // Use REST API field names
    const name = lab.displayName?.text || "Name not available";
    const address = lab.formattedAddress || "Address not available";
    let phone = "Phone not available";
    if (lab.nationalPhoneNumber) {
      const cleaned = lab.nationalPhoneNumber.replace(/\s+/g, "");
      phone = `<a href="tel:${cleaned}" class="lab-phone-link">${lab.nationalPhoneNumber}</a>`;
    }
    const rating = lab.rating !== undefined ? lab.rating : "No rating";
    const isOpenNow = lab.currentOpeningHours?.openNow;
    const openStatus = isOpenNow === true
      ? `<span class="open-now">Open Now</span>`
      : isOpenNow === false
        ? `<span class="closed-now">Closed</span>`
        : `<span class="unknown-status">Hours Unknown</span>`;

    // Lab type detection (simple)
    const lowerName = name.toLowerCase();
    let type = "Lab Center";
    if (lowerName.includes("diagnostic")) type = "Diagnostic Lab";
    else if (lowerName.includes("pathology")) type = "Pathology Lab";
    else if (lowerName.includes("blood")) type = "Blood Test Lab";

    // Location and distance
    const lat = lab.location?.latitude;
    const lng = lab.location?.longitude;
    let distanceKm = "Unknown";
    if (typeof lab._distance === 'number' && isFinite(lab._distance)) {
      distanceKm = lab._distance.toFixed(2);
    } else if (userLocation && lat && lng) {
      const R = 6371; // km
      const dLat = (lat - userLocation.lat) * Math.PI / 180;
      const dLng = (lng - userLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distanceKm = (R * c).toFixed(2);
    }

    // Photo
    let photoUrl = "https://placehold.co/400x300?text=No+Image+Available";
    if (lab.photos && lab.photos.length > 0 && lab.photos[0].name) {
      const ref = lab.photos[0].name;
      photoUrl = `https://places.googleapis.com/v1/${ref}/media?maxHeightPx=400&key=AIzaSyDJLn3hR4dbAXjIZ4On6_K0EyxsqIMqRPQ`;
    }

    const card = `
      <div class="hospital-card">
        <span class="hospital-badge">${type}</span>
        <div class="hospital-image" style="background-image: url('${photoUrl}')"></div>
        <div class="hospital-info">
          <h3 class="hospital-name">${name}</h3>
          <div class="hospital-meta">
            <div class="hospital-distance">
              <i class="fas fa-location-arrow"></i>
              ${lat && lng ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="distance-link">${distanceKm} km away</a>` : ""}
            </div>
            <div class="hospital-rating"><i class="fas fa-star"></i> ${rating}</div>
            <div class="hospital-address"><i class="fas fa-map-marker-alt"></i> ${address}</div>
            <div class="hospital-phone"><i class="fas fa-phone-alt"></i> ${phone}</div>
            <div class="hospital-status">${openStatus}</div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML += card;
  });
}



