// Main barber data - scalable system
let barbers = [
    {
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
        latitude: 6.1318,
        longitude: -75.6137,
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
    }
];

// Function to add new barber (for future expansion)
function addNewBarber(barberData) {
    const newId = Math.max(...barbers.map(b => b.id)) + 1;
    const newBarber = {
        id: newId,
        name: barberData.name,
        shopName: barberData.shopName,
        address: barberData.address,
        phone: barberData.phone,
        email: barberData.email,
        rating: 0,
        reviews: 0,
        priceRange: barberData.priceRange,
        image: barberData.image || "https://images.unsplash.com/photo-1585747860718-85af9b5edf34?w=400&h=300&fit=crop",
        logo: barberData.logo || null,
        latitude: barberData.latitude,
        longitude: barberData.longitude,
        services: barberData.services,
        specialties: barberData.specialties,
        description: barberData.description,
        hours: barberData.hours,
        featured: false,
        established: barberData.established || new Date().getFullYear().toString(),
        website: barberData.website || '',
        socialMedia: barberData.socialMedia || {}
    };
    
    barbers.push(newBarber);
    saveBarbersToStorage();
    return newBarber;
}

// Save barbers to localStorage for persistence
function saveBarbersToStorage() {
    localStorage.setItem('barberhub_barbers', JSON.stringify(barbers));
}

// Load barbers from localStorage
function loadBarbersFromStorage() {
    const saved = localStorage.getItem('barberhub_barbers');
    if (saved) {
        barbers = JSON.parse(saved);
    }
}

// Initialize barbers from storage
loadBarbersFromStorage();

let currentFilter = 'all';
let displayedBarbers = 6;
let userLocation = null;

// Update stats dynamically
function updateStats() {
    document.getElementById('barbersCount').textContent = barbers.length;
    document.getElementById('barbersTotalCount').textContent = barbers.length;
    
    // Calculate average rating
    const avgRating = barbers.reduce((sum, barber) => sum + barber.rating, 0) / barbers.length;
    const ratingElements = document.querySelectorAll('.text-purple-600');
    if (ratingElements.length >= 4) {
        ratingElements[3].textContent = avgRating.toFixed(1);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadBarbers();
    updateStats();
    getUserLocation();
});

// Load barbers grid
function loadBarbers(filter = 'all') {
    const grid = document.getElementById('barbersGrid');
    let filteredBarbers = [...barbers];
    
    if (filter === 'featured') {
        filteredBarbers = barbers.filter(b => b.featured);
    } else if (filter === 'nearby' && userLocation) {
        filteredBarbers = barbers.filter(b => calculateDistance(userLocation, b) < 10);
    } else if (filter === 'toprated') {
        filteredBarbers = barbers.filter(b => b.rating >= 4.8);
    }
    
    const barbersToShow = filteredBarbers.slice(0, displayedBarbers);
    
    grid.innerHTML = barbersToShow.map(barber => createBarberCard(barber)).join('');
}

