// Barber portal data and functionality
let currentBarber = null;
let barberClients = [];
let barberBookings = [];

// Initialize portal with barber data
function initializePortal() {
    // Get barber ID from URL or use default
    const urlParams = new URLSearchParams(window.location.search);
    const barberId = urlParams.get('barber') || '1';
    
    // Load barber data from directory
    loadBarberData(barberId);
    
    // Load clients and bookings
    loadBarberClients();
    loadBarberBookings();
    
    // Setup event listeners
    setupEventListeners();
}

// Load barber data
function loadBarberData(barberId) {
    // Get barber data from directory or localStorage
    const savedBarbers = localStorage.getItem('barberhub_barbers');
    if (savedBarbers) {
        const barbers = JSON.parse(savedBarbers);
        currentBarber = barbers.find(b => b.id.toString() === barberId) || barbers[0];
    } else {
        // Default barber data
        currentBarber = {
            id: 1,
            name: "Carlos Rodríguez",
            shopName: "La Barbería de Carlos",
            address: "Cra. 44 #64 B Sur 15, Sabaneta, Antioquia",
            phone: "300 123 4567",
            email: "carlos@barberhub.co",
            rating: 4.9,
            reviews: 127,
            priceRange: "$20.000 - $50.000",
            image: "https://images.unsplash.com/photo-1585747860718-85af9b5edf34?w=400&h=300&fit=crop",
            logo: null,
            services: [
                { name: "Corte Clásico", price: "$25.000", duration: "30 min" },
                { name: "Afeitado Tradicional", price: "$20.000", duration: "25 min" },
                { name: "Servicio Completo", price: "$45.000", duration: "60 min" },
                { name: "Tratamiento de Barba", price: "$30.000", duration: "40 min" },
                { name: "Corte Moderno", price: "$30.000", duration: "35 min" },
                { name: "Color Cabello", price: "$50.000", duration: "90 min" }
            ],
            specialties: ["Cortes Modernos", "Afeitado Tradicional", "Tratamientos Capilares", "Coloración"],
            description: "Con más de 10 años de experiencia, especializado en cortes modernos y técnicas tradicionales de afeitado. Usamos productos de alta calidad para garantizar el mejor resultado.",
            hours: {
                monday: "9:00 AM - 7:00 PM",
                tuesday: "9:00 AM - 7:00 PM",
                wednesday: "9:00 AM - 7:00 PM",
                thursday: "9:00 AM - 8:00 PM",
                friday: "9:00 AM - 8:00 PM",
                saturday: "8:00 AM - 6:00 PM",
                sunday: "10:00 AM - 4:00 PM"
            },
            featured: true,
            established: "2014",
            website: "www.labarberiadecarlos.com",
            socialMedia: {
                instagram: "@labarberiadecarlos",
                facebook: "LaBarberiaDeCarlos",
                whatsapp: "3001234567"
            }
        };
    }
    
    // Update portal with barber data
    updatePortalBranding();
    loadServices();
    updateContactInfo();
    updateSocialMedia();
}

// Update portal branding
function updatePortalBranding() {
    document.getElementById('portalTitle').textContent = `${currentBarber.shopName} | BarberHub`;
    document.getElementById('barberShopName').textContent = currentBarber.shopName;
    document.getElementById('barberSlogan').textContent = currentBarber.description.split('.')[0] || 'La mejor decisión para tu estilo';
    document.getElementById('heroTitle').textContent = currentBarber.shopName;
    document.getElementById('heroDescription').textContent = currentBarber.description;
    document.getElementById('aboutDescription').textContent = currentBarber.description;
    document.getElementById('footerShopName').textContent = currentBarber.shopName;
    document.getElementById('footerDescription').textContent = currentBarber.description;
    document.getElementById('footerCopyright').textContent = currentBarber.shopName;
    document.getElementById('footerPhone').textContent = currentBarber.phone;
    document.getElementById('footerEmail').textContent = currentBarber.email;
    document.getElementById('footerAddress').textContent = currentBarber.address.split(',')[0];
    
    // Update logo if available
    if (currentBarber.logo) {
        document.getElementById('barberLogo').innerHTML = `<img src="${currentBarber.logo}" alt="${currentBarber.shopName}" class="w-full h-full object-cover rounded-full">`;
        document.getElementById('footerLogo').innerHTML = `<img src="${currentBarber.logo}" alt="${currentBarber.shopName}" class="w-full h-full object-cover rounded-full">`;
    }
    
    // Update hero image
    document.getElementById('heroImage').src = currentBarber.image;
    document.getElementById('aboutImage').src = currentBarber.image;
}

