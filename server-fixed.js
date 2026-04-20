const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Disable helmet temporarily to fix CORS issues
// app.use(helmet());

// Aggressive CORS configuration
app.use(cors({
    origin: true, // Allow all origins for testing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count']
}));

// Pre-flight requests
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Increased limit
    message: 'Too many requests from this IP'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static(__dirname));

// Database connection
const dbPath = path.join(__dirname, 'stylecut_pro.db');
let db;

async function initializeDatabase() {
    try {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                throw err;
            }
            console.log('Connected to SQLite database');
        });

        await runQuery('PRAGMA foreign_keys = ON');
        await createTables();
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function createTables() {
    try {
        await runQuery(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('client', 'barber', 'admin')),
                status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
                registrations INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS barbers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                specialty TEXT,
                rating REAL DEFAULT 4.5,
                earnings REAL DEFAULT 0.00,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                duration INTEGER NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER NOT NULL,
                barber_id INTEGER NOT NULL,
                service_id INTEGER NOT NULL,
                appointment_date TEXT NOT NULL,
                appointment_time TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
            )
        `);

        await insertDefaultData();
        
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
}

async function insertDefaultData() {
    try {
        const adminCount = await getQuery('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
        
        if (adminCount.count === 0) {
            const adminUsersData = [
                ['Admin User', 'admin1@stylecut.com', '3001112222', 'admin123', 'admin'],
                ['Admin Two', 'admin2@stylecut.com', '3002223333', 'admin123', 'admin'],
                ['Admin Three', 'admin3@stylecut.com', '3003334444', 'admin123', 'admin']
            ];

            for (const [name, email, phone, password, role] of adminUsersData) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await runQuery(
                    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
                    [name, email, phone, hashedPassword, role]
                );
            }
        }

        const barberCount = await getQuery('SELECT COUNT(*) as count FROM users WHERE role = "barber"');
        
        if (barberCount.count === 0) {
            const barberUsersData = [
                ['Carlos Rodríguez', 'carlos@stylecut.com', '3009876543', 'barber123', 'barber'],
                ['Juan Martínez', 'juan@stylecut.com', '3005559876', 'barber123', 'barber'],
                ['Miguel Ángel', 'miguel@stylecut.com', '3002223333', 'barber123', 'barber']
            ];

            for (const [name, email, phone, password, role] of barberUsersData) {
                const hashedPassword = await bcrypt.hash(password, 10);
                const result = await runQuery(
                    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
                    [name, email, phone, hashedPassword, role]
                );
                
                const specialties = ['Corte de Cabello', 'Afeitado de Barba', 'Todos los Servicios'];
                await runQuery(
                    'INSERT INTO barbers (user_id, specialty, rating, earnings) VALUES (?, ?, ?, ?)',
                    [result.id, specialties[barberUsersData.findIndex(u => u[0] === name)], 4.5, 0]
                );
            }
        }

        const clientCount = await getQuery('SELECT COUNT(*) as count FROM users WHERE role = "client"');
        
        if (clientCount.count === 0) {
            const clientUsersData = [
                ['Juan Pérez', 'juan.perez@email.com', '3001234567', 'client123', 'client'],
                ['María García', 'maria.garcia@email.com', '3005551234', 'client123', 'client']
            ];

            for (const [name, email, phone, password, role] of clientUsersData) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await runQuery(
                    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
                    [name, email, phone, hashedPassword, role]
                );
            }
        }

        const serviceCount = await getQuery('SELECT COUNT(*) as count FROM services');
        
        if (serviceCount.count === 0) {
            const servicesData = [
                ['Corte de Cabello', 15000, 30, 'Corte profesional con estilo moderno'],
                ['Afeitado de Barba', 10000, 20, 'Afeitado tradicional con toalla caliente'],
                ['Servicio Completo', 20000, 45, 'Corte + afeitado + tratamiento']
            ];

            for (const [name, price, duration, description] of servicesData) {
                await runQuery(
                    'INSERT INTO services (name, price, duration, description) VALUES (?, ?, ?, ?)',
                    [name, price, duration, description]
                );
            }
        }
    } catch (error) {
        console.error('Error inserting default data:', error);
        throw error;
    }
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

// Add this middleware to handle pre-flight requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const { password: _, ...userWithoutPassword } = user;
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Register new client
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword } = req.body;

        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Las contraseñas no coinciden' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const existingUser = await getQuery('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await runQuery(
            'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, hashedPassword, 'client']
        );

        const newUser = await getQuery(
            'SELECT id, name, email, phone, role, status FROM users WHERE id = ?',
            [result.id]
        );
        
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registro exitoso',
            token,
            user: newUser
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Register new barber
app.post('/api/auth/register-barber', async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword, specialty, shopName } = req.body;

        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Las contraseñas no coinciden' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const existingUser = await getQuery('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await runQuery(
            'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, hashedPassword, 'barber']
        );

        // Add barber profile
        await runQuery(
            'INSERT INTO barbers (user_id, specialty, rating, earnings) VALUES (?, ?, ?, ?)',
            [result.id, specialty || 'General', 0, 0]
        );

        const newUser = await getQuery(
            'SELECT id, name, email, phone, role, status FROM users WHERE id = ?',
            [result.id]
        );
        
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registro de barbero exitoso',
            token,
            user: newUser
        });

    } catch (error) {
        console.error('Register barber error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await getQuery(
            'SELECT id, name, email, phone, role, status, registrations FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        let barberInfo = null;
        if (user.role === 'barber') {
            barberInfo = await getQuery(
                'SELECT * FROM barbers WHERE user_id = ?',
                [req.user.id]
            );
        }

        res.json({
            user: user,
            barberInfo: barberInfo
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Users CRUD
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const users = await allQuery(
            'SELECT id, name, email, phone, role, status, registrations, created_at FROM users ORDER BY created_at DESC'
        );

        res.json(users);

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, status } = req.body;

        const result = await runQuery(
            'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, status = ? WHERE id = ?',
            [name, email, phone, role, status, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const updatedUser = await getQuery(
            'SELECT id, name, email, phone, role, status, registrations FROM users WHERE id = ?',
            [id]
        );

        res.json({
            message: 'Usuario actualizado exitosamente',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await runQuery(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado exitosamente' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Barbers CRUD
app.get('/api/barbers', authenticateToken, async (req, res) => {
    try {
        const barbers = await allQuery(`
            SELECT u.id, u.name, u.email, u.phone, u.status,
                   b.specialty, b.rating, b.earnings
            FROM users u
            LEFT JOIN barbers b ON u.id = b.user_id
            WHERE u.role = 'barber'
            ORDER BY u.created_at DESC
        `);

        res.json(barbers);

    } catch (error) {
        console.error('Get barbers error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/api/barbers', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, password, specialty } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await runQuery('BEGIN TRANSACTION');

        try {
            const userResult = await runQuery(
                'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, phone, hashedPassword, 'barber']
            );

            await runQuery(
                'INSERT INTO barbers (user_id, specialty, rating, earnings) VALUES (?, ?, ?, ?)',
                [userResult.id, specialty, 4.5, 0]
            );

            await runQuery('COMMIT');

            const newBarber = await allQuery(`
                SELECT u.id, u.name, u.email, u.phone, u.status,
                       b.specialty, b.rating, b.earnings
                FROM users u
                LEFT JOIN barbers b ON u.id = b.user_id
                WHERE u.id = ?
            `, [userResult.id]);

            res.status(201).json({
                message: 'Barbero creado exitosamente',
                barber: newBarber[0]
            });

        } catch (error) {
            await runQuery('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Create barber error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Services CRUD
app.get('/api/services', authenticateToken, async (req, res) => {
    try {
        const services = await allQuery('SELECT * FROM services ORDER BY name');

        res.json(services);

    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Appointments CRUD
app.get('/api/appointments', authenticateToken, async (req, res) => {
    try {
        const appointments = await allQuery(`
            SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
                   c.name as client_name, c.email as client_email,
                   b.name as barber_name, b.email as barber_email,
                   s.name as service_name, s.price, s.duration
            FROM appointments a
            JOIN users c ON a.client_id = c.id
            JOIN users b ON a.barber_id = b.id
            JOIN services s ON a.service_id = s.id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `);

        res.json(appointments);

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
    try {
        const { client_id, barber_id, service_id, appointment_date, appointment_time, notes } = req.body;

        const result = await runQuery(
            'INSERT INTO appointments (client_id, barber_id, service_id, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [client_id, barber_id, service_id, appointment_date, appointment_time, notes]
        );

        const newAppointments = await allQuery(`
            SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
                   c.name as client_name, c.email as client_email,
                   b.name as barber_name, b.email as barber_email,
                   s.name as service_name, s.price, s.duration
            FROM appointments a
            JOIN users c ON a.client_id = c.id
            JOIN users b ON a.barber_id = b.id
            JOIN services s ON a.service_id = s.id
            WHERE a.id = ?
        `, [result.id]);

        res.status(201).json({
            message: 'Cita creada exitosamente',
            appointment: newAppointments[0]
        });

    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'SQLite',
        cors: 'Fixed'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Start server
async function startServer() {
    await initializeDatabase();
    
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
        console.log(`API disponible en http://localhost:${PORT}/api`);
        console.log('Base de datos SQLite conectada exitosamente');
        console.log('CORS completamente abierto para desarrollo');
        console.log('Archivo de base de datos: stylecut_pro.db');
    });
}

startServer().catch(console.error);
