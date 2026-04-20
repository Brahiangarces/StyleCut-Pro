// Barber registration system
let currentStep = 1;
let registrationData = {
    basicInfo: {},
    services: [],
    specialties: [],
    location: {},
    hours: {},
    logo: null,
    latitude: null,
    longitude: null
};

// Initialize registration
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateStepIndicators();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('barberRegistrationForm').addEventListener('submit', handleSubmit);
    document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
}

// Handle logo upload
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('La imagen no debe superar los 5MB', 'error');
            event.target.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.match('image.*')) {
            showNotification('Por favor selecciona un archivo de imagen válido', 'error');
            event.target.value = '';
            return;
        }
        
        // Read and display the image
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoPreview = document.getElementById('logoPreview');
            logoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo de barbería" class="w-full h-full object-cover rounded-lg">`;
            registrationData.logo = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Add service
function addService() {
    const servicesContainer = document.querySelector('#step2 .space-y-4');
    const serviceDiv = document.createElement('div');
    serviceDiv.className = 'border border-gray-200 rounded-lg p-4';
    serviceDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" class="service-name px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600" placeholder="Nombre del servicio">
            <input type="text" class="service-price px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600" placeholder="Precio">
            <input type="text" class="service-duration px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600" placeholder="Duración">
            <button type="button" onclick="removeService(this)" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    servicesContainer.appendChild(serviceDiv);
}

// Remove service
function removeService(button) {
    button.closest('.border').remove();
}

// Get current location
function getCurrentLocation() {
    const locationStatus = document.getElementById('locationStatus');
    
    if (!navigator.geolocation) {
        locationStatus.innerHTML = '<span class="text-red-600">Tu navegador no soporta geolocalización</span>';
        return;
    }
    
    locationStatus.innerHTML = '<span class="text-blue-600">Obteniendo ubicación...</span>';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            registrationData.latitude = position.coords.latitude;
            registrationData.longitude = position.coords.longitude;
            
            // Get address from coordinates (reverse geocoding)
            getAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
            
            locationStatus.innerHTML = '<span class="text-green-600">Ubicación obtenida correctamente</span>';
        },
        (error) => {
            let errorMessage = 'Error al obtener ubicación: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Permiso denegado';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Información no disponible';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Tiempo de espera agotado';
                    break;
                default:
                    errorMessage += 'Error desconocido';
                    break;
            }
            locationStatus.innerHTML = '<span class="text-red-600">' + errorMessage + '</span>';
        }
    );
}

// Get address from coordinates
function getAddressFromCoordinates(lat, lng) {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                document.getElementById('address').value = data.display_name;
                registrationData.location.address = data.display_name;
            }
        })
        .catch(error => {
            console.error('Error getting address:', error);
        });
}

// Change step
function changeStep(direction) {
    // Validate current step before moving forward
    if (direction > 0 && !validateCurrentStep()) {
        return;
    }
    
    // Save current step data
    saveCurrentStepData();
    
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    
    // Update step
    currentStep += direction;
    
    // Show new step
    document.getElementById(`step${currentStep}`).classList.remove('hidden');
    
    // Update UI
    updateStepIndicators();
    updateNavigationButtons();
    
    // Load review data if on step 4
    if (currentStep === 4) {
        loadReviewData();
    }
}

