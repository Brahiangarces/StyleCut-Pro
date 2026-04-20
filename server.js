const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stylecut_pro',
    charset: 'utf8mb4',
    timezone: '+00:00'
};

let pool;

async function initializeDatabase() {
    try {
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Create database if not exists
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await connection.end();

        // Create tables
        await createTables();
        
        console.log('Database connected and initialized successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

async function createTables() {
    const connection = await pool.getConnection();
    
    try {
        // Users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('client', 'barber', 'admin') NOT NULL DEFAULT 'client',
                status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
                registrations INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Barbers table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS barbers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                specialty VARCHAR(255),
                rating DECIMAL(3,2) DEFAULT 4.5,
                earnings DECIMAL(10,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Services table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                duration INT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Appointments table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS appointments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT NOT NULL,
                barber_id INT NOT NULL,
                service_id INT NOT NULL,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
            )
        `);

        // Insert default data
        await insertDefaultData(connection);
        
    } finally {
        connection.release();
    }
}

async function insertDefaultData(connection) {
    // Check if admin users exist
    const [adminUsers] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    
    if (adminUsers[0].count === 0) {
        // Insert admin users
        const adminUsersData = [
            ['Admin User', 'admin1@stylecut.com', '3001112222', 'admin123', 'admin'],
            ['Admin Two', 'admin2@stylecut.com', '3002223333', 'admin123', 'admin'],
            ['Admin Three', 'admin3@stylecut.com', '3003334444', 'admin123', 'admin']
        ];

        for (const [name, email, phone, password, role] of adminUsersData) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.execute(
                'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, phone, hashedPassword, role]
            );
        }
    }

    // Check if barber users exist
    const [barberUsers] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "barber"');
    
    if (barberUsers[0].count === 0) {
        // Insert barber users
        const barberUsersData = [
            ['Carlos Rodríguez', 'carlos@stylecut.com', '3009876543', 'barber123', 'barber'],
            ['Juan Martínez', 'juan@stylecut.com', '3005559876', 'barber123', 'barber'],
            ['Miguel Ángel', 'miguel@stylecut.com', '3002223333', 'barber123', 'barber']
        ];

        for (const [name, email, phone, password, role] of barberUsersData) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await connection.execute(
                'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, phone, hashedPassword, role]
            );
            
            // Add to barbers table
            const specialties = ['Corte de Cabello', 'Afeitado de Barba', 'Todos los Servicios'];
            await connection.execute(
                'INSERT INTO barbers (user_id, specialty, rating, earnings) VALUES (?, ?, ?, ?)',
                [result.insertId, specialties[barberUsersData.indexOf([name, email, phone, password, role])], 4.5, 0]
            );
        }
    }

    // Check if client users exist
    const [clientUsers] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "client"');
    
    if (clientUsers[0].count === 0) {
        // Insert client users
        const clientUsersData = [
            ['Juan Pérez', 'juan.perez@email.com', '3001234567', 'client123', 'client'],
            ['María García', 'maria.garcia@email.com', '3005551234', 'client123', 'client']
        ];

        for (const [name, email, phone, password, role] of clientUsersData) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.execute(
                'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, phone, hashedPassword, role]
            );
        }
    }

    // Check if services exist
    const [services] = await connection.execute('SELECT COUNT(*) as count FROM services');
    
    if (services[0].count === 0) {
        const servicesData = [
            ['Corte de Cabello', 15000, 30, 'Corte profesional con estilo moderno'],
            ['Afeitado de Barba', 10000, 20, 'Afeitado tradicional con toalla caliente'],
            ['Servicio Completo', 20000, 45, 'Corte + afeitado + tratamiento']
        ];

        for (const [name, price, duration, description] of servicesData) {
            await connection.execute(
                'INSERT INTO services (name, price, duration, description) VALUES (?, ?, ?, ?)',
                [name, price, duration, description]
            );
        }
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

// Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const connection = await pool.getConnection();
        
        try {
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const user = users[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Remove password from response
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

        } finally {
            connection.release();
        }

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

        const connection = await pool.getConnection();
        
        try {
            // Check if user already exists
            const [existingUsers] = await connection.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            const [result] = await connection.execute(
                'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, phone, hashedPassword, 'client']
            );

            // Get the new user
            const [newUsers] = await connection.execute(
                'SELECT id, name, email, phone, role, status FROM users WHERE id = ?',
                [result.insertId]
            );

            const newUser = newUsers[0];
            
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

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [users] = await connection.execute(
                'SELECT id, name, email, phone, role, status, registrations FROM users WHERE id = ?',
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // If barber, get barber info
            let barberInfo = null;
            if (users[0].role === 'barber') {
                const [barbers] = await connection.execute(
                    'SELECT * FROM barbers WHERE user_id = ?',
                    [req.user.id]
                );
                if (barbers.length > 0) {
                    barberInfo = barbers[0];
                }
            }

            res.json({
                user: users[0],
                barberInfo
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Users CRUD
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [users] = await connection.execute(
                'SELECT id, name, email, phone, role, status, registrations, created_at FROM users ORDER BY created_at DESC'
            );

            res.json(users);

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, status } = req.body;

        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.execute(
                'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, status = ? WHERE id = ?',
                [name, email, phone, role, status, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const [updatedUsers] = await connection.execute(
                'SELECT id, name, email, phone, role, status, registrations FROM users WHERE id = ?',
                [id]
            );

            res.json({
                message: 'Usuario actualizado exitosamente',
                user: updatedUsers[0]
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.execute(
                'DELETE FROM users WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({ message: 'Usuario eliminado exitosamente' });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Barbers CRUD
app.get('/api/barbers', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [barbers] = await connection.execute(`
                SELECT u.id, u.name, u.email, u.phone, u.status,
                       b.specialty, b.rating, b.earnings
                FROM users u
                LEFT JOIN barbers b ON u.id = b.user_id
                WHERE u.role = 'barber'
                ORDER BY u.created_at DESC
            `);

            res.json(barbers);

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Get barbers error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/api/barbers', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, password, specialty } = req.body;

        const connection = await pool.getConnection();
        
        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Start transaction
            await connection.beginTransaction();

            try {
                // Insert user
                const [userResult] = await connection.execute(
                    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
                    [name, email, phone, hashedPassword, 'barber']
                );

                // Insert barber info
                await connection.execute(
                    'INSERT INTO barbers (user_id, specialty, rating, earnings) VALUES (?, ?, ?, ?)',
                    [userResult.insertId, specialty, 4.5, 0]
                );

                await connection.commit();

                // Get the new barber
                const [newBarbers] = await connection.execute(`
                    SELECT u.id, u.name, u.email, u.phone, u.status,
                           b.specialty, b.rating, b.earnings
                    FROM users u
                    LEFT JOIN barbers b ON u.id = b.user_id
                    WHERE u.id = ?
                `, [userResult.insertId]);

                res.status(201).json({
                    message: 'Barbero creado exitosamente',
                    barber: newBarbers[0]
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            }

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Create barber error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Services CRUD
app.get('/api/services', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [services] = await connection.execute(
                'SELECT * FROM services ORDER BY name'
            );

            res.json(services);

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Appointments CRUD
app.get('/api/appointments', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [appointments] = await connection.execute(`
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

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
    try {
        const { client_id, barber_id, service_id, appointment_date, appointment_time, notes } = req.body;

        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.execute(
                'INSERT INTO appointments (client_id, barber_id, service_id, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [client_id, barber_id, service_id, appointment_date, appointment_time, notes]
            );

            // Get the new appointment
            const [newAppointments] = await connection.execute(`
                SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
                       c.name as client_name, c.email as client_email,
                       b.name as barber_name, b.email as barber_email,
                       s.name as service_name, s.price, s.duration
                FROM appointments a
                JOIN users c ON a.client_id = c.id
                JOIN users b ON a.barber_id = b.id
                JOIN services s ON a.service_id = s.id
                WHERE a.id = ?
            `, [result.insertId]);

            res.status(201).json({
                message: 'Cita creada exitosamente',
                appointment: newAppointments[0]
            });

        } finally {
            connection.release();
        }

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
        uptime: process.uptime()
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
        console.log('Base de datos conectada exitosamente');
    });
}

startServer().catch(console.error);
