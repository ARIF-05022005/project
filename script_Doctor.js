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

// Doctor Data Service
const DoctorService = {
  /**
   * Get all doctors (simulated API call with realistic delay)
   * @returns {Promise<Array>} Array of doctor objects
   */
  getAllDoctors: function() {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Dr. Sarah Johnson',
            specialty: 'Cardiology',
            qualification: 'MD, FACC',
            rating: 4.5,
            reviews: 128,
            availability: 'Today',
            consultationType: 'Both',
            image: 'https://randomuser.me/api/portraits/women/65.jpg',
            location: 'Downtown',
            languages: ['English', 'Spanish'],
            insurance: ['BlueCross', 'Aetna'],
            bio: 'Board-certified cardiologist with 15 years of experience.'
          },
          {
            id: 2,
            name: 'Dr. Michael Chen',
            specialty: 'Neurology',
            qualification: 'MD, PhD',
            rating: 4.8,
            reviews: 76,
            availability: 'Tomorrow',
            consultationType: 'In-person',
            image: 'https://randomuser.me/api/portraits/men/22.jpg',
            location: 'North District',
            languages: ['English', 'Mandarin'],
            insurance: ['Cigna', 'United Healthcare'],
            bio: 'Specializing in movement disorders and neurodegenerative diseases.'
          },
          // More doctors...
        ]);
      }, 800); // Simulate network delay
    });
  },

  /**
   * Get filter options for dropdowns 
   * (could be from API in real implementation)
   */
  getFilterOptions: function() {
    return {
      specialties: SPECIALTIES,
      languages: LANGUAGES,
      insuranceProviders: INSURANCE_PROVIDERS,
      locations: ['Downtown', 'North District', 'South District', 'East District', 'West District']
    };
  }
};

// UI Controller
const UIController = (function() {
  // Private DOM elements
  const elements = {
    doctorSearchForm: document.getElementById('doctorSearchForm'),
    doctorsGrid: document.getElementById('doctorsGrid'),
    resultsCount: document.querySelector('.results-count'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    specialtySelect: document.getElementById('specialty'),
    locationSelect: document.getElementById('location'),
    languageSelect: document.getElementById('language'),
    insuranceSelect: document.getElementById('insurance')
  };

  // Private methods
  function showLoading(show) {
    elements.loadingIndicator.style.display = show ? 'block' : 'none';
    elements.doctorsGrid.style.display = show ? 'none' : 'grid';
  }

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

    // Setup filter dropdowns with options
    setupFilters: async function() {
      const options = DoctorService.getFilterOptions();
      
      // Populate specialty dropdown
      elements.specialtySelect.innerHTML = `
        <option value="">All Specialties</option>
        ${options.specialties.map(s => `<option value="${s}">${s}</option>`).join('')}
      `;
      
      // Populate location dropdown
      elements.locationSelect.innerHTML = `
        <option value="">All Locations</option>
        ${options.locations.map(l => `<option value="${l}">${l}</option>`).join('')}
      `;
      
      // Populate other dropdowns similarly...
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
          const card = e.target.closest('.doctor-card');
          const doctorId = card.dataset.id;
          this.viewDoctorProfile(doctorId);
        }
        
        if (e.target.closest('.book-now')) {
          const card = e.target.closest('.doctor-card');
          const doctorId = card.dataset.id;
          this.bookAppointment(doctorId);
        }
      });
    },

    // Main function to load and display doctors
    loadDoctors: async function() {
      try {
        showLoading(true);
        const doctors = await DoctorService.getAllDoctors();
        this.renderDoctors(doctors);
        this.updateResultsCount(doctors.length);
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
        
        const formData = new FormData(elements.doctorSearchForm);
        const filters = {
          specialty: formData.get('specialty'),
          location: formData.get('location'),
          language: formData.get('language'),
          insurance: formData.get('insurance')
        };

        const doctors = await DoctorService.getAllDoctors();
        const filteredDoctors = this.filterDoctors(doctors, filters);
        
        this.renderDoctors(filteredDoctors);
        this.updateResultsCount(filteredDoctors.length);
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
      
      if (doctors.length === 0) {
        elements.doctorsGrid.innerHTML = `
          <div class="no-results">
            <i class="fas fa-user-md"></i>
            <p>No doctors found matching your criteria</p>
          </div>
        `;
        return;
      }

      doctors.forEach(doctor => {
        const doctorCard = this.createDoctorCard(doctor);
        elements.doctorsGrid.appendChild(doctorCard);
      });
    },

    // Create a doctor card element
    createDoctorCard: function(doctor) {
      const card = document.createElement('div');
      card.className = 'doctor-card';
      card.dataset.id = doctor.id;
      
      card.innerHTML = `
        <div class="doctor-image" style="background-image: url('${doctor.image}')">
          <span class="doctor-specialty">${doctor.specialty}</span>
          ${getConsultationBadge(doctor.consultationType)}
        </div>
        <div class="doctor-info">
          <h3 class="doctor-name">${doctor.name}</h3>
          <p class="doctor-qualification">${doctor.qualification}</p>
          <div class="doctor-rating">
            ${generateRatingStars(doctor.rating)}
            <span class="review-count">${doctor.reviews} reviews</span>
          </div>
          <div class="doctor-available">
            <i class="fas fa-calendar-check"></i>
            <span>${doctor.availability}</span>
          </div>
          <div class="doctor-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${doctor.location}</span>
          </div>
          <div class="doctor-actions">
            <button class="view-profile">
              <i class="fas fa-user-circle"></i> Profile
            </button>
            <button class="book-now">
              <i class="fas fa-calendar-plus"></i> Book
            </button>
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
