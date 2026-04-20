// Sistema de autenticación con localStorage para GitHub Pages
class AuthSystem {
    constructor() {
        this.initStorage();
    }

    initStorage() {
        // Inicializar storage si no existe
        if (!localStorage.getItem('users')) {
            // Agregar usuarios demo
            const demoUsers = [
                { id: '1', name: 'Admin User', email: 'admin1@stylecut.com', phone: '3001112222', password: 'admin123', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
                { id: '2', name: 'Admin Two', email: 'admin2@stylecut.com', phone: '3002223333', password: 'admin123', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
                { id: '3', name: 'Admin Three', email: 'admin3@stylecut.com', phone: '3003334444', password: 'admin123', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
                { id: '4', name: 'Carlos Rodríguez', email: 'carlos@stylecut.com', phone: '3009876543', password: 'barber123', role: 'barber', status: 'active', createdAt: new Date().toISOString() },
                { id: '5', name: 'Juan Martínez', email: 'juan@stylecut.com', phone: '3005559876', password: 'barber123', role: 'barber', status: 'active', createdAt: new Date().toISOString() },
                { id: '6', name: 'Miguel Ángel', email: 'miguel@stylecut.com', phone: '3002223333', password: 'barber123', role: 'barber', status: 'active', createdAt: new Date().toISOString() },
                { id: '7', name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '3001234567', password: 'client123', role: 'client', status: 'active', createdAt: new Date().toISOString() },
                { id: '8', name: 'María García', email: 'maria.garcia@email.com', phone: '3005551234', password: 'client123', role: 'client', status: 'active', createdAt: new Date().toISOString() }
            ];
            localStorage.setItem('users', JSON.stringify(demoUsers));
        }
        if (!localStorage.getItem('barbers')) {
            // Agregar barberos demo
            const demoBarbers = [
                { user_id: '4', specialty: 'Corte de Cabello', rating: 4.5, earnings: 0 },
                { user_id: '5', specialty: 'Afeitado de Barba', rating: 4.5, earnings: 0 },
                { user_id: '6', specialty: 'Todos los Servicios', rating: 4.5, earnings: 0 }
            ];
            localStorage.setItem('barbers', JSON.stringify(demoBarbers));
        }
        if (!localStorage.getItem('appointments')) {
            localStorage.setItem('appointments', JSON.stringify([]));
        }
    }

    // Registro de usuarios
    async register(userData) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Verificar si el email ya existe
            if (users.find(user => user.email === userData.email)) {
                return { success: false, error: 'El email ya está registrado' };
            }

            // Validar datos
            if (!userData.name || !userData.email || !userData.password) {
                return { success: false, error: 'Todos los campos son requeridos' };
            }

            if (userData.password !== userData.confirmPassword) {
                return { success: false, error: 'Las contraseñas no coinciden' };
            }

            if (userData.password.length < 6) {
                return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
            }

            // Crear nuevo usuario
            const newUser = {
                id: Date.now().toString(),
                name: userData.name,
                email: userData.email,
                phone: userData.phone || '',
                password: userData.password, // En producción usar hash
                role: userData.role || 'client',
                status: 'active',
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Si es barbero, agregar a la tabla de barberos
            if (userData.role === 'barber') {
                const barbers = JSON.parse(localStorage.getItem('barbers') || '[]');
                const newBarber = {
                    user_id: newUser.id,
                    specialty: userData.specialty || 'General',
                    rating: 0,
                    earnings: 0,
                    shopName: userData.shopName || userData.name,
                    services: userData.services || [],
                    hours: userData.hours || {},
                    location: userData.location || {}
                };
                barbers.push(newBarber);
                localStorage.setItem('barbers', JSON.stringify(barbers));
            }

            // Generar token simple
            const token = btoa(JSON.stringify({
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
            }));

            // Guardar sesión
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            return { 
                success: true, 
                message: 'Registro exitoso',
                token,
                user: newUser
            };

        } catch (error) {
            return { success: false, error: 'Error en el registro' };
        }
    }

    // Login de usuarios
    async login(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                return { success: false, error: 'Credenciales inválidas' };
            }

            // Generar token
            const token = btoa(JSON.stringify({
                id: user.id,
                email: user.email,
                role: user.role,
                exp: Date.now() + (24 * 60 * 60 * 1000)
            }));

            // Guardar sesión
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            return { 
                success: true, 
                message: 'Login exitoso',
                token,
                user
            };

        } catch (error) {
            return { success: false, error: 'Error en el login' };
        }
    }

    // Verificar si está autenticado
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        try {
            const decoded = JSON.parse(atob(token));
            return decoded.exp > Date.now();
        } catch {
            return false;
        }
    }

    // Obtener usuario actual
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Cerrar sesión
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    // Obtener todos los usuarios
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Obtener barberos
    getBarbers() {
        const barbers = JSON.parse(localStorage.getItem('barbers') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        return barbers.map(barber => {
            const user = users.find(u => u.id === barber.user_id);
            return { ...barber, user };
        });
    }
}

// Instancia global
const authSystem = new AuthSystem();

// Funciones globales para compatibilidad
window.registerUser = (userData) => authSystem.register(userData);
window.loginUser = (email, password) => authSystem.login(email, password);
window.logoutUser = () => authSystem.logout();
window.getCurrentUser = () => authSystem.getCurrentUser();
window.isAuthenticated = () => authSystem.isAuthenticated();
window.getBarbers = () => authSystem.getBarbers();
