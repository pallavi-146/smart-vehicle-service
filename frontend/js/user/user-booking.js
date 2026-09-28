// ============ BOOKING DATA ============
let selectedData = {
    vehicleType: null,
    city: null,
    brand: null,
    model: null,
    fuelType: null,
    serviceType: null
};

let currentStep = 1;
const totalSteps = 6;

// Vehicle Types Data
const vehicleTypes = [
    { id: 'car', name: 'Car', icon: 'fa-car' },
    { id: 'bike', name: 'Bike', icon: 'fa-motorcycle' },
    { id: 'scooter', name: 'Scooter', icon: 'fa-scooter' }
];

// Cities Data
const cities = [
    'Bengaluru', 'Mysuru', 'Hubballi', 'Dharwad', 'Belagavi', 'Mangaluru', 
    'Kalaburagi', 'Davanagere', 'Ballari', 'Shivamogga', 'Tumakuru', 'Raichur', 
    'Bidar', 'Hassan', 'Mandya', 'Kolar', 'Udupi', 'Chitradurga', 'Gadag', 
    'Haveri', 'Koppal', 'Bagalkot', 'Vijayapura', 'Yadgir', 'Chamarajanagar', 
    'Ramanagara', 'Chikkaballapur'
];

// Brands by Vehicle Type
const brandsByVehicle = {
    car: ['Maruti Suzuki', 'Hyundai', 'Honda', 'TATA', 'Ford', 'Mahindra', 'Toyota', 'Kia', 'Skoda', 'Volkswagen', 'Renault', 'Nissan', 'MG', 'Jeep'],
    bike: ['Hero', 'Honda', 'Bajaj', 'TVS', 'Yamaha', 'Suzuki', 'Royal Enfield', 'KTM', 'Ducati', 'Harley-Davidson', 'Kawasaki', 'BMW'],
    scooter: ['Honda', 'TVS', 'Suzuki', 'Yamaha', 'Piaggio', 'Hero', 'Bajaj', 'Aprilia', 'Vespa']
};

// Models by Brand
const modelsByBrand = {
    'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Vitara Brezza', 'Ertiga', 'Ciaz', 'Alto', 'WagonR', 'S-Presso', 'Ignis', 'XL6', 'Jimny'],
    'Hyundai': ['i20', 'i10', 'Creta', 'Venue', 'Verna', 'Elantra', 'Tucson', 'Aura', 'Grand i10', 'Santro', 'Alcazar', 'Kona'],
    'Honda': ['City', 'Amaze', 'WR-V', 'Jazz', 'CR-V', 'Brio', 'Mobilio', 'Civic', 'Elevate'],
    'TATA': ['Nexon', 'Punch', 'Tiago', 'Altroz', 'Tigor', 'Harrier', 'Safari', 'Indica', 'Indigo', 'Nano'],
    'Ford': ['Figo', 'Aspire', 'EcoSport', 'Endeavour', 'Freestyle', 'Mustang'],
    'Mahindra': ['XUV700', 'Thar', 'Scorpio', 'XUV300', 'Marazzo', 'KUV100', 'Bolero'],
    'Toyota': ['Innova', 'Fortuner', 'Camry', 'Glanza', 'Urban Cruiser', 'Yaris', 'Corolla'],
    'Kia': ['Seltos', 'Sonet', 'Carens', 'EV6'],
    'Skoda': ['Octavia', 'Superb', 'Kushaq', 'Slavia', 'Rapid'],
    'Hero': ['Splendor', 'Passion', 'Glamour', 'HF Deluxe', 'Maestro', 'Pleasure', 'Destiny', 'Xpulse'],
    'Honda Bike': ['Activa', 'Dio', 'Shine', 'Unicorn', 'CB Hornet', 'CB Shine', 'Grazia', 'CBR'],
    'TVS': ['Apache', 'Jupiter', 'Ntorq', 'WeGo', 'XL100', 'Sport', 'Star City', 'Raider'],
    'Bajaj': ['Pulsar', 'Discover', 'Platina', 'CT100', 'Dominar', 'Avenger', 'KTM'],
    'Yamaha': ['FZ', 'R15', 'MT-15', 'RayZR', 'Fascino', 'Aerox'],
    'Royal Enfield': ['Classic 350', 'Bullet', 'Meteor', 'Hunter 350', 'Continental GT', 'Interceptor']
};

// Fuel Types
const fuelTypes = [
    { id: 'petrol', name: 'Petrol', icon: 'fa-gas-pump' },
    { id: 'cng', name: 'CNG', icon: 'fa-industry' },
    { id: 'diesel', name: 'Diesel', icon: 'fa-oil-can' }
];

