// channels.js - Gestión CRUD de canales individuales

const ChannelManager = {
    /**
     * Agrega un nuevo canal a la lista
     * @param {Object} channelData - Datos del canal
     * @param {Array} channels - Array de canales existentes
     * @returns {Object} Resultado de la operación
     */
    add(channelData, channels) {
        const { name, url, logo, group } = channelData;

        // Validaciones
        if (!name || !name.trim()) {
            return {
                success: false,
                message: 'El nombre del canal es obligatorio'
            };
        }

        if (!url || !utils.isValidUrl(url)) {
            return {
                success: false,
                message: 'La URL del canal no es válida'
            };
        }

        if (logo && !utils.isValidUrl(logo)) {
            return {
                success: false,
                message: 'El logo debe ser una URL válida'
            };
        }

        // Crear nuevo canal
        const newChannel = {
            name: name.trim(),
            url: url.trim(),
            logo: logo?.trim() || '',
            group: group?.trim() || 'No Group',
            tvgId: utils.generateTvgId(name),
            tvgName: name.trim()
        };

        channels.push(newChannel);

        return {
            success: true,
            message: `Canal "${name}" agregado correctamente`,
            channel: newChannel
        };
    },

    /**
     * Edita un canal existente
     * @param {number} index - Índice del canal a editar
     * @param {Array} channels - Array de canales
     */
    edit(index, channels) {
        if (index < 0 || index >= channels.length) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Canal no encontrado',
                confirmButtonText: 'Ok'
            });
            return;
        }

        const channel = channels[index];

        Swal.fire({
            title: '✏️ Editar Canal',
            html: `
                <div style="text-align: left;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #495057;">
                            Nombre del Canal
                        </label>
                        <input id="swal-name" class="swal2-input" 
                               placeholder="Nombre del canal" 
                               value="${utils.escapeHtml(channel.name)}"
                               style="width: 100%; margin: 0;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #495057;">
                            URL del Stream
                        </label>
                        <input id="swal-url" class="swal2-input" 
                               placeholder="https://ejemplo.com/stream.m3u8" 
                               value="${utils.escapeHtml(channel.url)}"
                               style="width: 100%; margin: 0;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #495057;">
                            Logo URL (Opcional)
                        </label>
                        <input id="swal-logo" class="swal2-input" 
                               placeholder="https://ejemplo.com/logo.png" 
                               value="${channel.logo || ''}"
                               style="width: 100%; margin: 0;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #495057;">
                            Grupo/Categoría
                        </label>
                        <input id="swal-group" class="swal2-input" 
                               placeholder="ej. Deportes, Noticias" 
                               value="${utils.escapeHtml(channel.group || 'No Group')}"
                               style="width: 100%; margin: 0;">
                    </div>
                </div>
            `,
            width: '600px',
            showCancelButton: true,
            confirmButtonText: '💾 Guardar',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            focusConfirm: false,
            preConfirm: () => {
                const name = document.getElementById('swal-name').value.trim();
                const url = document.getElementById('swal-url').value.trim();
                const logo = document.getElementById('swal-logo').value.trim();
                const group = document.getElementById('swal-group').value.trim() || 'No Group';

                if (!name) {
                    Swal.showValidationMessage('El nombre es obligatorio');
                    return false;
                }

                if (!url || !utils.isValidUrl(url)) {
                    Swal.showValidationMessage('La URL no es válida');
                    return false;
                }

                if (logo && !utils.isValidUrl(logo)) {
                    Swal.showValidationMessage('El logo debe ser una URL válida');
                    return false;
                }

                return { name, url, logo, group };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const updates = result.value;

                // Actualizar canal
                channels[index] = {
                    ...channels[index],
                    name: updates.name,
                    url: updates.url,
                    logo: updates.logo,
                    group: updates.group,
                    tvgName: updates.name,
                    tvgId: utils.generateTvgId(updates.name)
                };

                Swal.fire({
                    icon: 'success',
                    title: '✅ Canal actualizado',
                    text: `"${updates.name}" se actualizó correctamente`,
                    confirmButtonText: 'Ok'
                });

                return true;
            }
            return false;
        });
    },

    /**
     * Elimina un canal
     * @param {number} index - Índice del canal a eliminar
     * @param {Array} channels - Array de canales
     * @param {Function} callback - Función a ejecutar después de eliminar
     */
    delete(index, channels, callback) {
        if (index < 0 || index >= channels.length) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Canal no encontrado',
                confirmButtonText: 'Ok'
            });
            return;
        }

        const channel = channels[index];

        Swal.fire({
            title: `⚠️ ¿Eliminar "${channel.name}"?`,
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '🗑️ Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                channels.splice(index, 1);

                Swal.fire({
                    icon: 'success',
                    title: '✅ Canal eliminado',
                    text: `"${channel.name}" ha sido eliminado`,
                    confirmButtonText: 'Ok',
                    timer: 2000
                });

                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        });
    },

    /**
     * Copia la URL de un canal al portapapeles
     * @param {number} index - Índice del canal
     * @param {Array} channels - Array de canales
     */
    copyUrl(index, channels) {
        if (index < 0 || index >= channels.length) {
            return;
        }

        const channel = channels[index];
        navigator.clipboard.writeText(channel.url)
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: '📋 URL copiada',
                    text: `URL de "${channel.name}" copiada al portapapeles`,
                    confirmButtonText: 'Ok',
                    timer: 2000,
                    showConfirmButton: false
                });
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo copiar la URL',
                    confirmButtonText: 'Ok'
                });
            });
    },

    /**
     * Ordena canales alfabéticamente
     * @param {Array} channels - Array de canales
     * @returns {boolean} true si se ordenó, false si ya estaban ordenados
     */
    sort(channels) {
        // Verificar si ya están ordenados
        const isAlreadySorted = channels.every((ch, i, arr) => {
            return i === 0 || arr[i - 1].name.localeCompare(ch.name) <= 0;
        });

        if (isAlreadySorted) {
            Swal.fire({
                icon: 'info',
                title: 'Ya ordenados',
                text: 'Los canales ya están en orden alfabético',
                confirmButtonText: 'Ok'
            });
            return false;
        }

        // Ordenar
        channels.sort((a, b) => a.name.localeCompare(b.name));

        Swal.fire({
            icon: 'success',
            title: '✅ Canales ordenados',
            text: 'Los canales están ahora en orden alfabético',
            confirmButtonText: 'Ok',
            timer: 2000
        });

        return true;
    },

    /**
     * Elimina canales duplicados
     * @param {Array} channels - Array de canales
     * @returns {number} Cantidad de duplicados eliminados
     */
    removeDuplicates(channels) {
        const seen = new Set();
        const originalLength = channels.length;

        const unique = channels.filter(channel => {
            const key = `${channel.name.toLowerCase()}-${channel.url}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const removed = originalLength - unique.length;

        if (removed === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin duplicados',
                text: 'No se encontraron canales duplicados',
                confirmButtonText: 'Ok'
            });
            return 0;
        }

        // Limpiar array original y agregar únicos
        channels.length = 0;
        channels.push(...unique);

        Swal.fire({
            icon: 'success',
            title: '✅ Duplicados eliminados',
            text: `Se eliminaron ${removed} canal(es) duplicado(s)`,
            confirmButtonText: 'Ok'
        });

        return removed;
    },

    /**
     * Filtra canales por búsqueda y grupo
     * @param {Array} channels - Array de canales
     * @param {string} searchText - Texto de búsqueda
     * @param {string} groupFilter - Grupo seleccionado
     * @returns {Array} Canales filtrados
     */
    filter(channels, searchText = '', groupFilter = '') {
        let search = searchText.toLowerCase().trim();
        search = search.replace(/\s+/g, ' '); // Normalizar espacios

        return channels.filter(channel => {
            const channelName = (channel.name || '').toLowerCase();
            const channelGroup = (channel.group || '').toLowerCase();
            const channelUrl = (channel.url || '').toLowerCase();

            const matchesSearch = !search ||
                channelName.includes(search) ||
                channelGroup.includes(search) ||
                channelUrl.includes(search);

            const matchesGroup = !groupFilter || channel.group === groupFilter;

            return matchesSearch && matchesGroup;
        });
    },

    /**
     * Obtiene todos los grupos únicos de los canales
     * @param {Array} channels - Array de canales
     * @returns {Array} Array de grupos ordenados alfabéticamente
     */
    getGroups(channels) {
        const groups = [...new Set(channels.map(ch => ch.group || 'No Group'))];
        return groups.sort();
    },

    /**
     * Limpia todos los canales con confirmación
     * @param {Array} channels - Array de canales
     * @param {Function} callback - Función a ejecutar después de limpiar
     */
    clearAll(channels, callback) {
        if (channels.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Lista vacía',
                text: 'No hay canales para eliminar',
                confirmButtonText: 'Ok'
            });
            return;
        }

        Swal.fire({
            title: '⚠️ ¿Eliminar todos los canales?',
            html: `Se eliminarán <strong>${channels.length}</strong> canales permanentemente.<br><br>Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '🗑️ Sí, eliminar todo',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const count = channels.length;
                channels.length = 0; // Limpiar array

                Swal.fire({
                    icon: 'success',
                    title: '✅ Canales eliminados',
                    text: `Se eliminaron ${count} canal(es)`,
                    confirmButtonText: 'Ok'
                });

                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        });
    },

    /**
     * Valida los datos de un canal
     * @param {Object} channelData - Datos del canal
     * @returns {Object} Resultado de validación
     */
    validate(channelData) {
        const errors = [];

        if (!channelData.name || !channelData.name.trim()) {
            errors.push('El nombre del canal es obligatorio');
        }

        if (!channelData.url || !utils.isValidUrl(channelData.url)) {
            errors.push('La URL del canal no es válida');
        }

        if (channelData.logo && channelData.logo.trim() && !utils.isValidUrl(channelData.logo)) {
            errors.push('El logo debe ser una URL válida');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
};

// Exportar para uso global
window.ChannelManager = ChannelManager;