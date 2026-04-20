// Services data
const services = [
    {
        id: 1,
        name: "Masaje Relajante",
        description: "Masaje terapéutico para liberar tensiones y relajar cuerpo y mente",
        price: "$80.000",
        duration: "60 min",
        icon: "fa-spa",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop"
    },
    {
        id: 2,
        name: "Facial Rejuvenecedor",
        description: "Tratamiento facial profundo para una piel radiante y saludable",
        price: "$120.000",
        duration: "90 min",
        icon: "fa-face-smile",
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612d97a9?w=400&h=300&fit=crop"
    },
    {
        id: 3,
        name: "Manicure y Pedicure",
        description: "Cuidado completo para manos y pies con productos de alta calidad",
        price: "$60.000",
        duration: "45 min",
        icon: "fa-hands",
        image: "https://images.unsplash.com/photo-1610992015792-35d2c622b5bc?w=400&h=300&fit=crop"
    },
    {
        id: 4,
        name: "Depilación Laser",
        description: "Eliminación permanente de vello con tecnología láser avanzada",
        price: "$150.000",
        duration: "30 min",
        icon: "fa-bolt",
        image: "https://images.unsplash.com/photo-1570172619644-dfd23ed64f80?w=400&h=300&fit=crop"
    },
    {
        id: 5,
        name: "Tratamiento Capilar",
        description: "Reparación y nutrición profunda para tu cabello",
        price: "$90.000",
        duration: "75 min",
        icon: "fa-wind",
        image: "https://images.unsplash.com/photo-1562322075-982c51455c73?w=400&h=300&fit=crop"
    },
    {
        id: 6,
        name: "Sauna y Vapor",
        description: "Sesión de sauna y vapor para desintoxicar y revitalizar",
        price: "$50.000",
        duration: "40 min",
        icon: "fa-temperature-high",
        image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop"
    }
];

let selectedService = null;
let selectedTimeSlot = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderServices();
    generateTimeSlots();
    setupEventListeners();
    setMinDate();
});

// Render services
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    
    services.forEach((service, index) => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card glass-effect rounded-xl overflow-hidden fade-in';
        serviceCard.style.animationDelay = `${index * 0.1}s`;
        
        serviceCard.innerHTML = `
            <div class="relative h-48 overflow-hidden">
                <img src="${service.image}" alt="${service.name}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span class="text-sm font-semibold text-purple-600">${service.price}</span>
                </div>
            </div>
            <div class="p-6">
                <div class="flex items-center mb-3">
                    <i class="fas ${service.icon} text-2xl text-purple-600 mr-3"></i>
                    <h3 class="text-xl font-semibold text-gray-800">${service.name}</h3>
                </div>
                <p class="text-gray-600 mb-4">${service.description}</p>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">
                        <i class="far fa-clock mr-1"></i>${service.duration}
                    </span>
                    <button onclick="openBookingModal(${service.id})" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                        Reservar
                    </button>
                </div>
            </div>
        `;
        
        servicesGrid.appendChild(serviceCard);
    });
}

// Generate time slots
function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    const timeSlots = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
        '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
        '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
    ];
    
    timeSlots.forEach(time => {
        const timeSlot = document.createElement('button');
        timeSlot.type = 'button';
        timeSlot.className = 'time-slot px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-purple-600 hover:text-white transition';
        timeSlot.textContent = time;
        timeSlot.onclick = () => selectTimeSlot(time, timeSlot);
        
        timeSlotsContainer.appendChild(timeSlot);
    });
}

// Select time slot
function selectTimeSlot(time, element) {
    // Remove previous selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Add selection to clicked slot
    element.classList.add('selected');
    selectedTimeSlot = time;
}

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').setAttribute('min', today);
}

// Setup event listeners
function setupEventListeners() {
    // Login button
    document.getElementById('loginBtn').addEventListener('click', function() {
        window.open('https://negocios.beunik.co/auth/sign-in', '_blank');
    });
    
    // Booking form
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    
    // Photo upload
    document.getElementById('clientPhoto').addEventListener('change', handlePhotoUpload);
}

// Open booking modal
function openBookingModal(serviceId) {
    selectedService = services.find(s => s.id === serviceId);
    if (!selectedService) return;
    
    document.getElementById('selectedServiceName').textContent = selectedService.name;
    document.getElementById('bookingModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close booking modal
function closeBookingModal() {
    document.getElementById('bookingModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    resetBookingForm();
}

// Handle photo upload
function handlePhotoUpload(event) {
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
            const photoPreview = document.getElementById('photoPreview');
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Foto de perfil" class="w-full h-full object-cover">`;
        };
        reader.readAsDataURL(file);
    }
}

// Reset booking form
function resetBookingForm() {
    document.getElementById('bookingForm').reset();
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    selectedTimeSlot = null;
    
    // Reset photo preview
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.innerHTML = '<i class="fas fa-user text-3xl text-gray-400"></i>';
}

// Handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Get photo data if uploaded
    const photoInput = document.getElementById('clientPhoto');
    let photoData = null;
    
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        photoData = await new Promise((resolve) => {
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.readAsDataURL(photoInput.files[0]);
        });
    }
    
    const formData = {
        service: selectedService.name,
        date: document.getElementById('bookingDate').value,
        time: selectedTimeSlot,
        name: document.getElementById('clientName').value,
        phone: document.getElementById('clientPhone').value,
        email: document.getElementById('clientEmail').value,
        notes: document.getElementById('clientNotes').value,
        photo: photoData
    };
    
    // Validate time slot selection
    if (!selectedTimeSlot) {
        showNotification('Por favor selecciona una hora', 'error');
        return;
    }
    
    // Simulate booking process
    try {
        await simulateBooking(formData);
        closeBookingModal();
        showSuccessModal();
    } catch (error) {
        showNotification('Error al procesar la reserva. Inténtalo nuevamente.', 'error');
    }
}

// Simulate booking API call
function simulateBooking(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Booking data:', data);
            resolve({ success: true, bookingId: Math.random().toString(36).substr(2, 9) });
        }, 1500);
    });
}

// Show success modal
function showSuccessModal() {
    document.getElementById('successModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg fade-in ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all service cards
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });
});