// Services Data
const services = [
    { name: 'Engine Repair', price: 2499, icon: 'fa-engine' },
    { name: 'Oil Change', price: 499, icon: 'fa-oil-can' },
    { name: 'Brake Service', price: 899, icon: 'fa-car-side' },
    { name: 'AC Repair', price: 1199, icon: 'fa-fan' },
    { name: 'Battery Replacement', price: 1599, icon: 'fa-car-battery' },
    { name: 'Towing Service', price: 1999, icon: 'fa-towing' },
    { name: 'Tyre Replacement', price: 1299, icon: 'fa-circle' },
    { name: 'Full Service', price: 3499, icon: 'fa-tools' },
    { name: 'Clutch Repair', price: 899, icon: 'fa-cogs' },
    { name: 'Suspension Work', price: 1499, icon: 'fa-car' },
    { name: 'Denting & Painting', price: 1999, icon: 'fa-paint-roller' },
    { name: 'Car Wash', price: 299, icon: 'fa-car-wash' }
];

// ============ STEP NAVIGATION ============
function showStep(step) {
    document.querySelectorAll('[id$="Step"]').forEach(el => el.style.display = 'none');
    
    if (step === 1) document.getElementById('vehicleTypeStep').style.display = 'block';
    else if (step === 2) document.getElementById('cityStep').style.display = 'block';
    else if (step === 3) document.getElementById('brandStep').style.display = 'block';
    else if (step === 4) document.getElementById('modelStep').style.display = 'block';
    else if (step === 5) document.getElementById('fuelStep').style.display = 'block';
    else if (step === 6) document.getElementById('serviceStep').style.display = 'block';
    
    // Update step indicator
    for (let i = 1; i <= totalSteps; i++) {
        const stepDiv = document.getElementById(`step${i === 1 ? 'VehicleType' : i === 2 ? 'City' : i === 3 ? 'Brand' : i === 4 ? 'Model' : i === 5 ? 'Fuel' : 'Service'}`);
        if (stepDiv) {
            if (i < step) stepDiv.classList.add('completed');
            else if (i === step) stepDiv.classList.add('active');
            else stepDiv.classList.remove('active', 'completed');
        }
    }
}

function nextStep(current) {
    if (validateStep(current)) {
        currentStep++;
        showStep(currentStep);
        if (currentStep === 3) loadBrands();
        if (currentStep === 4 && selectedData.brand) loadModels();
    }
}

function prevStep() {
    currentStep--;
    showStep(currentStep);
}

function validateStep(step) {
    if (step === 1 && !selectedData.vehicleType) {
        alert('Please select vehicle type');
        return false;
    }
    if (step === 2 && !selectedData.city) {
        alert('Please select city');
        return false;
    }
    if (step === 3 && !selectedData.brand) {
        alert('Please select brand');
        return false;
    }
    if (step === 4 && !selectedData.model) {
        alert('Please select model');
        return false;
    }
    if (step === 5 && !selectedData.fuelType) {
        alert('Please select fuel type');
        return false;
    }
    return true;
}

// ============ VEHICLE TYPE ============
function loadVehicleTypes() {
    const grid = document.getElementById('vehicleTypeGrid');
    grid.innerHTML = vehicleTypes.map(v => `
        <div class="selection-card ${selectedData.vehicleType === v.id ? 'selected' : ''}" 
             onclick="selectVehicleType('${v.id}')">
            <i class="fas ${v.icon} fa-3x"></i>
            <h4>${v.name}</h4>
        </div>
    `).join('');
}

function selectVehicleType(type) {
    selectedData.vehicleType = type;
    loadVehicleTypes();
    setTimeout(() => nextStep(1), 300);
}

// ============ CITY ============
function loadCities() {
    const grid = document.getElementById('cityGrid');
    grid.innerHTML = cities.map(c => `
        <div class="selection-card ${selectedData.city === c ? 'selected' : ''}" 
             onclick="selectCity('${c}')">
            <i class="fas fa-city fa-2x"></i>
            <h4>${c}</h4>
        </div>
    `).join('');
}

function selectCity(city) {
    selectedData.city = city;
    loadCities();
    setTimeout(() => nextStep(2), 300);
}

function detectLocation() {
    alert('📍 Location detected: Bengaluru');
    selectCity('Bengaluru');
}

// ============ BRAND ============
function loadBrands() {
    const brands = brandsByVehicle[selectedData.vehicleType] || [];
    const grid = document.getElementById('brandGrid');
    grid.innerHTML = brands.map(b => `
        <div class="selection-card ${selectedData.brand === b ? 'selected' : ''}" 
             onclick="selectBrand('${b}')">
            <i class="fas fa-building fa-2x"></i>
            <h4>${b}</h4>
        </div>
    `).join('');
}

function selectBrand(brand) {
    selectedData.brand = brand;
    loadBrands();
    setTimeout(() => nextStep(3), 300);
}

// ============ MODEL ============
function loadModels() {
    let models = modelsByBrand[selectedData.brand] || [];
    if (models.length === 0) {
        models = ['Nexon', 'Punch', 'Tiago', 'Altroz', 'Swift', 'Baleno', 'i20', 'Creta', 'City', 'Amaze', 'Activa', 'Jupiter', 'Apache', 'Pulsar'];
    }
    const grid = document.getElementById('modelGrid');
    grid.innerHTML = models.map(m => `
        <div class="selection-card ${selectedData.model === m ? 'selected' : ''}" 
             onclick="selectModel('${m}')">
            <i class="fas fa-car fa-2x"></i>
            <h4>${m}</h4>
        </div>
    `).join('');
}