// Validate current step
function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            const requiredFields = ['shopName', 'barberEmail', 'barberPhone', 'barberPassword', 'confirmPassword', 'description'];
            for (let field of requiredFields) {
                if (!document.getElementById(field).value.trim()) {
                    showNotification('Por favor completa todos los campos obligatorios', 'error');
                    document.getElementById(field).focus();
                    return false;
                }
            }
            
            // Validate email
            const email = document.getElementById('barberEmail').value;
            if (!isValidEmail(email)) {
                showNotification('Por favor ingresa un email válido', 'error');
                return false;
            }
            
            // Validate password
            const password = document.getElementById('barberPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password.length < 6) {
                showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
                document.getElementById('barberPassword').focus();
                return false;
            }
            
            if (password !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                document.getElementById('confirmPassword').focus();
                return false;
            }
            
            break;
            
        case 2:
            // Check if at least one service is added
            const services = document.querySelectorAll('#step2 .service-name');
            let hasValidService = false;
            
            services.forEach(serviceInput => {
                if (serviceInput.value.trim()) {
                    hasValidService = true;
                }
            });
            
            if (!hasValidService) {
                showNotification('Por favor agrega al menos un servicio', 'error');
                return false;
            }
            break;
            
        case 3:
            const requiredLocationFields = ['address', 'city', 'department'];
            for (let field of requiredLocationFields) {
                if (!document.getElementById(field).value.trim()) {
                    showNotification('Por favor completa todos los campos de ubicación', 'error');
                    document.getElementById(field).focus();
                    return false;
                }
            }
            break;
    }
    
    return true;
}

// Save current step data
function saveCurrentStepData() {
    switch(currentStep) {
        case 1:
            registrationData.basicInfo = {
                name: document.getElementById('shopName').value, // Use shop name as barber name
                shopName: document.getElementById('shopName').value,
                email: document.getElementById('barberEmail').value,
                phone: document.getElementById('barberPhone').value,
                password: document.getElementById('barberPassword').value,
                establishedYear: document.getElementById('establishedYear').value,
                website: document.getElementById('website').value,
                description: document.getElementById('description').value
            };
            break;
            
        case 2:
            // Save services
            registrationData.services = [];
            const serviceRows = document.querySelectorAll('#step2 .space-y-4 > div');
            serviceRows.forEach(row => {
                const name = row.querySelector('.service-name').value;
                const price = row.querySelector('.service-price').value;
                const duration = row.querySelector('.service-duration').value;
                
                if (name && price && duration) {
                    registrationData.services.push({ name, price, duration });
                }
            });
            
            // Save specialties
            registrationData.specialties = [];
            document.querySelectorAll('.specialty-checkbox:checked').forEach(checkbox => {
                registrationData.specialties.push(checkbox.value);
            });
            break;
            
        case 3:
            // Save location data
            registrationData.location = {
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                department: document.getElementById('department').value
            };
            
            // Save hours
            registrationData.hours = {
                monday: document.getElementById('monday').value,
                tuesday: document.getElementById('tuesday').value,
                wednesday: document.getElementById('wednesday').value,
                thursday: document.getElementById('thursday').value,
                friday: document.getElementById('friday').value,
                saturday: document.getElementById('saturday').value,
                sunday: document.getElementById('sunday').value
            };
            
            // Save coordinates if available
            if (registrationData.latitude && registrationData.longitude) {
                registrationData.location.latitude = registrationData.latitude;
                registrationData.location.longitude = registrationData.longitude;
            }
            break;
    }
}

