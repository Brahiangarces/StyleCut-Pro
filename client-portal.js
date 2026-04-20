// Client Portal JavaScript
const services = [
    { id: 1, name: "Masaje Relajante", price: "$80.000", duration: "60 min" },
    { id: 2, name: "Facial Rejuvenecedor", price: "$120.000", duration: "90 min" },
    { id: 3, name: "Manicure y Pedicure", price: "$60.000", duration: "45 min" },
    { id: 4, name: "Depilación Laser", price: "$150.000", duration: "30 min" },
    { id: 5, name: "Tratamiento Capilar", price: "$90.000", duration: "75 min" },
    { id: 6, name: "Sauna y Vapor", price: "$50.000", duration: "40 min" }
];

let appointments = [
    {
        id: 1,
        service: "Masaje Relajante",
        date: "2024-12-15",
        time: "10:00 AM",
        status: "confirmed",
        barber: "Carlos Rodríguez",
        clientId: "client1"
    },
    {
        id: 2,
        service: "Facial Rejuvenecedor",
        date: "2024-12-18",
        time: "2:30 PM",
        status: "pending",
        barber: "María González",
        clientId: "client2"
    }
];

// Load existing appointments from localStorage
function loadExistingAppointments() {
    const storedAppointments = localStorage.getItem('stylecut_appointments');
    if (storedAppointments) {
        appointments = JSON.parse(storedAppointments);
    }
}

// Check if time slot is available for specific barber
function isTimeSlotAvailable(barber, date, time) {
    return !appointments.some(apt => 
        apt.barber === barber && 
        apt.date === date && 
        apt.time === time && 
        apt.status !== 'cancelled'
    );
}

// Get unavailable time slots for a barber on a specific date
function getUnavailableTimeSlots(barber, date) {
    return appointments
        .filter(apt => apt.barber === barber && apt.date === date && apt.status !== 'cancelled')
        .map(apt => apt.time);
}

