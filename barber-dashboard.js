// Barber Dashboard JavaScript

// Open Report Modal
function openReportModal() {
    window.open('direct-download.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}

// Profile Modal Functions
function showProfileModal() {
    document.getElementById('profileModal').classList.remove('hidden');
    loadProfileData();
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.add('hidden');
}

function loadProfileData() {
    // Load current barber data into the form
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    
    // Set basic information
    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileSpecialty').value = currentUser.specialty || '';
    
    // Load saved profile data if exists
    const savedProfile = JSON.parse(localStorage.getItem('barber_profile_' + currentUser.id) || '{}');
    
    document.getElementById('profileBio').value = savedProfile.bio || '';
    document.getElementById('profileInstagram').value = savedProfile.instagram || '';
    document.getElementById('profileFacebook').value = savedProfile.facebook || '';
    document.getElementById('preferredSchedule').value = savedProfile.preferredSchedule || 'flexible';
    document.getElementById('preferredDays').value = savedProfile.preferredDays || 'flexible';
    
    // Set notification preferences
    document.getElementById('notifyAppointments').checked = savedProfile.notifyAppointments !== false;
    document.getElementById('notifyReminders').checked = savedProfile.notifyReminders !== false;
    document.getElementById('notifyReviews').checked = savedProfile.notifyReviews === true;
    
    // Load profile picture if exists
    if (savedProfile.profilePicture) {
        const preview = document.getElementById('profilePicturePreview');
        preview.innerHTML = `<img src="${savedProfile.profilePicture}" alt="Profile" class="w-full h-full rounded-full object-cover">`;
    }
}

// Handle profile form submission
document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileData();
        });
    }
});

function saveProfileData() {
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    
    // Collect form data
    const profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        specialty: document.getElementById('profileSpecialty').value,
        bio: document.getElementById('profileBio').value,
        instagram: document.getElementById('profileInstagram').value,
        facebook: document.getElementById('profileFacebook').value,
        preferredSchedule: document.getElementById('preferredSchedule').value,
        preferredDays: document.getElementById('preferredDays').value,
        notifyAppointments: document.getElementById('notifyAppointments').checked,
        notifyReminders: document.getElementById('notifyReminders').checked,
        notifyReviews: document.getElementById('notifyReviews').checked,
        updatedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('barber_profile_' + currentUser.id, JSON.stringify(profileData));
    
    // Update current user data
    currentUser.name = profileData.name;
    currentUser.email = profileData.email;
    currentUser.phone = profileData.phone;
    currentUser.specialty = profileData.specialty;
    localStorage.setItem('stylecut_current_user', JSON.stringify(currentUser));
    
    // Show success message
    showNotification('Perfil actualizado exitosamente', 'success');
    
    // Close modal
    closeProfileModal();
    
    // Update dashboard display
    updateDashboardDisplay();
}

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

function updateDashboardDisplay() {
    // Update barber name in dashboard if it changed
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    const nameElements = document.querySelectorAll('.barber-name');
    nameElements.forEach(element => {
        if (element) {
            element.textContent = currentUser.name;
        }
    });
}
let appointments = [
    {
        id: 1,
        clientName: "Juan Pérez",
        service: "Masaje Relajante",
        date: "2024-12-15",
        time: "9:00 AM",
        status: "confirmed",
        phone: "3001234567",
        notes: "Primera vez"
    },
    {
        id: 2,
        clientName: "María García",
        service: "Facial Rejuvenecedor",
        date: "2024-12-15",
        time: "10:30 AM",
        status: "pending",
        phone: "3009876543",
        notes: "Alergia a productos químicos"
    },
    {
        id: 3,
        clientName: "Carlos López",
        service: "Manicure y Pedicure",
        date: "2024-12-15",
        time: "2:00 PM",
        status: "confirmed",
        phone: "3005555555",
        notes: ""
    },
    {
        id: 4,
        clientName: "Ana Martínez",
        service: "Depilación Laser",
        date: "2024-12-15",
        time: "3:30 PM",
        status: "pending",
        phone: "3007777777",
        notes: "Zona piernas completas"
    },
    {
        id: 5,
        clientName: "Luis Rodríguez",
        service: "Tratamiento Capilar",
        date: "2024-12-15",
        time: "5:00 PM",
        status: "confirmed",
        phone: "3009999999",
        notes: "Cabelllo muy dañado"
    }
];

let barberServices = [
    { id: 1, name: "Masaje Relajante", price: "$80.000", duration: "60 min", active: true },
    { id: 2, name: "Facial Rejuvenecedor", price: "$120.000", duration: "90 min", active: true },
    { id: 3, name: "Manicure y Pedicure", price: "$60.000", duration: "45 min", active: false },
    { id: 4, name: "Depilación Laser", price: "$150.000", duration: "30 min", active: true }
];

