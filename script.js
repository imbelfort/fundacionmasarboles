// Variables globales
let map;
let treeMarkers = [];
let allTrees = [];
let filteredTrees = [];

// Configuración inicial
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeEventListeners();
    loadTreeData();
});

// Inicializar el mapa
function initializeMap() {
    // Crear el mapa centrado en las coordenadas de los datos reales (Bolivia)
    map = L.map('map').setView([-17.8045, -60.6285], 15); // Coordenadas aproximadas de los datos
    
    // Agregar capa satelital de Google
    L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);
    
    // Agregar capa de etiquetas de Google
    L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);
}

// Inicializar event listeners
function initializeEventListeners() {
    // Filtros
    const searchInput = document.getElementById('search-input');
    const speciesFilter = document.getElementById('species-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (speciesFilter) speciesFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    
}

// Cargar datos de árboles desde archivo CSV local
function loadTreeData() {
    showLoadingMessage();
    
    fetch('c.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar CSV: ${response.status}`);
            }
            return response.text();
        })
        .then(csvData => {
            parseCSVData(csvData);
        })
        .catch(error => {
            console.error('Error al cargar datos:', error);
            showErrorMessage('No se pudieron cargar los datos de los árboles. Verifica que el archivo c.csv esté disponible.');
        });
}

// Parsear datos CSV
function parseCSVData(csvData) {
    Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Filtrar árboles con coordenadas válidas
            allTrees = results.data.filter(tree => {
                return tree && 
                       tree.LATI && 
                       tree.LONG && 
                       tree.LATI.trim() !== '' && 
                       tree.LONG.trim() !== '' &&
                       !isNaN(parseFloat(tree.LATI)) && 
                       !isNaN(parseFloat(tree.LONG));
            });
            
            filteredTrees = [...allTrees];
            
            // Actualizar interfaz
            updateStatistics();
            updateFilters();
            displayTreesOnMap();
            hideLoadingMessage();
            
        },
        error: function(error) {
            console.error('Error al parsear CSV:', error);
            showErrorMessage('Error al procesar los datos del archivo CSV.');
        }
    });
}

// Mostrar mensaje de carga
function showLoadingMessage() {
    const controls = document.querySelector('.controls');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-message';
    loadingDiv.innerHTML = `
        <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 15px; margin-top: 10px;">
            <h4 style="color: #1976d2; margin: 0 0 10px 0;">🔄 Cargando datos...</h4>
            <p style="margin: 0; color: #1976d2;">Cargando datos de árboles desde c.csv</p>
        </div>
    `;
    controls.appendChild(loadingDiv);
}

// Ocultar mensaje de carga
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('loading-message');
    if (loadingDiv) loadingDiv.remove();
}