// Check barber availability and update UI
function checkBarberAvailability(barber, date) {
    const unavailableSlots = getUnavailableTimeSlots(barber, date);
    const timeSlots = document.querySelectorAll('.time-slot');
    
    timeSlots.forEach(slot => {
        const slotTime = slot.textContent.trim();
        const isAvailable = !unavailableSlots.includes(slotTime);
        
        if (isAvailable) {
            slot.classList.remove('bg-red-100', 'text-red-600', 'cursor-not-allowed', 'border-red-300');
            slot.classList.add('bg-white', 'text-gray-700', 'cursor-pointer', 'hover:bg-purple-50', 'border-gray-300');
            slot.disabled = false;
            slot.onclick = () => selectTimeSlot(slotTime, slot);
        } else {
            slot.classList.remove('bg-white', 'text-gray-700', 'cursor-pointer', 'hover:bg-purple-50', 'border-gray-300');
            slot.classList.add('bg-red-100', 'text-red-600', 'cursor-not-allowed', 'border-red-300');
            slot.disabled = true;
            slot.onclick = null;
            
            // Add tooltip or indicator
            if (!slot.querySelector('.occupied-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'occupied-indicator text-xs block mt-1';
                indicator.textContent = 'Ocupado';
                slot.appendChild(indicator);
            }
        }
    });
    
    // Update availability status message
    updateAvailabilityStatus(barber, date, unavailableSlots);
}

// Update availability status message
function updateAvailabilityStatus(barber, date, unavailableSlots) {
    const statusDiv = document.getElementById('availabilityStatus');
    const messageDiv = document.getElementById('availabilityMessage');
    
    if (unavailableSlots.length > 0) {
        statusDiv.classList.remove('hidden');
        statusDiv.firstElementChild.classList.remove('bg-green-100', 'text-green-800');
        statusDiv.firstElementChild.classList.add('bg-yellow-100', 'text-yellow-800');
        messageDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle mr-2"></i>
            ${unavailableSlots.length} horario(s) no disponible(s) para ${barber} el ${date}
        `;
    } else {
        statusDiv.classList.remove('hidden');
        statusDiv.firstElementChild.classList.remove('bg-yellow-100', 'text-yellow-800');
        statusDiv.firstElementChild.classList.add('bg-green-100', 'text-green-800');
        messageDiv.innerHTML = `
            <i class="fas fa-check-circle mr-2"></i>
            Todos los horarios disponibles para ${barber} el ${date}
        `;
    }
}

// Enhanced appointment booking with validation
function bookAppointment(service, date, time, barber) {
    // Check if slot is still available
    if (!isTimeSlotAvailable(barber, date, time)) {
        showNotification('Este horario ya no está disponible. Por favor, selecciona otro.', 'error');
        return false;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    const newAppointment = {
        id: Date.now(),
        service: service,
        date: date,
        time: time,
        barber: barber,
        clientId: currentUser.id || 'client_' + Date.now(),
        clientName: currentUser.name || currentUser.email || 'Cliente',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Add to appointments array
    appointments.push(newAppointment);
    
    // Save to localStorage
    localStorage.setItem('stylecut_appointments', JSON.stringify(appointments));
    
    // Notify barber (simulate)
    notifyBarberAboutAppointment(newAppointment);
    
    // Update UI
    checkBarberAvailability(barber, date);
    renderAppointments();
    
    showNotification('Cita solicitada exitosamente. Esperando confirmación del barbero.', 'success');
    return true;
}

// Notify barber about new appointment (simulation)
function notifyBarberAboutAppointment(appointment) {
    // In a real application, this would send a notification to the barber
    console.log('Notificando al barbero:', appointment.barber, 'about new appointment:', appointment);
    
    // Store notification for barber dashboard
    const barberNotifications = JSON.parse(localStorage.getItem('barber_notifications_' + appointment.barber) || '[]');
    barberNotifications.push({
        id: Date.now(),
        type: 'new_appointment',
        message: `Nueva cita solicitada: ${appointment.service} el ${appointment.date} a las ${appointment.time}`,
        appointment: appointment,
        read: false,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('barber_notifications_' + appointment.barber, JSON.stringify(barberNotifications));
}

// Show notification to user
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

let selectedTimeSlot = null;

// Load barbers from localStorage
function loadBarbers() {
    const barberSelect = document.getElementById('barberSelect');
    if (!barberSelect) return;
    
    // Get barbers from localStorage
    const barbers = JSON.parse(localStorage.getItem('stylecut_barbers') || '[]');
    
    // Clear existing options except the first one
    barberSelect.innerHTML = '<option value="">Elige un barbero...</option>';
    
    // Add barber options
    barbers.forEach(barber => {
        if (barber.role === 'barber') {
            const option = document.createElement('option');
            option.value = barber.name;
            option.textContent = barber.name;
            barberSelect.appendChild(option);
        }
    });
    
    // If no barbers found, add default barbers
    if (barbers.length === 0) {
        const defaultBarbers = [
            { name: 'Carlos Rodríguez', role: 'barber' },
            { name: 'María González', role: 'barber' },
            { name: 'Juan Martínez', role: 'barber' }
        ];
        
        defaultBarbers.forEach(barber => {
            const option = document.createElement('option');
            option.value = barber.name;
            option.textContent = barber.name;
            barberSelect.appendChild(option);
        });
    }
}

// Rating system
let ratings = JSON.parse(localStorage.getItem('barber_ratings') || '[]');

// Load ratings from localStorage
function loadRatings() {
    ratings = JSON.parse(localStorage.getItem('barber_ratings') || '[]');
}

// Save rating to localStorage
function saveRating(barberName, rating, review, appointmentId) {
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    
    const newRating = {
        id: Date.now(),
        barberName: barberName,
        rating: rating,
        review: review,
        appointmentId: appointmentId,
        clientName: currentUser.name || currentUser.email || 'Cliente',
        createdAt: new Date().toISOString()
    };
    
    ratings.push(newRating);
    localStorage.setItem('barber_ratings', JSON.stringify(ratings));
    
    // Update appointment as rated
    const appointments = JSON.parse(localStorage.getItem('stylecut_appointments') || '[]');
    const appointment = appointments.find(a => a.id == appointmentId);
    if (appointment) {
        appointment.rated = true;
        appointment.rating = rating;
        localStorage.setItem('stylecut_appointments', JSON.stringify(appointments));
    }
    
    showNotification('¡Gracias por tu calificación!', 'success');
    renderAppointments();
}

// Show rating modal
function showRatingModal(appointmentId) {
    const appointments = JSON.parse(localStorage.getItem('stylecut_appointments') || '[]');
    const appointment = appointments.find(a => a.id == appointmentId);
    
    if (!appointment) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-effect rounded-2xl max-w-md w-full p-6">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-gray-800">Calificar Servicio</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <div class="text-center mb-6">
                <div class="text-lg font-semibold text-gray-700 mb-2">${appointment.barber}</div>
                <div class="text-gray-600 mb-4">${appointment.service}</div>
                <div class="text-sm text-gray-500">${appointment.date} - ${appointment.time}</div>
            </div>
            
            <form id="ratingForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                    <div class="flex justify-center space-x-2">
                        ${[1,2,3,4,5].map(star => `
                            <button type="button" class="star-btn text-3xl text-gray-300 hover:text-yellow-400 transition" 
                                    data-rating="${star}" onclick="selectStar(${star})">
                                <i class="fas fa-star"></i>
                            </button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="ratingValue" value="0" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Comentario (opcional)</label>
                    <textarea id="ratingReview" rows="3" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                              placeholder="Cuéntanos sobre tu experiencia..."></textarea>
                </div>
                
                <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                    Enviar Calificación
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup form submission
    document.getElementById('ratingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const rating = parseInt(document.getElementById('ratingValue').value);
        const review = document.getElementById('ratingReview').value;
        
        if (rating === 0) {
            showNotification('Por favor selecciona una calificación', 'error');
            return;
        }
        
        saveRating(appointment.barber, rating, review, appointmentId);
        modal.remove();
    });
}

// Select star rating
function selectStar(rating) {
    document.getElementById('ratingValue').value = rating;
    
    const stars = document.querySelectorAll('.star-btn');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadBarbers();
    loadRatings();
    loadExistingAppointments();
    renderAppointments();
    renderServices();
    generateTimeSlots();
    setupEventListeners();
    setMinDate();
});

