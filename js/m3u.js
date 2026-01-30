// m3u.js - Manejo de archivos M3U (parseo y exportación)

const M3UManager = {
    /**
     * Parsea el contenido de un archivo M3U
     * @param {string} content - Contenido del archivo M3U
     * @returns {Array} Array de canales parseados
     */
    parse(content) {
        const channels = [];
        const lines = content.split(/\r?\n/).filter(line => line.trim());

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF:')) {
                const extinf = lines[i];
                const url = lines[i + 1];

                if (url && !url.startsWith('#')) {
                    channels.push(this.extractChannelData(extinf, url));
                }
            }
        }

        return channels;
    },

    /**
     * Extrae los datos de un canal desde la línea EXTINF
     * @param {string} extinf - Línea #EXTINF
     * @param {string} url - URL del stream
     * @returns {Object} Datos del canal
     */
    extractChannelData(extinf, url) {
        const name = this.extractAttribute(extinf, 'name') || 'Unnamed Channel';
        const logo = this.extractAttribute(extinf, 'tvg-logo');
        const group = this.extractAttribute(extinf, 'group-title') || 'No Group';
        const tvgId = this.extractAttribute(extinf, 'tvg-id') || utils.generateTvgId(name);
        const tvgName = this.extractAttribute(extinf, 'tvg-name') || name;

        return {
            name: name.trim(),
            url: url.trim(),
            logo: logo?.trim() || '',
            group: group.trim(),
            tvgId: tvgId.trim(),
            tvgName: tvgName.trim()
        };
    },

    /**
     * Extrae un atributo específico de la línea EXTINF
     * @param {string} extinf - Línea #EXTINF
     * @param {string} attribute - Nombre del atributo a extraer
     * @returns {string} Valor del atributo
     */
    extractAttribute(extinf, attribute) {
        // Caso especial: el nombre viene después de la última coma
        if (attribute === 'name') {
            return extinf.split(',').pop();
        }

        // Buscar atributo en formato tvg-xxx="valor"
        const regex = new RegExp(`${attribute}="([^"]*)"`, 'i');
        const match = extinf.match(regex);
        return match ? match[1] : '';
    },

    /**
     * Genera contenido M3U a partir de un array de canales
     * @param {Array} channels - Array de canales
     * @returns {string} Contenido del archivo M3U
     */
    generate(channels) {
        let m3u = '#EXTM3U\n';

        channels.forEach(channel => {
            // Construir línea EXTINF con todos los atributos
            m3u += `#EXTINF:-1 tvg-id="${channel.tvgId}" tvg-name="${channel.tvgName}"`;

            if (channel.logo?.trim()) {
                m3u += ` tvg-logo="${channel.logo}"`;
            }

            m3u += ` group-title="${channel.group}",${channel.name}\n`;
            m3u += `${channel.url}\n`;
        });

        return m3u;
    },

    /**
     * Exporta canales como archivo M3U
     * @param {Array} channels - Canales a exportar
     * @param {string} filename - Nombre del archivo (sin extensión)
     */
    export(channels, filename = 'channels') {
        if (channels.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No hay canales para exportar',
                text: 'Por favor, agrega canales antes de exportar.',
                confirmButtonText: 'Ok'
            });
            return;
        }

        // Mostrar progreso
        Swal.fire({
            title: 'Exportando M3U',
            html: 'Preparando archivo...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        setTimeout(() => {
            const content = this.generate(channels);
            utils.downloadFile(content, `${filename}.m3u`);

            Swal.fire({
                icon: 'success',
                title: 'Exportación completa',
                text: `El archivo "${filename}.m3u" se ha generado correctamente.`,
                confirmButtonText: 'Ok'
            });
        }, 500);
    },

    /**
     * Importa un archivo M3U adicional y lo agrega a los canales existentes
     * @param {Function} callback - Función a ejecutar con los nuevos canales
     */
    import(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.m3u, .m3u8, .txt';

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
                const newChannels = this.parse(content);

                Swal.fire({
                    icon: 'success',
                    title: 'Importación completada',
                    text: `Se importaron ${newChannels.length} canales.`,
                    confirmButtonText: 'Ok'
                });

                // Ejecutar callback con los nuevos canales
                if (callback && typeof callback === 'function') {
                    callback(newChannels);
                }
            };

            reader.onerror = () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al importar',
                    text: 'No se pudo leer el archivo M3U.',
                    confirmButtonText: 'Ok'
                });
            };

            reader.readAsText(file, 'UTF-8');
        });

        input.click();
    },

    /**
     * Procesa un archivo cargado (drag & drop o input file)
     * @param {File} file - Archivo a procesar
     * @param {Function} callback - Función a ejecutar con los canales parseados
     */
    processFile(file, callback) {
        if (!file.name.match(/\.(m3u|m3u8)$/i)) {
            Swal.fire({
                icon: 'error',
                title: 'Archivo inválido',
                text: 'Por favor selecciona un archivo M3U válido (.m3u o .m3u8)',
                confirmButtonText: 'Ok'
            });
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const channels = this.parse(e.target.result);
            const fileName = file.name.replace(/\.[^/.]+$/, "");

            if (callback && typeof callback === 'function') {
                callback({
                    channels,
                    fileName
                });
            }
        };

        reader.onerror = () => {
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar',
                text: 'No se pudo leer el archivo M3U.',
                confirmButtonText: 'Ok'
            });
        };

        reader.readAsText(file, 'UTF-8');
    },

    /**
     * Valida la estructura básica de un archivo M3U
     * @param {string} content - Contenido del archivo
     * @returns {boolean} true si es válido
     */
    validate(content) {
        return content.trim().startsWith('#EXTM3U') ||
            content.includes('#EXTINF:');
    }
};

// Exportar para uso global
window.M3UManager = M3UManager;