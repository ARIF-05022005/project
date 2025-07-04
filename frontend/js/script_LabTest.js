document.addEventListener("DOMContentLoaded", () => {
  const labTests = [
    {
      name: "Complete Blood Count",
      category: "Blood Test",
      lab: "Apollo Lab",
      availability: "Available",
      image: "https://img.icons8.com/fluency/96/lab-items.png"
    },
    {
      name: "Chest X-Ray",
      category: "Imaging",
      lab: "City Diagnostics",
      availability: "Available",
      image: "https://img.icons8.com/fluency/96/x-ray.png"
    },
    {
      name: "Urine Routine",
      category: "Urine Test",
      lab: "HealthCare Labs",
      availability: "Not Available",
      image: "https://img.icons8.com/fluency/96/test-tube.png"
    }
  ];

  const form = document.getElementById("labTestSearchForm");
  const grid = document.getElementById("labTestsGrid");
  const count = document.querySelector(".results-count h3");

  function renderLabTests(tests) {
    grid.innerHTML = "";
    count.textContent = `${tests.length} Lab Tests Found`;

    tests.forEach(test => {
      const card = document.createElement("div");
      card.className = "doctor-card";
      card.innerHTML = `
        <div class="doctor-image" style="background-image: url('${test.image}');"></div>
        <div class="doctor-info">
          <div class="doctor-name">${test.name}</div>
          <div class="doctor-qualification">${test.category}</div>
          <div class="doctor-location"><i class="fas fa-flask"></i> ${test.lab}</div>
          <div class="doctor-available"><i class="fas fa-warehouse"></i> ${test.availability}</div>
          <div class="doctor-actions">
            <button class="view-profile">View Details</button>
            <button class="book-now">Book Test</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.testName.value.toLowerCase();
    const category = form.category.value;
    const labName = form.labName.value.toLowerCase();
    const availability = form.availability.value;

    const filtered = labTests.filter(test =>
      (!name || test.name.toLowerCase().includes(name)) &&
      (!category || test.category === category) &&
      (!labName || test.lab.toLowerCase().includes(labName)) &&
      (!availability || test.availability === availability)
    );
    renderLabTests(filtered);
  });

  // Initial render
  renderLabTests(labTests);
});
