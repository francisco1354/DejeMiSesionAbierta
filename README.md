# 🔐 DejeMiSesionAbierta

**Proyecto Escolar - Clase 525**  
Sistema de gestión de sesiones abiertas para demostrar conceptos de persistencia y control de sesiones web.

## Descripción

Este es un primer proyecto escolar que implementa un sistema básico de gestión de sesiones. El objetivo es demostrar cómo mantener sesiones activas, controlar timeouts, y gestionar la persistencia de datos de sesión en el navegador.

## Características

### 🎯 Funcionalidades Principales
- **Gestión de Sesiones**: Crear, mantener y cerrar sesiones de usuario
- **Control de Timeout**: Configuración personalizable de tiempo de expiración
- **Persistencia**: Almacenamiento local para recuperar sesiones tras recargar la página
- **Actividad Automática**: Detección de actividad del usuario para mantener la sesión viva
- **Registro de Actividad**: Log detallado de todas las acciones y eventos de la sesión

### 🛠️ Funcionalidades Técnicas
- Generación automática de IDs únicos de sesión
- Timer de sesión en tiempo real
- Auto-mantenimiento de sesión configurable
- Interfaz responsive para móviles y escritorio
- Validación de sesiones expiradas al cargar la página

## Uso

### Inicio Rápido
1. Abrir `index.html` en un navegador web
2. Hacer clic en "Iniciar Sesión" para comenzar
3. La sesión se mantendrá activa detectando la actividad del usuario
4. Usar "Mantener Viva" para renovar manualmente la sesión
5. Configurar el tiempo de timeout según sea necesario

### Configuración
- **Tiempo de expiración**: Ajustar entre 1-120 minutos
- **Auto-mantenimiento**: Activar para renovar automáticamente cada 5 minutos
- **Detección de actividad**: El sistema detecta clics, teclas y movimiento del mouse

## Estructura del Proyecto

```
DejeMiSesionAbierta/
├── index.html          # Página principal con la interfaz
├── styles.css          # Estilos y diseño responsive  
├── script.js           # Lógica de gestión de sesiones
└── README.md           # Documentación del proyecto
```

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño moderno con gradientes y animaciones
- **JavaScript ES6+**: Programación orientada a objetos con clases
- **LocalStorage API**: Persistencia de datos del navegador
- **Responsive Design**: Compatible con dispositivos móviles

## Conceptos Demostrados

### Programación
- Clases de JavaScript y encapsulación
- Manejo de eventos y timers
- Almacenamiento local del navegador
- Debouncing para optimización de performance

### UX/UI
- Interfaz intuitiva con feedback visual
- Estados de botones según el contexto
- Registro de actividad en tiempo real
- Diseño responsive

### Gestión de Sesiones
- Generación de identificadores únicos
- Control de timeouts y expiración
- Persistencia entre recargas de página
- Detección de actividad del usuario

## Desarrollador

**Francisco** - Proyecto para la Clase 525  
Primer proyecto escolar de gestión de sesiones abiertas

## Licencia

Este proyecto es de uso educativo para la clase 525.
