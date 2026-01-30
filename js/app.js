// app.js - Punto de entrada principal de la aplicación

/**
 * Inicialización de la aplicación cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM cargado, iniciando aplicación...');

    // Verificar que todos los módulos estén cargados
    const requiredModules = [
        'utils',
        'M3UManager',
        'ChannelManager',
        'VerifyManager',
        'BulkEditor',
        'UIManager',
        'AppCore',
        'toast' // NUEVO: Verificar que toast esté cargado
    ];

    const missingModules = requiredModules.filter(module => !window[module]);

    if (missingModules.length > 0) {
        console.error('❌ Módulos faltantes:', missingModules);
        // CAMBIADO: Usar toast en lugar de alert
        if (window.toast) {
            toast.error('No se pudieron cargar todos los módulos necesarios: ' + missingModules.join(', '));
        } else {
            alert('Error: No se pudieron cargar todos los módulos necesarios.\nMódulos faltantes: ' + missingModules.join(', '));
        }
        return;
    }

    console.log('✅ Todos los módulos cargados correctamente');

    // Inicializar aplicación
    try {
        AppCore.init();

        // NUEVO: Notificación de inicio exitoso
        toast.success('¡Aplicación iniciada correctamente!', 2000);

        // Mensaje de bienvenida (opcional, comentar si no se desea)
        // showWelcomeMessage();
    } catch (error) {
        console.error('❌ Error al iniciar la aplicación:', error);
        // CAMBIADO: Usar toast en lugar de alert
        toast.error('Error al iniciar la aplicación. Revisa la consola para más detalles.');
    }
});

/**
 * Muestra mensaje de bienvenida (opcional)
 */
function showWelcomeMessage() {
    // Solo mostrar si es la primera vez o si no hay canales cargados
    const hasSeenWelcome = localStorage.getItem('m3u_manager_welcome_seen');

    if (!hasSeenWelcome) {
        setTimeout(() => {
            Swal.fire({
                title: '🎉 Bienvenido a M3U Manager Pro',
                html: `
                    <div style="text-align: left; padding: 10px;">
                        <p><strong>Características principales:</strong></p>
                        <ul style="margin: 10px 0;">
                            <li>✅ Carga y edita archivos M3U</li>
                            <li>🔍 Verifica el estado de los canales</li>
                            <li>✏️ Edición individual y masiva</li>
                            <li>📊 Reportes detallados</li>
                            <li>🎯 Filtros y búsqueda avanzada</li>
                        </ul>
                        <p style="margin-top: 15px;">
                            <strong>Comienza arrastrando un archivo M3U aquí o usa el botón "Cargar M3U"</strong>
                        </p>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: '¡Entendido!',
                confirmButtonColor: '#667eea',
                width: '600px'
            }).then(() => {
                // NUEVO: Toast después de cerrar el welcome
                toast.info('Arrastra un archivo M3U para comenzar', 3000);
            });

            localStorage.setItem('m3u_manager_welcome_seen', 'true');
        }, 500);
    }
}

/**
 * Manejo de errores globales
 */
window.addEventListener('error', (event) => {
    console.error('💥 Error global capturado:', event.error);

    // No mostrar alert para errores menores
    if (event.error && event.error.message &&
        !event.error.message.includes('ResizeObserver')) {
        // Errores que se pueden ignorar
        return;
    }

    // NUEVO: Notificar errores críticos con toast
    if (event.error && event.error.message) {
        toast.error('Se produjo un error. Revisa la consola.');
    }
});

/**
 * Manejo de promesas rechazadas
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Promise rechazada:', event.reason);
    event.preventDefault(); // Prevenir que se muestre en consola por defecto

    // NUEVO: Notificar con toast
    toast.error('Error en operación asíncrona. Revisa la consola.');
});

/**
 * Prevenir pérdida de datos al cerrar/recargar
 */
window.addEventListener('beforeunload', (event) => {
    // Solo advertir si hay canales cargados y modificados
    if (window.app && window.app.channels.length > 0) {
        const message = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
        event.returnValue = message;
        return message;
    }
});

// Exponer versión para debugging
window.M3U_MANAGER_VERSION = '2.0.1'; // NUEVO: Incrementar versión
console.log(`📦 M3U Manager Pro v${window.M3U_MANAGER_VERSION}`);

// NUEVO: Confirmar que toast está disponible
if (window.toast) {
    console.log('✅ Sistema de notificaciones Toast cargado');
}