let currentFilter = 'all';
let barberNotifications = [];

// Load notifications for current barber
function loadNotifications() {
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    const barberName = currentUser.name || 'Carlos Rodríguez';
    
    const notifications = JSON.parse(localStorage.getItem('barber_notifications_' + barberName) || '[]');
    barberNotifications = notifications;
}

// Render notifications
function renderNotifications() {
    const notificationsContainer = document.getElementById('notificationsContainer');
    if (!notificationsContainer) return;
    
    const unreadCount = barberNotifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        notificationsContainer.innerHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <i class="fas fa-bell text-yellow-600 mr-3"></i>
                        <span class="font-semibold text-yellow-800">
                            ${unreadCount} notificación(es) nueva(s)
                        </span>
                    </div>
                    <button onclick="markAllNotificationsAsRead()" class="text-yellow-600 hover:text-yellow-800">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
                <div class="mt-3 space-y-2">
                    ${barberNotifications.filter(n => !n.read).slice(0, 3).map(notification => `
                        <div class="text-sm text-yellow-700">
                            <i class="fas fa-calendar-plus mr-2"></i>
                            ${notification.message}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        notificationsContainer.innerHTML = '';
    }
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    const barberName = currentUser.name || 'Carlos Rodríguez';
    
    barberNotifications.forEach(notification => {
        notification.read = true;
    });
    
    localStorage.setItem('barber_notifications_' + barberName, JSON.stringify(barberNotifications));
    renderNotifications();
}

// Refresh appointments data
function refreshAppointments() {
    loadAppointments();
    renderAppointments();
}

// Auto-refresh appointments every 30 seconds
setInterval(() => {
    refreshAppointments();
    loadNotifications();
    renderNotifications();
    renderRatings();
    renderCalendar();
}, 30000);

// Calendar functionality
function renderCalendar() {
    const calendarView = document.getElementById('calendarView');
    if (!calendarView) return;
    
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    const barberName = currentUser.name || 'Carlos Rodríguez';
    
    // Get current date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get barber's appointments for this month
    const barberAppointments = appointments.filter(a => 
        a.barber === barberName && 
        new Date(a.date).getMonth() === currentMonth && 
        new Date(a.date).getFullYear() === currentYear
    );
    
    // Generate calendar HTML
    let calendarHTML = `
        <div class="col-span-7 text-center font-semibold text-gray-700 mb-4">
            ${getMonthName(currentMonth)} ${currentYear}
        </div>
    `;
    
    // Day headers
    const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayHeaders.forEach(day => {
        calendarHTML += `<div class="text-center font-semibold text-gray-600 text-sm">${day}</div>`;
    });
    
    // Empty cells for first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarHTML += '<div></div>';
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAppointments = barberAppointments.filter(a => a.date === dateStr);
        
        const isToday = day === today.getDate();
        const hasAppointments = dayAppointments.length > 0;
        
        let dayClasses = 'p-2 rounded-lg border cursor-pointer transition ';
        if (isToday) {
            dayClasses += 'bg-purple-100 border-purple-300 ';
        } else if (hasAppointments) {
            dayClasses += 'bg-blue-50 border-blue-200 hover:bg-blue-100 ';
        } else {
            dayClasses += 'border-gray-200 hover:bg-gray-50 ';
        }
        
        calendarHTML += `
            <div class="${dayClasses}" onclick="showDayDetails('${dateStr}')">
                <div class="text-center">
                    <div class="font-semibold ${isToday ? 'text-purple-700' : 'text-gray-700'}">${day}</div>
                    ${hasAppointments ? `
                        <div class="text-xs text-blue-600 mt-1">
                            ${dayAppointments.length} cita${dayAppointments.length > 1 ? 's' : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    calendarView.innerHTML = calendarHTML;
}

function getMonthName(monthIndex) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthIndex];
}

function showDayDetails(date) {
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    const barberName = currentUser.name || 'Carlos Rodríguez';
    
    const dayAppointments = appointments.filter(a => 
        a.barber === barberName && a.date === date
    );
    
    if (dayAppointments.length === 0) {
        showNotification(`No hay citas agendadas para el ${date}`, 'info');
        return;
    }
    
    let detailsHTML = `
        <div class="bg-white rounded-lg p-4 max-w-md mx-auto">
            <h3 class="text-lg font-semibold mb-3">Citas para ${date}</h3>
            <div class="space-y-2">
    `;
    
    dayAppointments.forEach(apt => {
        detailsHTML += `
            <div class="border-l-4 ${
                apt.status === 'confirmed' ? 'border-green-500' : 'border-yellow-500'
            } pl-3 py-2">
                <div class="font-medium">${apt.time} - ${apt.service}</div>
                <div class="text-sm text-gray-600">${apt.clientName || 'Cliente'}</div>
                <div class="text-xs ${apt.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}">
                    ${apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                </div>
            </div>
        `;
    });
    
    detailsHTML += `
            </div>
        </div>
    `;
    
    // Create modal to show details
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-effect rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">Detalles del Día</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                ${detailsHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Load ratings for barber
function loadRatings() {
    const ratings = JSON.parse(localStorage.getItem('barber_ratings') || '[]');
    return ratings;
}

// Calculate average rating for barber
function calculateAverageRating(barberName) {
    const ratings = loadRatings();
    const barberRatings = ratings.filter(r => r.barberName === barberName);
    
    if (barberRatings.length === 0) return 0;
    
    const sum = barberRatings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / barberRatings.length).toFixed(1);
}

// Get rating count for barber
function getRatingCount(barberName) {
    const ratings = loadRatings();
    return ratings.filter(r => r.barberName === barberName).length;
}

// Render ratings in barber dashboard
function renderRatings() {
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    const barberName = currentUser.name || 'Carlos Rodríguez';
    
    const averageRating = calculateAverageRating(barberName);
    const ratingCount = getRatingCount(barberName);
    
    // Update stats cards or create ratings section
    const ratingsContainer = document.getElementById('ratingsContainer');
    if (ratingsContainer) {
        if (ratingCount > 0) {
            ratingsContainer.innerHTML = `
                <div class="glass-effect rounded-xl p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Calificaciones</h3>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="text-3xl font-bold text-purple-600 mr-3">${averageRating}</div>
                            <div class="text-yellow-400">
                                ${Array(5).fill(0).map((_, i) => 
                                    `<i class="fas fa-star ${i < Math.round(averageRating) ? '' : 'text-gray-300'}"></i>`
                                ).join('')}
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-600">${ratingCount} calificación${ratingCount > 1 ? 'es' : ''}</div>
                            <div class="text-xs text-gray-500">Promedio de ${ratingCount} cliente${ratingCount > 1 ? 's' : ''}</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            ratingsContainer.innerHTML = `
                <div class="glass-effect rounded-xl p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Calificaciones</h3>
                    <div class="text-center text-gray-500">
                        <i class="fas fa-star text-4xl mb-2"></i>
                        <p>Aún no tienes calificaciones</p>
                        <p class="text-sm">Los clientes podrán calificarte después de completar sus servicios</p>
                    </div>
                </div>
            `;
        }
    }
}

// Load barber profile including logo and cover
function loadBarberProfile() {
    const savedProfile = localStorage.getItem('barberProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        
        // Update cover image display
        const coverImageContainer = document.getElementById('coverImageContainer');
        const coverUploadArea = document.getElementById('coverUploadArea');
        if (coverImageContainer) {
            if (profile.coverImage) {
                // Hide upload area and show cover
                if (coverUploadArea) {
                    coverUploadArea.style.display = 'none';
                }
                coverImageContainer.style.backgroundImage = `url(${profile.coverImage})`;
                coverImageContainer.style.backgroundSize = 'cover';
                coverImageContainer.style.backgroundPosition = 'center';
                coverImageContainer.style.backgroundRepeat = 'no-repeat';
            } else {
                // Show upload area if no cover
                if (coverUploadArea) {
                    coverUploadArea.style.display = 'flex';
                }
                coverImageContainer.style.backgroundImage = '';
            }
        }
        
        // Update logo display (circular like Facebook profile) - only if barber has uploaded logo
        const logoDisplay = document.getElementById('barberLogoDisplay');
        if (logoDisplay) {
            if (profile.logo) {
                // Hide upload area and show logo
                const uploadArea = document.getElementById('logoUploadArea');
                if (uploadArea) {
                    uploadArea.style.display = 'none';
                }
                // Add logo image (circular like Facebook)
                const logoImg = document.createElement('img');
                logoImg.src = profile.logo;
                logoImg.alt = 'Logo';
                logoImg.className = 'w-full h-full object-cover rounded-full';
                logoDisplay.appendChild(logoImg);
            } else {
                // Show upload area if no logo
                const uploadArea = document.getElementById('logoUploadArea');
                if (uploadArea) {
                    uploadArea.style.display = 'flex';
                }
            }
        }
        
        // Update cover preview in modal
        const coverPreview = document.getElementById('coverPreview');
        if (coverPreview) {
            if (profile.coverImage) {
                coverPreview.innerHTML = `<img src="${profile.coverImage}" alt="Cover Preview" class="w-full h-full object-cover rounded-lg">`;
            } else {
                coverPreview.innerHTML = '<i class="fas fa-image text-gray-400 text-2xl"></i>';
            }
        }
        
        // Update logo preview in modal
        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview) {
            if (profile.logo) {
                logoPreview.innerHTML = `<img src="${profile.logo}" alt="Logo Preview" class="w-full h-full object-contain rounded-lg p-1">`;
            } else {
                logoPreview.innerHTML = '<i class="fas fa-user text-gray-400 text-2xl"></i>';
            }
        }
        
        // Update watermark with custom logo
        const watermarkBackground = document.getElementById('watermarkBackground');
        if (watermarkBackground) {
            if (profile.logo) {
                watermarkBackground.innerHTML = `
                    <div class="transform rotate-12 scale-150">
                        <img src="${profile.logo}" alt="Watermark" class="w-64 h-32 object-contain opacity-20">
                    </div>
                `;
            } else {
                watermarkBackground.innerHTML = `
                    <div class="transform rotate-12 scale-150">
                        <i class="fas fa-store text-gray-400 text-9xl"></i>
                    </div>
                `;
            }
        }
        
        // Update form fields
        if (profile.displayName) {
            document.getElementById('profileName').value = profile.displayName;
        }
        if (profile.email) {
            document.getElementById('profileEmail').value = profile.email;
        }
        if (profile.phone) {
            document.getElementById('profilePhone').value = profile.phone;
        }
        if (profile.bio) {
            document.getElementById('profileBio').value = profile.bio;
        }
    }
}

