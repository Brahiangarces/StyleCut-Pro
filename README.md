# Beunik Enhanced Booking Page

Una versión mejorada y modernizada de la página de reservas de Beunik con diseño responsive, animaciones y funcionalidad avanzada.

## Características

### 🎨 Diseño Moderno
- Interfaz moderna con gradientes y efectos de glassmorphism
- Diseño totalmente responsive para todos los dispositivos
- Animaciones suaves y transiciones elegantes
- Tipografía profesional con Google Fonts

### ⚡ Funcionalidades
- Sistema de reservas completo con selección de fecha y hora
- Validación de formularios en tiempo real
- Modal de confirmación de reserva
- Notificaciones visuales para el usuario
- Integración con sistema de autenticación existente

### 🛠️ Tecnologías
- **HTML5** semántico y accesible
- **Tailwind CSS** para estilos modernos
- **JavaScript vanilla** para interactividad
- **Font Awesome** para iconos
- **Unsplash** para imágenes de alta calidad

## Estructura del Proyecto

```
enhanced-booking-page/
├── index.html          # Página principal
├── script.js           # Lógica de la aplicación
└── README.md           # Documentación
```

## Servicios Disponibles

1. **Masaje Relajante** - $80.000 (60 min)
2. **Facial Rejuvenecedor** - $120.000 (90 min)
3. **Manicure y Pedicure** - $60.000 (45 min)
4. **Depilación Laser** - $150.000 (30 min)
5. **Tratamiento Capilar** - $90.000 (75 min)
6. **Sauna y Vapor** - $50.000 (40 min)

## Cómo Usar

1. Abre `index.html` en tu navegador
2. Explora los servicios disponibles
3. Haz clic en "Reservar" en el servicio deseado
4. Completa el formulario con tus datos
5. Selecciona fecha y hora disponibles
6. Confirma tu reserva

## Mejoras Implementadas

### Comparación con la versión original:

| Característica | Original | Versión Mejorada |
|---------------|----------|------------------|
| Diseño | Básico, estático | Moderno, interactivo |
| Responsividad | Limitada | Totalmente responsive |
| Animaciones | Ninguna | Transiciones suaves |
| Experiencia de usuario | Simple | Optimizada |
| Validación | Básica | Completa |
| Feedback visual | Mínimo | Notificaciones y modales |

### Nuevas Funcionalidades:
- 🎯 Selección interactiva de servicios
- 📅 Calendario de disponibilidad
- ⏰ Slots de tiempo seleccionables
- 📝 Formulario de reservas completo
- ✅ Confirmación visual de reserva
- 📱 Diseño mobile-first
- 🎨 Efectos visuales modernos

## Personalización

### Para modificar servicios:
Edita el array `services` en `script.js`:

```javascript
const services = [
    {
        id: 1,
        name: "Nombre del Servicio",
        description: "Descripción del servicio",
        price: "$Precio",
        duration: "Duración",
        icon: "fa-icono",
        image: "URL de la imagen"
    }
];
```

### Para personalizar colores:
Modifica las clases de Tailwind CSS en `index.html` o crea un archivo CSS personalizado.

## Deploy

Esta página puede ser desplegada en cualquier hosting estático como:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

## Contacto

- **Ubicación**: Cra. 44 #64 B Sur 15, Sabaneta, Antioquia
- **Teléfono**: +57 300 123 4567
- **Email**: info@beunik.co
- **Web**: https://beunik.co
