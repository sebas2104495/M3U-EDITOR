
// ============================================
// FUNCIONES DE EDICIÓN MASIVA
// ============================================

let selectedChannels = new Set();
let filteredBulkChannels = [];

/**
 * Abre el modal de edición masiva
 */
function openBulkEditor() {
    if (app.channels.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No hay canales',
            text: 'Primero debes cargar una lista M3U',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    selectedChannels.clear();
    filteredBulkChannels = [...app.channels];
    renderBulkGrid();
    document.getElementById('bulkEditModal').classList.add('active');
    updateSelectedCount();

    // Configurar buscador en tiempo real
    const searchInput = document.getElementById('bulkSearchInput');
    searchInput.value = '';
    searchInput.oninput = function () {
        filterBulkChannels(this.value);
    };
}

/**
 * Cierra el modal de edición masiva
 */
function closeBulkEditor() {
    document.getElementById('bulkEditModal').classList.remove('active');
    selectedChannels.clear();
    filteredBulkChannels = [];
}

/**
 * Filtra canales en tiempo real según búsqueda
 */
function filterBulkChannels(searchText) {
    const search = searchText.toLowerCase().trim();

    if (!search) {
        filteredBulkChannels = [...app.channels];
    } else {
        filteredBulkChannels = app.channels.filter(channel => {
            return channel.name.toLowerCase().includes(search) ||
                channel.group.toLowerCase().includes(search) ||
                channel.url.toLowerCase().includes(search);
        });
    }

    renderBulkGrid();
}

/**
 * Renderiza el grid de tarjetas de canales
 */
function renderBulkGrid() {
    const grid = document.getElementById('bulkChannelsGrid');

    if (filteredBulkChannels.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d;">
                <div style="font-size: 64px; margin-bottom: 15px;">🔍</div>
                <h3 style="color: #495057; margin-bottom: 8px;">No se encontraron canales</h3>
                <p style="color: #6c757d;">Intenta ajustar tu búsqueda</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredBulkChannels.map((channel) => {
        const realIndex = app.channels.indexOf(channel);
        const isSelected = selectedChannels.has(realIndex);

        return `
            <div class="bulk-channel-card ${isSelected ? 'selected' : ''}" 
                 onclick="toggleChannelCard(${realIndex})">
                <div class="bulk-card-header">
                    <input type="checkbox" 
                           class="bulk-checkbox bulk-card-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); toggleChannel(${realIndex})">
                    <div class="bulk-card-info">
                        <div class="bulk-card-name">${app.escapeHtml(channel.name)}</div>
                        <span class="bulk-card-group">${app.escapeHtml(channel.group)}</span>
                    </div>
                </div>
                
                <div class="bulk-card-url" title="${app.escapeHtml(channel.url)}">
                    ${app.escapeHtml(channel.url)}
                </div>
                
                <div class="bulk-card-logo">
                    ${channel.logo && channel.logo.trim() ?
                `<img src="${channel.logo}" onerror="this.outerHTML='<div class=\\'bulk-card-logo-placeholder\\'>❌</div>'">
                         <span class="bulk-card-logo-text">✅ Con logo</span>` :
                `<div class="bulk-card-logo-placeholder">❌</div>
                         <span class="bulk-card-logo-text">Sin logo</span>`
            }
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Toggle de selección al hacer clic en la tarjeta
 */
function toggleChannelCard(index) {
    toggleChannel(index);
}

/**
 * Toggle individual de canal
 */
function toggleChannel(index) {
    if (selectedChannels.has(index)) {
        selectedChannels.delete(index);
    } else {
        selectedChannels.add(index);
    }
    updateSelectedCount();
    renderBulkGrid();
}

/**
 * Seleccionar todos los canales visibles
 */
function selectAllBulkChannels() {
    filteredBulkChannels.forEach(channel => {
        const realIndex = app.channels.indexOf(channel);
        selectedChannels.add(realIndex);
    });
    updateSelectedCount();
    renderBulkGrid();
}

/**
 * Deseleccionar todos los canales
 */
function deselectAllBulkChannels() {
    selectedChannels.clear();
    updateSelectedCount();
    renderBulkGrid();
}

/**
 * Actualiza el contador de canales seleccionados
 */
function updateSelectedCount() {
    const countElement = document.getElementById('selectedCount');
    const count = selectedChannels.size;
    countElement.textContent = `${count} canal${count !== 1 ? 'es' : ''} seleccionado${count !== 1 ? 's' : ''}`;
}

/**
 * Editar canales seleccionados individualmente
 */
function editSelectedChannels() {
    if (selectedChannels.size === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Ningún canal seleccionado',
            text: 'Selecciona al menos un canal para editar',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const channelsToEdit = Array.from(selectedChannels).map(index => ({
        index: index,
        data: app.channels[index]
    }));

    let formsHTML = '<div class="edit-form-container" style="max-height: 60vh; overflow-y: auto;">';

    channelsToEdit.forEach(({ index, data }) => {
        formsHTML += `
            <div class="channel-edit-card" style="background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <div style="font-size: 16px; font-weight: 600; color: #343a40; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #dee2e6;">
                    📺 ${app.escapeHtml(data.name)}
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-weight: 500; color: #495057; margin-bottom: 5px; font-size: 13px;">Nombre del Canal</label>
                    <input type="text" 
                           id="edit_name_${index}" 
                           value="${app.escapeHtml(data.name)}"
                           placeholder="Nombre del canal"
                           style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-weight: 500; color: #495057; margin-bottom: 5px; font-size: 13px;">URL del Stream</label>
                    <input type="url" 
                           id="edit_url_${index}" 
                           value="${app.escapeHtml(data.url)}"
                           placeholder="https://ejemplo.com/stream.m3u8"
                           style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-weight: 500; color: #495057; margin-bottom: 5px; font-size: 13px;">Grupo/Categoría</label>
                    <input type="text" 
                           id="edit_group_${index}" 
                           value="${app.escapeHtml(data.group)}"
                           placeholder="ej. Deportes"
                           style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-weight: 500; color: #495057; margin-bottom: 5px; font-size: 13px;">URL del Logo (Opcional)</label>
                    <input type="url" 
                           id="edit_logo_${index}" 
                           value="${data.logo || ''}"
                           placeholder="https://ejemplo.com/logo.png"
                           style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px;">
                </div>
            </div>
        `;
    });

    formsHTML += '</div>';

    Swal.fire({
        title: `✏️ Editar ${selectedChannels.size} Canal(es)`,
        html: formsHTML,
        width: '850px',
        showCancelButton: true,
        confirmButtonText: '💾 Guardar Cambios',
        cancelButtonText: '❌ Cancelar',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        preConfirm: () => {
            const updates = [];

            channelsToEdit.forEach(({ index }) => {
                const name = document.getElementById(`edit_name_${index}`).value.trim();
                const url = document.getElementById(`edit_url_${index}`).value.trim();
                const group = document.getElementById(`edit_group_${index}`).value.trim();
                const logo = document.getElementById(`edit_logo_${index}`).value.trim();

                if (!name) {
                    Swal.showValidationMessage('El nombre del canal es obligatorio');
                    return false;
                }

                if (!url || !app.isValidUrl(url)) {
                    Swal.showValidationMessage(`La URL "${url}" no es válida`);
                    return false;
                }

                if (logo && !app.isValidUrl(logo)) {
                    Swal.showValidationMessage('El logo debe ser una URL válida');
                    return false;
                }

                updates.push({
                    index,
                    name,
                    url,
                    group: group || 'No Group',
                    logo
                });
            });

            return updates;
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            result.value.forEach(update => {
                app.channels[update.index] = {
                    ...app.channels[update.index],
                    name: update.name,
                    url: update.url,
                    group: update.group,
                    logo: update.logo,
                    tvgId: app.generateTvgId(update.name),
                    tvgName: update.name
                };
            });

            app.filteredChannels = [...app.channels];
            app.updateAll();

            Swal.fire({
                icon: 'success',
                title: '✅ Cambios guardados',
                text: `Se actualizaron ${result.value.length} canal(es) correctamente`,
                confirmButtonText: 'Ok'
            });

            renderBulkGrid();
        }
    });
}

/**
 * Eliminar canales seleccionados
 */
function deleteBulkChannels() {
    if (selectedChannels.size === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Ningún canal seleccionado',
            text: 'Selecciona al menos un canal para eliminar',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    Swal.fire({
        title: '⚠️ ¿Eliminar canales?',
        html: `Se eliminarán <strong>${selectedChannels.size}</strong> canales permanentemente.<br><br>Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const count = selectedChannels.size;
            const indicesToDelete = Array.from(selectedChannels).sort((a, b) => b - a);

            indicesToDelete.forEach(index => {
                app.channels.splice(index, 1);
            });

            app.filteredChannels = [...app.channels];
            app.updateAll();

            Swal.fire({
                icon: 'success',
                title: '✅ Canales eliminados',
                text: `${count} canal(es) eliminados correctamente`,
                confirmButtonText: 'Ok'
            });

            closeBulkEditor();
        }
    });
}


const app = {
    channels: [],
    filteredChannels: [],
    currentPage: 1,
    pageSize: 10,
    fileName: '',
    verificationResults: new Map(),
    isLoaded: false,

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const groupFilter = document.getElementById('groupFilter');
        searchInput?.addEventListener('input', this.debounce(() => this.filterChannels(), 300));
        groupFilter?.addEventListener('change', () => this.filterChannels());
    },

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },

    dragOverHandler(ev) {
        ev.preventDefault();
        ev.currentTarget.classList.add('dragover');
    },

    dragLeaveHandler(ev) {
        ev.currentTarget.classList.remove('dragover');
    },

    dropHandler(ev) {
        ev.preventDefault();
        ev.currentTarget.classList.remove('dragover');
        const files = ev.dataTransfer.files;
        if (files.length > 0) this.processFile(files[0]);
    },

    loadFile(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);

            // Guardar copia de la lista original para poder restaurarla luego
            // Esto debe hacerse después de procesar el archivo y llenar this.channels
            setTimeout(() => {
                this.originalChannels = [...this.channels];
            }, 100); // pequeño delay para asegurar que processFile termine
        }
    },


    processFile(file) {
        if (!file.name.match(/\.(m3u|m3u8)$/i)) {
            alert('Please select a valid M3U file');
            return;
        }

        this.fileName = file.name.replace(/\.[^/.]+$/, "");
        const reader = new FileReader();

        reader.onload = (e) => {
            this.parseM3U(e.target.result);
            this.updateFileInfo(file.name);
            this.isLoaded = true;
            this.showTab('edit');
        };

        reader.readAsText(file, 'UTF-8');
    },

    updateFileInfo(fileName) {
        const fileInfo = document.getElementById('fileInfo');
        if (fileInfo) {
            fileInfo.innerHTML = `
                        <div class="file-info">
                            <strong>File loaded:</strong> ${fileName}<br>
                            <strong>Total channels:</strong> ${this.channels.length}
                        </div>
                    `;
        }
    },

    parseM3U(content) {
        this.channels = [];
        const lines = content.split(/\r?\n/).filter(line => line.trim());

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF:')) {
                const extinf = lines[i];
                const url = lines[i + 1];

                if (url && !url.startsWith('#')) {
                    this.channels.push(this.extractChannelData(extinf, url));
                }
            }
        }

        this.filteredChannels = [...this.channels];
        this.updateAll();
    },

    restoreOriginalChannels() {
        if (!this.originalChannels || this.originalChannels.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No hay lista original',
                text: 'No se ha cargado una lista original de canales para restaurar.',
                confirmButtonText: 'Ok'
            });
            return;
        }

        // Restaurar la lista original
        this.channels = [...this.originalChannels];
        this.filteredChannels = [...this.originalChannels];
        this.renderTable();

        Swal.fire({
            icon: 'success',
            title: 'Lista restaurada',
            text: 'Los canales se han restaurado al estado original.',
            confirmButtonText: 'Ok'
        });
    },


    extractChannelData(extinf, url) {
        const name = this.extractAttribute(extinf, 'name') || 'Unnamed Channel';
        const logo = this.extractAttribute(extinf, 'tvg-logo');
        const group = this.extractAttribute(extinf, 'group-title') || 'No Group';
        const tvgId = this.extractAttribute(extinf, 'tvg-id') || this.generateTvgId(name);

        return {
            name: name.trim(),
            url: url.trim(),
            logo: logo?.trim() || '',
            group: group.trim(),
            tvgId: tvgId.trim(),
            tvgName: name.trim()
        };
    },

    extractAttribute(extinf, attribute) {
        if (attribute === 'name') return extinf.split(',').pop();
        const regex = new RegExp(`${attribute}="([^"]*)"`, 'i');
        const match = extinf.match(regex);
        return match ? match[1] : '';
    },

    generateTvgId(name) {
        return name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20);
    },




    async verifyChannels() {
        if (!this.isLoaded) {
            Swal.fire({
                icon: 'info',
                title: 'Archivo no cargado',
                text: 'Por favor, carga un archivo primero',
                confirmButtonText: 'Ok'
            });
            return;
        }

        const total = this.channels.length;
        let checked = 0;
        let live = 0;
        let dead = 0;
        let timeout = 0;

        // Arrays para almacenar resultados detallados
        const liveChannels = [];
        const deadChannels = [];
        const timeoutChannels = [];

        Swal.fire({
            title: 'Verificando Canales',
            html: `
            <div style="margin-bottom: 15px;">
                <div id="swal-progress-text" style="font-size: 18px; font-weight: bold;">${checked}/${total}</div>
                <progress id="swal-progress-bar" value="0" max="${total}" style="width: 100%; height: 25px; margin-top: 10px;"></progress>
            </div>
            <div style="display: flex; justify-content: space-around; margin-top: 20px; font-size: 14px;">
                <div style="color: #28a745;">✓ Activos: <span id="live-count">0</span></div>
                <div style="color: #dc3545;">✗ Muertos: <span id="dead-count">0</span></div>
                <div style="color: #ffc107;">⏱ Timeout: <span id="timeout-count">0</span></div>
            </div>
        `,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            for (let i = 0; i < this.channels.length; i += 3) {
                const batch = this.channels.slice(i, i + 3);
                const promises = batch.map(async (channel) => {
                    const status = await this.checkChannelStatus(channel.url);

                    this.verificationResults.set(channel.url, {
                        status,
                        lastCheck: new Date()
                    });

                    checked++;

                    // Clasificar canales por estado
                    const channelInfo = {
                        name: channel.name,
                        group: channel.group,
                        url: channel.url
                    };

                    if (status === 'live') {
                        live++;
                        liveChannels.push(channelInfo);
                    } else if (status === 'timeout') {
                        timeout++;
                        timeoutChannels.push(channelInfo);
                    } else {
                        dead++;
                        deadChannels.push(channelInfo);
                    }

                    const popup = Swal.getPopup();
                    if (popup) {
                        const progressBar = popup.querySelector('#swal-progress-bar');
                        const progressText = popup.querySelector('#swal-progress-text');
                        const liveCount = popup.querySelector('#live-count');
                        const deadCount = popup.querySelector('#dead-count');
                        const timeoutCount = popup.querySelector('#timeout-count');

                        if (progressBar) progressBar.value = checked;
                        if (progressText) progressText.textContent = `${checked}/${total}`;
                        if (liveCount) liveCount.textContent = live;
                        if (deadCount) deadCount.textContent = dead;
                        if (timeoutCount) timeoutCount.textContent = timeout;
                    }

                    this.renderTable();
                });

                await Promise.allSettled(promises);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Mostrar reporte detallado
            this.showVerificationReport({
                total,
                live,
                dead,
                timeout,
                liveChannels,
                deadChannels,
                timeoutChannels
            });

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error durante la verificación',
                text: error.message,
                confirmButtonText: 'Ok'
            });
        }
    },

    showVerificationReport(data) {
        const { total, live, dead, timeout, liveChannels, deadChannels, timeoutChannels } = data;

        // Generar HTML del reporte
        let reportHtml = `
        <div style="max-height: 70vh; overflow-y: auto; text-align: left;">
            <!-- Resumen General -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <h3 style="margin: 0 0 20px 0; font-size: 24px; text-align: center;">📊 Resumen de Verificación</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 32px; font-weight: bold;">${total}</div>
                        <div style="font-size: 14px; opacity: 0.9;">Total Verificados</div>
                    </div>
                    <div style="background: rgba(40,167,69,0.3); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold;">${live}</div>
                        <div style="font-size: 14px; opacity: 0.9;">✓ Activos (${((live / total) * 100).toFixed(1)}%)</div>
                    </div>
                    <div style="background: rgba(220,53,69,0.3); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold;">${dead}</div>
                        <div style="font-size: 14px; opacity: 0.9;">✗ Muertos (${((dead / total) * 100).toFixed(1)}%)</div>
                    </div>
                    <div style="background: rgba(255,193,7,0.3); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold;">${timeout}</div>
                        <div style="font-size: 14px; opacity: 0.9;">⏱ Timeout (${((timeout / total) * 100).toFixed(1)}%)</div>
                    </div>
                </div>
            </div>

            <!-- Tabs para diferentes estados -->
            <div style="margin-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
                <button onclick="showReportTab('live')" id="tab-live" class="report-tab" style="padding: 12px 24px; border: none; background: #28a745; color: white; cursor: pointer; font-weight: 600; border-radius: 8px 8px 0 0; margin-right: 5px;">
                    ✓ Activos (${live})
                </button>
                <button onclick="showReportTab('dead')" id="tab-dead" class="report-tab" style="padding: 12px 24px; border: none; background: #6c757d; color: white; cursor: pointer; font-weight: 600; border-radius: 8px 8px 0 0; margin-right: 5px;">
                    ✗ Muertos (${dead})
                </button>
                <button onclick="showReportTab('timeout')" id="tab-timeout" class="report-tab" style="padding: 12px 24px; border: none; background: #6c757d; color: white; cursor: pointer; font-weight: 600; border-radius: 8px 8px 0 0;">
                    ⏱ Timeout (${timeout})
                </button>
            </div>

            <!-- Contenido de Canales Activos -->
            <div id="report-live" class="report-content" style="display: block;">
                <div style="background: #d4edda; border: 2px solid #c3e6cb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Canales Funcionando Correctamente</h4>
                    <p style="margin: 0; color: #155724; font-size: 14px;">Estos canales están en línea y reproduciendo sin problemas.</p>
                </div>
                ${this.generateChannelList(liveChannels, 'live')}
            </div>

            <!-- Contenido de Canales Muertos -->
            <div id="report-dead" class="report-content" style="display: none;">
                <div style="background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Canales No Disponibles</h4>
                    <p style="margin: 0; color: #721c24; font-size: 14px;">Estos canales necesitan ser reemplazados o actualizados.</p>
                </div>
                ${this.generateChannelList(deadChannels, 'dead')}
            </div>

            <!-- Contenido de Canales Timeout -->
            <div id="report-timeout" class="report-content" style="display: none;">
                <div style="background: #fff3cd; border: 2px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Canales con Timeout</h4>
                    <p style="margin: 0; color: #856404; font-size: 14px;">Estos canales tardaron demasiado en responder. Pueden estar lentos o con problemas de conexión.</p>
                </div>
                ${this.generateChannelList(timeoutChannels, 'timeout')}
            </div>
        </div>
    `;

        Swal.fire({
            title: '📋 Reporte de Verificación Completo',
            html: reportHtml,
            width: '900px',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: '📥 Descargar Reporte',
            cancelButtonText: '✕ Cerrar',
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#6c757d',
            customClass: {
                popup: 'verification-report-popup'
            },
            didOpen: () => {
                // Función global para cambiar tabs
                window.showReportTab = function (tabName) {
                    // Ocultar todos los contenidos
                    document.querySelectorAll('.report-content').forEach(el => {
                        el.style.display = 'none';
                    });

                    // Resetear todos los botones
                    document.querySelectorAll('.report-tab').forEach(btn => {
                        btn.style.background = '#6c757d';
                    });

                    // Mostrar el contenido seleccionado
                    document.getElementById(`report-${tabName}`).style.display = 'block';

                    // Activar el botón seleccionado
                    const activeBtn = document.getElementById(`tab-${tabName}`);
                    if (tabName === 'live') activeBtn.style.background = '#28a745';
                    else if (tabName === 'dead') activeBtn.style.background = '#dc3545';
                    else if (tabName === 'timeout') activeBtn.style.background = '#ffc107';
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.downloadVerificationReport(data);
            }
        });
    },

    generateChannelList(channels, type) {
        if (channels.length === 0) {
            return `<div style="text-align: center; padding: 40px; color: #6c757d;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                    <p style="font-size: 16px;">No hay canales en esta categoría</p>
                </div>`;
        }

        // Agrupar por categoría
        const grouped = channels.reduce((acc, channel) => {
            const group = channel.group || 'Sin Categoría';
            if (!acc[group]) acc[group] = [];
            acc[group].push(channel);
            return acc;
        }, {});

        let html = '';

        Object.entries(grouped).forEach(([group, groupChannels]) => {
            html += `
            <div style="margin-bottom: 20px; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden;">
                <div style="background: #f8f9fa; padding: 12px 15px; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">
                    📁 ${this.escapeHtml(group)} (${groupChannels.length} canales)
                </div>
                <div style="padding: 10px;">
        `;

            groupChannels.forEach((channel, index) => {
                const bgColor = type === 'live' ? '#f8fff9' : type === 'dead' ? '#fff5f5' : '#fffbf0';
                const borderColor = type === 'live' ? '#c3e6cb' : type === 'dead' ? '#f5c6cb' : '#ffeaa7';

                html += `
                <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 12px 15px; margin-bottom: 8px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #343a40; margin-bottom: 4px;">
                            ${index + 1}. ${this.escapeHtml(channel.name)}
                        </div>
                        <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #6c757d; background: white; padding: 4px 8px; border-radius: 4px; display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${this.escapeHtml(channel.url)}
                        </div>
                    </div>
                    <button onclick="navigator.clipboard.writeText('${channel.url.replace(/'/g, "\\'")}'); alert('URL copiada al portapapeles');" 
                            style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 10px; white-space: nowrap;">
                        📋 Copiar URL
                    </button>
                </div>
            `;
            });

            html += `
                </div>
            </div>
        `;
        });

        return html;
    },

    downloadVerificationReport(data) {
        const { total, live, dead, timeout, liveChannels, deadChannels, timeoutChannels } = data;
        const timestamp = new Date().toLocaleString('es-ES');

        let report = `═══════════════════════════════════════════════════════════════
📊 REPORTE DE VERIFICACIÓN DE CANALES IPTV
═══════════════════════════════════════════════════════════════

Fecha de Verificación: ${timestamp}
Archivo: ${this.fileName || 'Lista M3U'}

───────────────────────────────────────────────────────────────
📈 RESUMEN GENERAL
───────────────────────────────────────────────────────────────

Total Verificados: ${total}
✅ Canales Activos: ${live} (${((live / total) * 100).toFixed(1)}%)
❌ Canales Muertos: ${dead} (${((dead / total) * 100).toFixed(1)}%)
⏱️  Canales Timeout: ${timeout} (${((timeout / total) * 100).toFixed(1)}%)

═══════════════════════════════════════════════════════════════

`;

        // Canales Activos
        if (liveChannels.length > 0) {
            report += `\n✅ CANALES ACTIVOS (${liveChannels.length})\n`;
            report += `───────────────────────────────────────────────────────────────\n\n`;

            const groupedLive = this.groupChannelsByCategory(liveChannels);
            Object.entries(groupedLive).forEach(([group, channels]) => {
                report += `📁 ${group} (${channels.length} canales)\n\n`;
                channels.forEach((ch, i) => {
                    report += `  ${i + 1}. ${ch.name}\n`;
                    report += `     URL: ${ch.url}\n\n`;
                });
            });
        }

        // Canales Muertos
        if (deadChannels.length > 0) {
            report += `\n❌ CANALES MUERTOS - REQUIEREN REEMPLAZO (${deadChannels.length})\n`;
            report += `───────────────────────────────────────────────────────────────\n\n`;

            const groupedDead = this.groupChannelsByCategory(deadChannels);
            Object.entries(groupedDead).forEach(([group, channels]) => {
                report += `📁 ${group} (${channels.length} canales)\n\n`;
                channels.forEach((ch, i) => {
                    report += `  ${i + 1}. ${ch.name}\n`;
                    report += `     URL: ${ch.url}\n\n`;
                });
            });
        }

        // Canales Timeout
        if (timeoutChannels.length > 0) {
            report += `\n⏱️ CANALES CON TIMEOUT (${timeoutChannels.length})\n`;
            report += `───────────────────────────────────────────────────────────────\n\n`;

            const groupedTimeout = this.groupChannelsByCategory(timeoutChannels);
            Object.entries(groupedTimeout).forEach(([group, channels]) => {
                report += `📁 ${group} (${channels.length} canales)\n\n`;
                channels.forEach((ch, i) => {
                    report += `  ${i + 1}. ${ch.name}\n`;
                    report += `     URL: ${ch.url}\n\n`;
                });
            });
        }

        report += `\n═══════════════════════════════════════════════════════════════\n`;
        report += `Reporte generado por M3U Manager Pro\n`;
        report += `═══════════════════════════════════════════════════════════════\n`;

        // Descargar archivo
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Verificacion_${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Swal.fire({
            icon: 'success',
            title: '📥 Reporte Descargado',
            text: 'El reporte completo se ha guardado en tu dispositivo',
            confirmButtonText: 'Ok'
        });
    },

    groupChannelsByCategory(channels) {
        return channels.reduce((acc, channel) => {
            const group = channel.group || 'Sin Categoría';
            if (!acc[group]) acc[group] = [];
            acc[group].push(channel);
            return acc;
        }, {});
    },

    async checkChannelStatus(url) {
        try {
            url = url.trim();

            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return 'dead';
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            try {
                const canPlay = await this.testWithVideoElement(url, controller.signal);
                clearTimeout(timeoutId);

                if (canPlay) {
                    return 'live';
                }

                if (url.includes('.m3u8') || url.includes('.ts') || url.includes('.m3u')) {
                    const response = await fetch(url, {
                        method: 'GET',
                        signal: controller.signal,
                        headers: {
                            'Range': 'bytes=0-1024'
                        }
                    });

                    clearTimeout(timeoutId);

                    if (response.ok || response.status === 206) {
                        return 'live';
                    }
                }

                return 'dead';

            } catch (fetchError) {
                clearTimeout(timeoutId);

                if (fetchError.name === 'AbortError') {
                    return 'timeout';
                }

                return 'dead';
            }

        } catch (error) {
            return 'dead';
        }
    },

    testWithVideoElement(url, signal) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.muted = true;
            video.volume = 0;
            video.preload = 'metadata';

            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve(false);
                }
            }, 7000);

            const cleanup = () => {
                clearTimeout(timeout);
                video.pause();
                video.src = '';
                video.load();
                video.remove();
            };

            const onSuccess = () => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve(true);
                }
            };

            const onError = () => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve(false);
                }
            };

            video.addEventListener('loadedmetadata', onSuccess);
            video.addEventListener('loadeddata', onSuccess);
            video.addEventListener('canplay', onSuccess);
            video.addEventListener('error', onError);
            video.addEventListener('abort', onError);

            if (signal) {
                signal.addEventListener('abort', () => {
                    if (!resolved) {
                        resolved = true;
                        cleanup();
                        resolve(false);
                    }
                });
            }

            try {
                video.src = url;
                video.load();
            } catch (e) {
                onError();
            }
        });
    },

    getChannelStatus(url) {
        const result = this.verificationResults.get(url);
        if (!result) return null;

        const hoursDiff = (new Date() - result.lastCheck) / (1000 * 60 * 60);
        return hoursDiff > 2 ? null : result.status;
    },

    addChannel(event) {
        event.preventDefault();

        // Obtener valores del formulario
        const name = document.getElementById('channelName')?.value.trim() || '';
        const url = document.getElementById('channelURL')?.value.trim() || '';
        const logo = document.getElementById('channelLogo')?.value.trim() || '';
        const group = document.getElementById('channelGroup')?.value.trim() || 'No Group';

        // Validaciones
        if (!name) {
            this.showError('El nombre del canal es obligatorio');
            return;
        }
        if (!url || !this.isValidUrl(url)) {
            this.showError('La URL del canal no es válida');
            return;
        }
        if (logo && !this.isValidUrl(logo)) {
            this.showError('El logo debe ser una URL válida');
            return;
        }

        // Crear nuevo canal
        const newChannel = {
            name,
            url,
            logo,
            group: group || 'No Group',
            tvgId: this.generateTvgId(name),
            tvgName: name
        };

        // Actualizar listas
        this.channels.push(newChannel);
        this.filteredChannels = [...this.channels];

        // Limpiar y actualizar
        this.clearForm();
        this.updateAll();

        // Mensaje de éxito con SweetAlert
        Swal.fire({
            icon: 'success',
            title: '¡Canal agregado!',
            html: `El canal <b>${name}</b> se agregó correctamente ✅`,
            confirmButtonText: 'Editar canal',
            confirmButtonColor: '#2ecc71'
        }).then(() => {

        });
    },

    // Métodos de feedback con SweetAlert2
    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            html: message,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#e74c3c'
        });
    },

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol.startsWith('http');
        } catch {
            return false;
        }
    },

    clearForm() {
        ['channelName', 'channelURL', 'channelLogo', 'channelGroup']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
    },

    importM3U() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.m3u, .txt';

        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            Swal.fire({
                title: 'Importando M3U...',
                html: `Archivo: ${file.name}`,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;

                const newChannels = [];
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('#EXTINF:')) {
                        const infoLine = lines[i];
                        const urlLine = lines[i + 1] || '';

                        // Nombre después de la última coma
                        const lastCommaIndex = infoLine.lastIndexOf(',');
                        const name = lastCommaIndex !== -1
                            ? infoLine.substring(lastCommaIndex + 1).trim()
                            : 'Sin nombre';

                        const groupMatch = infoLine.match(/group-title="(.*?)"/);
                        const group = groupMatch ? groupMatch[1] : 'No Group';

                        const logoMatch = infoLine.match(/tvg-logo="(.*?)"/);
                        const logo = logoMatch ? logoMatch[1] : '';

                        const tvgIdMatch = infoLine.match(/tvg-id="(.*?)"/);
                        const tvgId = tvgIdMatch ? tvgIdMatch[1] : '';

                        const tvgNameMatch = infoLine.match(/tvg-name="(.*?)"/);
                        const tvgName = tvgNameMatch ? tvgNameMatch[1] : name;

                        newChannels.push({ name, url: urlLine.trim(), logo, group, tvgId, tvgName });
                    }
                }

                // Agregar nuevos canales a la lista existente
                this.channels = [...this.channels, ...newChannels];
                this.filteredChannels = [...this.channels];

                // Actualizar lista de grupos
                this.groups = [...new Set(this.channels.map(ch => ch.group || 'No Group'))];

                // Actualizar el dropdown de grupos
                const groupSelect = document.getElementById('groupFilter');
                if (groupSelect) {
                    groupSelect.innerHTML = '<option value="">Todos los grupos</option>';
                    this.groups.forEach(group => {
                        const option = document.createElement('option');
                        option.value = group;
                        option.textContent = group;
                        groupSelect.appendChild(option);
                    });
                }

                // Guardar copia original si no existía antes
                if (!this.originalChannels || this.originalChannels.length === 0) {
                    this.originalChannels = [...this.channels];
                }

                this.renderTable();

                Swal.fire({
                    icon: 'success',
                    title: 'Importación completada',
                    text: `Se agregaron ${newChannels.length} nuevos canales.`,
                    confirmButtonText: 'Ok'
                });
            };

            reader.readAsText(file);
        });

        input.click();
    },



    editChannel(index) {
        const channel = this.filteredChannels[index];

        Swal.fire({
            title: 'Editar Canal',
            html:
                `<input id="swal-name" class="swal2-input" placeholder="Channel Name" value="${channel.name}">` +
                `<input id="swal-url" class="swal2-input" placeholder="Stream URL" value="${channel.url}">` +
                `<input id="swal-logo" class="swal2-input" placeholder="Logo URL" value="${channel.logo || ''}">` +
                `<input id="swal-group" class="swal2-input" placeholder="Group" value="${channel.group || 'No Group'}">`,
            focusConfirm: false,
            preConfirm: () => {
                const name = document.getElementById('swal-name').value.trim();
                const url = document.getElementById('swal-url').value.trim();
                const logo = document.getElementById('swal-logo').value.trim();
                const group = document.getElementById('swal-group').value.trim() || 'No Group';

                if (!name || !url) {
                    Swal.showValidationMessage('Name and URL are required');
                    return false;
                }
                if (!this.isValidUrl(url)) {
                    Swal.showValidationMessage('Please enter a valid URL');
                    return false;
                }

                return { name, url, logo, group };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const updates = result.value;

                Object.assign(this.filteredChannels[index], {
                    ...updates,
                    tvgName: updates.name
                });

                const originalIndex = this.channels.findIndex(ch => ch.tvgId === channel.tvgId);
                if (originalIndex !== -1) {
                    this.channels[originalIndex] = { ...this.filteredChannels[index] };
                }

                this.updateAll();
            }
        });
    },


    deleteChannel(index) {
        const channel = this.filteredChannels[index];

        Swal.fire({
            title: `¿Eliminar "${channel.name}"?`,
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Eliminar del arreglo original y filtrado
                this.channels = this.channels.filter(ch => ch.tvgId !== channel.tvgId);
                this.filteredChannels.splice(index, 1);
                this.updateAll();

                Swal.fire(
                    '¡Eliminado!',
                    `"${channel.name}" ha sido eliminado.`,
                    'success'
                );
            }
        });
    },


    copyChannelUrl(index) {
        const channel = this.filteredChannels[index];
        navigator.clipboard.writeText(channel.url)
            .then(() => alert(`URL for "${channel.name}" copied to clipboard`))
            .catch(() => alert('Error copying URL'));
    },

    filterChannels() {
        let search = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
        const group = document.getElementById('groupFilter')?.value || '';

        // Reemplazar múltiples espacios internos por uno solo
        search = search.replace(/\s+/g, ' ');

        this.filteredChannels = this.channels.filter(channel => {
            const channelName = (channel.name || '').toLowerCase();
            const channelGroup = (channel.group || '').toLowerCase();

            const matchesSearch = !search || channelName.includes(search) || channelGroup.includes(search);
            const matchesGroup = !group || channel.group === group;

            return matchesSearch && matchesGroup;
        });

        this.currentPage = 1;
        this.renderTable();

        // Mostrar SweetAlert si no se encuentra ningún canal
        if (this.filteredChannels.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No se encontraron canales',
                text: 'No hay canales que coincidan con los filtros aplicados.',
                confirmButtonText: 'Ok'
            });
        }
    },



    filterByStatus(status) {
        this.filteredChannels = this.channels.filter(channel => {
            if (status === 'all') return true;
            return this.getChannelStatus(channel.url) === status;
        });

        this.currentPage = 1;
        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageChannels = this.filteredChannels.slice(start, end);

        tbody.innerHTML = pageChannels.map((channel, i) =>
            this.createChannelRow(channel, start + i)
        ).join('');

        this.updatePagination();
    },

    createChannelRow(channel, index) {
        const status = this.getChannelStatus(channel.url);
        const statusHtml = this.getStatusHtml(status);
        const hasLogo = channel.logo && channel.logo.trim() !== '';

        const logoHtml = hasLogo ?
            `<img src="${channel.logo}" class="logo-preview" loading="lazy" onerror="this.outerHTML='<div class=\\'logo-placeholder\\'>No Logo</div>'">` :
            '<div class="logo-placeholder">No Logo</div>';

        return `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                ${statusHtml}
                                <strong>${this.escapeHtml(channel.name)}</strong>
                            </div>
                        </td>
                        <td>
                            <div class="channel-url" title="${this.escapeHtml(channel.url)}">
                                ${this.truncateUrl(channel.url)}
                            </div>
                        </td>
                        <td style="text-align: center;">${logoHtml}</td>
                        <td>
                            <span class="group-badge">
                                ${this.escapeHtml(channel.group)}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="app.copyChannelUrl(${index})" title="Copiar URL">Copiar</button>
                            <button class="btn btn-secondary btn-sm" onclick="app.editChannel(${index})" title="Edit">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="app.deleteChannel(${index})" title="Delete">Eliminar</button>
                        </td>
                    </tr>
                `;
    },

    getStatusHtml(status) {
        const statusClasses = {
            'live': 'status-live',
            'dead': 'status-dead',
            'timeout': 'status-timeout',
            null: 'status-unknown'
        };

        const statusLabels = {
            'live': 'Live',
            'dead': 'Dead',
            'timeout': 'Timeout',
            null: 'Desconocido'
        };

        const statusClass = statusClasses[status] || statusClasses[null];
        const statusLabel = statusLabels[status] || statusLabels[null];

        return `<div class="status-indicator ${statusClass}">
                    <div class="status-dot"></div>
                    <span style="font-size: 12px;">${statusLabel}</span>
                </div>`;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    truncateUrl(url) {
        return url.length > 50 ? url.substring(0, 47) + '...' : url;
    },

    sortChannels() {
        // Verificar si ya están ordenados
        const isAlreadySorted = this.channels.every((ch, i, arr) => {
            return i === 0 || arr[i - 1].name.localeCompare(ch.name) <= 0;
        });

        if (isAlreadySorted) {
            Swal.fire({
                icon: 'info',
                title: 'Canales ya ordenados',
                text: 'Los canales ya están en orden alfabético',
                confirmButtonText: 'Ok'
            });
            return;
        }

        // Ordenar canales
        this.channels.sort((a, b) => a.name.localeCompare(b.name));
        this.filteredChannels.sort((a, b) => a.name.localeCompare(b.name));
        this.renderTable();

        Swal.fire({
            icon: 'success',
            title: 'Canales ordenados',
            text: 'Los canales ahora están en orden alfabético',
            confirmButtonText: 'Ok'
        });
    },


    removeDuplicates() {
        const seen = new Set();
        const unique = this.channels.filter(channel => {
            const key = `${channel.name.toLowerCase()}-${channel.url}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const removed = this.channels.length - unique.length;
        this.channels = unique;
        this.filteredChannels = [...unique];

        alert(removed > 0 ? `${removed} duplicates removed` : 'No duplicates found');
        if (removed > 0) this.updateAll();
    },

    removeDeadChannels() {
        const deadChannels = this.channels.filter(ch =>
            this.getChannelStatus(ch.url) === 'dead'
        );

        if (deadChannels.length === 0) {
            alert('No dead channels to remove');
            return;
        }

        if (confirm(`Remove ${deadChannels.length} dead channels?`)) {
            this.channels = this.channels.filter(ch =>
                this.getChannelStatus(ch.url) !== 'dead'
            );
            this.filteredChannels = [...this.channels];
            this.updateAll();
            alert(`${deadChannels.length} channels removed`);
        }
    },

    clearAll() {
        if (confirm('Delete all channels?')) {
            this.channels = [];
            this.filteredChannels = [];
            this.fileName = '';
            this.isLoaded = false;
            this.verificationResults.clear();
            this.currentPage = 1;
            this.updateAll();

            const fileInfo = document.getElementById('fileInfo');
            if (fileInfo) fileInfo.innerHTML = '';
        }
    },

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
        }
    },

    nextPage() {
        const maxPage = Math.ceil(this.filteredChannels.length / this.pageSize);
        if (this.currentPage < maxPage) {
            this.currentPage++;
            this.renderTable();
        }
    },

    updatePagination() {
        const maxPage = Math.ceil(this.filteredChannels.length / this.pageSize) || 1;
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) {
            pageInfo.textContent = `Pagina ${this.currentPage} de ${maxPage}`;
        }
    },

    updateStats() {
        const stats = {
            totalChannels: this.channels.length,
            totalGroups: new Set(this.channels.map(ch => ch.group)).size,
            workingChannels: this.channels.filter(ch => ch.logo?.trim()).length,
            totalUrls: new Set(this.channels.map(ch => ch.url)).size
        };

        Object.entries(stats).forEach(([key, value]) => {
            const el = document.getElementById(key);
            if (el) el.textContent = value;
        });
    },

    updateGroupFilter() {
        const groupFilter = document.getElementById('groupFilter');
        if (!groupFilter) return;

        const groups = [...new Set(this.channels.map(ch => ch.group))].sort();
        groupFilter.innerHTML = '<option value="">Todos los grupos</option>' +
            groups.map(group =>
                `<option value="${this.escapeHtml(group)}">${this.escapeHtml(group)}</option>`
            ).join('');
    },

    updateAll() {
        this.updateStats();
        this.updateGroupFilter();
        this.renderTable();
    },

    exportM3U() {
        if (this.channels.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No hay canales para exportar',
                text: 'Por favor, agrega canales antes de exportar.',
                confirmButtonText: 'Ok'
            });
            return;
        }

        // Mostrar modal de progreso
        Swal.fire({
            title: 'Exportando M3U',
            html: 'Preparando archivo...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        setTimeout(() => {
            // Construir contenido M3U
            let m3u = '#EXTM3U\n';
            this.channels.forEach(channel => {
                m3u += `#EXTINF:-1 tvg-id="${channel.tvgId}" tvg-name="${channel.tvgName}"`;
                if (channel.logo?.trim()) {
                    m3u += ` tvg-logo="${channel.logo}"`;
                }
                m3u += ` group-title="${channel.group}",${channel.name}\n${channel.url}\n`;
            });

            // Descargar archivo
            this.downloadFile(m3u, this.fileName || 'channels');

            // Confirmación de éxito
            Swal.fire({
                icon: 'success',
                title: 'Exportación completa',
                text: `El archivo M3U "${this.fileName || 'channels'}.m3u" se ha generado correctamente.`,
                confirmButtonText: 'Ok'
            });
        }, 500); // pequeño delay para que se vea el modal de carga
    },

    downloadFile(content, name) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `${name}.m3u`; // Solo el nombre, sin fecha
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },


    showTab(tabName, buttonElement = null) {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

        const targetButton = buttonElement || document.querySelector(`.nav-tab[onclick*="${tabName}"]`);
        const targetContent = document.getElementById(tabName);

        targetButton?.classList.add('active');
        targetContent?.classList.add('active');
    }
};

// Global functions for HTML
const showTab = (tabName, btn) => app.showTab(tabName, btn);
const dropHandler = (e) => app.dropHandler(e);
const dragOverHandler = (e) => app.dragOverHandler(e);
const dragLeaveHandler = (e) => app.dragLeaveHandler(e);
const loadFile = (e) => app.loadFile(e);
const addChannel = (e) => app.addChannel(e);
const filterChannels = () => app.filterChannels();
const filterByStatus = (status) => app.filterByStatus(status);
const prevPage = () => app.prevPage();
const nextPage = () => app.nextPage();
const exportM3U = () => app.exportM3U();
const clearAll = () => app.clearAll();
const sortChannels = () => app.sortChannels();
const removeDuplicates = () => app.removeDuplicates();
const verifyChannels = () => app.verifyChannels();
const removeDeadChannels = () => app.removeDeadChannels();
const restoreOriginalChannels = () => app.restoreOriginalChannels();
const importM3U = () => app.importM3U();


document.addEventListener('DOMContentLoaded', () => {
    app.init();
});