// Handle logo upload
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('El archivo no puede superar los 2MB', 'error');
        return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
        showNotification('Por favor selecciona un archivo de imagen válido', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const logoData = e.target.result;
        
        // Update preview
        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview) {
            logoPreview.innerHTML = `<img src="${logoData}" alt="Logo Preview" class="w-full h-full object-cover rounded-lg">`;
        }
        
        // Update main display
        const logoDisplay = document.getElementById('barberLogoDisplay');
        const uploadArea = document.getElementById('logoUploadArea');
        
        if (logoDisplay && uploadArea) {
            // Hide upload area
            uploadArea.style.display = 'none';
            
            // Remove existing logo if any
            const existingLogo = logoDisplay.querySelector('img');
            if (existingLogo) {
                existingLogo.remove();
            }
            
            // Add new logo (circular like Facebook profile)
            const logoImg = document.createElement('img');
            logoImg.src = logoData;
            logoImg.alt = 'Logo';
            logoImg.className = 'w-full h-full object-cover rounded-full';
            logoDisplay.appendChild(logoImg);
        }
        
        // Save to profile
        saveLogoToProfile(logoData);
    };
    reader.readAsDataURL(file);
}

// Handle main logo upload from dashboard area
function handleMainLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('El archivo no puede superar los 2MB', 'error');
        return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
        showNotification('Por favor selecciona un archivo de imagen válido', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const logoData = e.target.result;
        
        // Update main display (circular like Facebook)
        const logoDisplay = document.getElementById('barberLogoDisplay');
        const uploadArea = document.getElementById('logoUploadArea');
        
        if (logoDisplay && uploadArea) {
            // Hide upload area
            uploadArea.style.display = 'none';
            
            // Remove existing logo if any
            const existingLogo = logoDisplay.querySelector('img');
            if (existingLogo) {
                existingLogo.remove();
            }
            
            // Add new logo (circular like Facebook profile)
            const logoImg = document.createElement('img');
            logoImg.src = logoData;
            logoImg.alt = 'Logo';
            logoImg.className = 'w-full h-full object-cover rounded-full';
            logoDisplay.appendChild(logoImg);
        }
        
        // Update modal preview
        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview) {
            logoPreview.innerHTML = `<img src="${logoData}" alt="Logo Preview" class="w-full h-full object-contain rounded-lg p-1">`;
        }
        
        // Save to profile
        saveLogoToProfile(logoData);
    };
    reader.readAsDataURL(file);
}

