document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const address = localStorage.getItem("userLocationAddress");
    if (address) {
      const locText = document.getElementById("locationText");
      if (locText) {
        locText.textContent = address;
      }

      const resultCount = document.querySelector("#resultsCount strong");
      if (resultCount) {
        resultCount.textContent = address;
      }
    }

    // ✅ Make location clickable and set return URL
    const locSection = document.getElementById("locationSection");
    if (locSection) {
      locSection.style.cursor = "pointer";
      const goToLocationSelector = () => {
        localStorage.setItem("locationReturnUrl", window.location.href);
        window.location.href = "../pages/select_location.html";
      };

      locSection.addEventListener("click", goToLocationSelector);
      locSection.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          goToLocationSelector();
        }
      });
    }
  }, 50);
});