// Load user info
function loadUserInfo() {
    const userEmail = sessionStorage.getItem('userEmail') || 'demo@client.com';
    document.getElementById('clientName').textContent = userEmail.split('@')[0];
    document.getElementById('profileEmail').value = userEmail;
}

// Render appointments
function renderAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    
    if (!appointmentsList) return;
    
    const userAppointments = appointments.filter(apt => 
        apt.clientId === currentUser.id || apt.clientName === currentUser.name
    );
    
    if (userAppointments.length === 0) {
        appointmentsList.innerHTML = '<p class="text-gray-500 text-center py-8">No tienes citas agendadas</p>';
        return;
    }
    
    appointmentsList.innerHTML = userAppointments.map(appointment => {
        const isCompleted = appointment.status === 'completed';
        const isRated = appointment.rated;
        const canRate = isCompleted && !isRated;
        
        return `
            <div class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold text-gray-800">${appointment.service}</h4>
                        <p class="text-sm text-gray-600">Con: ${appointment.barber}</p>
                        <p class="text-sm text-gray-600">${appointment.date} - ${appointment.time}</p>
                        ${appointment.rating ? `
                            <div class="flex items-center mt-2">
                                <div class="text-yellow-400">
                                    ${Array(5).fill(0).map((_, i) => 
                                        `<i class="fas fa-star ${i < appointment.rating ? '' : 'text-gray-300'}"></i>`
                                    ).join('')}
                                </div>
                                <span class="text-sm text-gray-600 ml-2">(${appointment.rating}/5)</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="text-right">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                            appointment.status === 'completed' 
                                ? 'bg-gray-100 text-gray-800' 
                                : appointment.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                        }">
                            ${appointment.status === 'completed' ? 'Completada' : 
                              appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                        </span>
                        ${canRate ? `
                            <button onclick="showRatingModal(${appointment.id})" 
                                    class="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition">
                                Calificar
                            </button>
                        ` : isRated ? `
                            <div class="text-xs text-green-600 mt-2">Calificado</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render services
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    const serviceSelect = document.getElementById('serviceSelect');
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer" onclick="quickBookService(${service.id})">
            <h4 class="font-semibold text-gray-800 mb-2">${service.name}</h4>
            <p class="text-gray-600 mb-2">${service.price}</p>
            <p class="text-sm text-gray-500">
                <i class="far fa-clock mr-1"></i>${service.duration}
            </p>
        </div>
    `).join('');
    
    serviceSelect.innerHTML = '<option value="">Elige un servicio...</option>' + 
        services.map(service => `<option value="${service.id}">${service.name} - ${service.price}</option>`).join('');
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
    
    timeSlotsContainer.innerHTML = timeSlots.map(time => `
        <button type="button" class="time-slot px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-purple-600 hover:text-white transition" onclick="selectTimeSlot('${time}', this)">
            ${time}
        </button>
    `).join('');
}

// Select time slot
function selectTimeSlot(time, element) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected', 'bg-purple-600', 'text-white');
    });
    
    element.classList.add('selected', 'bg-purple-600', 'text-white');
    selectedTimeSlot = time;
}