// Handle cover upload from dashboard
function handleCoverUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('El archivo no puede superar los 2MB', 'error');
        return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
        showNotification('Por favor selecciona un archivo de imagen válido', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const coverData = e.target.result;
        
        // Update cover display
        const coverImageContainer = document.getElementById('coverImageContainer');
        const coverUploadArea = document.getElementById('coverUploadArea');
        
        if (coverImageContainer && coverUploadArea) {
            // Hide upload area
            coverUploadArea.style.display = 'none';
            
            // Set background image
            coverImageContainer.style.backgroundImage = `url(${coverData})`;
            coverImageContainer.style.backgroundSize = 'cover';
            coverImageContainer.style.backgroundPosition = 'center';
            coverImageContainer.style.backgroundRepeat = 'no-repeat';
        }
        
        // Update modal preview
        const coverPreview = document.getElementById('coverPreview');
        if (coverPreview) {
            coverPreview.innerHTML = `<img src="${coverData}" alt="Cover Preview" class="w-full h-full object-cover rounded-lg">`;
        }
        
        // Save to profile
        saveCoverToProfile(coverData);
    };
    reader.readAsDataURL(file);
}

// Handle cover upload from modal
function handleCoverUploadModal(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('El archivo no puede superar los 2MB', 'error');
        return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
        showNotification('Por favor selecciona un archivo de imagen válido', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const coverData = e.target.result;
        
        // Update modal preview
        const coverPreview = document.getElementById('coverPreview');
        if (coverPreview) {
            coverPreview.innerHTML = `<img src="${coverData}" alt="Cover Preview" class="w-full h-full object-cover rounded-lg">`;
        }
        
        // Save to profile (this will update main display)
        saveCoverToProfile(coverData);
    };
    reader.readAsDataURL(file);
}

