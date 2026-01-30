<div align="center">

# 🎬 M3U Editor

### Editor de listas M3U simple, elegante y poderoso

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

<img src="https://img.shields.io/badge/No%20Dependencies-✓-success" alt="No Dependencies">
<img src="https://img.shields.io/badge/Vanilla%20JS-✓-yellow" alt="Vanilla JavaScript">
<img src="https://img.shields.io/badge/Made%20with-❤️-red" alt="Made with Love">

**[✨ Demo en vivo](#) • [📖 Documentación](#-cómo-usar) • [🐛 Reportar Bug](https://github.com/smtzcode/M3U-EDITOR/issues)**

</div>

---

## 🌟 ¿Qué es M3U Editor?

**M3U Editor** es una herramienta web **100% gratuita** que te permite gestionar tus listas de canales IPTV de manera **visual e intuitiva**, sin necesidad de conocimientos técnicos avanzados. 

Olvídate de editar archivos de texto plano o usar programas complicados. Con M3U Editor, cualquier persona puede organizar, editar y optimizar sus listas M3U en minutos.

### 💡 ¿Por qué M3U Editor?

| Característica | M3U Editor | Otras alternativas |
|----------------|------------|-------------------|
| **Sin instalación** | ✅ Funciona directo en el navegador | ❌ Requieren instalación |
| **Interfaz intuitiva** | ✅ Diseño moderno y fácil | ⚠️ Interfaces complejas |
| **Cero dependencias** | ✅ JavaScript puro | ❌ Frameworks pesados |
| **Código abierto** | ✅ 100% transparente | ⚠️ Muchos son privativos |
| **Gratis para siempre** | ✅ Sin límites | ⚠️ Versiones de pago |

---

## ✨ Características principales

<table>
<tr>
<td width="50%">

### 📂 Carga y edición
- **Importa** archivos `.m3u` y `.m3u8`
- **Edita** canales individualmente
- **Organiza** por categorías/grupos
- **Elimina** canales duplicados o no deseados

</td>
<td width="50%">

### ⚡ Rendimiento
- **Ultra rápido** - JavaScript vanilla optimizado
- **Liviano** - Sin librerías innecesarias
- **Responsive** - Funciona en PC, tablet y móvil
- **Offline ready** - Trabaja sin conexión

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Interfaz elegante
- Diseño **moderno y minimalista**
- **Modo oscuro** para trabajar de noche
- Animaciones **fluidas y suaves**
- **Totalmente responsive**

</td>
<td width="50%">

### 🔧 Funciones avanzadas
- **Búsqueda rápida** de canales
- **Filtros** por grupo/categoría
- **Exportación** de listas optimizadas
- **Previsualización** antes de guardar

</td>
</tr>
</table>

---

## 🚀 Inicio rápido

### Opción 1: Usar directamente en tu navegador

1. **Descarga** este repositorio o clónalo:
   ```bash
   git clone https://github.com/smtzcode/M3U-EDITOR.git
   ```

2. **Abre** el archivo `editor.html` en tu navegador favorito

3. **¡Listo!** Ya puedes empezar a editar tus listas M3U

### Opción 2: Servidor local

```bash
# Si tienes Python instalado
python -m http.server 8000

# Si tienes Node.js instalado
npx serve
```

Luego abre tu navegador en `http://localhost:8000`

---

## 📖 Cómo usar

### 1️⃣ Cargar tu lista M3U

<table>
<tr>
<td width="50%">

**Arrastra y suelta**
- Simplemente arrastra tu archivo `.m3u` a la ventana
- El editor lo procesará automáticamente

</td>
<td width="50%">

**O usa el botón**
- Haz clic en "📂 Cargar archivo"
- Selecciona tu archivo M3U
- ¡Listo para editar!

</td>
</tr>
</table>

### 2️⃣ Editar canales

- **Renombrar**: Haz clic en el nombre del canal para editarlo
- **Reordenar**: Arrastra los canales para cambiar el orden
- **Eliminar**: Usa el botón ❌ para quitar canales no deseados
- **Agrupar**: Organiza canales por categorías

### 3️⃣ Guardar cambios

- Haz clic en "💾 Guardar"
- Descarga tu lista M3U optimizada
- ¡Úsala en tu reproductor favorito!

---

## 📁 Estructura del proyecto

```
M3U-EDITOR/
│
├── 📄 index.html          # Página principal (puerta de entrada)
├── 📄 editor.html         # Interfaz del editor
├── 📄 index.js            # Lógica principal
│
├── 📁 css/
│   ├── styles.css         # Estilos generales
│   └── editor.css         # Estilos del editor
│
├── 📁 js/
│   ├── parser.js          # Parser de archivos M3U
│   ├── ui.js              # Gestión de la interfaz
│   ├── storage.js         # Almacenamiento local
│   └── export.js          # Exportación de archivos
│
├── 📄 README.md           # Este archivo
└── 📄 LICENSE             # Licencia MIT
```

### 🏗️ Arquitectura modular

El proyecto está diseñado con **separación de responsabilidades**:

- **Parser**: Procesa y valida archivos M3U
- **UI**: Maneja toda la interacción con el usuario
- **Storage**: Gestiona el almacenamiento temporal
- **Export**: Genera archivos M3U optimizados

---

## 🎯 Casos de uso

### 📺 Para usuarios de IPTV
- Organiza tus canales favoritos
- Elimina canales que no funcionan
- Crea listas personalizadas por temática

### 🎬 Para creadores de contenido
- Gestiona múltiples listas de reproducción
- Combina varias listas en una
- Optimiza listas para diferentes dispositivos

### 💻 Para desarrolladores
- Código limpio y documentado
- Arquitectura modular y extensible
- Sin dependencias externas

---

## 🛠️ Tecnologías utilizadas

Este proyecto está construido con tecnologías **web estándar**, sin frameworks ni librerías externas:

<div align="center">

| Tecnología | Uso |
|------------|-----|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) | Estructura de la aplicación |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) | Diseño y animaciones |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) | Lógica de la aplicación |

