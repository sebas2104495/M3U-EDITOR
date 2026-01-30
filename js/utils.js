// utils.js - Funciones auxiliares comunes

const utils = {
    /**
     * Escapa caracteres HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Trunca una URL larga
     */
    truncateUrl(url, maxLength = 50) {
        return url.length > maxLength ? url.substring(0, maxLength - 3) + '...' : url;
    },

    /**
     * Valida si una cadena es una URL válida
     */
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol.startsWith('http');
        } catch {
            return false;
        }
    },

    /**
     * Genera un ID limpio a partir de un nombre
     */
    generateTvgId(name) {
        return name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20);
    },

    /**
     * Debounce para optimizar búsquedas
     */
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },

    /**
     * Descarga un archivo al navegador
     */
    downloadFile(content, filename, mimeType = 'text/plain;charset=utf-8') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Agrupa canales por categoría
     */
    groupChannelsByCategory(channels) {
        return channels.reduce((acc, channel) => {
            const group = channel.group || 'Sin Categoría';
            if (!acc[group]) acc[group] = [];
            acc[group].push(channel);
            return acc;
        }, {});
    },

    /**
     * Formatea fecha para reportes
     */
    formatDateTime() {
        return new Date().toLocaleString('es-ES');
    }
};

// Exportar para uso global
window.utils = utils;