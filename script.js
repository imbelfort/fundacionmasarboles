// Variables globales
let map;
let treeMarkers = [];
let allTrees = [];
let filteredTrees = [];
let speciesChart;
let statusChart;

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
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (speciesFilter) speciesFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
    
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
            createCharts();
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
    const filterPanel = document.querySelector('.filter-panel');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-message';
    loadingDiv.innerHTML = `
        <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 15px; margin-top: 10px;">
            <h4 style="color: #1976d2; margin: 0 0 10px 0;">🔄 Cargando datos...</h4>
            <p style="margin: 0; color: #1976d2;">Cargando datos de árboles desde c.csv</p>
        </div>
    `;
    filterPanel.appendChild(loadingDiv);
}

// Ocultar mensaje de carga
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('loading-message');
    if (loadingDiv) loadingDiv.remove();
}

// Mostrar mensaje de error simple
function showErrorMessage(message) {
    const filterPanel = document.querySelector('.filter-panel');
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin-top: 10px;">
            <h4 style="color: #721c24; margin: 0 0 10px 0;">❌ Error</h4>
            <p style="margin: 0; color: #721c24;">${message}</p>
        </div>
    `;
    filterPanel.appendChild(errorDiv);
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
    
    // Crear icono personalizado
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-icon ${isSponsored ? 'sponsored-tree-marker' : 'tree-marker'}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    const marker = L.marker([lat, lng], { icon });
    
    // Crear popup con información del árbol
    const popupContent = createTreePopup(tree);
    marker.bindPopup(popupContent);
    
    return marker;
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
        createCharts();
        
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

// Crear gráficos
function createCharts() {
    createSpeciesChart();
    createStatusChart();
}

// Gráfico de especies
function createSpeciesChart() {
    const ctx = document.getElementById('species-chart').getContext('2d');
    
    // Destruir gráfico existente
    if (speciesChart) {
        speciesChart.destroy();
    }
    
    const speciesCount = {};
    allTrees.forEach(tree => {
        const species = tree.NOMBRE || 'Sin nombre';
        speciesCount[species] = (speciesCount[species] || 0) + 1;
    });
    
    const labels = Object.keys(speciesCount);
    const data = Object.values(speciesCount);
    
    speciesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
                    '#F44336', '#00BCD4', '#8BC34A', '#FFC107'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de estado
function createStatusChart() {
    const ctx = document.getElementById('status-chart').getContext('2d');
    
    // Destruir gráfico existente
    if (statusChart) {
        statusChart.destroy();
    }
    
    const sponsoredCount = allTrees.filter(tree => tree.PADRINO && tree.PADRINO.trim() !== '').length;
    const availableCount = allTrees.length - sponsoredCount;
    
    statusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Disponibles', 'Padrinados'],
            datasets: [{
                data: [availableCount, sponsoredCount],
                backgroundColor: ['#4CAF50', '#FF9800'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Exportar funciones globales para uso en HTML
window.openSponsorModal = openSponsorModal;
