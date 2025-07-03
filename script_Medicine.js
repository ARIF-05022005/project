document.addEventListener('DOMContentLoaded', () => {
  const medicineForm = document.getElementById('medicineSearchForm');
  const medicinesGrid = document.getElementById('medicinesGrid');
  const resultsCount = document.querySelector('.results-count h3');

  // Dummy medicines data (replace with real API/data later)
  const medicines = [
    {
      name: 'Paracetamol',
      category: 'Pain Relief',
      brand: 'Cipla',
      availability: 'In Stock',
      price: '₹50',
      image: 'https://img.icons8.com/color/200/000000/pill.png'
    },
    {
      name: 'Amoxicillin',
      category: 'Antibiotics',
      brand: 'Sun Pharma',
      availability: 'Out of Stock',
      price: '₹120',
      image: 'https://img.icons8.com/color/200/000000/capsule.png'
    },
    {
      name: 'Vitamin C Tablets',
      category: 'Vitamins',
      brand: 'Himalaya',
      availability: 'In Stock',
      price: '₹90',
      image: 'https://img.icons8.com/color/200/000000/vitamins.png'
    }
    // Add more if needed
  ];

  // Render medicines to grid
  function renderMedicines(data) {
    medicinesGrid.innerHTML = '';
    data.forEach(med => {
      const card = document.createElement('div');
      card.classList.add('doctor-card');
      card.innerHTML = `
        <div class="doctor-image" style="background-image: url('${med.image}');"></div>
        <div class="doctor-info">
          <h3 class="doctor-name">${med.name}</h3>
          <div class="doctor-qualification">${med.category} | ${med.brand}</div>
          <div class="doctor-available">
            <i class="fas fa-warehouse"></i> ${med.availability}
          </div>
          <div class="doctor-rating">
            <i class="fas fa-rupee-sign"></i> ${med.price}
          </div>
        </div>
      `;
      medicinesGrid.appendChild(card);
    });
    resultsCount.textContent = `${data.length} Medicines Found`;
  }

  // Initial render
  renderMedicines(medicines);

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