// Set minimum date
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').setAttribute('min', today);
}

// Communication messages
let clientMessages = [
    { id: 1, sender: 'barber', message: '¡Bienvenido a nuestra barbería! Gracias por agendar tu cita.', date: '2024-12-14', time: '10:30 AM' },
    { id: 2, sender: 'client', message: '¡Gracias! Estoy muy emocionado por mi primera cita.', date: '2024-12-14', time: '11:15 AM' },
    { id: 3, sender: 'barber', message: 'Recordatorio: Tu cita es mañana a las 2:00 PM. ¡Te esperamos!', date: '2024-12-15', time: '9:00 AM' }
];

// Setup event listeners
function setupEventListeners() {
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    document.getElementById('profileForm').addEventListener('submit', handleProfileSubmit);
    document.getElementById('sendMessageForm').addEventListener('submit', handleSendMessageSubmit);
    
    // Add listeners for availability checking
    const barberSelect = document.getElementById('barberSelect');
    const dateInput = document.getElementById('bookingDate');
    
    if (barberSelect) {
        barberSelect.addEventListener('change', handleBarberOrDateChange);
    }
    
    if (dateInput) {
        dateInput.addEventListener('change', handleBarberOrDateChange);
        dateInput.addEventListener('input', handleBarberOrDateChange);
    }
}

// Handle barber or date change to update availability
function handleBarberOrDateChange() {
    const barber = document.getElementById('barberSelect').value;
    const date = document.getElementById('bookingDate').value;
    
    if (barber && date) {
        checkBarberAvailability(barber, date);
    }
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
    resetTimeSlots();
}