// Create barber card HTML
function createBarberCard(barber) {
    const distance = userLocation ? calculateDistance(userLocation, barber) : null;
    
    return `
        <div class="service-card bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer" onclick="showBarberDetail(${barber.id})">
            <div class="relative">
                <img src="${barber.image}" alt="${barber.shopName}" class="w-full h-48 object-cover">
                ${barber.featured ? '<span class="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Destacado</span>' : ''}
                <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                    <span class="text-sm font-semibold text-purple-600">${barber.priceRange}</span>
                </div>
            </div>
            
            <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">${barber.shopName}</h3>
                        <p class="text-gray-600">${barber.name}</p>
                    </div>
                    <div class="text-right">
                        <div class="flex items-center">
                            <i class="fas fa-star rating-star"></i>
                            <span class="ml-1 font-semibold">${barber.rating}</span>
                        </div>
                        <p class="text-sm text-gray-500">${barber.reviews} reseñas</p>
                    </div>
                </div>
                
                <p class="text-gray-600 mb-4 line-clamp-2">${barber.description}</p>
                
                <div class="flex items-center text-gray-500 mb-4">
                    <i class="fas fa-map-marker-alt mr-2"></i>
                    <span class="text-sm">${barber.address}</span>
                </div>
                
                ${distance ? `<div class="flex items-center text-gray-500 mb-4">
                    <i class="fas fa-route mr-2"></i>
                    <span class="text-sm">${distance.toFixed(1)} km de distancia</span>
                </div>` : ''}
                
                <div class="flex flex-wrap gap-2 mb-4">
                    ${barber.specialties.slice(0, 3).map(specialty => 
                        `<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">${specialty}</span>`
                    ).join('')}
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center text-gray-500">
                        <i class="fas fa-clock mr-2"></i>
                        <span class="text-sm">Abierto ahora</span>
                    </div>
                    <button class="brand-purple text-white px-4 py-2 rounded-lg hover:shadow-lg transition" onclick="event.stopPropagation(); bookAppointment(${barber.id})">
                    Reservar
                </button>
                <button class="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition" onclick="event.stopPropagation(); visitBarberPortal(${barber.id})">
                    Portal
                </button>
                </div>
            </div>
        </div>
    `;
}

// Show barber detail modal
function showBarberDetail(barberId) {
    const barber = barbers.find(b => b.id === barberId);
    if (!barber) return;
    
    const modal = document.getElementById('barberDetailModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="relative">
            <img src="${barber.image}" alt="${barber.shopName}" class="w-full h-64 object-cover">
            <button onclick="closeBarberDetail()" class="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition">
                <i class="fas fa-times text-gray-700"></i>
            </button>
        </div>
        
        <div class="p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">${barber.shopName}</h2>
                    <p class="text-xl text-gray-600">${barber.name}</p>
                    <div class="flex items-center mt-2">
                        <div class="flex items-center">
                            <i class="fas fa-star rating-star"></i>
                            <span class="ml-1 font-semibold">${barber.rating}</span>
                        </div>
                        <span class="mx-2 text-gray-400">|</span>
                        <span class="text-gray-600">${barber.reviews} reseñas</span>
                    </div>
                </div>
                <div class="text-right">
                    <span class="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">${barber.priceRange}</span>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 class="text-xl font-semibold mb-4">Información</h3>
                    <div class="space-y-3">
                        <div class="flex items-center text-gray-600">
                            <i class="fas fa-map-marker-alt w-6"></i>
                            <span>${barber.address}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i class="fas fa-phone w-6"></i>
                            <span>${barber.phone}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i class="fas fa-envelope w-6"></i>
                            <span>${barber.email}</span>
                        </div>
                    </div>
                    
                    <h3 class="text-xl font-semibold mb-4 mt-6">Horario</h3>
                    <div class="space-y-2">
                        ${Object.entries(barber.hours).map(([day, hours]) => `
                            <div class="flex justify-between text-gray-600">
                                <span class="capitalize">${day}:</span>
                                <span>${hours}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold mb-4">Servicios</h3>
                    <div class="space-y-3">
                        ${barber.services.map(service => `
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 class="font-semibold text-gray-900">${service.name}</h4>
                                    <p class="text-sm text-gray-600">${service.duration}</p>
                                </div>
                                <span class="font-bold text-purple-600">${service.price}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4">Especialidades</h3>
                <div class="flex flex-wrap gap-2">
                    ${barber.specialties.map(specialty => 
                        `<span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">${specialty}</span>`
                    ).join('')}
                </div>
            </div>
            
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4">Descripción</h3>
                <p class="text-gray-600">${barber.description}</p>
            </div>
            
            ${barber.established ? `
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4">Información Adicional</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center text-gray-600">
                        <i class="fas fa-calendar-alt w-6"></i>
                        <span>Establecido en ${barber.established}</span>
                    </div>
                    ${barber.website ? `
                    <div class="flex items-center text-gray-600">
                        <i class="fas fa-globe w-6"></i>
                        <a href="http://${barber.website}" target="_blank" class="text-purple-600 hover:underline">${barber.website}</a>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            ${barber.socialMedia && Object.keys(barber.socialMedia).length > 0 ? `
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4">Redes Sociales</h3>
                <div class="flex space-x-4">
                    ${barber.socialMedia.instagram ? `
                    <a href="https://instagram.com/${barber.socialMedia.instagram.replace('@', '')}" target="_blank" class="bg-pink-100 text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-200 transition">
                        <i class="fab fa-instagram mr-2"></i>Instagram
                    </a>
                    ` : ''}
                    ${barber.socialMedia.facebook ? `
                    <a href="https://facebook.com/${barber.socialMedia.facebook}" target="_blank" class="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition">
                        <i class="fab fa-facebook mr-2"></i>Facebook
                    </a>
                    ` : ''}
                    ${barber.socialMedia.whatsapp ? `
                    <a href="https://wa.me/57${barber.socialMedia.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200 transition">
                        <i class="fab fa-whatsapp mr-2"></i>WhatsApp
                    </a>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <div class="flex space-x-4">
                <button onclick="bookAppointment(${barber.id})" class="flex-1 brand-purple text-white py-3 rounded-lg hover:shadow-lg transition">
                    <i class="fas fa-calendar-plus mr-2"></i>Reservar Cita
                </button>
                <button onclick="visitBarberPortal(${barber.id})" class="bg-purple-100 text-purple-700 px-6 py-3 rounded-lg hover:bg-purple-200 transition">
                    <i class="fas fa-store mr-2"></i>Visitar Portal
                </button>
                <button onclick="callBarber('${barber.phone}')" class="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition">
                    <i class="fas fa-phone mr-2"></i>Llamar
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close barber detail modal
function closeBarberDetail() {
    document.getElementById('barberDetailModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Book appointment
function bookAppointment(barberId) {
    const barber = barbers.find(b => b.id === barberId);
    sessionStorage.setItem('selectedBarber', barber.name);
    sessionStorage.setItem('selectedBarberShop', barber.shopName);
    window.location.href = 'login.html';
}

// Visit barber portal
function visitBarberPortal(barberId) {
    window.location.href = `barber-portal.html?barber=${barberId}`;
}

// Call barber
function callBarber(phone) {
    window.location.href = `tel:${phone}`;
}

// Search barbers
function searchBarbers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        loadBarbers('all');
        return;
    }
    
    const filtered = barbers.filter(barber => 
        barber.shopName.toLowerCase().includes(searchTerm) ||
        barber.name.toLowerCase().includes(searchTerm) ||
        barber.address.toLowerCase().includes(searchTerm) ||
        barber.specialties.some(s => s.toLowerCase().includes(searchTerm))
    );
    
    const grid = document.getElementById('barbersGrid');
    grid.innerHTML = filtered.map(barber => createBarberCard(barber)).join('');
}

// Filter by service
function filterByService(service) {
    const filtered = barbers.filter(barber => 
        barber.services.some(s => s.name.toLowerCase().includes(service.toLowerCase()))
    );
    
    const grid = document.getElementById('barbersGrid');
    grid.innerHTML = filtered.map(barber => createBarberCard(barber)).join('');
}

// Sort barbers
function sortBarbers() {
    const sortBy = document.getElementById('sortBy').value;
    let sorted = [...barbers];
    
    switch(sortBy) {
        case 'rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        case 'distance':
            if (userLocation) {
                sorted.sort((a, b) => calculateDistance(userLocation, a) - calculateDistance(userLocation, b));
            }
            break;
        case 'price':
            sorted.sort((a, b) => {
                const priceA = parseInt(a.priceRange.replace(/[^0-9]/g, ''));
                const priceB = parseInt(b.priceRange.replace(/[^0-9]/g, ''));
                return priceA - priceB;
            });
            break;
        case 'name':
            sorted.sort((a, b) => a.shopName.localeCompare(b.shopName));
            break;
    }
    
    const grid = document.getElementById('barbersGrid');
    grid.innerHTML = sorted.map(barber => createBarberCard(barber)).join('');
}

// Show all barbers
function showAllBarbers() {
    loadBarbers('all');
    closeMobileMenu();
}

// Show nearby barbers
function showNearbyBarbers() {
    loadBarbers('nearby');
    closeMobileMenu();
}

// Show top rated barbers
function showTopRated() {
    loadBarbers('toprated');
    closeMobileMenu();
}

// Load more barbers
function loadMoreBarbers() {
    displayedBarbers += 3;
    loadBarbers('all');
}

// Get user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                loadBarbers('all');
            },
            (error) => {
                console.log('Location access denied');
            }
        );
    }
}

// Calculate distance between two points
function calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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

// Search on Enter key
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBarbers();
        }
    });
});