// Load review data
function loadReviewData() {
    const reviewContent = document.getElementById('reviewContent');
    
    reviewContent.innerHTML = `
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Nombre de la Barbería:</strong> ${registrationData.basicInfo.shopName}</div>
                <div><strong>Email:</strong> ${registrationData.basicInfo.email}</div>
                <div><strong>Teléfono:</strong> ${registrationData.basicInfo.phone}</div>
                <div><strong>Contraseña:</strong> [Protegida]</div>
                <div><strong>Año de Establecimiento:</strong> ${registrationData.basicInfo.establishedYear || 'No especificado'}</div>
                <div><strong>Sitio Web:</strong> ${registrationData.basicInfo.website || 'No especificado'}</div>
            </div>
            <div class="mt-4">
                <strong>Descripción:</strong>
                <p class="text-gray-600 mt-2">${registrationData.basicInfo.description}</p>
            </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Servicios</h3>
            <div class="space-y-2">
                ${registrationData.services.map(service => `
                    <div class="flex justify-between">
                        <span>${service.name}</span>
                        <span class="text-gray-600">${service.price} (${service.duration})</span>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4">
                <strong>Especialidades:</strong>
                <div class="flex flex-wrap gap-2 mt-2">
                    ${registrationData.specialties.map(specialty => 
                        `<span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">${specialty}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Ubicación y Horario</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Dirección:</strong> ${registrationData.location.address}</div>
                <div><strong>Ciudad:</strong> ${registrationData.location.city}</div>
                <div><strong>Departamento:</strong> ${registrationData.location.department}</div>
                <div><strong>Coordenadas:</strong> ${registrationData.latitude ? `${registrationData.latitude.toFixed(6)}, ${registrationData.longitude.toFixed(6)}` : 'No obtenidas'}</div>
            </div>
            <div class="mt-4">
                <strong>Horario:</strong>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    ${Object.entries(registrationData.hours).map(([day, hours]) => `
                        <div class="text-sm">
                            <strong>${day.charAt(0).toUpperCase() + day.slice(1)}:</strong> ${hours || 'Cerrado'}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Update step indicators
function updateStepIndicators() {
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            indicator.classList.add('completed');
        } else if (index + 1 === currentStep) {
            indicator.classList.add('active');
        }
    });
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Show/hide previous button
    if (currentStep === 1) {
        prevBtn.classList.add('hidden');
    } else {
        prevBtn.classList.remove('hidden');
    }
    
    // Show/hide next and submit buttons
    if (currentStep === 4) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    console.log('Form submission started');
    
    // Disable submit button to prevent double submission
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
    
    // Show loading notification
    showNotification('Procesando tu registro...', 'info');
    
    // Validate terms acceptance first
    if (!document.getElementById('termsAccept').checked) {
        showNotification('Debes aceptar los términos y condiciones', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Registro';
        return;
    }
    
    // Save final data from step 4
    saveCurrentStepData();
    
    console.log('Registration data:', registrationData);
    
    // Validate all required data
    if (!registrationData.basicInfo || !registrationData.basicInfo.shopName || !registrationData.basicInfo.email || !registrationData.basicInfo.phone) {
        showNotification('Faltan datos básicos obligatorios', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Registro';
        return;
    }
    
    if (!registrationData.services || registrationData.services.length === 0) {
        showNotification('Debes agregar al menos un servicio', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Registro';
        return;
    }
    
    if (!registrationData.location || !registrationData.location.address) {
        showNotification('Debes completar la información de ubicación', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Registro';
        return;
    }
    
    // Create registration object
    const registration = {
        id: Date.now(),
        ...registrationData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        approvedAt: null,
        rejectedAt: null,
        rejectionReason: null
    };
    
    console.log('Registration object:', registration);
    
    // Show processing notification
    showNotification('Registrando en el sistema...', 'info');
    
    // Register barber in backend
    const result = await registerBarberInBackend(registration);
    
    if (result.success) {
        // Show success message
        showNotification('¡Barbero registrado exitosamente! Tu cuenta está lista para usar.', 'success');
        
        // Update button to show success
        submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>¡Registro Enviado!';
        submitBtn.className = 'bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition';
        
        // Redirect to confirmation page
        setTimeout(() => {
            showNotification('Redirigiendo a tu dashboard...', 'info');
            window.location.href = 'barber-dashboard.html';
        }, 1500);
    } else {
        // Show error message
        showNotification(result.error || 'Error al registrar barbero', 'error');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Registro';
    }
}

// Save pending registration
function savePendingRegistration(registration) {
    let pendingRegistrations = JSON.parse(localStorage.getItem('barberhub_pending_registrations') || '[]');
    pendingRegistrations.push(registration);
    localStorage.setItem('barberhub_pending_registrations', JSON.stringify(pendingRegistrations));
}

// Register barber in backend
async function registerBarberInBackend(registration) {
    try {
        const response = await fetch('/api/auth/register-barber', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: registration.basicInfo.shopName,
                email: registration.basicInfo.email,
                phone: registration.basicInfo.phone,
                password: registration.basicInfo.password,
                confirmPassword: registration.basicInfo.password,
                specialty: registration.services.length > 0 ? registration.services[0].name : 'General',
                shopName: registration.basicInfo.shopName
            }),
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user data
            sessionStorage.setItem('authToken', data.token);
            sessionStorage.setItem('userRole', data.user.role);
            sessionStorage.setItem('userEmail', data.user.email);
            sessionStorage.setItem('userData', JSON.stringify(data.user));
            
            return { success: true, data };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Error registering barber:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}
    
    // Add barber to directory
    const barberData = {
        id: Date.now(),
        name: registration.basicInfo.shopName, // Use shop name as barber name
        shopName: registration.basicInfo.shopName,
        address: registration.location.address,
        phone: registration.basicInfo.phone,
        email: registration.basicInfo.email,
        rating: 0,
        reviews: 0,
        priceRange: registration.services.length > 0 ? 
            `$${Math.min(...registration.services.map(s => parseInt(s.price.replace(/[^0-9]/g, ''))))}.000 - $${Math.max(...registration.services.map(s => parseInt(s.price.replace(/[^0-9]/g, ''))))}.000` :
            '$20.000 - $50.000',
        image: registration.logo || 'https://images.unsplash.com/photo-1585747860718-85af9b5edf34?w=400&h=300&fit=crop',
        logo: registration.logo,
        latitude: registration.latitude || 6.1318,
        longitude: registration.longitude || -75.6137,
        services: registration.services,
        specialties: registration.specialties,
        description: registration.basicInfo.description,
        hours: registration.hours,
        featured: false,
        established: registration.basicInfo.establishedYear || new Date().getFullYear().toString(),
        website: registration.basicInfo.website || '',
        socialMedia: {}
    };
    
    // Save barber to directory
    let barbers = JSON.parse(localStorage.getItem('barberhub_barbers') || '[]');
    barbers.push(barberData);
    localStorage.setItem('barberhub_barbers', JSON.stringify(barbers));
    
    // Update registration status
    registration.status = 'approved';
    registration.approvedAt = new Date().toISOString();
    
    // Update pending registrations
    let pendingRegistrations = JSON.parse(localStorage.getItem('barberhub_pending_registrations') || '[]');
    const index = pendingRegistrations.findIndex(r => r.id === registration.id);
    if (index !== -1) {
        pendingRegistrations[index] = registration;
        localStorage.setItem('barberhub_pending_registrations', JSON.stringify(pendingRegistrations));
    }
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Get current location
function getCurrentLocation() {
    const locationStatus = document.getElementById('locationStatus');
    
    if (!navigator.geolocation) {
        locationStatus.innerHTML = '<span class="text-red-600">Tu navegador no soporta geolocalización</span>';
        return;
    }
    
    locationStatus.innerHTML = '<span class="text-blue-600">Obteniendo ubicación...</span>';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            registrationData.latitude = lat;
            registrationData.longitude = lng;
            
            // Get address from coordinates (reverse geocoding)
            getAddressFromCoordinates(lat, lng);
            
            locationStatus.innerHTML = '<span class="text-green-600">✓ Ubicación obtenida correctamente</span>';
            showNotification('Ubicación actualizada', 'success');
        },
        (error) => {
            let errorMessage = 'Error al obtener ubicación: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Permiso denegado';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Información no disponible';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Tiempo de espera agotado';
                    break;
                default:
                    errorMessage += 'Error desconocido';
                    break;
            }
            locationStatus.innerHTML = `<span class="text-red-600">${errorMessage}</span>`;
            showNotification(errorMessage, 'error');
        }
    );
}

// Get address from coordinates
function getAddressFromCoordinates(lat, lng) {
    // Using Nominatim API for reverse geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                // Fill address fields
                document.getElementById('address').value = data.display_name;
                
                // Try to extract city and department from address
                if (data.address) {
                    if (data.address.city) {
                        document.getElementById('city').value = data.address.city;
                    }
                    if (data.address.state) {
                        document.getElementById('department').value = data.address.state;
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error getting address:', error);
            showNotification('Error al obtener dirección desde coordenadas', 'error');
        });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 shadow-lg' : 
        type === 'error' ? 'bg-red-500 shadow-lg' : 
        'bg-blue-500 shadow-lg'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle'
            } mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page with animation
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}
