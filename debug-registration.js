// Script para depurar el registro de barberos
async function debugRegistration() {
    console.log('=== Iniciando depuración de registro ===');
    
    // 1. Verificar token
    const token = localStorage.getItem('stylecut_token');
    console.log('Token disponible:', !!token);
    
    if (!token) {
        console.error('❌ No hay token de autenticación');
        return;
    }
    
    // 2. Intentar registrar con datos completamente nuevos
    const timestamp = Date.now();
    const testBarber = {
        name: `Test Barber ${timestamp}`,
        email: `testbarber${timestamp}@test.com`,
        phone: `300${timestamp.toString().slice(-7)}`,
        password: 'barber123',
        specialty: 'Corte de Cabello'
    };
    
    console.log('📤 Enviando datos:', testBarber);
    
    try {
        const response = await fetch('/api/barbers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testBarber)
        });
        
        const data = await response.json();
        
        console.log('📥 Respuesta del servidor:');
        console.log('- Status:', response.status);
        console.log('- Data:', data);
        
        if (response.ok) {
            console.log('✅ Barbero creado exitosamente');
            alert('✅ Barbero creado exitosamente');
        } else {
            console.error('❌ Error del servidor:', data.error);
            alert(`❌ Error: ${data.error}`);
        }
        
    } catch (error) {
        console.error('❌ Error de red:', error);
        alert(`❌ Error de conexión: ${error.message}`);
    }
}

// Función para verificar usuarios existentes
async function checkExistingUsers() {
    console.log('=== Verificando usuarios existentes ===');
    
    const token = localStorage.getItem('stylecut_token');
    if (!token) {
        console.error('❌ No hay token de autenticación');
        return;
    }
    
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const users = await response.json();
        console.log('👥 Usuarios existentes:', users);
        
        // Buscar emails específicos
        const problemEmails = ['estela@gmai.com', 'brahiangarcesmartinez@gmail.com'];
        problemEmails.forEach(email => {
            const exists = users.some(u => u.email === email);
            console.log(`📧 Email ${email}: ${exists ? '✅ Existe' : '❌ No existe'}`);
        });
        
    } catch (error) {
        console.error('❌ Error al verificar usuarios:', error);
    }
}

// Ejecutar funciones
console.log('🔧 Funciones de depuración cargadas');
console.log('Para usar: debugRegistration() o checkExistingUsers()');