// Mostrar mensaje de error simple
function showErrorMessage(message) {
    const controls = document.querySelector('.controls');
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin-top: 10px;">
            <h4 style="color: #721c24; margin: 0 0 10px 0;">❌ Error</h4>
            <p style="margin: 0; color: #721c24;">${message}</p>
        </div>
    `;
    controls.appendChild(errorDiv);
    hideLoadingMessage();
}


// Mostrar árboles en el mapa
function displayTreesOnMap() {
    // Limpiar marcadores existentes
    clearMapMarkers();
    
    filteredTrees.forEach(tree => {
        const marker = createTreeMarker(tree);
        if (marker) {
            treeMarkers.push(marker);
            marker.addTo(map);
        }
    });
    
    // Ajustar vista del mapa para mostrar todos los marcadores
    if (treeMarkers.length > 0) {
        const group = new L.featureGroup(treeMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Crear marcador para un árbol
function createTreeMarker(tree) {
    if (!tree || !tree.LATI || !tree.LONG) {
        return null;
    }
    
    const lat = parseFloat(tree.LATI);
    const lng = parseFloat(tree.LONG);
    
    if (isNaN(lat) || isNaN(lng)) {
        return null;
    }
    
    const isSponsored = tree.PADRINO && tree.PADRINO.trim() !== '';
    
    // Crear círculo más grande
    const circle = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: isSponsored ? '#FF5722' : '#4CAF50',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
    });
    
    // Crear popup con información del árbol
    const popupContent = createTreePopup(tree);
    circle.bindPopup(popupContent);
    
    return circle;
}

// Función auxiliar para generar rutas de imágenes
function getTreeImages(treeId) {
    const baseName = treeId.replace(/\s+/g, '-');
    const images = [];
    
    // Primera imagen (sin número)
    images.push({
        path: `imagen/${baseName}.webp`,
        alt: `Imagen del árbol ${treeId}`
    });
    
    // Buscar imágenes adicionales (2, 3, etc.)
    for (let i = 2; i <= 10; i++) {
        images.push({
            path: `imagen/${baseName} (${i}).webp`,
            alt: `Imagen ${i} del árbol ${treeId}`
        });
    }
    
    return images;
}

// Función para crear el contenido del popup del árbol de manera optimizada
function createTreePopup(tree) {
    // 1. Lógica de Estado y Datos
    const treeID = tree.ID || 'N/A';
    const treeName = tree.NOMBRE || 'Árbol Desconocido';
    const isSponsored = tree.PADRINO && tree.PADRINO.trim() !== '';
    const images = getTreeImages(treeID) || [];
    const mainImage = images[0];

    // 2. Generar Galería (Miniaturas y Controles)
    const thumbnailsHTML = images.map((img, index) => `
        <button class="gallery-thumbnail ${index === 0 ? 'active' : ''}" 
                title="${img.alt || 'Vista del árbol'}"
                onclick="showGalleryImage(this, '${img.path}', '${treeID}')">
            <img src="${img.path}" alt="${img.alt || 'Miniatura del árbol'}" 
                 onerror="this.closest('.gallery-thumbnail').classList.add('hidden');">
        </button>
    `).join('');

    const galleryControlsHTML = images.length > 1 ? `
        <div class="gallery-nav">
            <button class="gallery-nav-btn prev" title="Anterior" 
                    onclick="navigateGallery(this.closest('.tree-gallery'), -1)">❮</button>
            <button class="gallery-nav-btn next" title="Siguiente" 
                    onclick="navigateGallery(this.closest('.tree-gallery'), 1)">❯</button>
        </div>` : '';

    // 3. Generar Contenido HTML del Popup
    return `
        <div class="custom-popup" data-tree-id="${treeID}">
            
            <header class="popup-header">
                <h3 class="tree-name">${treeName}</h3>
                <span class="tree-id">ID: ${treeID}</span>
                <span class="status-badge ${isSponsored ? 'sponsored' : 'unsponsored'}">
                    ${isSponsored ? '✅ Padrinado' : 'Sin Padrino'}
                </span>
            </header>
            
            <div class="tree-gallery">
                <div class="gallery-container">
                    <img src="${mainImage?.path || ''}" 
                         alt="${mainImage?.alt || 'Imagen principal del árbol'}" 
                         class="gallery-main-image"
                         onclick="openImageModal('${mainImage?.path || ''}', '${treeID}')"
                         onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');">
                    
                    <div class="gallery-placeholder ${mainImage ? 'hidden' : ''}">
                        <svg viewBox="0 0 100 100" class="placeholder-icon">
                            <rect width="100" height="100" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
                            <path d="M30 40L50 20L70 40L80 30V80H20V30L30 40Z" fill="#4CAF50"/>
                            <circle cx="50" cy="35" r="8" fill="#2E7D32"/>
                            <text x="50" y="90" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Sin imagen</text>
                        </svg>
                    </div>
                    
                    ${galleryControlsHTML}
                </div>
                
                ${images.length > 1 ? `<div class="gallery-thumbnails">${thumbnailsHTML}</div>` : ''}
            </div>
            
            <div class="tree-details grid-details">
                <div class="detail-item"><strong><span class="icon-map">📍</span> Faja:</strong> ${tree.FAJA || 'N/A'}</div>
                <div class="detail-item"><strong><span class="icon-number">#</span> Número:</strong> ${tree.NRO || 'N/A'}</div>
                <div class="detail-item"><strong><span class="icon-trunk">📏</span> Tronco(cm):</strong> ${tree.CAP || 'N/A'} cm</div>
                <div class="detail-item"><strong><span class="icon-height">⛰️</span> Altura:</strong> ${tree.HT || 'N/A'} m</div>
                ${isSponsored ? `<div class="detail-item full-width"><strong><span class="icon-sponsor">🧑‍🤝‍🧑</span> Padrino:</strong> ${tree.PADRINO}</div>` : ''}
            </div>
            
            <footer class="popup-footer">
                ${!isSponsored ? `
                    <button class="btn-sponsor" 
                            onclick="showSponsorQR('${treeID}', '${treeName}')" 
                            title="Haz clic para obtener el código QR de apadrinamiento">
                        🌳 Padrinar este árbol
                    </button>
                ` : ''}
            </footer>
        </div>
    `;
}

// Actualizar estadísticas
function updateStatistics() {
    const totalTrees = allTrees.length;
    const sponsoredTrees = allTrees.filter(tree => tree.PADRINO && tree.PADRINO.trim() !== '').length;
    const availableTrees = totalTrees - sponsoredTrees;
    
    document.getElementById('total-trees').textContent = totalTrees;
    document.getElementById('sponsored-trees').textContent = sponsoredTrees;
    document.getElementById('available-trees').textContent = availableTrees;
    
    // Actualizar estadísticas de especies
    updateSpeciesStatistics();
}

// Actualizar filtros
function updateFilters() {
    const speciesFilter = document.getElementById('species-filter');
    const species = [...new Set(allTrees.map(tree => tree.NOMBRE))].sort();
    
    // Limpiar opciones existentes
    speciesFilter.innerHTML = '<option value="">Todas las especies</option>';
    
    // Agregar especies
    species.forEach(speciesName => {
        const option = document.createElement('option');
        option.value = speciesName;
        option.textContent = speciesName;
        speciesFilter.appendChild(option);
    });
}

// Aplicar filtros
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const speciesFilter = document.getElementById('species-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    filteredTrees = allTrees.filter(tree => {
        // Búsqueda por código o nombre
        const matchesSearch = !searchTerm || 
            tree.ID.toLowerCase().includes(searchTerm) ||
            tree.NOMBRE.toLowerCase().includes(searchTerm) ||
            tree.FAJA.toLowerCase().includes(searchTerm);
        
        // Filtro por especie
        const matchesSpecies = !speciesFilter || tree.NOMBRE === speciesFilter;
        
        // Filtro por estado
        const isSponsored = tree.PADRINO && tree.PADRINO.trim() !== '';
        let matchesStatus = true;
        if (statusFilter === 'disponible') {
            matchesStatus = !isSponsored;
        } else if (statusFilter === 'padrinado') {
            matchesStatus = isSponsored;
        }
        
        return matchesSearch && matchesSpecies && matchesStatus;
    });
    
    displayTreesOnMap();
    
    // Si hay búsqueda, centrar en el primer resultado
    if (searchTerm && filteredTrees.length > 0) {
        const firstTree = filteredTrees[0];
        map.setView([parseFloat(firstTree.LATI), parseFloat(firstTree.LONG)], 18);
    }
}

// Limpiar filtros
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('species-filter').value = '';
    document.getElementById('status-filter').value = '';
    filteredTrees = [...allTrees];
    displayTreesOnMap();
}

// Limpiar marcadores del mapa
function clearMapMarkers() {
    treeMarkers.forEach(marker => {
        map.removeLayer(marker);
    });
    treeMarkers = [];
}


// Abrir modal de imagen ampliada
function openImageModal(imagePath, treeId) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-content">
            <span class="image-close">&times;</span>
            <img src="${imagePath}" alt="Imagen ampliada del árbol ${treeId}" class="image-full">
            <div class="image-caption">🌳 ${treeId}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Cerrar modal al hacer clic en X o fuera de la imagen
    modal.addEventListener('click', function(event) {
        if (event.target === modal || event.target.classList.contains('image-close')) {
            modal.remove();
        }
    });
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modal.remove();
        }
    });
}

// Actualizar estadísticas de especies
function updateSpeciesStatistics() {
    const speciesContainer = document.getElementById('species-statistics');
    if (!speciesContainer) {
        console.error('No se encontró el contenedor de estadísticas de especies');
        return;
    }
    
    
    // Contar árboles por especie
    const speciesCount = {};
    allTrees.forEach(tree => {
        const species = tree.NOMBRE || 'Sin nombre';
        speciesCount[species] = (speciesCount[species] || 0) + 1;
    });
    
    
    // Ordenar especies por cantidad (descendente)
    const sortedSpecies = Object.entries(speciesCount)
        .sort(([,a], [,b]) => b - a);
    
    // Generar HTML para las estadísticas
    let speciesHTML = '';
    sortedSpecies.forEach(([species, count]) => {
        const percentage = ((count / allTrees.length) * 100).toFixed(1);
        speciesHTML += `
            <div class="species-card">
                <h3>🌳 ${species}</h3>
                <div class="species-count">${count} árboles</div>
                <div class="species-percentage">${percentage}% del total</div>
                <div class="species-bar">
                    <div class="species-bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    
    speciesContainer.innerHTML = speciesHTML;
}