// Show profile modal
function showProfile() {
    document.getElementById('profileModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Show messages modal
function showMessages() {
    document.getElementById('messagesModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderMessages();
}

// Show barber map modal
function showBarberMap() {
    document.getElementById('barberMapModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loadBarberMap();
}

// Close barber map modal
function closeBarberMapModal() {
    document.getElementById('barberMapModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Close messages modal
function closeMessagesModal() {
    document.getElementById('messagesModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Close profile modal
function closeProfileModal() {
    document.getElementById('profileModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Show appointments
function showAppointments() {
    document.getElementById('appointmentsList').scrollIntoView({ behavior: 'smooth' });
}

// Quick book service
function quickBookService(serviceId) {
    document.getElementById('serviceSelect').value = serviceId;
    showBookingModal();
}

// Reset time slots
function resetTimeSlots() {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected', 'bg-purple-600', 'text-white');
    });
    selectedTimeSlot = null;
}

// Handle booking submit
function handleBookingSubmit(e) {
    e.preventDefault();
    
    const serviceId = document.getElementById('serviceSelect').value;
    const date = document.getElementById('bookingDate').value;
    const barber = document.getElementById('barberSelect').value;
    
    if (!serviceId || !date || !selectedTimeSlot || !barber) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    const service = services.find(s => s.id == serviceId);
    
    // Use the enhanced booking function with validation
    const success = bookAppointment(service.name, date, selectedTimeSlot, barber);
    
    if (success) {
        // Reset form
        document.getElementById('bookingForm').reset();
        resetTimeSlots();
        closeBookingModal();
    }
}

// Render messages
function renderMessages() {
    const messagesList = document.getElementById('messagesList');
    
    if (clientMessages.length === 0) {
        messagesList.innerHTML = '<p class="text-gray-500 text-center py-8">No hay mensajes aún</p>';
        return;
    }
    
    messagesList.innerHTML = clientMessages.map(message => `
        <div class="flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}">
            <div class="max-w-xs lg:max-w-md">
                <div class="rounded-lg p-3 ${
                    message.sender === 'client' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 text-gray-800'
                }">
                    <p class="text-sm">${message.message}</p>
                </div>
                <p class="text-xs text-gray-500 mt-1 ${message.sender === 'client' ? 'text-right' : 'text-left'}">
                    ${message.date} - ${message.time}
                </p>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    messagesList.scrollTop = messagesList.scrollHeight;
}

// Handle send message submit
function handleSendMessageSubmit(e) {
    e.preventDefault();
    
    const messageText = document.getElementById('newMessage').value;
    
    if (!messageText.trim()) {
        return;
    }
    
    const newMessage = {
        id: clientMessages.length + 1,
        sender: 'client',
        message: messageText,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
    
    clientMessages.push(newMessage);
    renderMessages();
    
    // Clear form
    document.getElementById('newMessage').value = '';
    
    showNotification('Mensaje enviado', 'success');
    
    // Simulate barber response
    setTimeout(() => {
        const barberResponse = {
            id: clientMessages.length + 1,
            sender: 'barber',
            message: '¡Gracias por tu mensaje! Te responderé pronto.',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
        
        clientMessages.push(barberResponse);
        renderMessages();
        showNotification(' tienes un nuevo mensaje de tu barbero', 'info');
    }, 2000);
}

// Load barber map
function loadBarberMap() {
    const mapContainer = document.getElementById('barberMapContainer');
    const barberListContainer = document.getElementById('barberListContainer');
    
    // Get barber locations from localStorage (in real app, this would be from API)
    const savedBarberProfiles = localStorage.getItem('barberProfile');
    const barbers = [];
    
    // Add demo barbers with locations
    if (savedBarberProfiles) {
        const profile = JSON.parse(savedBarberProfiles);
        if (profile.latitude && profile.longitude) {
            barbers.push({
                name: profile.displayName || 'Barbero',
                shopName: profile.shopName || 'Barbería',
                address: profile.address || 'Dirección no disponible',
                latitude: profile.latitude,
                longitude: profile.longitude,
                logo: profile.logo || null
            });
        }
    }
    
    // Add demo barbers in Sabaneta area
    barbers.push(
        {
            name: 'Carlos Rodríguez',
            shopName: 'La Barbería de Carlos',
            address: 'Cra. 44 #64 B Sur 15, Sabaneta, Antioquia',
            latitude: 6.1318,
            longitude: -75.6137,
            logo: null
        },
        {
            name: 'María González',
            shopName: 'Estilo María',
            address: 'Calle 73 #45-30, Sabaneta, Antioquia',
            latitude: 6.1340,
            longitude: -75.6150,
            logo: null
        }
    );
    
    if (barbers.length === 0) {
        mapContainer.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No hay barberías disponibles</div>';
        barberListContainer.innerHTML = '';
        return;
    }
    
    // Create map with all barber locations
    const bounds = barbers.reduce((acc, barber) => {
        if (barber.latitude && barber.longitude) {
            acc.push([barber.latitude, barber.longitude]);
        }
        return acc;
    }, []);
    
    if (bounds.length > 0) {
        const minLat = Math.min(...bounds.map(b => b[0]));
        const maxLat = Math.max(...bounds.map(b => b[0]));
        const minLng = Math.min(...bounds.map(b => b[1]));
        const maxLng = Math.max(...bounds.map(b => b[1]));
        
        const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
        const markers = bounds.map(b => b.join(',')).join('|');
        
        const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${markers}`;
        
        mapContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                frameborder="0" 
                scrolling="no" 
                marginheight="0" 
                marginwidth="0" 
                src="${mapUrl}"
            ></iframe>
        `;
    }
    
    // Render barber list
    barberListContainer.innerHTML = barbers.map(barber => `
        <div class="bg-white rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer" onclick="selectBarber('${barber.name}')">
            <div class="flex items-center space-x-4">
                ${barber.logo ? 
                    `<img src="${barber.logo}" alt="${barber.shopName}" class="w-12 h-12 rounded-full object-cover">` :
                    `<div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-cut text-purple-600"></i>
                    </div>`
                }
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800">${barber.name}</h4>
                    <p class="text-sm text-gray-600">${barber.shopName}</p>
                    <p class="text-xs text-gray-500">${barber.address}</p>
                </div>
                <div class="text-right">
                    <button class="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-200 transition text-sm">
                        Reservar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Select barber from map
function selectBarber(barberName) {
    // Store selected barber and redirect to booking
    sessionStorage.setItem('selectedBarber', barberName);
    closeBarberMapModal();
    showBookingModal();
}

// Handle profile submit
function handleProfileSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    
    // Update display name
    document.getElementById('clientName').textContent = name;
    
    closeProfileModal();
    showNotification('Perfil actualizado correctamente', 'success');
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
        appointments = appointments.filter(a => a.id !== appointmentId);
        renderAppointments();
        showNotification('Cita cancelada exitosamente', 'success');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg fade-in ${
        type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Logout
function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}