</div>

**Ventajas de usar Vanilla JavaScript:**
- ✅ Cero dependencias = más rápido y seguro
- ✅ Compatible con todos los navegadores modernos
- ✅ Fácil de mantener y extender
- ✅ Tamaño mínimo de descarga

---

## 🎨 Principios de diseño

### Simplicidad primero
> "La complejidad es el enemigo de la ejecución" - Tony Robbins

M3U Editor está diseñado para ser **intuitivo desde el primer uso**. No necesitas leer un manual de 50 páginas para empezar.

### Accesibilidad universal
Cualquier persona puede usar M3U Editor, independientemente de su nivel técnico:
- 👴 **Tu abuelo** puede organizar sus canales de TV
- 👨‍💼 **Un profesional** puede gestionar listas empresariales
- 👨‍💻 **Un desarrollador** puede integrar o extender la herramienta

### Rendimiento óptimo
- Carga instantánea (< 1 segundo)
- Procesamiento rápido incluso con listas grandes
- Interfaz fluida y responsive

---

## 🤝 Contribuir al proyecto

¡Las contribuciones son **bienvenidas**! Este es un proyecto de código abierto y cualquier ayuda es apreciada.

### Formas de contribuir

1. **🐛 Reportar bugs**
   - Abre un [Issue](https://github.com/smtzcode/M3U-EDITOR/issues)
   - Describe el problema claramente
   - Incluye pasos para reproducirlo

2. **💡 Sugerir mejoras**
   - ¿Tienes una idea genial?
   - Compártela en [Issues](https://github.com/smtzcode/M3U-EDITOR/issues)

3. **🔧 Enviar código**
   ```bash
   # Fork el proyecto
   git clone https://github.com/TU-USUARIO/M3U-EDITOR.git
   
   # Crea una rama para tu feature
   git checkout -b feature/mi-nueva-funcionalidad
   
   # Haz tus cambios y commit
   git commit -m "✨ Añade nueva funcionalidad increíble"
   
   # Push a tu fork
   git push origin feature/mi-nueva-funcionalidad
   
   # Abre un Pull Request
   ```

4. **📖 Mejorar documentación**
   - Corrige errores tipográficos
   - Añade ejemplos
   - Traduce a otros idiomas

### Guías de estilo

- **JavaScript**: ES6+, sin semicolons, 2 espacios de indentación
- **CSS**: BEM methodology, mobile-first
- **Commits**: Usa [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` nueva funcionalidad
  - `fix:` corrección de bug
  - `docs:` cambios en documentación
  - `style:` formato, sin cambios de código
  - `refactor:` refactorización de código

---

## 📜 Licencia

Este proyecto está bajo la **Licencia MIT** - mira el archivo [LICENSE](LICENSE) para más detalles.

### ¿Qué significa esto?

✅ **Puedes**:
- Usar comercialmente
- Modificar el código
- Distribuir
- Uso privado

❌ **No puedes**:
- Hacer responsable al autor
- Usar sin atribución

---

## 👨‍💻 Autor

<div align="center">

**Desarrollado con ❤️ por [Sebastian Martinez](https://github.com/smtzcode)**

[![GitHub](https://img.shields.io/badge/GitHub-smtzcode-181717?style=for-the-badge&logo=github)](https://github.com/smtzcode)
[![Portfolio](https://img.shields.io/badge/Portfolio-sebastianmartinez.dev-FF6B6B?style=for-the-badge&logo=google-chrome&logoColor=white)](#)

</div>

### 💬 Contacto

¿Preguntas? ¿Sugerencias? ¿Simplemente quieres saludar?

- 📧 Email: [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)
- 💼 LinkedIn: [Sebastian Martinez](https://linkedin.com/in/tu-perfil)
- 🐦 Twitter: [@smtzcode](https://twitter.com/smtzcode)

---

## 🙏 Agradecimientos

Un agradecimiento especial a:

- La **comunidad de código abierto** por inspirar este proyecto
- Todos los **contributors** que han aportado su tiempo
- **Tú**, por interesarte en M3U Editor ❤️

---

## 🗺️ Roadmap

### ✅ Versión actual (v1.0)
- [x] Carga de archivos M3U
- [x] Edición básica de canales
- [x] Exportación de listas
- [x] Interfaz responsive

### 🚧 Próximas funcionalidades (v1.1)
- [ ] Validación de URLs en tiempo real
- [ ] Modo oscuro automático
- [ ] Importar desde URL
- [ ] Estadísticas de uso

### 🔮 Futuro (v2.0)
- [ ] Gestión de logos de canales
- [ ] EPG (Guía electrónica de programación)
- [ ] Sincronización con la nube
- [ ] Aplicación móvil nativa

---

## 📊 Estadísticas del proyecto

<div align="center">

![GitHub repo size](https://img.shields.io/github/repo-size/smtzcode/M3U-EDITOR?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/smtzcode/M3U-EDITOR?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/smtzcode/M3U-EDITOR?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/smtzcode/M3U-EDITOR?style=for-the-badge)
![GitHub pull requests](https://img.shields.io/github/issues-pr/smtzcode/M3U-EDITOR?style=for-the-badge)

</div>

---

## 🔗 Enlaces útiles

- [Formato M3U - Wikipedia](https://es.wikipedia.org/wiki/M3U)
- [Guía de IPTV para principiantes](#)
- [Mejores reproductores M3U](#)
- [Preguntas frecuentes (FAQ)](#)

---

<div align="center">

### ⭐ Si este proyecto te ha sido útil, considera darle una estrella

**¡Gracias por usar M3U Editor!**

Hecho con 💻 y ☕ en Ecuador 🇪🇨

---

*"El código simple es el código más mantenible"*

</div>