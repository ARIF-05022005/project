document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '../login.html';
    return;
  }

  // Initialize Google Places Autocomplete
  initAutocomplete();

  // Handle "Use Current Location" button
  const currentBtn = document.getElementById('useCurrentBtn');
  if (currentBtn) {
    currentBtn.addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=AIzaSyDJLn3hR4dbAXjIZ4On6_K0EyxsqIMqRPQ`
              );

              const data = await res.json();

              if (data.status === "OK" && data.results.length > 0) {
                const address = data.results[0].formatted_address;
                console.log("✅ Reverse geocoded address:", address);

                await saveLocation(address, lat, lon);

                localStorage.setItem("userLocationAddress", address);
                localStorage.setItem("userLocationLat", lat);
                localStorage.setItem("userLocationLon", lon);

                // Redirect back to the page you came from
                const returnUrl = localStorage.getItem("locationReturnUrl") || "../indexMainpage.html";
                window.location.href = returnUrl;

              } else {
                alert("Could not retrieve address from Google Maps.");
              }

            } catch (err) {
              alert("Error retrieving location: " + err.message);
              console.error(err);
            }
          },
          (error) => {
            alert("Geolocation failed: " + error.message);
            console.error(error);
          }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    });
  }
});

function initAutocomplete() {
  const input = document.getElementById("locationSearch");
  if (!input) return;

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["geocode"],
    componentRestrictions: { country: "in" }
  });

  autocomplete.addListener("place_changed", async () => {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      alert("No details available for the input.");
      return;
    }

    const lat = place.geometry.location.lat();
    const lon = place.geometry.location.lng();
    const address = place.formatted_address || place.name;

    console.log("✅ User selected place:", address);

    await saveLocation(address, lat, lon);

    localStorage.setItem("userLocationAddress", address);
    localStorage.setItem("userLocationLat", lat);
    localStorage.setItem("userLocationLon", lon);

    // Redirect back to the page you came from
    const returnUrl = localStorage.getItem("locationReturnUrl") || "../indexMainpage.html";
    window.location.href = returnUrl;
  });
}

async function saveLocation(address, lat, lon) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('http://localhost:5050/api/user/location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        address,
        latitude: lat,
        longitude: lon,
      }),
    });

    if (response.ok) {
      console.log("✅ Location saved successfully to backend.");
    } else {
      console.error("❌ Error saving location:", await response.text());
    }
  } catch (error) {
    console.error("❌ Error saving location:", error);
  }
}