class SessionManager {
    constructor() {
        this.sessionData = {
            id: null,
            startTime: null,
            lastActivity: null,
            isActive: false,
            timeoutMinutes: 30
        };
        
        this.timers = {
            display: null,
            timeout: null,
            keepAlive: null
        };
        
        this.elements = this.initializeElements();
        this.initializeEventListeners();
        this.loadSessionFromStorage();
        this.updateDisplay();
        this.addLogEntry('Sistema iniciado correctamente');
    }

    initializeElements() {
        return {
            sessionStatus: document.getElementById('session-status'),
            sessionTime: document.getElementById('session-time'),
            sessionId: document.getElementById('session-id'),
            lastActivity: document.getElementById('last-activity'),
            startButton: document.getElementById('start-session'),
            keepAliveButton: document.getElementById('keep-alive'),
            endButton: document.getElementById('end-session'),
            timeoutSetting: document.getElementById('timeout-setting'),
            autoKeepAlive: document.getElementById('auto-keepalive'),
            logContainer: document.getElementById('log-container')
        };
    }

    initializeEventListeners() {
        // Botones principales
        this.elements.startButton.addEventListener('click', () => this.startSession());
        this.elements.keepAliveButton.addEventListener('click', () => this.keepSessionAlive());
        this.elements.endButton.addEventListener('click', () => this.endSession());
        
        // Configuraciones
        this.elements.timeoutSetting.addEventListener('change', () => this.updateTimeout());
        this.elements.autoKeepAlive.addEventListener('change', () => this.toggleAutoKeepAlive());
        
        // Actividad del usuario para resetear timeout
        document.addEventListener('click', () => this.onUserActivity());
        document.addEventListener('keypress', () => this.onUserActivity());
        document.addEventListener('mousemove', this.debounce(() => this.onUserActivity(), 5000));
        
        // Detección de cierre de página
        window.addEventListener('beforeunload', () => this.saveSessionToStorage());
    }

