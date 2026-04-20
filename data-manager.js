// API Manager for Backend Communication
class ApiManager {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
        this.token = localStorage.getItem('stylecut_token') || null;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('stylecut_token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('stylecut_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la solicitud');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        this.setToken(data.token);
        return data;
    }

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        this.setToken(data.token);
        return data;
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // Users CRUD
    async getUsers() {
        return await this.request('/users');
    }

    async updateUser(id, userData) {
        return await this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(id) {
        return await this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    // Barbers CRUD
    async getBarbers() {
        return await this.request('/barbers');
    }

    async createBarber(barberData) {
        return await this.request('/barbers', {
            method: 'POST',
            body: JSON.stringify(barberData)
        });
    }

    // Services CRUD
    async getServices() {
        return await this.request('/services');
    }

    // Appointments CRUD
    async getAppointments() {
        return await this.request('/appointments');
    }

    async createAppointment(appointmentData) {
        return await this.request('/appointments', {
            method: 'POST',
            body: JSON.stringify(appointmentData)
        });
    }

    // Health check
    async healthCheck() {
        return await this.request('/health');
    }
}

// Global API instance
const api = new ApiManager();

// Enhanced DataManager with API integration
class DataManager {
    static KEYS = {
        CURRENT_USER: 'stylecut_current_user',
        OFFLINE_DATA: 'stylecut_offline_data'
    };

    // Initialize with API fallback to LocalStorage
    static async initializeData() {
        try {
            // Check if backend is available
            await api.healthCheck();
            console.log('Backend API available');
            return true;
        } catch (error) {
            console.log('Backend API not available, using LocalStorage fallback');
            return false;
        }
    }

    // Authentication
    static async authenticateUser(email, password) {
        try {
            const response = await api.login(email, password);
            const user = response.user;
            
            // Store current user
            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
            
            return user;
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }

    static async registerUser(userData) {
        try {
            const response = await api.register(userData);
            const user = response.user;
            
            // Store current user
            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
            
            return user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    static getCurrentUser() {
        const userStr = localStorage.getItem(this.KEYS.CURRENT_USER);
        return userStr ? JSON.parse(userStr) : null;
    }

    static setCurrentUser(user) {
        localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
    }

    static clearCurrentUser() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
        api.removeToken();
    }

    // Users
    static async getUsers() {
        try {
            const users = await api.getUsers();
            return users;
        } catch (error) {
            console.error('Get users error:', error);
            // Fallback to LocalStorage
            return JSON.parse(localStorage.getItem('stylecut_users') || '[]');
        }
    }

    static async updateUser(userId, updatedData) {
        try {
            const updatedUser = await api.updateUser(userId, updatedData);
            return updatedUser.user;
        } catch (error) {
            console.error('Update user error:', error);
            return null;
        }
    }

    static async deleteUser(userId) {
        try {
            await api.deleteUser(userId);
            return true;
        } catch (error) {
            console.error('Delete user error:', error);
            return false;
        }
    }

    // Barbers
    static async getBarbers() {
        try {
            const barbers = await api.getBarbers();
            return barbers;
        } catch (error) {
            console.error('Get barbers error:', error);
            return JSON.parse(localStorage.getItem('stylecut_barbers') || '[]');
        }
    }

    static async createBarber(barberData) {
        try {
            const response = await api.createBarber(barberData);
            return response.barber;
        } catch (error) {
            console.error('Create barber error:', error);
            return null;
        }
    }

    // Services
    static async getServices() {
        try {
            const services = await api.getServices();
            return services;
        } catch (error) {
            console.error('Get services error:', error);
            return JSON.parse(localStorage.getItem('stylecut_services') || '[]');
        }
    }

    // Appointments
    static async getAppointments() {
        try {
            const appointments = await api.getAppointments();
            return appointments;
        } catch (error) {
            console.error('Get appointments error:', error);
            return JSON.parse(localStorage.getItem('stylecut_appointments') || '[]');
        }
    }

    static async createAppointment(appointmentData) {
        try {
            const response = await api.createAppointment(appointmentData);
            return response.appointment;
        } catch (error) {
            console.error('Create appointment error:', error);
            return null;
        }
    }

    // Legacy methods for backward compatibility
    static authenticateAdmin(email, password) {
        return this.authenticateUser(email, password);
    }

    static authenticateBarber(email, password) {
        return this.authenticateUser(email, password);
    }

    static authenticateClient(email, password) {
        return this.authenticateUser(email, password);
    }

    static addUser(user) {
        return this.registerUser(user);
    }

    static addBarber(barber) {
        return this.createBarber(barber);
    }

    static addAppointment(appointment) {
        return this.createAppointment(appointment);
    }

    static setUsers(users) {
        localStorage.setItem('stylecut_users', JSON.stringify(users));
    }

    static setBarbers(barbers) {
        localStorage.setItem('stylecut_barbers', JSON.stringify(barbers));
    }

    static setServices(services) {
        localStorage.setItem('stylecut_services', JSON.stringify(services));
    }

    static setAppointments(appointments) {
        localStorage.setItem('stylecut_appointments', JSON.stringify(appointments));
    }

    static updateBarber(barberId, updatedData) {
        return this.updateUser(barberId, updatedData);
    }

    static updateAppointment(appointmentId, updatedData) {
        // This would need to be implemented in the backend
        console.log('Update appointment not yet implemented in backend');
        return null;
    }

    static deleteBarber(barberId) {
        return this.deleteUser(barberId);
    }

    static deleteAppointment(appointmentId) {
        // This would need to be implemented in the backend
        console.log('Delete appointment not yet implemented in backend');
        return false;
    }
}

// Initialize data on script load
DataManager.initializeData();