// Save cover image to profile
function saveCoverToProfile(coverData) {
    const currentProfile = JSON.parse(localStorage.getItem('barberProfile') || '{}');
    currentProfile.coverImage = coverData;
    localStorage.setItem('barberProfile', JSON.stringify(currentProfile));
    
    // Update main display
    const coverImageContainer = document.getElementById('coverImageContainer');
    const coverUploadArea = document.getElementById('coverUploadArea');
    
    if (coverImageContainer && coverUploadArea) {
        // Hide upload area
        coverUploadArea.style.display = 'none';
        
        // Set background image
        coverImageContainer.style.backgroundImage = `url(${coverData})`;
        coverImageContainer.style.backgroundSize = 'cover';
        coverImageContainer.style.backgroundPosition = 'center';
        coverImageContainer.style.backgroundRepeat = 'no-repeat';
    }
    
    showNotification('Imagen de portada actualizada correctamente', 'success');
}

// Show cover upload area
function showCoverUploadArea() {
    const coverUploadArea = document.getElementById('coverUploadArea');
    if (coverUploadArea) {
        coverUploadArea.style.display = 'flex';
    }
}

// Hide cover upload area
function hideCoverUploadArea() {
    const coverUploadArea = document.getElementById('coverUploadArea');
    if (coverUploadArea) {
        coverUploadArea.style.display = 'none';
    }
}

// Save logo to profile
function saveLogoToProfile(logoData) {
    const currentProfile = JSON.parse(localStorage.getItem('barberProfile') || '{}');
    currentProfile.logo = logoData;
    localStorage.setItem('barberProfile', JSON.stringify(currentProfile));
    
    // Update main display
    const logoDisplay = document.getElementById('barberLogoDisplay');
    const uploadArea = document.getElementById('logoUploadArea');
    
    if (logoDisplay && uploadArea) {
        // Hide upload area
        uploadArea.style.display = 'none';
        
        // Remove existing logo if any
        const existingLogo = logoDisplay.querySelector('img');
        if (existingLogo) {
            existingLogo.remove();
        }
        
        // Add new logo (circular like Facebook profile)
        const logoImg = document.createElement('img');
        logoImg.src = logoData;
        logoImg.alt = 'Logo';
        logoImg.className = 'w-full h-full object-cover rounded-full';
        logoDisplay.appendChild(logoImg);
    }
    
    // Update watermark with custom logo
    const watermarkBackground = document.getElementById('watermarkBackground');
    if (watermarkBackground) {
        watermarkBackground.innerHTML = `
            <div class="transform rotate-12 scale-150">
                <img src="${logoData}" alt="Watermark" class="w-64 h-32 object-contain opacity-20">
            </div>
        `;
    }
    
    showNotification('Foto de perfil actualizada correctamente', 'success');
}

// Setup logo and cover upload event listeners
function setupLogoUpload() {
    // Modal logo upload
    const logoUpload = document.getElementById('logoUpload');
    if (logoUpload) {
        logoUpload.addEventListener('change', handleLogoUpload);
    }
    
    // Main logo upload area
    const logoUploadMain = document.getElementById('logoUploadMain');
    const logoUploadArea = document.getElementById('logoUploadArea');
    
    if (logoUploadMain && logoUploadArea) {
        logoUploadArea.addEventListener('click', () => {
            logoUploadMain.click();
        });
        
        logoUploadMain.addEventListener('change', handleMainLogoUpload);
    }
    
    // Cover upload area
    const coverUpload = document.getElementById('coverUpload');
    const coverUploadArea = document.getElementById('coverUploadArea');
    
    if (coverUpload && coverUploadArea) {
        coverUploadArea.addEventListener('click', () => {
            coverUpload.click();
        });
        
        coverUpload.addEventListener('change', handleCoverUpload);
    }
    
    // Modal cover upload
    const coverUploadModal = document.getElementById('coverUploadModal');
    if (coverUploadModal) {
        coverUploadModal.addEventListener('change', handleCoverUploadModal);
    }
}

