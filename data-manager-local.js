// Local Storage Data Manager for GitHub Pages compatibility
class LocalDataManager {
    constructor() {
        this.baseURL = 'http://localhost:3001/api'; // Mantener para compatibilidad
        this.token = localStorage.getItem('stylecut_token') || null;
        this.initStorage();
    }

    initStorage() {
        // Inicializar storage si no existe
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('barbers')) {
            localStorage.setItem('barbers', JSON.stringify([]));
        }
        if (!localStorage.getItem('appointments')) {
            localStorage.setItem('appointments', JSON.stringify([]));
        }
        if (!localStorage.getItem('services')) {
            localStorage.setItem('services', JSON.stringify([
                { id: 1, name: 'Corte de Cabello', price: 15000, duration: 30 },
                { id: 2, name: 'Afeitado de Barba', price: 10000, duration: 20 },
                { id: 3, name: 'Servicio Completo', price: 20000, duration: 45 }
            ]));
        }
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('stylecut_token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('stylecut_token');
    }

    // Simular request para compatibilidad
    async request(endpoint, options = {}) {
        // Para GitHub Pages, usar localStorage en lugar de fetch
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (endpoint.includes('/auth/login')) {
                        this.handleLogin(options.body, resolve, reject);
                    } else if (endpoint.includes('/auth/register')) {
                        this.handleRegister(options.body, resolve, reject);
                    } else if (endpoint.includes('/users')) {
                        this.handleUsers(resolve, reject);
                    } else {
                        resolve({ message: 'Operación simulada exitosa' });
                    }
                } catch (error) {
                    reject(error);
                }
            }, 100); // Simular delay de red
        });
    }

    handleLogin(body, resolve, reject) {
        const { email, password } = JSON.parse(body);
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const token = btoa(JSON.stringify({
                id: user.id,
                email: user.email,
                role: user.role,
                exp: Date.now() + (24 * 60 * 60 * 1000)
            }));
            this.setToken(token);
            resolve({
                message: 'Login exitoso',
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } else {
            reject(new Error('Credenciales inválidas'));
        }
    }

    handleRegister(body, resolve, reject) {
        const userData = JSON.parse(body);
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Verificar si el email ya existe
        if (users.find(user => user.email === userData.email)) {
            reject(new Error('El email ya está registrado'));
            return;
        }

        // Validar datos
        if (!userData.name || !userData.email || !userData.password) {
            reject(new Error('Todos los campos son requeridos'));
            return;
        }

        if (userData.password !== userData.confirmPassword) {
            reject(new Error('Las contraseñas no coinciden'));
            return;
        }

        if (userData.password.length < 6) {
            reject(new Error('La contraseña debe tener al menos 6 caracteres'));
            return;
        }

        // Crear nuevo usuario
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            password: userData.password,
            role: userData.role || 'client',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Generar token
        const token = btoa(JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            exp: Date.now() + (24 * 60 * 60 * 1000)
        }));

        this.setToken(token);

        resolve({
            message: 'Registro exitoso',
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    }

    handleUsers(resolve, reject) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const usersWithoutPassword = users.map(({ password, ...user }) => user);
        resolve(usersWithoutPassword);
    }

    // Authentication methods
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getUsers() {
        return this.request('/users');
    }

    // Barber-specific methods
    async getBarbers() {
        const barbers = JSON.parse(localStorage.getItem('barbers') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        return barbers.map(barber => {
            const user = users.find(u => u.id === barber.user_id);
            return { ...barber, user };
        });
    }

    // Services
    async getServices() {
        return JSON.parse(localStorage.getItem('services') || '[]');
    }

    // Appointments
    async getAppointments() {
        return JSON.parse(localStorage.getItem('appointments') || '[]');
    }

    async createAppointment(appointmentData) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const newAppointment = {
            id: Date.now().toString(),
            ...appointmentData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        appointments.push(newAppointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        return newAppointment;
    }
}

// Instancia global
const DataManager = new LocalDataManager();

// Exportar para compatibilidad
window.DataManager = DataManager;
window.ApiManager = LocalDataManager;
