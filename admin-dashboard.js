// Admin Dashboard JavaScript
// Get data from LocalStorage
let users = DataManager.getUsers();
let barbers = DataManager.getBarbers();
let appointments = DataManager.getAppointments();
let services = DataManager.getServices();

// Admin Dashboard JavaScript
let currentSection = 'dashboard';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    updateCurrentTime();
    renderUsers();
    renderBarbers();
    renderServices();
    renderAppointments();
    initializeCharts();
    
    // Update time every minute
    setInterval(updateCurrentTime, 60000);
});

// Load user info
function loadUserInfo() {
    const userEmail = sessionStorage.getItem('userEmail') || 'demo@admin.com';
    console.log('Admin logged in:', userEmail);
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('es-CO', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('currentTime').textContent = timeString;
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Show selected section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    }
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Panel de Administración',
        users: 'Gestión de Usuarios',
        barbers: 'Gestión de Barberos',
        services: 'Gestión de Servicios',
        appointments: 'Gestión de Citas',
        reports: 'Reportes y Estadísticas',
        settings: 'Configuración del Sistema'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || 'Panel de Administración';
    currentSection = section;
}

// Render users
function renderUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;
    
    users = DataManager.getUsers(); // Refresh data from LocalStorage
    
    usersTableBody.innerHTML = users.map(user => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="py-3 px-4">${user.id}</td>
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <i class="fas fa-user-circle text-2xl text-gray-400 mr-3"></i>
                    <span class="font-medium">${user.name}</span>
                </div>
            </td>
            <td class="py-3 px-4">${user.email}</td>
            <td class="py-3 px-4">${user.phone}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                }">
                    ${user.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="editUser(${user.id})" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleUserStatus(${user.id})" class="text-yellow-500 hover:text-yellow-700">
                        <i class="fas fa-ban"></i>
                    </button>
                    <button onclick="deleteUser(${user.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render barbers
function renderBarbers() {
    const barbersTableBody = document.getElementById('barbersTableBody');
    if (!barbersTableBody) return;
    
    barbers = DataManager.getBarbers(); // Refresh data from LocalStorage
    
    barbersTableBody.innerHTML = barbers.map(barber => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="py-3 px-4">${barber.id}</td>
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <i class="fas fa-user-tie text-2xl text-purple-600 mr-3"></i>
                    <span class="font-medium">${barber.name}</span>
                </div>
            </td>
            <td class="py-3 px-4">${barber.email}</td>
            <td class="py-3 px-4">${barber.phone}</td>
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <i class="fas fa-star text-yellow-500 mr-1"></i>
                    <span>${barber.rating}</span>
                </div>
            </td>
            <td class="py-3 px-4">${barber.earnings}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                    barber.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                }">
                    ${barber.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="editBarber(${barber.id})" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleBarberStatus(${barber.id})" class="text-yellow-500 hover:text-yellow-700">
                        <i class="fas fa-ban"></i>
                    </button>
                    <button onclick="deleteBarber(${barber.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render services
function renderServices() {
    const servicesTableBody = document.getElementById('servicesTableBody');
    if (!servicesTableBody) return;
    
    servicesTableBody.innerHTML = services.map(service => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="py-3 px-4">${service.id}</td>
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <i class="fas fa-cut text-2xl text-purple-600 mr-3"></i>
                    <span class="font-medium">${service.name}</span>
                </div>
            </td>
            <td class="py-3 px-4">${service.price}</td>
            <td class="py-3 px-4">${service.duration}</td>
            <td class="py-3 px-4">${service.category}</td>
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div class="bg-purple-600 h-2 rounded-full" style="width: ${service.popularity}%"></div>
                    </div>
                    <span class="text-sm">${service.popularity}%</span>
                </div>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="editService(${service.id})" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteService(${service.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render appointments
function renderAppointments() {
    const appointmentsTableBody = document.getElementById('appointmentsTableBody');
    if (!appointmentsTableBody) return;
    
    appointmentsTableBody.innerHTML = appointments.map(appointment => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="py-3 px-4">${appointment.id}</td>
            <td class="py-3 px-4">${appointment.client}</td>
            <td class="py-3 px-4">${appointment.barber}</td>
            <td class="py-3 px-4">${appointment.service}</td>
            <td class="py-3 px-4">${appointment.date}</td>
            <td class="py-3 px-4">${appointment.time}</td>
            <td class="py-3 px-4">${appointment.revenue}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                    appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                }">
                    ${appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="editAppointment(${appointment.id})" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="cancelAppointment(${appointment.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Initialize charts
function initializeCharts() {
    // Simple chart placeholders - in a real app you'd use Chart.js or similar
    setTimeout(() => {
        showNotification('Gráficos cargados exitosamente', 'success');
    }, 1000);
}

// User management functions
function addNewUser() {
    const name = prompt('Nombre del usuario:');
    if (name) {
        const email = prompt('Email del usuario:');
        const phone = prompt('Teléfono del usuario:');
        
        if (email && phone) {
            const newUser = {
                id: users.length + 1,
                name: name,
                email: email,
                phone: phone,
                status: 'active',
                role: 'client',
                registrations: 0
            };
            
            users.push(newUser);
            renderUsers();
            showNotification('Usuario agregado exitosamente', 'success');
        }
    }
}

function openEditModal(button, type, id) {
    // Get the row from the button that was clicked
    const row = button.closest('tr');
    
    if (row) {
        // Get data from table cells
        const cells = row.getElementsByTagName('td');
        const name = cells[1].textContent.trim();
        const email = cells[2].textContent.trim();
        const phone = cells[3].textContent.trim();
        
        console.log('Opening edit modal for:', { type, id, name, email, phone });
        
        // Populate modal with data
        document.getElementById('editUserName').value = name;
        document.getElementById('editUserEmail').value = email;
        document.getElementById('editUserPhone').value = phone;
        
        // Set modal title
        const modalTitle = type === 'barber' ? 'Editar Barbero' : 'Editar Usuario';
        document.querySelector('#editUserModal h3').textContent = modalTitle;
        
        // Show modal
        document.getElementById('editUserModal').classList.remove('hidden');
        
        // Store the row and type for saving
        window.currentEditRow = row;
        document.getElementById('editUserForm').dataset.userType = type;
        document.getElementById('editUserForm').dataset.userId = id;
        
        console.log('Modal opened successfully');
    } else {
        console.error('Could not find row for editing');
        showNotification('Error: No se encontró la fila', 'error');
    }
}

function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.status = user.status === 'active' ? 'inactive' : 'active';
        renderUsers();
        showNotification(`Usuario ${user.status === 'active' ? 'activado' : 'desactivado'}`, 'success');
    }
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        const success = DataManager.deleteUser(userId);
        if (success) {
            renderUsers();
            showNotification('Usuario eliminado exitosamente', 'success');
        } else {
            showNotification('Error: No se pudo eliminar el usuario', 'error');
        }
    }
}

// Barber management functions

function toggleBarberStatus(barberId) {
    const barber = barbers.find(b => b.id === barberId);
    if (barber) {
        barber.status = barber.status === 'active' ? 'inactive' : 'active';
        renderBarbers();
        showNotification(`Barbero ${barber.status === 'active' ? 'activado' : 'desactivado'}`, 'success');
    }
}

function deleteBarber(barberId) {
    if (confirm('¿Estás seguro de que deseas eliminar este barbero?')) {
        const success = DataManager.deleteBarber(barberId);
        if (success) {
            renderBarbers();
            showNotification('Barbero eliminado exitosamente', 'success');
        } else {
            showNotification('Error: No se pudo eliminar el barbero', 'error');
        }
    }
}

// Service management functions
function editService(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (service) {
        const newName = prompt('Nuevo nombre:', service.name);
        if (newName) {
            service.name = newName;
            renderServices();
            showNotification('Servicio actualizado exitosamente', 'success');
        }
    }
}

function deleteService(serviceId) {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
        services = services.filter(s => s.id !== serviceId);
        renderServices();
        showNotification('Servicio eliminado exitosamente', 'success');
    }
}

// Appointment management functions
function editAppointment(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
        const newTime = prompt('Nueva hora:', appointment.time);
        if (newTime) {
            appointment.time = newTime;
            renderAppointments();
            showNotification('Cita actualizada exitosamente', 'success');
        }
    }
}

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
        type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Función de diagnóstico directo
async function runQuickDiagnosis() {
    console.log('=== INICIANDO DIAGNÓSTICO RÁPIDO ===');
    
    // 1. Verificar token
    const token = localStorage.getItem('stylecut_token');
    if (!token) {
        showNotification('Error: No hay token de autenticación. Inicia sesión nuevamente.', 'error');
        return;
    }
    console.log('Token encontrado:', token.substring(0, 20) + '...');
    
    // 2. Verificar emails existentes
    try {
        const response = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const users = await response.json();
            console.log('Usuarios existentes:', users.length);
            
            const problemEmails = ['estela@gmai.com', 'brahiangarcesmartinez@gmail.com'];
            problemEmails.forEach(email => {
                const exists = users.some(u => u.email === email);
                console.log(`Email ${email}: ${exists ? 'YA EXISTE' : 'NO EXISTE'}`);
                if (exists) {
                    showNotification(`El email ${email} ya está registrado. Usa otro email.`, 'error');
                }
            });
        }
    } catch (error) {
        console.error('Error verificando usuarios:', error);
    }
    
    // 3. Probar registro con datos nuevos
    const timestamp = Date.now();
    const testBarber = {
        name: `Test Barber ${timestamp}`,
        email: `testbarber${timestamp}@test.com`,
        phone: `300${timestamp.toString().slice(-7)}`,
        password: 'barber123',
        specialty: 'Corte de Cabello'
    };
    
    try {
        const response = await fetch('/api/barbers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testBarber)
        });
        
        const data = await response.json();
        console.log('Respuesta del servidor:', response.status, data);
        
        if (response.ok) {
            showNotification('¡Registro funciona! El problema es el email duplicado.', 'success');
            console.log('Barbero creado exitosamente:', data);
        } else {
            showNotification(`Error del servidor: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Error en prueba:', error);
        showNotification('Error de conexión con el servidor', 'error');
    }
    
    console.log('=== DIAGNÓSTICO COMPLETADO ===');
}

// Modal management functions
function closeEditUserModal() {
    document.getElementById('editUserModal').classList.add('hidden');
    // Reset modal title
    document.querySelector('#editUserModal h3').textContent = 'Editar Usuario';
}

function showCreateBarberModal() {
    document.getElementById('createBarberModal').classList.remove('hidden');
    // Reset form to clear any previous data
    document.getElementById('createBarberForm').reset();
    // Hide specialty field initially
    document.getElementById('barberSpecialtyField').style.display = 'none';
}

function closeCreateBarberModal() {
    document.getElementById('createBarberModal').classList.add('hidden');
    document.getElementById('createBarberForm').reset();
}

function closeChangeRoleModal() {
    document.getElementById('changeRoleModal').classList.add('hidden');
    document.getElementById('changeRoleForm').reset();
}

// Form submission handlers
document.addEventListener('DOMContentLoaded', function() {
    // Edit user form submission
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userType = this.dataset.userType || 'user';
            const name = document.getElementById('editUserName').value;
            const email = document.getElementById('editUserEmail').value;
            const phone = document.getElementById('editUserPhone').value;
            
            console.log('Form submitted with data:', { userType, name, email, phone });
            
            // Update data using DataManager
            const userId = parseInt(document.getElementById('editUserForm').dataset.userId);
            
            if (userType === 'barber') {
                const updatedBarber = DataManager.updateBarber(userId, { name, email, phone });
                if (updatedBarber) {
                    showNotification('Barbero actualizado exitosamente', 'success');
                    renderBarbers(); // Refresh the table
                } else {
                    showNotification('Error: No se encontró el barbero', 'error');
                }
            } else {
                const updatedUser = DataManager.updateUser(userId, { name, email, phone });
                if (updatedUser) {
                    showNotification('Usuario actualizado exitosamente', 'success');
                    renderUsers(); // Refresh the table
                } else {
                    showNotification('Error: No se encontró el usuario', 'error');
                }
            }
            
            closeEditUserModal();
            window.currentEditRow = null;
        });
    }
    
    // Create barber form submission
    const createBarberForm = document.getElementById('createBarberForm');
    if (createBarberForm) {
        createBarberForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('barberName').value;
            const email = document.getElementById('barberEmail').value;
            const phone = document.getElementById('barberPhone').value;
            const role = document.getElementById('userRole').value;
            const specialty = document.getElementById('barberSpecialty').value;
            const password = document.getElementById('barberPassword').value;
            const confirmPassword = document.getElementById('barberConfirmPassword').value;
            
            console.log('Creating user with data:', { name, email, phone, role, specialty });
        console.log('Token being used:', token ? 'Token exists' : 'No token');
            
            // Validate passwords match
            if (password !== confirmPassword) {
                showNotification('Error: Las contraseñas no coinciden', 'error');
                return;
            }
            
            // Validate password length
            if (password.length < 6) {
                showNotification('Error: La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
            
            // Create user using backend API
            createUserInBackend(name, email, phone, role, specialty, password, confirmPassword)
                .then(result => {
                    if (result.success) {
                        // Refresh data based on role
                        if (role === 'barber') {
                            renderBarbers();
                            showNotification('Barbero creado exitosamente', 'success');
                        } else {
                            renderUsers();
                            showNotification(`${role === 'admin' ? 'Administrador' : 'Cliente'} creado exitosamente`, 'success');
                        }
                        
                        // Close modal and reset form
                        closeCreateBarberModal();
                        createBarberForm.reset();
                    } else {
                        showNotification(result.error || 'Error al crear usuario', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error creating user:', error);
                    showNotification('Error de conexión con el servidor', 'error');
                });
        });
    }
});

// Create user in backend
async function createUserInBackend(name, email, phone, role, specialty, password, confirmPassword) {
    try {
        const endpoint = role === 'barber' ? '/barbers' : '/users';
        const token = localStorage.getItem('stylecut_token');
        const response = await fetch(`/api${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                password: password,
                confirmPassword: confirmPassword,
                specialty: specialty,
                shopName: name
            }),
            mode: 'cors'
        });
        
        const data = await response.json();
        
        console.log('Server response status:', response.status);
        console.log('Server response data:', data);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.error || 'Error desconocido' };
        }
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

// Logout
function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}