// Show notification function (if not already present)
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
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
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadBarberProfile();
    loadAppointments();
    loadNotifications();
    renderAppointments();
    renderNotifications();
    renderRatings();
    renderCalendar();
    setupEventListeners();
    setupLogoUpload();
});

// Load user info
function loadUserInfo() {
    const userEmail = sessionStorage.getItem('userEmail') || 'demo@barber.com';
    
    // Load barber profile
    const savedProfile = localStorage.getItem('barberProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('barberName').textContent = profile.displayName || 'Barbero';
    } else {
        const barberName = userEmail.split('@')[0].replace('demo', 'Carlos Rodríguez');
        document.getElementById('barberName').textContent = barberName;
    }
}

// Load appointments from localStorage
function loadAppointments() {
    const storedAppointments = localStorage.getItem('stylecut_appointments');
    if (storedAppointments) {
        appointments = JSON.parse(storedAppointments);
    }
}

// Render appointments
function renderAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    const today = new Date().toISOString().split('T')[0];
    const currentUser = JSON.parse(localStorage.getItem('stylecut_current_user') || '{}');
    const barberName = currentUser.name || 'Carlos Rodríguez';
    
    // Filter appointments for current barber and today
    let filteredAppointments = appointments.filter(a => 
        a.barber === barberName && a.date === today
    );
    
    if (currentFilter !== 'all') {
        filteredAppointments = filteredAppointments.filter(a => a.status === currentFilter);
    }
    
    if (filteredAppointments.length === 0) {
        appointmentsList.innerHTML = '<p class="text-gray-500 text-center py-8">No hay citas para hoy</p>';
        return;
    }
    
    appointmentsList.innerHTML = filteredAppointments.map(appointment => `
        <div class="appointment-card border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-user-circle text-2xl text-purple-600 mr-3"></i>
                        <div>
                            <h4 class="font-semibold text-gray-800">${appointment.clientName || 'Cliente'}</h4>
                            <p class="text-sm text-gray-600">${appointment.service}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 text-sm text-gray-600">
                        <span><i class="far fa-clock mr-1"></i>${appointment.time}</span>
                        <span><i class="fas fa-phone mr-1"></i>${appointment.phone || 'No especificado'}</span>
                        ${appointment.notes ? `<span><i class="fas fa-sticky-note mr-1"></i>${appointment.notes}</span>` : ''}
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                        appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                    }">
                        ${appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                    <div class="space-y-1">
                        ${appointment.status === 'pending' ? `
                            <button onclick="confirmAppointment(${appointment.id})" class="block w-full bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition">
                                <i class="fas fa-check mr-1"></i>Confirmar
                            </button>
                        ` : ''}
                        <button onclick="contactClient('${appointment.phone}')" class="block w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition">
                            <i class="fas fa-phone mr-1"></i>Contactar
                        </button>
                        <button onclick="cancelAppointment(${appointment.id})" class="block w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">
                            <i class="fas fa-times mr-1"></i>Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Render services
function renderServices() {
    const servicesList = document.getElementById('servicesList');
    
    servicesList.innerHTML = barberServices.map(service => `
        <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="font-semibold text-gray-800">${service.name}</h4>
                    <p class="text-gray-600">${service.price} - ${service.duration}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 rounded text-xs font-semibold ${
                        service.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                    }">
                        ${service.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button onclick="toggleService(${service.id})" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteService(${service.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Generate calendar
function generateCalendar() {
    const calendarView = document.getElementById('calendarView');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Days of week headers
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    let calendarHTML = daysOfWeek.map(day => 
        `<div class="text-center font-semibold text-gray-700 py-2">${day}</div>`
    ).join('');
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div></div>';
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAppointments = appointments.filter(a => a.date === dateStr).length;
        const isToday = day === today.getDate();
        
        calendarHTML += `
            <div class="border border-gray-200 rounded-lg p-2 min-h-[60px] ${
                isToday ? 'bg-purple-100 border-purple-400' : 'hover:bg-gray-50'
            } cursor-pointer transition">
                <div class="font-semibold text-sm ${isToday ? 'text-purple-700' : 'text-gray-700'}">${day}</div>
                ${dayAppointments > 0 ? `
                    <div class="text-xs text-purple-600 font-semibold">
                        ${dayAppointments} cita${dayAppointments > 1 ? 's' : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    calendarView.innerHTML = calendarHTML;
}

// Update stats
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);
    const weekAppointments = appointments.filter(a => {
        const appointmentDate = new Date(a.date);
        const todayDate = new Date();
        const diffTime = Math.abs(appointmentDate - todayDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    });
    
    document.getElementById('todayAppointments').textContent = todayAppointments.length;
    document.getElementById('weekAppointments').textContent = weekAppointments.length;
}

// Barber profile data
let barberProfile = {
    shopName: '',
    displayName: '',
    logo: '',
    description: '',
    address: '',
    latitude: null,
    longitude: null
};

// Registered clients
let registeredClients = [
    { id: 1, name: 'Juan Pérez', phone: '3001234567', email: 'juan@email.com', notes: 'Prefiere corte corto', registeredDate: '2024-12-01' },
    { id: 2, name: 'María García', phone: '3009876543', email: 'maria@email.com', notes: 'Alergia a productos químicos', registeredDate: '2024-12-05' }
];

// Communication messages
let communicationMessages = [
    { id: 1, clientId: 1, clientName: 'Juan Pérez', message: 'Recordatorio de tu cita mañana a las 10:00 AM', date: '2024-12-14', type: 'reminder' },
    { id: 2, clientId: 2, clientName: 'María García', message: 'Gracias por visitar nuestra barbería', date: '2024-12-13', type: 'thank_you' }
];

// Setup event listeners
function setupEventListeners() {
    document.getElementById('scheduleForm').addEventListener('submit', handleScheduleSubmit);
    document.getElementById('barberProfileForm').addEventListener('submit', handleProfileSubmit);
    document.getElementById('clientRegistrationForm').addEventListener('submit', handleClientRegistrationSubmit);
    document.getElementById('barberLogo').addEventListener('change', handleLogoUpload);
}

// Filter appointments
function filterAppointments(filter) {
    currentFilter = filter;
    
    // Update button styles
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Todas') && filter === 'all' ||
            btn.textContent.includes('Pendientes') && filter === 'pending' ||
            btn.textContent.includes('Confirmadas') && filter === 'confirmed') {
            btn.className = 'px-4 py-2 bg-purple-600 text-white rounded-lg';
        } else if (btn.textContent.includes('Todas') || btn.textContent.includes('Pendientes') || btn.textContent.includes('Confirmadas')) {
            btn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300';
        }
    });
    
    renderAppointments();
}

// Confirm appointment
function confirmAppointment(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
        appointment.status = 'confirmed';
        renderAppointments();
        showNotification('Cita confirmada exitosamente', 'success');
    }
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
        appointments = appointments.filter(a => a.id !== appointmentId);
        renderAppointments();
        updateStats();
        showNotification('Cita cancelada exitosamente', 'success');
    }
}