// Load services
function loadServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    const serviceSelect = document.getElementById('selectedService');
    
    // Update services grid
    servicesGrid.innerHTML = currentBarber.services.map(service => `
        <div class="service-card bg-white rounded-xl shadow-lg p-6 text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-cut text-purple-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">${service.name}</h3>
            <p class="text-gray-600 mb-4">${service.duration}</p>
            <div class="text-2xl font-bold text-purple-600 mb-4">${service.price}</div>
            <button onclick="bookService('${service.name}')" class="brand-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition w-full">
                Reservar
            </button>
        </div>
    `).join('');
    
    // Update service select
    serviceSelect.innerHTML = '<option value="">Seleccionar servicio</option>' + 
        currentBarber.services.map(service => 
            `<option value="${service.name}">${service.name} - ${service.price} (${service.duration})</option>`
        ).join('');
}

// Update contact information
function updateContactInfo() {
    document.getElementById('contactAddress').textContent = currentBarber.address;
    document.getElementById('contactPhone').textContent = currentBarber.phone;
    document.getElementById('contactHours').textContent = 'Lun-Sáb: 9:00 AM - 8:00 PM';
}

// Update social media links
function updateSocialMedia() {
    const instagramLink = document.getElementById('instagramLink');
    const facebookLink = document.getElementById('facebookLink');
    const whatsappLink = document.getElementById('whatsappLink');
    
    if (currentBarber.socialMedia.instagram) {
        instagramLink.href = `https://instagram.com/${currentBarber.socialMedia.instagram.replace('@', '')}`;
        instagramLink.style.display = 'block';
    } else {
        instagramLink.style.display = 'none';
    }
    
    if (currentBarber.socialMedia.facebook) {
        facebookLink.href = `https://facebook.com/${currentBarber.socialMedia.facebook}`;
        facebookLink.style.display = 'block';
    } else {
        facebookLink.style.display = 'none';
    }
    
    if (currentBarber.socialMedia.whatsapp) {
        whatsappLink.href = `https://wa.me/57${currentBarber.socialMedia.whatsapp.replace(/[^0-9]/g, '')}`;
        whatsappLink.style.display = 'block';
    } else {
        whatsappLink.style.display = 'none';
    }
}

// Load barber clients
function loadBarberClients() {
    const savedClients = localStorage.getItem(`barber_${currentBarber.id}_clients`);
    if (savedClients) {
        barberClients = JSON.parse(savedClients);
    } else {
        // Default clients for demo
        barberClients = [
            { id: 1, name: 'Juan Pérez', phone: '3001234567', email: 'juan@email.com', notes: 'Prefiere corte corto', registeredDate: '2024-12-01' },
            { id: 2, name: 'María García', phone: '3009876543', email: 'maria@email.com', notes: 'Alergia a productos químicos', registeredDate: '2024-12-05' }
        ];
    }
}