    generateSessionId() {
        return 'SES-' + Date.now().toString(36).toUpperCase() + '-' + 
               Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    startSession() {
        if (this.sessionData.isActive) {
            this.addLogEntry('Ya existe una sesión activa');
            return;
        }

        this.sessionData = {
            id: this.generateSessionId(),
            startTime: new Date(),
            lastActivity: new Date(),
            isActive: true,
            timeoutMinutes: parseInt(this.elements.timeoutSetting.value)
        };

        this.updateButtonStates();
        this.startDisplayTimer();
        this.startTimeoutTimer();
        this.saveSessionToStorage();
        
        this.addLogEntry(`Sesión iniciada con ID: ${this.sessionData.id}`);
        this.addLogEntry(`Timeout configurado a ${this.sessionData.timeoutMinutes} minutos`);
        
        if (this.elements.autoKeepAlive.checked) {
            this.startAutoKeepAlive();
        }
    }

    keepSessionAlive() {
        if (!this.sessionData.isActive) {
            this.addLogEntry('No hay sesión activa para mantener viva');
            return;
        }

        this.sessionData.lastActivity = new Date();
        this.resetTimeoutTimer();
        this.saveSessionToStorage();
        this.addLogEntry('Sesión mantenida viva manualmente');
    }

    endSession() {
        if (!this.sessionData.isActive) {
            this.addLogEntry('No hay sesión activa para cerrar');
            return;
        }

        const sessionDuration = this.getSessionDuration();
        this.addLogEntry(`Sesión cerrada después de ${sessionDuration}`);

        this.sessionData.isActive = false;
        this.clearAllTimers();
        this.updateButtonStates();
        this.updateDisplay(); // Actualizar display después de cambiar el estado
        this.removeSessionFromStorage();
        
        // Resetear valores mostrados
        this.elements.sessionId.textContent = '-';
        this.elements.sessionTime.textContent = '00:00:00';
        this.elements.lastActivity.textContent = '-';
    }

    onUserActivity() {
        if (this.sessionData.isActive) {
            this.sessionData.lastActivity = new Date();
            this.resetTimeoutTimer();
            this.saveSessionToStorage();
        }
    }

    updateTimeout() {
        const newTimeout = parseInt(this.elements.timeoutSetting.value);
        if (this.sessionData.isActive) {
            this.sessionData.timeoutMinutes = newTimeout;
            this.resetTimeoutTimer();
            this.addLogEntry(`Timeout actualizado a ${newTimeout} minutos`);
        }
    }

    toggleAutoKeepAlive() {
        if (this.elements.autoKeepAlive.checked) {
            if (this.sessionData.isActive) {
                this.startAutoKeepAlive();
                this.addLogEntry('Auto-mantener sesión ACTIVADO');
            }
        } else {
            this.stopAutoKeepAlive();
            this.addLogEntry('Auto-mantener sesión DESACTIVADO');
        }
    }

    startDisplayTimer() {
        this.timers.display = setInterval(() => {
            this.updateDisplay();
        }, 1000);
    }

    startTimeoutTimer() {
        this.clearTimer('timeout');
        const timeoutMs = this.sessionData.timeoutMinutes * 60 * 1000;
        
        this.timers.timeout = setTimeout(() => {
            this.addLogEntry('⚠️ Sesión expirada por inactividad');
            this.endSession();
        }, timeoutMs);
    }

    resetTimeoutTimer() {
        if (this.sessionData.isActive) {
            this.startTimeoutTimer();
        }
    }

    startAutoKeepAlive() {
        this.stopAutoKeepAlive();
        // Mantener viva cada 5 minutos si está habilitado
        this.timers.keepAlive = setInterval(() => {
            if (this.sessionData.isActive && this.elements.autoKeepAlive.checked) {
                this.sessionData.lastActivity = new Date();
                this.resetTimeoutTimer();
                this.addLogEntry('Sesión mantenida viva automáticamente');
            }
        }, 5 * 60 * 1000); // 5 minutos
    }

    stopAutoKeepAlive() {
        this.clearTimer('keepAlive');
    }

    clearTimer(timerName) {
        if (this.timers[timerName]) {
            clearInterval(this.timers[timerName]);
            clearTimeout(this.timers[timerName]);
            this.timers[timerName] = null;
        }
    }

    clearAllTimers() {
        Object.keys(this.timers).forEach(timer => this.clearTimer(timer));
    }

    updateDisplay() {
        // Estado de la sesión
        if (this.sessionData.isActive) {
            this.elements.sessionStatus.textContent = 'Activa';
            this.elements.sessionStatus.className = 'status active';
        } else {
            this.elements.sessionStatus.textContent = 'Inactiva';
            this.elements.sessionStatus.className = 'status inactive';
        }

        // ID de sesión
        this.elements.sessionId.textContent = this.sessionData.id || '-';

        // Tiempo activo
        if (this.sessionData.isActive && this.sessionData.startTime) {
            this.elements.sessionTime.textContent = this.getSessionDuration();
        }

        // Última actividad
        if (this.sessionData.lastActivity) {
            this.elements.lastActivity.textContent = this.formatTime(this.sessionData.lastActivity);
        }
    }

    updateButtonStates() {
        const isActive = this.sessionData.isActive;
        
        this.elements.startButton.disabled = isActive;
        this.elements.keepAliveButton.disabled = !isActive;
        this.elements.endButton.disabled = !isActive;
    }

    getSessionDuration() {
        if (!this.sessionData.startTime) return '00:00:00';
        
        const now = new Date();
        const diff = now - this.sessionData.startTime;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    formatTime(date) {
        return date.toLocaleTimeString('es-ES');
    }

    addLogEntry(message) {
        const logEntry = document.createElement('p');
        logEntry.className = 'log-entry';
        logEntry.setAttribute('data-time', this.formatTime(new Date()));
        logEntry.textContent = message;
        
        this.elements.logContainer.appendChild(logEntry);
        
        // Scroll al final
        this.elements.logContainer.scrollTop = this.elements.logContainer.scrollHeight;
        
        // Mantener solo las últimas 50 entradas
        const entries = this.elements.logContainer.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
    }

    saveSessionToStorage() {
        const sessionToSave = {
            ...this.sessionData,
            startTime: this.sessionData.startTime?.getTime(),
            lastActivity: this.sessionData.lastActivity?.getTime()
        };
        localStorage.setItem('dejeMiSesionAbierta', JSON.stringify(sessionToSave));
    }

    loadSessionFromStorage() {
        try {
            const saved = localStorage.getItem('dejeMiSesionAbierta');
            if (saved) {
                const sessionData = JSON.parse(saved);
                
                // Verificar si la sesión guardada no ha expirado
                if (sessionData.isActive && sessionData.lastActivity) {
                    const lastActivity = new Date(sessionData.lastActivity);
                    const now = new Date();
                    const timeDiff = now - lastActivity;
                    const timeoutMs = sessionData.timeoutMinutes * 60 * 1000;
                    
                    if (timeDiff < timeoutMs) {
                        // Restaurar sesión
                        this.sessionData = {
                            ...sessionData,
                            startTime: new Date(sessionData.startTime),
                            lastActivity: new Date(sessionData.lastActivity)
                        };
                        
                        this.updateButtonStates();
                        this.startDisplayTimer();
                        this.startTimeoutTimer();
                        
                        this.addLogEntry('Sesión restaurada desde almacenamiento local');
                        
                        if (this.elements.autoKeepAlive.checked) {
                            this.startAutoKeepAlive();
                        }
                    } else {
                        this.addLogEntry('Sesión guardada había expirado - iniciando nueva sesión');
                        this.removeSessionFromStorage();
                    }
                }
            }
        } catch (error) {
            this.addLogEntry('Error al cargar sesión guardada: ' + error.message);
        }
    }

    removeSessionFromStorage() {
        localStorage.removeItem('dejeMiSesionAbierta');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Inicializar el gestor de sesiones cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.sessionManager = new SessionManager();
});

// Funciones de utilidad global
window.exportSessionData = function() {
    const data = window.sessionManager.sessionData;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};