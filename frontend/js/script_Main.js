document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = './login.html';
    return;
  }

  // Load saved location from localStorage
  const savedAddress = localStorage.getItem('userLocationAddress');
  if (savedAddress) {
    document.getElementById('locationText').textContent = savedAddress;
  } else {
    document.getElementById('locationText').textContent = "Your Location";
  }

  // ===============================
  // CAROUSEL SLIDE FUNCTIONALITY
  // ===============================

  const carouselSlide = document.getElementById("carouselSlide");
  const items = document.querySelectorAll(".carousel-item");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  let index = 0;

  function updateCarousel() {
    const width = items[0].clientWidth;
    carouselSlide.style.transform = `translateX(-${index * width}px)`;

    // Remove active class from all
    items.forEach(item => item.classList.remove("active"));

    // Add active class to current slide
    items[index].classList.add("active");
  }

  function showNext() {
    index = (index + 1) % items.length;
    updateCarousel();
  }

  function showPrev() {
    index = (index - 1 + items.length) % items.length;
    updateCarousel();
  }

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", showNext);
    prevBtn.addEventListener("click", showPrev);

    // Auto-slide every 5s
    setInterval(showNext, 3000);
  }

  updateCarousel();
});