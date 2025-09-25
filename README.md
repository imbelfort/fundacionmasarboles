# 🌳 Mapa de Árboles - Fundación

Una aplicación web interactiva para visualizar árboles en un mapa y gestionar su padrinazgo.

## Características

- **Mapa interactivo** con Leaflet.js
- **Marcadores personalizados** para cada árbol
- **Sistema de padrinazgo** con formulario modal
- **Filtros** por especie y estado
- **Gráficos estadísticos** con Chart.js
- **Diseño responsivo** y moderno
- **Lectura de datos CSV** con PapaParse

## Estructura de archivos

```
├── index.html                    # Página principal
├── styles.css                    # Estilos CSS
├── script.js                     # Lógica JavaScript
├── README.md                     # Este archivo
├── GOOGLE_SHEETS_SETUP.md        # Instrucciones para Google Sheets
├── GITHUB_PAGES_DEPLOYMENT.md    # Instrucciones para GitHub Pages
└── arboles_ejemplo.csv           # Archivo CSV de ejemplo (opcional)
```

## Instalación y uso

### Opción 1: GitHub Pages (Recomendado)

1. **Sube tu archivo CSV** a Google Sheets
2. **Haz la hoja pública** (ver `GOOGLE_SHEETS_SETUP.md`)
3. **Despliega en GitHub Pages** (ver `GITHUB_PAGES_DEPLOYMENT.md`)
4. **Los datos se cargarán automáticamente** desde Google Sheets

### Opción 2: Servidor local

1. **Sube tu archivo CSV** a Google Sheets
2. **Haz la hoja pública** (ver `GOOGLE_SHEETS_SETUP.md`)
3. **Configura la URL** en `script.js` (línea 50)
4. **Ejecuta un servidor HTTP local** (no funciona abriendo directamente el archivo)

## Formato del archivo CSV

El archivo `c.csv` debe tener las siguientes columnas:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `OID_` | ID único del árbol | 1 |
| `ID` | Identificador | F1 1 CH |
| `FAJA` | Faja/área | PARCELA 1 |
| `NRO` | Número | 1 |
| `NOMBRE` | Especie del árbol | CUCHI |
| `CAP` | Capacidad (cm) | 90 |
| `HT` | Altura (m) | 13 |
| `GlobalID` | ID global | (vacío) |
| `coord_X` | Coordenada X | 751379.684799999929965 |
| `coord_Y` | Coordenada Y | 8029844.326600000262260 |
| `PADRINO` | Nombre del padrino (vacío si no tiene) | (vacío) |
| `LONG` | Longitud | -60.628569470142857 |
| `LATI` | Latitud | -17.804571769771876 |
| `Field` | Ubicación/descripción | (vacío) |

## Funcionalidades

### Mapa
- **Vista interactiva** con zoom y pan
- **Marcadores verdes** para árboles disponibles
- **Marcadores naranjas** para árboles padrinados
- **Popup informativo** con detalles del árbol

### Padrinazgo
- **Botón "Padrinar este árbol"** en cada popup
- **Formulario modal** para datos del padrino
- **Validación** de campos requeridos
- **Actualización automática** del estado

### Filtros
- **Por especie** de árbol
- **Por estado** (disponible/padrinado)
- **Botón limpiar** filtros

### Estadísticas
- **Contador total** de árboles
- **Árboles padrinados** vs disponibles
- **Gráfico circular** de especies
- **Gráfico de estado** de padrinazgo

## Personalización

### Cambiar ubicación por defecto
En `script.js`, línea 19:
```javascript
map.setView([-17.8045, -60.6285], 15); // Cambia estas coordenadas
```

### Modificar colores
En `styles.css`, busca las variables de color:
- Verde: `#4CAF50` (árboles disponibles)
- Naranja: `#FF9800` (árboles padrinados)

### Agregar más campos al popup
En `script.js`, función `createTreePopup()`, agrega más campos según necesites.

## Tecnologías utilizadas

- **HTML5** - Estructura
- **CSS3** - Estilos y diseño responsivo
- **JavaScript ES6+** - Lógica de la aplicación
- **Leaflet.js** - Mapas interactivos
- **PapaParse** - Lectura de archivos CSV
- **Chart.js** - Gráficos estadísticos

## Compatibilidad

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Soporte

Para soporte técnico o preguntas sobre la implementación, contacta al equipo de desarrollo.

---

**Desarrollado para la Fundación** 🌱
