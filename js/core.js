// core.js - Núcleo central de la aplicación que conecta todos los módulos

const AppCore = {
    // Estado de la aplicación
    channels: [],
    filteredChannels: [],
    originalChannels: [],
    fileName: '',
    isLoaded: false,

    /**
     * Inicializa la aplicación completa
     */
    init() {
        console.log('🚀 Iniciando M3U Manager Pro...');

        // Inicializar UI
        UIManager.init();

        // Registrar app globalmente
        window.app = this;

        console.log('✅ M3U Manager Pro iniciado correctamente');
    },

    /**
     * Carga un archivo M3U desde input file
     * @param {Event} event - Evento del input file
     */
    loadFile(event) {
        const file = event.target.files[0];
        if (file) {
            UIManager.processFile(file);
        }
    },

    /**
     * Agrega un nuevo canal
     * @param {Event} event - Evento del formulario
     */
    addChannel(event) {
        event.preventDefault();

        const channelData = {
            name: document.getElementById('channelName')?.value || '',
            url: document.getElementById('channelURL')?.value || '',
            logo: document.getElementById('channelLogo')?.value || '',
            group: document.getElementById('channelGroup')?.value || 'No Group'
        };

        const result = ChannelManager.add(channelData, this.channels);

        if (result.success) {
            this.filteredChannels = [...this.channels];
            UIManager.clearAddChannelForm();
            this.updateAll();

            Swal.fire({
                icon: 'success',
                title: '✅ Canal agregado',
                html: `El canal <b>${result.channel.name}</b> se agregó correctamente`,
                confirmButtonText: 'Ok',
                timer: 2000
            });
        } else {
            UIManager.showError('Error', result.message);
        }
    },

    /**
     * Importa un archivo M3U adicional
     */
    importM3U() {
        M3UManager.import((newChannels) => {
            // Agregar nuevos canales a los existentes
            this.channels.push(...newChannels);
            this.filteredChannels = [...this.channels];

            // Guardar copia original si no existe
            if (!this.originalChannels || this.originalChannels.length === 0) {
                this.originalChannels = [...this.channels];
            }

            this.updateAll();
        });
    },

    /**
     * Exporta la lista actual como M3U
     */
    exportM3U() {
        M3UManager.export(this.channels, this.fileName);
    },

    /**
     * Verifica todos los canales
     */
    async verifyChannels() {
        if (!this.isLoaded || this.channels.length === 0) {
            UIManager.showInfo(
                'Archivo no cargado',
                'Por favor, carga un archivo M3U primero'
            );
            return;
        }

        await VerifyManager.verifyAll(
            this.channels,
            // Callback de progreso
            (progress) => {
                // Actualizar tabla en tiempo real
                UIManager.renderTable();
            },
            // Callback de completado
            (result) => {
                this.updateAll();
            }
        );
    },

    /**
     * Ordena los canales alfabéticamente
     */
    sortChannels() {
        const sorted = ChannelManager.sort(this.channels);

        if (sorted) {
            this.filteredChannels.sort((a, b) => a.name.localeCompare(b.name));
            UIManager.renderTable();
        }
    },

    /**
     * Elimina canales duplicados
     */
    removeDuplicates() {
        const removed = ChannelManager.removeDuplicates(this.channels);

        if (removed > 0) {
            this.filteredChannels = [...this.channels];
            this.updateAll();
        }
    },

    /**
     * Elimina canales muertos verificados
     */
    removeDeadChannels() {
        VerifyManager.removeDeadChannels(this.channels, () => {
            this.filteredChannels = [...this.channels];
            this.updateAll();
        });
    },

    /**
     * Restaura la lista original de canales
     */
    restoreOriginalChannels() {
        if (!this.originalChannels || this.originalChannels.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No hay lista original',
                text: 'No se ha cargado una lista original para restaurar.',
                confirmButtonText: 'Ok'
            });
            return;
        }

        Swal.fire({
            title: '⚠️ ¿Restaurar lista original?',
            text: 'Se perderán todos los cambios realizados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ffc107',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '🔄 Sí, restaurar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.channels = [...this.originalChannels];
                this.filteredChannels = [...this.originalChannels];

                // Limpiar verificaciones
                VerifyManager.verificationResults.clear();

                this.updateAll();

                Swal.fire({
                    icon: 'success',
                    title: '✅ Lista restaurada',
                    text: 'Los canales se restauraron al estado original.',
                    confirmButtonText: 'Ok',
                    timer: 2000
                });
            }
        });
    },

    /**
     * Limpia todos los canales
     */
    clearAll() {
        ChannelManager.clearAll(this.channels, () => {
            this.filteredChannels = [];
            this.fileName = '';
            this.isLoaded = false;
            this.originalChannels = [];
            VerifyManager.verificationResults.clear();
            UIManager.currentPage = 1;

            this.updateAll();

            const fileInfo = document.getElementById('fileInfo');
            if (fileInfo) fileInfo.innerHTML = '';
        });
    },

    /**
     * Abre el editor masivo
     */
    openBulkEditor() {
        BulkEditor.open(this.channels);
    },

    /**
     * Actualiza toda la aplicación
     */
    updateAll() {
        UIManager.updateAll();
    },

    /**
     * Obtiene estadísticas de la aplicación
     * @returns {Object} Estadísticas
     */
    getStats() {
        const liveCount = this.channels.filter(ch =>
            VerifyManager.getChannelStatus(ch.url) === 'live'
        ).length;

        const deadCount = this.channels.filter(ch =>
            VerifyManager.getChannelStatus(ch.url) === 'dead'
        ).length;

        const timeoutCount = this.channels.filter(ch =>
            VerifyManager.getChannelStatus(ch.url) === 'timeout'
        ).length;

        return {
            total: this.channels.length,
            groups: new Set(this.channels.map(ch => ch.group)).size,
            withLogo: this.channels.filter(ch => ch.logo?.trim()).length,
            uniqueUrls: new Set(this.channels.map(ch => ch.url)).size,
            verified: {
                live: liveCount,
                dead: deadCount,
                timeout: timeoutCount,
                unverified: this.channels.length - (liveCount + deadCount + timeoutCount)
            }
        };
    },

    /**
     * Exporta estadísticas como JSON
     */
    exportStats() {
        const stats = this.getStats();
        const timestamp = utils.formatDateTime();

        const statsData = {
            generatedAt: timestamp,
            fileName: this.fileName || 'N/A',
            statistics: stats,
            channels: this.channels.map(ch => ({
                name: ch.name,
                group: ch.group,
                hasLogo: !!ch.logo?.trim(),
                status: VerifyManager.getChannelStatus(ch.url) || 'unverified'
            }))
        };

        const json = JSON.stringify(statsData, null, 2);
        utils.downloadFile(json, `stats_${Date.now()}.json`, 'application/json');

        UIManager.showSuccess(
            '📊 Estadísticas exportadas',
            'El archivo JSON se descargó correctamente'
        );
    },

    /**
     * Filtra canales por grupo específico
     * @param {string} groupName - Nombre del grupo
     */
    filterByGroup(groupName) {
        if (!groupName) {
            this.filteredChannels = [...this.channels];
        } else {
            this.filteredChannels = this.channels.filter(ch => ch.group === groupName);
        }

        UIManager.currentPage = 1;
        UIManager.renderTable();
    },

    /**
     * Busca canales por texto
     * @param {string} searchText - Texto de búsqueda
     */
    searchChannels(searchText) {
        this.filteredChannels = ChannelManager.filter(this.channels, searchText, '');
        UIManager.currentPage = 1;
        UIManager.renderTable();
    },

    /**
     * Obtiene canales por estado
     * @param {string} status - Estado: 'live', 'dead', 'timeout', 'unverified'
     * @returns {Array} Canales filtrados
     */
    getChannelsByStatus(status) {
        if (status === 'unverified') {
            return this.channels.filter(ch =>
                !VerifyManager.getChannelStatus(ch.url)
            );
        }

        return this.channels.filter(ch =>
            VerifyManager.getChannelStatus(ch.url) === status
        );
    },

    /**
     * Exporta solo canales activos (live)
     */
    exportOnlyLive() {
        const liveChannels = this.getChannelsByStatus('live');

        if (liveChannels.length === 0) {
            UIManager.showInfo(
                'Sin canales activos',
                'No hay canales verificados como activos para exportar'
            );
            return;
        }

        Swal.fire({
            title: '📺 Exportar solo canales activos',
            html: `Se exportarán <strong>${liveChannels.length}</strong> canales activos de ${this.channels.length} totales.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '📥 Exportar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745'
        }).then((result) => {
            if (result.isConfirmed) {
                M3UManager.export(liveChannels, `${this.fileName}_LIVE`);
            }
        });
    },

    /**
     * Genera un reporte completo de la lista
     */
    generateReport() {
        const stats = this.getStats();
        const timestamp = utils.formatDateTime();

        let report = `
═══════════════════════════════════════════════════════════════
📊 REPORTE COMPLETO - M3U MANAGER PRO
═══════════════════════════════════════════════════════════════

Fecha: ${timestamp}
Archivo: ${this.fileName || 'N/A'}

───────────────────────────────────────────────────────────────
📈 ESTADÍSTICAS GENERALES
───────────────────────────────────────────────────────────────

Total de Canales: ${stats.total}
Grupos/Categorías: ${stats.groups}
Canales con Logo: ${stats.withLogo}
URLs Únicas: ${stats.uniqueUrls}

───────────────────────────────────────────────────────────────
🔍 ESTADO DE VERIFICACIÓN
───────────────────────────────────────────────────────────────

✅ Activos: ${stats.verified.live}
❌ Muertos: ${stats.verified.dead}
⏱️  Timeout: ${stats.verified.timeout}
❓ Sin Verificar: ${stats.verified.unverified}

───────────────────────────────────────────────────────────────
📁 DISTRIBUCIÓN POR GRUPOS
───────────────────────────────────────────────────────────────
`;

        const grouped = utils.groupChannelsByCategory(this.channels);
        Object.entries(grouped).forEach(([group, channels]) => {
            report += `\n${group}: ${channels.length} canales`;
        });

        report += `\n\n═══════════════════════════════════════════════════════════════\n`;
        report += `Generado por M3U Manager Pro\n`;
        report += `═══════════════════════════════════════════════════════════════\n`;

        utils.downloadFile(report, `Reporte_Completo_${Date.now()}.txt`);

        UIManager.showSuccess(
            '📋 Reporte generado',
            'El reporte completo se descargó correctamente'
        );
    },

    /**
     * Utilidad: Escape HTML (delegado a utils)
     */
    escapeHtml(text) {
        return utils.escapeHtml(text);
    },

    /**
     * Utilidad: Validar URL (delegado a utils)
     */
    isValidUrl(url) {
        return utils.isValidUrl(url);
    },

    /**
     * Utilidad: Generar TVG ID (delegado a utils)
     */
    generateTvgId(name) {
        return utils.generateTvgId(name);
    }
};

// Exportar para uso global
window.AppCore = AppCore;
window.app = AppCore;

// Funciones globales para HTML (compatibilidad con código existente)
window.addChannel = (e) => AppCore.addChannel(e);
window.importM3U = () => AppCore.importM3U();
window.exportM3U = () => AppCore.exportM3U();
window.verifyChannels = () => AppCore.verifyChannels();
window.sortChannels = () => AppCore.sortChannels();
window.removeDuplicates = () => AppCore.removeDuplicates();
window.removeDeadChannels = () => AppCore.removeDeadChannels();
window.restoreOriginalChannels = () => AppCore.restoreOriginalChannels();
window.clearAll = () => AppCore.clearAll();