// Contact client
function contactClient(phone) {
    window.open(`tel:${phone}`);
}

// Toggle service
function toggleService(serviceId) {
    const service = barberServices.find(s => s.id === serviceId);
    if (service) {
        service.active = !service.active;
        renderServices();
        showNotification(`Servicio ${service.active ? 'activado' : 'desactivado'}`, 'success');
    }
}

// Delete service
function deleteService(serviceId) {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
        barberServices = barberServices.filter(s => s.id !== serviceId);
        renderServices();
        showNotification('Servicio eliminado exitosamente', 'success');
    }
}

// Show schedule modal
function showScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close schedule modal
function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Show profile modal
function showProfileModal() {
    document.getElementById('profileModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loadBarberProfile();
}

// Close profile modal
function closeProfileModal() {
    document.getElementById('profileModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Show client registration modal
function showClientRegistrationModal() {
    document.getElementById('clientRegistrationModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close client registration modal
function closeClientRegistrationModal() {
    document.getElementById('clientRegistrationModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    document.getElementById('clientRegistrationForm').reset();
}

// Show services modal
function showServicesModal() {
    document.getElementById('servicesModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close services modal
function closeServicesModal() {
    document.getElementById('servicesModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Add new service
function addNewService() {
    const serviceName = prompt('Nombre del servicio:');
    if (serviceName) {
        const price = prompt('Precio del servicio:');
        const duration = prompt('Duración del servicio:');
        
        if (price && duration) {
            const newService = {
                id: barberServices.length + 1,
                name: serviceName,
                price: `$${price}`,
                duration: duration,
                active: true
            };
            
            barberServices.push(newService);
            renderServices();
            showNotification('Servicio agregado exitosamente', 'success');
        }
    }
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
            logoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo de barbería" class="w-full h-full object-cover">`;
            barberProfile.logo = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Load barber profile
function loadBarberProfile() {
    const savedProfile = localStorage.getItem('barberProfile');
    if (savedProfile) {
        barberProfile = JSON.parse(savedProfile);
        document.getElementById('barberShopName').value = barberProfile.shopName;
        document.getElementById('barberDisplayName').value = barberProfile.displayName;
        document.getElementById('barberDescription').value = barberProfile.description;
        document.getElementById('barberAddress').value = barberProfile.address || '';
        
        if (barberProfile.logo) {
            document.getElementById('logoPreview').innerHTML = `<img src="${barberProfile.logo}" alt="Logo de barbería" class="w-full h-full object-cover">`;
        }
        
        // Show map if coordinates are available
        if (barberProfile.latitude && barberProfile.longitude) {
            showMap(barberProfile.latitude, barberProfile.longitude);
            document.getElementById('locationStatus').innerHTML = '<span class="text-green-600">✓ Ubicación guardada</span>';
        }
    }
}

// Get current location
function getCurrentLocation() {
    const locationStatus = document.getElementById('locationStatus');
    const mapContainer = document.getElementById('mapContainer');
    
    if (!navigator.geolocation) {
        locationStatus.innerHTML = '<span class="text-red-600">Tu navegador no soporta geolocalización</span>';
        return;
    }
    
    locationStatus.innerHTML = '<span class="text-blue-600">Obteniendo ubicación...</span>';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            barberProfile.latitude = lat;
            barberProfile.longitude = lng;
            
            // Get address from coordinates (reverse geocoding)
            getAddressFromCoordinates(lat, lng);
            
            // Show map
            showMap(lat, lng);
            
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
                document.getElementById('barberAddress').value = data.display_name;
                barberProfile.address = data.display_name;
            }
        })
        .catch(error => {
            console.error('Error getting address:', error);
            // Fallback: use coordinates as address
            document.getElementById('barberAddress').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            barberProfile.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        });
}

// Show map
function showMap(lat, lng) {
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.classList.remove('hidden');
    
    // Create simple map using OpenStreetMap
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.001},${lat-0.001},${lng+0.001},${lat+0.001}&layer=mapnik&marker=${lat},${lng}`;
    
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

// Handle profile submit
function handleProfileSubmit(e) {
    e.preventDefault();
    
    barberProfile.shopName = document.getElementById('barberShopName').value;
    barberProfile.displayName = document.getElementById('barberDisplayName').value;
    barberProfile.description = document.getElementById('barberDescription').value;
    barberProfile.address = document.getElementById('barberAddress').value;
    
    // Save to localStorage
    localStorage.setItem('barberProfile', JSON.stringify(barberProfile));
    
    // Update barber name in header
    document.getElementById('barberName').textContent = barberProfile.displayName || 'Barbero';
    
    closeProfileModal();
    showNotification('Perfil actualizado exitosamente', 'success');
}

// Handle client registration submit
function handleClientRegistrationSubmit(e) {
    e.preventDefault();
    
    const newClient = {
        id: registeredClients.length + 1,
        name: document.getElementById('newClientName').value,
        phone: document.getElementById('newClientPhone').value,
        email: document.getElementById('newClientEmail').value,
        notes: document.getElementById('newClientNotes').value,
        registeredDate: new Date().toISOString().split('T')[0]
    };
    
    registeredClients.push(newClient);
    
    closeClientRegistrationModal();
    showNotification(`Cliente ${newClient.name} registrado exitosamente`, 'success');
    
    // Send welcome message
    sendWelcomeMessage(newClient);
}

// Send welcome message to new client
function sendWelcomeMessage(client) {
    const welcomeMessage = {
        id: communicationMessages.length + 1,
        clientId: client.id,
        clientName: client.name,
        message: `¡Bienvenido a ${barberProfile.shopName || 'nuestra barbería'}! Gracias por registrarte. Esperamos verte pronto.`,
        date: new Date().toISOString().split('T')[0],
        type: 'welcome'
    };
    
    communicationMessages.push(welcomeMessage);
    showNotification('Mensaje de bienvenida enviado', 'success');
}

// Handle schedule submit
function handleScheduleSubmit(e) {
    e.preventDefault();
    closeScheduleModal();
    showNotification('Horario actualizado exitosamente', 'success');
}

// Export report
function exportReport() {
    const reportData = {
        period: 'Diciembre 2024',
        totalAppointments: appointments.length,
        earnings: '$1.200.000',
        services: barberServices.filter(s => s.active).length
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'barber_report.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Reporte exportado exitosamente', 'success');
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