// Load barber bookings
function loadBarberBookings() {
    const savedBookings = localStorage.getItem(`barber_${currentBarber.id}_bookings`);
    if (savedBookings) {
        barberBookings = JSON.parse(savedBookings);
    } else {
        // Default bookings for demo
        barberBookings = [
            { id: 1, clientName: 'Juan Pérez', service: 'Corte Clásico', date: '2024-12-20', time: '10:00 AM', status: 'confirmed' },
            { id: 2, clientName: 'María García', service: 'Servicio Completo', date: '2024-12-20', time: '2:00 PM', status: 'pending' }
        ];
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    document.getElementById('clientLoginForm').addEventListener('submit', handleClientLogin);
    document.getElementById('clientRegistrationForm').addEventListener('submit', handleClientRegistration);
    
    // Set minimum date for booking
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').setAttribute('min', today);
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Show selected section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.style.display = 'block';
        sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Close mobile menu
    closeMobileMenu();
}

// Show booking modal
function showBookingModal() {
    document.getElementById('bookingModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close booking modal
function closeBookingModal() {
    document.getElementById('bookingModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    document.getElementById('bookingForm').reset();
}

// Book specific service
function bookService(serviceName) {
    document.getElementById('selectedService').value = serviceName;
    showBookingModal();
}

// Handle booking submit
function handleBookingSubmit(e) {
    e.preventDefault();
    
    const booking = {
        id: barberBookings.length + 1,
        clientName: document.getElementById('clientName').value,
        phone: document.getElementById('clientPhone').value,
        service: document.getElementById('selectedService').value,
        date: document.getElementById('bookingDate').value,
        time: document.getElementById('bookingTime').value,
        status: 'pending',
        barberId: currentBarber.id,
        createdAt: new Date().toISOString()
    };
    
    barberBookings.push(booking);
    localStorage.setItem(`barber_${currentBarber.id}_bookings`, JSON.stringify(barberBookings));
    
    closeBookingModal();
    showNotification('¡Reserva creada exitosamente! Te contactaremos pronto.', 'success');
}

// Show client login modal
function showClientLoginModal() {
    document.getElementById('clientLoginModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close client login modal
function closeClientLoginModal() {
    document.getElementById('clientLoginModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    document.getElementById('clientLoginForm').reset();
}

// Show client registration modal
function showClientRegistrationModal() {
    closeClientLoginModal();
    document.getElementById('clientRegistrationModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close client registration modal
function closeClientRegistrationModal() {
    document.getElementById('clientRegistrationModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    document.getElementById('clientRegistrationForm').reset();
}

// Handle client login
function handleClientLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('clientEmail').value;
    const password = document.getElementById('clientPassword').value;
    
    // Find client in barber's client list
    const client = barberClients.find(c => c.email === email);
    
    if (client) {
        // Store client session and redirect to client portal
        sessionStorage.setItem('clientData', JSON.stringify(client));
        sessionStorage.setItem('barberId', currentBarber.id);
        sessionStorage.setItem('userRole', 'client');
        
        window.location.href = `client-portal.html?barber=${currentBarber.id}`;
    } else {
        showNotification('Cliente no encontrado. Por favor regístrate.', 'error');
    }
}

// Handle client registration
function handleClientRegistration(e) {
    e.preventDefault();
    
    const newClient = {
        id: barberClients.length + 1,
        name: document.getElementById('regClientName').value,
        email: document.getElementById('regClientEmail').value,
        phone: document.getElementById('regClientPhone').value,
        password: document.getElementById('regClientPassword').value,
        notes: document.getElementById('regClientNotes').value,
        registeredDate: new Date().toISOString().split('T')[0],
        barberId: currentBarber.id
    };
    
    // Check if client already exists
    const existingClient = barberClients.find(c => c.email === newClient.email);
    if (existingClient) {
        showNotification('Ya existe un cliente con este email.', 'error');
        return;
    }
    
    barberClients.push(newClient);
    localStorage.setItem(`barber_${currentBarber.id}_clients`, JSON.stringify(barberClients));
    
    closeClientRegistrationModal();
    showNotification('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
    
    // Auto-login after registration
    setTimeout(() => {
        sessionStorage.setItem('clientData', JSON.stringify(newClient));
        sessionStorage.setItem('barberId', currentBarber.id);
        sessionStorage.setItem('userRole', 'client');
        window.location.href = `client-portal.html?barber=${currentBarber.id}`;
    }, 1500);
}

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// Close mobile menu
function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.add('hidden');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize portal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePortal();
    
    // Show services section by default
    showSection('services');
});
