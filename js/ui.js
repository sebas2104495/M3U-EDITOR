// ui.js - Manejo de interfaz de usuario (UI/UX)

const UIManager = {
    currentPage: 1,
    pageSize: 10,

    /**
     * Inicializa todos los event listeners de la UI
     */
    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    },

    /**
     * Configura event listeners principales
     */
    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const groupFilter = document.getElementById('groupFilter');

        if (searchInput) {
            searchInput.addEventListener('input',
                utils.debounce(() => this.handleSearch(), 300)
            );
        }

        if (groupFilter) {
            groupFilter.addEventListener('change', () => this.handleSearch());
        }
    },

    /**
     * Configura drag and drop
     */
    setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        dropZone.addEventListener('dragover', (e) => this.dragOverHandler(e));
        dropZone.addEventListener('dragleave', (e) => this.dragLeaveHandler(e));
        dropZone.addEventListener('drop', (e) => this.dropHandler(e));
    },

    /**
     * Handler para drag over
     */
    dragOverHandler(ev) {
        ev.preventDefault();
        ev.currentTarget.classList.add('dragover');
    },

    /**
     * Handler para drag leave
     */
    dragLeaveHandler(ev) {
        ev.currentTarget.classList.remove('dragover');
    },

    /**
     * Handler para drop
     */
    dropHandler(ev) {
        ev.preventDefault();
        ev.currentTarget.classList.remove('dragover');

        const files = ev.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    },

    /**
     * Procesa archivo desde input o drag & drop
     * @param {File} file - Archivo a procesar
     */
    processFile(file) {
        M3UManager.processFile(file, (result) => {
            window.app.channels = result.channels;
            window.app.filteredChannels = [...result.channels];
            window.app.fileName = result.fileName;
            window.app.isLoaded = true;

            // Guardar copia original para restaurar
            window.app.originalChannels = [...result.channels];

            this.updateFileInfo(file.name, result.channels.length);
            this.updateAll();
            this.showTab('edit');
        });
    },

    /**
     * Maneja búsqueda y filtros
     */
    handleSearch() {
        const searchText = document.getElementById('searchInput')?.value || '';
        const groupFilter = document.getElementById('groupFilter')?.value || '';

        window.app.filteredChannels = ChannelManager.filter(
            window.app.channels,
            searchText,
            groupFilter
        );

        this.currentPage = 1;
        this.renderTable();

        if (window.app.filteredChannels.length === 0 && (searchText || groupFilter)) {
            toast.info('No hay canales que coincidan con los filtros aplicados');
        }
    },

    /**
     * Actualiza la información del archivo cargado
     * @param {string} fileName - Nombre del archivo
     * @param {number} totalChannels - Total de canales
     */
    updateFileInfo(fileName, totalChannels) {
        const fileInfo = document.getElementById('fileInfo');
        if (fileInfo) {
            fileInfo.innerHTML = `
                <div class="file-info">
                    <strong>📄 Archivo cargado:</strong> ${fileName}<br>
                    <strong>📊 Total de canales:</strong> ${totalChannels}
                </div>
            `;
        }
    },

    /**
     * Renderiza la tabla de canales con paginación
     */
    renderTable() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageChannels = window.app.filteredChannels.slice(start, end);

        if (pageChannels.length === 0 && window.app.filteredChannels.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #6c757d;">
                        <div style="font-size: 48px; margin-bottom: 15px;">📺</div>
                        <h3 style="color: #495057;">No hay canales para mostrar</h3>
                        <p>Carga un archivo M3U para comenzar</p>
                    </td>
                </tr>
            `;
            this.updatePagination();
            return;
        }

        tbody.innerHTML = pageChannels.map((channel, i) =>
            this.createChannelRow(channel, start + i)
        ).join('');

        this.updatePagination();
    },

    /**
     * Crea una fila de canal para la tabla
     * @param {Object} channel - Datos del canal
     * @param {number} index - Índice del canal
     * @returns {string} HTML de la fila
     */
    createChannelRow(channel, index) {
        const status = VerifyManager.getChannelStatus(channel.url);
        const statusHtml = this.getStatusHtml(status);
        const hasLogo = channel.logo && channel.logo.trim() !== '';

        const logoHtml = hasLogo ?
            `<img src="${channel.logo}" class="logo-preview" loading="lazy" 
                  onerror="this.outerHTML='<div class=\\'logo-placeholder\\'>❌ Error</div>'">` :
            '<div class="logo-placeholder">❌ Sin Logo</div>';

        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${statusHtml}
                        <strong>${utils.escapeHtml(channel.name)}</strong>
                    </div>
                </td>
                <td>
                    <div class="channel-url" title="${utils.escapeHtml(channel.url)}">
                        ${utils.truncateUrl(channel.url, 60)}
                    </div>
                </td>
                <td style="text-align: center;">${logoHtml}</td>
                <td>
                    <span class="group-badge">
                        ${utils.escapeHtml(channel.group)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" 
                            onclick="ChannelManager.copyUrl(${index}, app.filteredChannels)" 
                            title="Copiar URL">
                        📋 Copiar
                    </button>
                    <button class="btn btn-secondary btn-sm" 
                            onclick="ChannelManager.edit(${index}, app.filteredChannels); UIManager.updateAll();" 
                            title="Editar">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-sm" 
                            onclick="ChannelManager.delete(${index}, app.filteredChannels, () => UIManager.updateAll())" 
                            title="Eliminar">
                        🗑️ Eliminar
                    </button>
                </td>
            </tr>
        `;
    },

    /**
     * Genera HTML para indicador de estado
     * @param {string} status - Estado del canal
     * @returns {string} HTML del indicador
     */
    getStatusHtml(status) {
        const statusConfig = {
            'live': { class: 'status-live', label: '✓ Live', color: '#28a745' },
            'dead': { class: 'status-dead', label: '✗ Dead', color: '#dc3545' },
            'timeout': { class: 'status-timeout', label: '⏱ Timeout', color: '#ffc107' },
            null: { class: 'status-unknown', label: '? N/A', color: '#6c757d' }
        };

        const config = statusConfig[status] || statusConfig[null];

        return `
            <div class="status-indicator ${config.class}">
                <div class="status-dot" style="background: ${config.color};"></div>
                <span style="font-size: 12px; color: ${config.color};">${config.label}</span>
            </div>
        `;
    },

    /**
     * Actualiza las estadísticas generales
     */
    updateStats() {
        const channels = window.app.channels || [];

        const stats = {
            totalChannels: channels.length,
            totalGroups: new Set(channels.map(ch => ch.group)).size,
            workingChannels: channels.filter(ch =>
                VerifyManager.getChannelStatus(ch.url) === 'live'
            ).length,
            totalUrls: new Set(channels.map(ch => ch.url)).size
        };

        Object.entries(stats).forEach(([key, value]) => {
            const el = document.getElementById(key);
            if (el) el.textContent = value;
        });
    },

    /**
     * Actualiza el dropdown de filtro de grupos
     */
    updateGroupFilter() {
        const groupFilter = document.getElementById('groupFilter');
        if (!groupFilter) return;

        const groups = ChannelManager.getGroups(window.app.channels || []);

        groupFilter.innerHTML = '<option value="">Todos los grupos</option>' +
            groups.map(group =>
                `<option value="${utils.escapeHtml(group)}">${utils.escapeHtml(group)}</option>`
            ).join('');
    },

    /**
     * Actualiza paginación
     */
    updatePagination() {
        const maxPage = Math.ceil(window.app.filteredChannels.length / this.pageSize) || 1;
        const pageInfo = document.getElementById('pageInfo');

        if (pageInfo) {
            pageInfo.textContent = `Página ${this.currentPage} de ${maxPage}`;
        }

        // Deshabilitar/habilitar botones
        const prevBtn = document.querySelector('[onclick*="prevPage"]');
        const nextBtn = document.querySelector('[onclick*="nextPage"]');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= maxPage;
        }
    },

    /**
     * Página anterior
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
        }
    },

    /**
     * Página siguiente
     */
    nextPage() {
        const maxPage = Math.ceil(window.app.filteredChannels.length / this.pageSize);
        if (this.currentPage < maxPage) {
            this.currentPage++;
            this.renderTable();
        }
    },

    /**
     * Cambia de pestaña
     * @param {string} tabName - Nombre de la pestaña
     * @param {HTMLElement} buttonElement - Botón de la pestaña (opcional)
     */
    showTab(tabName, buttonElement = null) {
        // Remover clase active de todos los tabs y contenidos
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

        // Activar tab seleccionado
        const targetButton = buttonElement || document.querySelector(`.nav-tab[onclick*="${tabName}"]`);
        const targetContent = document.getElementById(tabName);

        if (targetButton) targetButton.classList.add('active');
        if (targetContent) targetContent.classList.add('active');
    },

    /**
     * Actualiza toda la interfaz
     */
    updateAll() {
        this.updateStats();
        this.updateGroupFilter();
        this.renderTable();
    },

    /**
     * Filtra canales por estado de verificación
     * @param {string} status - Estado a filtrar
     */
    filterByStatus(status) {
        if (status === 'all') {
            window.app.filteredChannels = [...window.app.channels];
        } else {
            window.app.filteredChannels = window.app.channels.filter(channel =>
                VerifyManager.getChannelStatus(channel.url) === status
            );
        }

        this.currentPage = 1;
        this.renderTable();

        if (window.app.filteredChannels.length === 0) {
            toast.info(`No hay canales con estado "${status}"`);
        }
    },

    /**
     * Muestra el formulario para agregar canal
     */
    showAddChannelForm() {
        const form = document.getElementById('addChannelForm');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('channelName')?.focus();
        }
    },

    /**
     * Limpia el formulario de agregar canal
     */
    clearAddChannelForm() {
        ['channelName', 'channelURL', 'channelLogo', 'channelGroup']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
    },

    /**
     * Muestra loader/spinner
     * @param {string} message - Mensaje a mostrar
     */
    showLoader(message = 'Cargando...') {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
    },

    /**
     * Oculta loader
     */
    hideLoader() {
        Swal.close();
    },

    /**
     * Muestra mensaje de éxito
     * @param {string} title - Título
     * @param {string} text - Texto
     */
    showSuccess(title, text) {
        toast.success(text || title);
    },

    /**
     * Muestra mensaje de error
     * @param {string} title - Título
     * @param {string} text - Texto
     */
    showError(title, text) {
        toast.error(text || title);
    },

    /**
     * Muestra mensaje de advertencia
     * @param {string} title - Título
     * @param {string} text - Texto
     */
    showWarning(title, text) {
        toast.warning(text || title);
    },

    /**
     * Muestra mensaje de información
     * @param {string} title - Título
     * @param {string} text - Texto
     */
    showInfo(title, text) {
        toast.info(text || title);
    },

    /**
     * Muestra confirmación
     * @param {string} title - Título
     * @param {string} text - Texto
     * @param {Function} onConfirm - Callback si confirma
     */
    showConfirm(title, text, onConfirm) {
        Swal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed && onConfirm) {
                onConfirm();
            }
        });
    },

    /**
     * Actualiza el tamaño de página para paginación
     * @param {number} size - Nuevo tamaño
     */
    setPageSize(size) {
        this.pageSize = size;
        this.currentPage = 1;
        this.renderTable();
    },

    /**
     * Resetea la paginación a la primera página
     */
    resetPagination() {
        this.currentPage = 1;
        this.updatePagination();
    },

    /**
     * Scroll suave a un elemento
     * @param {string} elementId - ID del elemento
     */
    scrollTo(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};

// Exportar para uso global
window.UIManager = UIManager;

// Funciones globales para HTML
window.showTab = (tabName, btn) => UIManager.showTab(tabName, btn);
window.dropHandler = (e) => UIManager.dropHandler(e);
window.dragOverHandler = (e) => UIManager.dragOverHandler(e);
window.dragLeaveHandler = (e) => UIManager.dragLeaveHandler(e);
window.loadFile = (e) => {
    const file = e.target.files[0];
    if (file) UIManager.processFile(file);
};
window.filterChannels = () => UIManager.handleSearch();
window.filterByStatus = (status) => UIManager.filterByStatus(status);
window.prevPage = () => UIManager.prevPage();
window.nextPage = () => UIManager.nextPage();