function selectModel(model) {
    selectedData.model = model;
    loadModels();
    setTimeout(() => nextStep(4), 300);
}

function useCustomModel() {
    const customModel = document.getElementById('customModel').value;
    if (customModel) {
        selectModel(customModel);
    } else {
        alert('Please enter a model name');
    }
}

// ============ FUEL ============
function loadFuelTypes() {
    const grid = document.getElementById('fuelGrid');
    grid.innerHTML = fuelTypes.map(f => `
        <div class="selection-card ${selectedData.fuelType === f.id ? 'selected' : ''}" 
             onclick="selectFuelType('${f.id}')">
            <i class="fas ${f.icon} fa-2x"></i>
            <h4>${f.name}</h4>
        </div>
    `).join('');
}

function selectFuelType(fuel) {
    selectedData.fuelType = fuel;
    loadFuelTypes();
    setTimeout(() => nextStep(5), 300);
}

// ============ SERVICE ============
function loadServices() {
    const container = document.getElementById('serviceOptions');
    container.innerHTML = services.map(s => `
        <div class="service-card ${selectedData.serviceType === s.name ? 'selected' : ''}" 
             onclick="selectService('${s.name}', ${s.price})">
            <div class="service-icon"><i class="fas ${s.icon}"></i></div>
            <div class="service-info">
                <h4>${s.name}</h4>
                <p>Starting ₹${s.price}</p>
            </div>
        </div>
    `).join('');
}

function selectService(serviceName, price) {
    selectedData.serviceType = serviceName;
    selectedData.servicePrice = price;
    document.querySelectorAll('.service-card').forEach(card => card.classList.remove('selected'));
    event.target.closest('.service-card').classList.add('selected');
}

// ============ SUBMIT BOOKING ============
async function submitFinalBooking() {
    const vehicleNumber = document.getElementById('vehicleNumber').value;
    const serviceDate = document.getElementById('serviceDate').value;
    
    if (!selectedData.serviceType) {
        alert('Please select a service');
        return;
    }
    if (!vehicleNumber) {
        alert('Please enter vehicle number');
        return;
    }
    if (!serviceDate) {
        alert('Please select service date');
        return;
    }
    
    const bookingData = {
        serviceType: selectedData.serviceType,
        vehicleModel: selectedData.model,
        vehicleNumber: vehicleNumber,
        preferredDate: serviceDate,
        preferredTime: document.getElementById('serviceTime')?.value || 'Anytime',
        description: document.getElementById('serviceDescription')?.value || '',
        estimatedCost: selectedData.servicePrice,
        location: { city: selectedData.city, address: selectedData.city },
        vehicleDetails: {
            type: selectedData.vehicleType,
            brand: selectedData.brand,
            model: selectedData.model,
            fuel: selectedData.fuelType
        }
    };
    
    try {
        const response = await fetch('/api/bookings/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        const data = await response.json();
        if (data.success) {
            Swal.fire('Success!', 'Your booking has been created successfully!', 'success')
                .then(() => window.location.reload());
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Something went wrong', 'error');
    }
}

// ============ SEARCH FUNCTIONALITY ============
document.getElementById('citySearch')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = cities.filter(c => c.toLowerCase().includes(searchTerm));
    document.getElementById('cityGrid').innerHTML = filtered.map(c => `
        <div class="selection-card" onclick="selectCity('${c}')">
            <i class="fas fa-city fa-2x"></i>
            <h4>${c}</h4>
        </div>
    `).join('');
});

document.getElementById('brandSearch')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const brands = brandsByVehicle[selectedData.vehicleType] || [];
    const filtered = brands.filter(b => b.toLowerCase().includes(searchTerm));
    document.getElementById('brandGrid').innerHTML = filtered.map(b => `
        <div class="selection-card" onclick="selectBrand('${b}')">
            <i class="fas fa-building fa-2x"></i>
            <h4>${b}</h4>
        </div>
    `).join('');
});

document.getElementById('modelSearch')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    let models = modelsByBrand[selectedData.brand] || [];
    const filtered = models.filter(m => m.toLowerCase().includes(searchTerm));
    document.getElementById('modelGrid').innerHTML = filtered.map(m => `
        <div class="selection-card" onclick="selectModel('${m}')">
            <i class="fas fa-car fa-2x"></i>
            <h4>${m}</h4>
        </div>
    `).join('');
});

document.getElementById('serviceSearch')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = services.filter(s => s.name.toLowerCase().includes(searchTerm));
    document.getElementById('serviceOptions').innerHTML = filtered.map(s => `
        <div class="service-card" onclick="selectService('${s.name}', ${s.price})">
            <div class="service-icon"><i class="fas ${s.icon}"></i></div>
            <div class="service-info">
                <h4>${s.name}</h4>
                <p>Starting ₹${s.price}</p>
            </div>
        </div>
    `).join('');
});

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', () => {
    loadVehicleTypes();
    loadCities();
    loadFuelTypes();
    loadServices();
    showStep(1);
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('serviceDate');
    if (dateInput) dateInput.min = today;
});