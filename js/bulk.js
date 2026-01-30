// bulk.js - Editor masivo de canales con interfaz de tarjetas

const BulkEditor = {
    selectedChannels: new Set(),
    filteredChannels: [],

    /**
     * Abre el modal de edición masiva
     * @param {Array} channels - Array de canales
     */
    open(channels) {
        if (channels.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No hay canales',
                text: 'Primero debes cargar una lista M3U',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        this.selectedChannels.clear();
        this.filteredChannels = [...channels];
        this.renderGrid();

        const modal = document.getElementById('bulkEditModal');
        if (modal) {
            modal.classList.add('active');
        }

        this.updateSelectedCount();
        this.setupSearch();
    },

    /**
     * Cierra el modal de edición masiva
     */
    close() {
        const modal = document.getElementById('bulkEditModal');
        if (modal) {
            modal.classList.remove('active');
        }

        this.selectedChannels.clear();
        this.filteredChannels = [];
    },

    /**
     * Configura el buscador en tiempo real
     */
    setupSearch() {
        const searchInput = document.getElementById('bulkSearchInput');
        if (searchInput) {
            searchInput.value = '';
            searchInput.oninput = (e) => {
                this.filterChannels(e.target.value);
            };
        }
    },

    /**
     * Filtra canales en tiempo real según búsqueda
     * @param {string} searchText - Texto de búsqueda
     */
    filterChannels(searchText) {
        const search = searchText.toLowerCase().trim();

        if (!search) {
            this.filteredChannels = [...window.app.channels];
        } else {
            this.filteredChannels = window.app.channels.filter(channel => {
                return channel.name.toLowerCase().includes(search) ||
                    channel.group.toLowerCase().includes(search) ||
                    channel.url.toLowerCase().includes(search);
            });
        }

        this.renderGrid();
    },

    /**
     * Renderiza el grid de tarjetas de canales
     */
    renderGrid() {
        const grid = document.getElementById('bulkChannelsGrid');
        if (!grid) return;

        if (this.filteredChannels.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d;">
                    <div style="font-size: 64px; margin-bottom: 15px;">🔍</div>
                    <h3 style="color: #495057; margin-bottom: 8px;">No se encontraron canales</h3>
                    <p style="color: #6c757d;">Intenta ajustar tu búsqueda</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredChannels.map((channel) => {
            const realIndex = window.app.channels.indexOf(channel);
            const isSelected = this.selectedChannels.has(realIndex);

            return this.createChannelCard(channel, realIndex, isSelected);
        }).join('');
    },

    /**
     * Crea una tarjeta de canal
     * @param {Object} channel - Datos del canal
     * @param {number} index - Índice del canal
     * @param {boolean} isSelected - Si está seleccionado
     * @returns {string} HTML de la tarjeta
     */
    createChannelCard(channel, index, isSelected) {
        const hasLogo = channel.logo && channel.logo.trim();

        return `
            <div class="bulk-channel-card ${isSelected ? 'selected' : ''}" 
                 onclick="BulkEditor.toggleCard(${index})">
                <div class="bulk-card-header">
                    <input type="checkbox" 
                           class="bulk-checkbox bulk-card-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); BulkEditor.toggle(${index})">
                    <div class="bulk-card-info">
                        <div class="bulk-card-name">${utils.escapeHtml(channel.name)}</div>
                        <span class="bulk-card-group">${utils.escapeHtml(channel.group)}</span>
                    </div>
                </div>
                
                <div class="bulk-card-url" title="${utils.escapeHtml(channel.url)}">
                    ${utils.escapeHtml(channel.url)}
                </div>
                
                <div class="bulk-card-logo">
                    ${hasLogo ?
                `<img src="${channel.logo}" onerror="this.outerHTML='<div class=\\'bulk-card-logo-placeholder\\'>❌</div>'">
                         <span class="bulk-card-logo-text">✅ Con logo</span>` :
                `<div class="bulk-card-logo-placeholder">❌</div>
                         <span class="bulk-card-logo-text">Sin logo</span>`
            }
                </div>
            </div>
        `;
    },

    /**
     * Toggle de selección al hacer clic en la tarjeta
     * @param {number} index - Índice del canal
     */
    toggleCard(index) {
        this.toggle(index);
    },

    /**
     * Toggle individual de canal
     * @param {number} index - Índice del canal
     */
    toggle(index) {
        if (this.selectedChannels.has(index)) {
            this.selectedChannels.delete(index);
        } else {
            this.selectedChannels.add(index);
        }

        this.updateSelectedCount();
        this.renderGrid();
    },

    /**
     * Seleccionar todos los canales visibles
     */
    selectAll() {
        this.filteredChannels.forEach(channel => {
            const realIndex = window.app.channels.indexOf(channel);
            this.selectedChannels.add(realIndex);
        });

        this.updateSelectedCount();
        this.renderGrid();
    },

    /**
     * Deseleccionar todos los canales
     */
    deselectAll() {
        this.selectedChannels.clear();
        this.updateSelectedCount();
        this.renderGrid();
    },

    /**
     * Actualiza el contador de canales seleccionados
     */
    updateSelectedCount() {
        const countElement = document.getElementById('selectedCount');
        if (!countElement) return;

        const count = this.selectedChannels.size;
        countElement.textContent = `${count} canal${count !== 1 ? 'es' : ''} seleccionado${count !== 1 ? 's' : ''}`;
    },

    /**
     * Editar canales seleccionados individualmente
     */
    editSelected() {
        if (this.selectedChannels.size === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Ningún canal seleccionado',
                text: 'Selecciona al menos un canal para editar',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const channelsToEdit = Array.from(this.selectedChannels).map(index => ({
            index: index,
            data: window.app.channels[index]
        }));

        const formsHTML = this.generateEditForms(channelsToEdit);

        Swal.fire({
            title: `✏️ Editar ${this.selectedChannels.size} Canal(es)`,
            html: formsHTML,
            width: '850px',
            showCancelButton: true,
            confirmButtonText: '💾 Guardar Cambios',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            preConfirm: () => {
                return this.validateAndCollectEdits(channelsToEdit);
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                this.applyEdits(result.value);
            }
        });
    },

    /**
     * Genera formularios de edición para múltiples canales
     * @param {Array} channelsToEdit - Canales a editar
     * @returns {string} HTML de los formularios
     */
    generateEditForms(channelsToEdit) {
        let html = '<div class="edit-form-container" style="max-height: 60vh; overflow-y: auto;">';

        channelsToEdit.forEach(({ index, data }) => {
            html += `
                <div class="channel-edit-card" style="background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <div style="font-size: 16px; font-weight: 600; color: #343a40; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #dee2e6;">
                        📺 ${utils.escapeHtml(data.name)}
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 500; color: #495057; margin-bottom: 5px; font-size: 13px;">Nombre del Canal</label>
                        <input type="text" 
                               id="edit_name_${index}" 
                               value="${utils.escapeHtml(data.name)}"
                               placeholder="Nombre del canal"
                               style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px;">
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 500; color: #495057; margin-bottom: 5px; font-size: 13px;">URL del Stream</label>
                        <input type="url" 
                               id="edit_url_${index}" 
                               value="${utils.escapeHtml(data.url)}"
                               placeholder="https://ejemplo.com/stream.m3u8"
                               style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px;">
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 500; color: #495057; margin-bottom: 5px; font-size: 13px;">Grupo/Categoría</label>
                        <input type="text" 
                               id="edit_group_${index}" 
                               value="${utils.escapeHtml(data.group)}"
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

        html += '</div>';
        return html;
    },

    /**
     * Valida y recolecta las ediciones del formulario
     * @param {Array} channelsToEdit - Canales siendo editados
     * @returns {Array|false} Array de actualizaciones o false si hay error
     */
    validateAndCollectEdits(channelsToEdit) {
        const updates = [];

        for (const { index } of channelsToEdit) {
            const name = document.getElementById(`edit_name_${index}`).value.trim();
            const url = document.getElementById(`edit_url_${index}`).value.trim();
            const group = document.getElementById(`edit_group_${index}`).value.trim();
            const logo = document.getElementById(`edit_logo_${index}`).value.trim();

            if (!name) {
                Swal.showValidationMessage('El nombre del canal es obligatorio');
                return false;
            }

            if (!url || !utils.isValidUrl(url)) {
                Swal.showValidationMessage(`La URL "${url}" no es válida`);
                return false;
            }

            if (logo && !utils.isValidUrl(logo)) {
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
        }

        return updates;
    },

    /**
     * Aplica las ediciones a los canales
     * @param {Array} updates - Array de actualizaciones
     */
    applyEdits(updates) {
        updates.forEach(update => {
            window.app.channels[update.index] = {
                ...window.app.channels[update.index],
                name: update.name,
                url: update.url,
                group: update.group,
                logo: update.logo,
                tvgId: utils.generateTvgId(update.name),
                tvgName: update.name
            };
        });

        window.app.filteredChannels = [...window.app.channels];

        if (window.app.updateAll) {
            window.app.updateAll();
        }

        Swal.fire({
            icon: 'success',
            title: '✅ Cambios guardados',
            text: `Se actualizaron ${updates.length} canal(es) correctamente`,
            confirmButtonText: 'Ok'
        });

        this.renderGrid();
    },

    /**
     * Eliminar canales seleccionados
     */
    deleteSelected() {
        if (this.selectedChannels.size === 0) {
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
            html: `Se eliminarán <strong>${this.selectedChannels.size}</strong> canales permanentemente.<br><br>Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '🗑️ Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const count = this.selectedChannels.size;
                const indicesToDelete = Array.from(this.selectedChannels).sort((a, b) => b - a);

                // Eliminar de mayor a menor índice para evitar desplazamientos
                indicesToDelete.forEach(index => {
                    window.app.channels.splice(index, 1);
                });

                window.app.filteredChannels = [...window.app.channels];

                if (window.app.updateAll) {
                    window.app.updateAll();
                }

                Swal.fire({
                    icon: 'success',
                    title: '✅ Canales eliminados',
                    text: `${count} canal(es) eliminados correctamente`,
                    confirmButtonText: 'Ok'
                });

                this.close();
            }
        });
    },

    /**
     * Cambia el grupo de canales seleccionados
     */
    changeGroup() {
        if (this.selectedChannels.size === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Ningún canal seleccionado',
                text: 'Selecciona al menos un canal',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        // Obtener grupos existentes
        const groups = ChannelManager.getGroups(window.app.channels);
        const groupOptions = groups.map(g =>
            `<option value="${utils.escapeHtml(g)}">${utils.escapeHtml(g)}</option>`
        ).join('');

        Swal.fire({
            title: '📁 Cambiar Grupo',
            html: `
                <div style="text-align: left;">
                    <p style="margin-bottom: 15px;">Selecciona un grupo existente o crea uno nuevo:</p>
                    <select id="swal-group-select" class="swal2-input" style="width: 100%; margin-bottom: 10px;">
                        <option value="">-- Seleccionar grupo --</option>
                        ${groupOptions}
                        <option value="__new__">✨ Crear nuevo grupo</option>
                    </select>
                    <input type="text" id="swal-new-group" class="swal2-input" 
                           placeholder="Nombre del nuevo grupo" 
                           style="width: 100%; display: none;">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '💾 Aplicar',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#28a745',
            didOpen: () => {
                const select = document.getElementById('swal-group-select');
                const input = document.getElementById('swal-new-group');

                select.addEventListener('change', () => {
                    if (select.value === '__new__') {
                        input.style.display = 'block';
                        input.focus();
                    } else {
                        input.style.display = 'none';
                    }
                });
            },
            preConfirm: () => {
                const select = document.getElementById('swal-group-select');
                const input = document.getElementById('swal-new-group');

                if (select.value === '__new__') {
                    const newGroup = input.value.trim();
                    if (!newGroup) {
                        Swal.showValidationMessage('Ingresa el nombre del nuevo grupo');
                        return false;
                    }
                    return newGroup;
                } else if (select.value) {
                    return select.value;
                } else {
                    Swal.showValidationMessage('Selecciona un grupo');
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const newGroup = result.value;

                Array.from(this.selectedChannels).forEach(index => {
                    window.app.channels[index].group = newGroup;
                });

                window.app.filteredChannels = [...window.app.channels];

                if (window.app.updateAll) {
                    window.app.updateAll();
                }

                Swal.fire({
                    icon: 'success',
                    title: '✅ Grupo actualizado',
                    text: `${this.selectedChannels.size} canal(es) movidos a "${newGroup}"`,
                    confirmButtonText: 'Ok'
                });

                this.renderGrid();
            }
        });
    }
};

// Exportar para uso global
window.BulkEditor = BulkEditor;

// Funciones globales para HTML
window.openBulkEditor = () => BulkEditor.open(window.app.channels);
window.closeBulkEditor = () => BulkEditor.close();
window.selectAllBulkChannels = () => BulkEditor.selectAll();
window.deselectAllBulkChannels = () => BulkEditor.deselectAll();
window.editSelectedChannels = () => BulkEditor.editSelected();
window.deleteBulkChannels = () => BulkEditor.deleteSelected();
window.toggleChannel = (index) => BulkEditor.toggle(index);
window.toggleChannelCard = (index) => BulkEditor.toggleCard(index);