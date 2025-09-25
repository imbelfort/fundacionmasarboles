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
    
    // Agregar capa de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
}

// Inicializar event listeners
function initializeEventListeners() {
    // Filtros
    const speciesFilter = document.getElementById('species-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (speciesFilter) speciesFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    
    // Modal
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-sponsor');
    const sponsorForm = document.getElementById('sponsor-form');
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (sponsorForm) sponsorForm.addEventListener('submit', handleSponsorSubmit);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('sponsor-modal');
        if (modal && event.target === modal) {
            closeModal();
        }
    });
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
            
            console.log('Datos cargados:', allTrees.length, 'árboles');
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
        console.warn('Árbol sin coordenadas válidas:', tree);
        return null;
    }
    
    const lat = parseFloat(tree.LATI);
    const lng = parseFloat(tree.LONG);
    
    if (isNaN(lat) || isNaN(lng)) {
        console.warn('Coordenadas inválidas para el árbol:', tree);
        return null;
    }
    
    const isSponsored = tree.PADRINO && tree.PADRINO.trim() !== '';
    
    // Crear círculo pequeño
    const circle = L.circleMarker([lat, lng], {
        radius: 4,
        fillColor: isSponsored ? '#FF9800' : '#4CAF50',
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    });
    
    // Crear popup con información del árbol
    const popupContent = createTreePopup(tree);
    circle.bindPopup(popupContent);
    
    return circle;
}

// Crear contenido del popup
function createTreePopup(tree) {
    const isSponsored = tree.PADRINO && tree.PADRINO.trim() !== '';
    
    return `
        <div class="custom-popup">
            <h3>🌳 ${tree.NOMBRE || 'Árbol'}</h3>
            <div class="tree-details">
                <p><strong>ID:</strong> ${tree.ID}</p>
                <p><strong>Especie:</strong> ${tree.NOMBRE}</p>
                <p><strong>Faja:</strong> ${tree.FAJA}</p>
                <p><strong>Número:</strong> ${tree.NRO}</p>
                <p><strong>Capacidad:</strong> ${tree.CAP} cm</p>
                <p><strong>Altura:</strong> ${tree.HT} m</p>
                <p><strong>Ubicación:</strong> ${tree.Field || 'No especificada'}</p>
                <p><strong>Estado:</strong> ${isSponsored ? '✅ Padrinado' : '🆓 Disponible'}</p>
                ${isSponsored ? `<p><strong>Padrino:</strong> ${tree.PADRINO}</p>` : ''}
            </div>
            ${!isSponsored ? 
                `<button class="sponsor-button" onclick="openSponsorModal('${tree.OID_}')">
                    Padrinar este árbol
                </button>` : 
                '<p style="color: #FF9800; font-weight: bold;">Este árbol ya tiene padrino</p>'
            }
        </div>
    `;
}

// Abrir modal de padrinazgo
function openSponsorModal(treeOid) {
    const tree = allTrees.find(t => t.OID_ === treeOid);
    if (!tree) return;
    
    const modal = document.getElementById('sponsor-modal');
    const treeInfo = document.getElementById('tree-info');
    
    treeInfo.innerHTML = `
        <h4>🌳 ${tree.NOMBRE}</h4>
        <p><strong>ID:</strong> ${tree.ID}</p>
        <p><strong>Especie:</strong> ${tree.NOMBRE}</p>
        <p><strong>Faja:</strong> ${tree.FAJA}</p>
        <p><strong>Número:</strong> ${tree.NRO}</p>
        <p><strong>Capacidad:</strong> ${tree.CAP} cm</p>
        <p><strong>Altura:</strong> ${tree.HT} m</p>
        <p><strong>Ubicación:</strong> ${tree.Field || 'No especificada'}</p>
    `;
    
    // Guardar OID del árbol para el formulario
    document.getElementById('sponsor-form').dataset.treeOid = treeOid;
    
    modal.style.display = 'block';
}

// Cerrar modal
function closeModal() {
    document.getElementById('sponsor-modal').style.display = 'none';
    document.getElementById('sponsor-form').reset();
}

// Manejar envío del formulario de padrinazgo
function handleSponsorSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const treeOid = form.dataset.treeOid;
    const sponsorName = document.getElementById('sponsor-name').value;
    const sponsorEmail = document.getElementById('sponsor-email').value;
    const sponsorMessage = document.getElementById('sponsor-message').value;
    
    // Simular guardado (en producción esto se enviaría al servidor)
    const tree = allTrees.find(t => t.OID_ === treeOid);
    if (tree) {
        tree.PADRINO = sponsorName;
        
        // Actualizar datos
        updateStatistics();
        displayTreesOnMap();
        
        alert(`¡Gracias ${sponsorName}! Has padrinado el árbol ${tree.NOMBRE} exitosamente.`);
        closeModal();
    }
}

// Actualizar estadísticas
function updateStatistics() {
    const totalTrees = allTrees.length;
    const sponsoredTrees = allTrees.filter(tree => tree.PADRINO && tree.PADRINO.trim() !== '').length;
    const availableTrees = totalTrees - sponsoredTrees;
    
    document.getElementById('total-trees').textContent = totalTrees;
    document.getElementById('sponsored-trees').textContent = sponsoredTrees;
    document.getElementById('available-trees').textContent = availableTrees;
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
    const speciesFilter = document.getElementById('species-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    filteredTrees = allTrees.filter(tree => {
        const matchesSpecies = !speciesFilter || tree.NOMBRE === speciesFilter;
        const isSponsored = tree.PADRINO && tree.PADRINO.trim() !== '';
        
        let matchesStatus = true;
        if (statusFilter === 'disponible') {
            matchesStatus = !isSponsored;
        } else if (statusFilter === 'padrinado') {
            matchesStatus = isSponsored;
        }
        
        return matchesSpecies && matchesStatus;
    });
    
    displayTreesOnMap();
}

// Limpiar filtros
function clearFilters() {
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


// Exportar funciones globales para uso en HTML
window.openSponsorModal = openSponsorModal;
