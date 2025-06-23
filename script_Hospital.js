        
        const hospitals = [
            { name: "General Hospital", distance: 3, services: ["Emergency", "Routine Care"] },
            { name: "Children's Hospital", distance: 4, services: ["Emergency"] },
            { name: "Specialized Hospital", distance: 8, services: ["Routine Care"] },
            // Add more hospital data as needed
        ];

        document.getElementById('search').onclick = function() {
            const hospitalType = document.getElementById('hospital-type').value;
            const distanceFilter = parseInt(document.getElementById('distance').value.split(' ')[1]);
            const services = Array.from(document.getElementById('services').selectedOptions).map(o => o.value);
            const sortBy = document.getElementById('sort-by').value;

            // Filter hospitals
            let filteredHospitals = hospitals.filter(hospital => {
                return (hospitalType === "All Types" || hospital.name.includes(hospitalType))
                    && hospital.distance <= distanceFilter;
            });

            // Sort hospitals
            if (sortBy === "Distance (Nearest First)") {
                filteredHospitals.sort((a, b) => a.distance - b.distance);
            }

            // Display hospitals
            const hospitalList = document.getElementById('hospital-list');
            hospitalList.innerHTML = '';
            filteredHospitals.forEach(hospital => {
                const div = document.createElement('div');
                div.textContent = `${hospital.name} - ${hospital.distance} km away`;
                hospitalList.appendChild(div);
            });
        };
    