// Mostrar QR estático para padrinazgo
function showSponsorQR(treeId, treeName) {
    const modal = document.createElement('div');
    modal.className = 'sponsor-modal';
    modal.innerHTML = `
        <div class="sponsor-modal-content">
            <span class="sponsor-close">&times;</span>
            
            <div class="sponsor-header">
                <div class="logo-container">
                    <img src="logo.png" alt="Fundación + árboles Bolivia" class="modal-logo">
                </div>
                <h2>🌳 Padrinar Árbol</h2>
                <div class="tree-info">
                    <p><strong>Árbol:</strong> ${treeId}</p>
                    <p><strong>Especie:</strong> ${treeName}</p>
                </div>
            </div>
            
            <div class="sponsor-content-grid">
                <div class="sponsor-left-column">
                    <div class="qr-section">
                        <h3>📱 Código QR para Pagar</h3>
                        <div class="qr-container">
                            <div id="qr-code"></div>
                        </div>
                        <p class="qr-instructions">
                            Escanea el código QR con tu celular para pagar
                        </p>
                    </div>
                </div>
                
                <div class="sponsor-right-column">
                    <div class="payment-info-section">
                        <h3>💰 Datos del Pago</h3>
                        <div class="payment-details">
                            <div class="payment-item">
                                <span class="label">Monto:</span>
                                <span class="value">100 BOB</span>
                            </div>
                            <div class="payment-item">
                                <span class="label">Árbol:</span>
                                <span class="value">${treeId}</span>
                            </div>
                            <div class="payment-item">
                                <span class="label">Fundación:</span>
                                <span class="value">Más Árboles Bolivia</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="whatsapp-section">
                        <h3>📲 Enviar Comprobante</h3>
                        <p>Después de pagar, envía el comprobante por WhatsApp:</p>
                        <button onclick="sendToWhatsApp('${treeId}', '${treeName}')" 
                                class="whatsapp-button">
                            📱 Enviar por WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Generar QR estático
    generateStaticQR(treeId, treeName);
    
    // Cerrar modal
    modal.addEventListener('click', function(event) {
        if (event.target === modal || event.target.classList.contains('sponsor-close')) {
            modal.remove();
        }
    });
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modal.remove();
        }
    });
}

// Mostrar QR estático del banco
function generateStaticQR(treeId, treeName) {
    const qrContainer = document.getElementById('qr-code');
    
    // Usar imagen QR estática del banco
    qrContainer.innerHTML = `
        <div class="qr-visual">
            <img src="qr-banco.jpg" alt="Código QR del banco" class="qr-bank-image">
            <div class="qr-text">
                <p><strong>Árbol:</strong> ${treeId}</p>
                <p><strong>Monto:</strong> 100 BOB</p>
                <p><strong>Concepto:</strong> Padrinazgo árbol ${treeId}</p>
            </div>
        </div>
    `;
}


// Enviar comprobante por WhatsApp
function sendToWhatsApp(treeId, treeName) {
    const phoneNumber = '59160851148'; // Reemplaza con tu número de WhatsApp
    const message = `Hola! He realizado el pago para padrinar el árbol ${treeId} (${treeName}). Adjunto el comprobante de pago.`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp en nueva ventana
    window.open(whatsappUrl, '_blank');
    
    // Mostrar mensaje de confirmación
    showWhatsAppConfirmation(treeId);
}

// Mostrar una imagen específica en la galería
function showGalleryImage(thumbnail, imagePath, treeId) {
    const gallery = thumbnail.closest('.tree-gallery');
    const mainImg = gallery.querySelector('.gallery-main-image');
    const thumbnails = gallery.querySelectorAll('.gallery-thumbnail');
    
    // Actualizar la imagen principal
    mainImg.src = imagePath;
    mainImg.onclick = () => openImageModal(imagePath, treeId);
    
    // Actualizar miniaturas activas
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb === thumbnail) {
            thumb.classList.add('active');
        }
    });
}

// Navegar entre imágenes de la galería
function navigateGallery(gallery, direction) {
    const thumbnails = Array.from(gallery.querySelectorAll('.gallery-thumbnail:not([style*="display: none"])'));
    const currentIndex = thumbnails.findIndex(thumb => thumb.classList.contains('active'));
    
    if (currentIndex === -1) return;
    
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = thumbnails.length - 1;
    if (newIndex >= thumbnails.length) newIndex = 0;
    
    const newThumb = thumbnails[newIndex];
    const newImagePath = newThumb.querySelector('img').src;
    
    showGalleryImage(newThumb, newImagePath, '');
}

// Mostrar confirmación de WhatsApp
function showWhatsAppConfirmation(treeId) {
    const confirmation = document.createElement('div');
    confirmation.className = 'whatsapp-confirmation';
    confirmation.innerHTML = `
        <div class="confirmation-content">
            <div class="logo-container">
                <img src="logo.png" alt="Fundación + árboles Bolivia" class="modal-logo">
            </div>
            <h3>✅ ¡Perfecto!</h3>
            <p>Se ha abierto WhatsApp para enviar el comprobante del árbol <strong>${treeId}</strong>.</p>
            <p>Por favor incluye:</p>
            <ul>
                <li>Tu nombre completo</li>
                <li>El comprobante de pago</li>
                <li>El ID del árbol: <strong>${treeId}</strong></li>
            </ul>
            <p>Una vez recibido el comprobante, registraremos tu padrinazgo en nuestro sistema.</p>
            <button onclick="this.parentElement.parentElement.remove()" class="close-confirmation">
                Entendido
            </button>
        </div>
    `;
    
    document.body.appendChild(confirmation);
    confirmation.style.display = 'block';
}

// Exportar funciones globales para uso en HTML
window.openImageModal = openImageModal;
window.showSponsorQR = showSponsorQR;
window.sendToWhatsApp = sendToWhatsApp;
