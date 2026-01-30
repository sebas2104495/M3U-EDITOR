// verify.js - Verificación de estado de canales y generación de reportes

const VerifyManager = {
    verificationResults: new Map(),

    /**
     * Verifica el estado de todos los canales
     * @param {Array} channels - Array de canales a verificar
     * @param {Function} onProgress - Callback de progreso
     * @param {Function} onComplete - Callback al completar
     */
    async verifyAll(channels, onProgress, onComplete) {
        if (channels.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No hay canales',
                text: 'Por favor, carga canales antes de verificar',
                confirmButtonText: 'Ok'
            });
            return;
        }

        const total = channels.length;
        let checked = 0;
        let live = 0;
        let dead = 0;
        let timeout = 0;

        const liveChannels = [];
        const deadChannels = [];
        const timeoutChannels = [];

        // Mostrar progreso
        Swal.fire({
            title: '🔍 Verificando Canales',
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
            // Verificar en lotes de 3 canales
            for (let i = 0; i < channels.length; i += 3) {
                const batch = channels.slice(i, i + 3);
                const promises = batch.map(async (channel) => {
                    const status = await this.checkChannelStatus(channel.url);

                    this.verificationResults.set(channel.url, {
                        status,
                        lastCheck: new Date()
                    });

                    checked++;

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

                    // Actualizar UI de progreso
                    this.updateProgressUI(checked, total, live, dead, timeout);

                    // Callback de progreso
                    if (onProgress && typeof onProgress === 'function') {
                        onProgress({ checked, total, live, dead, timeout });
                    }
                });

                await Promise.allSettled(promises);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Mostrar reporte completo
            this.showReport({
                total,
                live,
                dead,
                timeout,
                liveChannels,
                deadChannels,
                timeoutChannels
            });

            // Callback de completado
            if (onComplete && typeof onComplete === 'function') {
                onComplete({ total, live, dead, timeout });
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error durante la verificación',
                text: error.message,
                confirmButtonText: 'Ok'
            });
        }
    },

    /**
     * Actualiza la UI de progreso en el modal de SweetAlert
     */
    updateProgressUI(checked, total, live, dead, timeout) {
        const popup = Swal.getPopup();
        if (!popup) return;

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
    },

    /**
     * Verifica el estado de un canal individual
     * @param {string} url - URL del canal
     * @returns {string} Estado: 'live', 'dead', o 'timeout'
     */
    async checkChannelStatus(url) {
        try {
            url = url.trim();

            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return 'dead';
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            try {
                // Intentar con elemento de video
                const canPlay = await this.testWithVideoElement(url, controller.signal);
                clearTimeout(timeoutId);

                if (canPlay) {
                    return 'live';
                }

                // Si es un stream HLS, intentar fetch
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

    /**
     * Prueba un canal con elemento de video HTML5
     * @param {string} url - URL del canal
     * @param {AbortSignal} signal - Señal de abort
     * @returns {Promise<boolean>} true si puede reproducir
     */
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

    /**
     * Obtiene el estado de un canal desde el caché
     * @param {string} url - URL del canal
     * @returns {string|null} Estado o null si no está en caché o expiró
     */
    getChannelStatus(url) {
        const result = this.verificationResults.get(url);
        if (!result) return null;

        // Verificar si el resultado tiene más de 2 horas
        const hoursDiff = (new Date() - result.lastCheck) / (1000 * 60 * 60);
        return hoursDiff > 2 ? null : result.status;
    },

    /**
     * Muestra el reporte detallado de verificación
     * @param {Object} data - Datos del reporte
     */
    showReport(data) {
        const { total, live, dead, timeout, liveChannels, deadChannels, timeoutChannels } = data;

        const reportHtml = `
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

                <!-- Tabs -->
                <div style="margin-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
                    <button onclick="showReportTab('live')" id="tab-live" class="report-tab" 
                            style="padding: 12px 24px; border: none; background: #28a745; color: white; cursor: pointer; font-weight: 600; border-radius: 8px 8px 0 0; margin-right: 5px;">
                        ✓ Activos (${live})
                    </button>
                    <button onclick="showReportTab('dead')" id="tab-dead" class="report-tab" 
                            style="padding: 12px 24px; border: none; background: #6c757d; color: white; cursor: pointer; font-weight: 600; border-radius: 8px 8px 0 0; margin-right: 5px;">
                        ✗ Muertos (${dead})
                    </button>
                    <button onclick="showReportTab('timeout')" id="tab-timeout" class="report-tab" 
                            style="padding: 12px 24px; border: none; background: #6c757d; color: white; cursor: pointer; font-weight: 600; border-radius: 8px 8px 0 0;">
                        ⏱ Timeout (${timeout})
                    </button>
                </div>

                <!-- Contenido Activos -->
                <div id="report-live" class="report-content" style="display: block;">
                    <div style="background: #d4edda; border: 2px solid #c3e6cb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Canales Funcionando</h4>
                        <p style="margin: 0; color: #155724; font-size: 14px;">Estos canales están en línea y reproduciendo.</p>
                    </div>
                    ${this.generateChannelList(liveChannels, 'live')}
                </div>

                <!-- Contenido Muertos -->
                <div id="report-dead" class="report-content" style="display: none;">
                    <div style="background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Canales No Disponibles</h4>
                        <p style="margin: 0; color: #721c24; font-size: 14px;">Estos canales necesitan ser reemplazados.</p>
                    </div>
                    ${this.generateChannelList(deadChannels, 'dead')}
                </div>

                <!-- Contenido Timeout -->
                <div id="report-timeout" class="report-content" style="display: none;">
                    <div style="background: #fff3cd; border: 2px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Canales con Timeout</h4>
                        <p style="margin: 0; color: #856404; font-size: 14px;">Estos canales tardaron demasiado en responder.</p>
                    </div>
                    ${this.generateChannelList(timeoutChannels, 'timeout')}
                </div>
            </div>
        `;

        Swal.fire({
            title: '📋 Reporte de Verificación',
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
                    document.querySelectorAll('.report-content').forEach(el => {
                        el.style.display = 'none';
                    });

                    document.querySelectorAll('.report-tab').forEach(btn => {
                        btn.style.background = '#6c757d';
                    });

                    document.getElementById(`report-${tabName}`).style.display = 'block';

                    const activeBtn = document.getElementById(`tab-${tabName}`);
                    if (tabName === 'live') activeBtn.style.background = '#28a745';
                    else if (tabName === 'dead') activeBtn.style.background = '#dc3545';
                    else if (tabName === 'timeout') activeBtn.style.background = '#ffc107';
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.downloadReport(data);
            }
        });
    },

    /**
     * Genera HTML para lista de canales por categoría
     * @param {Array} channels - Lista de canales
     * @param {string} type - Tipo: 'live', 'dead', 'timeout'
     * @returns {string} HTML generado
     */
    generateChannelList(channels, type) {
        if (channels.length === 0) {
            return `<div style="text-align: center; padding: 40px; color: #6c757d;">
                <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                <p style="font-size: 16px;">No hay canales en esta categoría</p>
            </div>`;
        }

        const grouped = utils.groupChannelsByCategory(channels);
        let html = '';

        Object.entries(grouped).forEach(([group, groupChannels]) => {
            html += `
                <div style="margin-bottom: 20px; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden;">
                    <div style="background: #f8f9fa; padding: 12px 15px; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">
                        📁 ${utils.escapeHtml(group)} (${groupChannels.length} canales)
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
                                ${index + 1}. ${utils.escapeHtml(channel.name)}
                            </div>
                            <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #6c757d; background: white; padding: 4px 8px; border-radius: 4px; display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${utils.escapeHtml(channel.url)}
                            </div>
                        </div>
                        <button onclick="navigator.clipboard.writeText('${channel.url.replace(/'/g, "\\'")}'); alert('URL copiada');" 
                                style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 10px; white-space: nowrap;">
                            📋 Copiar
                        </button>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        return html;
    },

    /**
     * Descarga el reporte en formato texto
     * @param {Object} data - Datos del reporte
     */
    downloadReport(data) {
        const { total, live, dead, timeout, liveChannels, deadChannels, timeoutChannels } = data;
        const timestamp = utils.formatDateTime();

        let report = `═══════════════════════════════════════════════════════════════
📊 REPORTE DE VERIFICACIÓN DE CANALES IPTV
═══════════════════════════════════════════════════════════════

Fecha: ${timestamp}

───────────────────────────────────────────────────────────────
📈 RESUMEN
───────────────────────────────────────────────────────────────

Total: ${total}
✅ Activos: ${live} (${((live / total) * 100).toFixed(1)}%)
❌ Muertos: ${dead} (${((dead / total) * 100).toFixed(1)}%)
⏱️  Timeout: ${timeout} (${((timeout / total) * 100).toFixed(1)}%)

═══════════════════════════════════════════════════════════════\n\n`;

        // Canales Activos
        if (liveChannels.length > 0) {
            report += this.generateTextSection('✅ CANALES ACTIVOS', liveChannels);
        }

        // Canales Muertos
        if (deadChannels.length > 0) {
            report += this.generateTextSection('❌ CANALES MUERTOS', deadChannels);
        }

        // Canales Timeout
        if (timeoutChannels.length > 0) {
            report += this.generateTextSection('⏱️ CANALES CON TIMEOUT', timeoutChannels);
        }

        report += `\n═══════════════════════════════════════════════════════════════\n`;
        report += `Reporte generado por M3U Manager Pro\n`;
        report += `═══════════════════════════════════════════════════════════════\n`;

        utils.downloadFile(report, `Reporte_Verificacion_${Date.now()}.txt`);

        Swal.fire({
            icon: 'success',
            title: '📥 Reporte Descargado',
            text: 'El reporte se guardó correctamente',
            confirmButtonText: 'Ok',
            timer: 2000
        });
    },

    /**
     * Genera sección de texto para reporte
     * @param {string} title - Título de la sección
     * @param {Array} channels - Canales de la sección
     * @returns {string} Texto formateado
     */
    generateTextSection(title, channels) {
        let text = `\n${title} (${channels.length})\n`;
        text += `───────────────────────────────────────────────────────────────\n\n`;

        const grouped = utils.groupChannelsByCategory(channels);
        Object.entries(grouped).forEach(([group, groupChannels]) => {
            text += `📁 ${group} (${groupChannels.length} canales)\n\n`;
            groupChannels.forEach((ch, i) => {
                text += `  ${i + 1}. ${ch.name}\n`;
                text += `     URL: ${ch.url}\n\n`;
            });
        });

        return text;
    },

    /**
     * Elimina canales muertos con confirmación
     * @param {Array} channels - Array de canales
     * @param {Function} callback - Callback después de eliminar
     */
    removeDeadChannels(channels, callback) {
        const deadChannels = channels.filter(ch =>
            this.getChannelStatus(ch.url) === 'dead'
        );

        if (deadChannels.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin canales muertos',
                text: 'No hay canales muertos para eliminar',
                confirmButtonText: 'Ok'
            });
            return;
        }

        Swal.fire({
            title: `⚠️ ¿Eliminar ${deadChannels.length} canales muertos?`,
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '🗑️ Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const originalLength = channels.length;

                // Filtrar canales que no estén muertos
                const alive = channels.filter(ch =>
                    this.getChannelStatus(ch.url) !== 'dead'
                );

                channels.length = 0;
                channels.push(...alive);

                const removed = originalLength - channels.length;

                Swal.fire({
                    icon: 'success',
                    title: '✅ Canales eliminados',
                    text: `Se eliminaron ${removed} canal(es) muerto(s)`,
                    confirmButtonText: 'Ok'
                });

                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        });
    }
};

// Exportar para uso global
window.VerifyManager = VerifyManager;