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
    document.getElementById('species-filter').addEventListener('change', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancel-sponsor').addEventListener('click', closeModal);
    document.getElementById('sponsor-form').addEventListener('submit', handleSponsorSubmit);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('sponsor-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Configuración de Google Sheets
const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1aq7odEithSwbG-hzrpFR35im3Hsd-B82Z0SG6C3nnuU/export?format=csv&gid=0';

// Cargar datos de árboles desde Google Sheets
function loadTreeData() {
    // Mostrar mensaje de carga
    showLoadingMessage();
    
    // Cargar desde Google Sheets
    fetch(GOOGLE_SHEETS_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            return response.text();
        })
        .then(csvData => {
            parseCSVData(csvData);
        })
        .catch(error => {
            console.error('Error al cargar desde Google Sheets:', error);
            showDetailedErrorMessage(error);
        });
}

// Parsear datos CSV
function parseCSVData(csvData) {
    Papa.parse(csvData, {
        header: true,
        complete: function(results) {
            allTrees = results.data.filter(tree => tree.LATI && tree.LONG && tree.LATI.trim() !== '' && tree.LONG.trim() !== '');
            filteredTrees = [...allTrees];
            
            // Actualizar estadísticas
            updateStatistics();
            
            // Actualizar filtros
            updateFilters();
            
            // Mostrar árboles en el mapa
            displayTreesOnMap();
            
            // Crear gráficos
            createCharts();
            
            // Ocultar mensaje de carga
            hideLoadingMessage();
            
            console.log('Datos cargados:', allTrees.length, 'árboles');
        },
        error: function(error) {
            console.error('Error al parsear datos:', error);
            alert('Error al procesar los datos de los árboles');
            hideLoadingMessage();
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
            <p style="margin: 0; color: #1976d2;">
                Conectando con Google Sheets para obtener los datos de los árboles.
            </p>
        </div>
    `;
    filterPanel.appendChild(loadingDiv);
}

// Ocultar mensaje de carga
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('loading-message');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Mostrar mensaje de error detallado
function showDetailedErrorMessage(error) {
    const filterPanel = document.querySelector('.filter-panel');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    
    let errorMessage = '';
    let solutionMessage = '';
    
    if (error.message.includes('403')) {
        errorMessage = 'Error 403: Acceso denegado';
        solutionMessage = 'La hoja no es pública. Ve a Google Sheets → Compartir → Cambiar a "Cualquier usuario con el enlace"';
    } else if (error.message.includes('404')) {
        errorMessage = 'Error 404: Hoja no encontrada';
        solutionMessage = 'Verifica que la URL sea correcta y que la hoja exista';
    } else if (error.message.includes('CORS')) {
        errorMessage = 'Error CORS: Política de seguridad';
        solutionMessage = 'Esto no debería pasar con Google Sheets públicos';
    } else {
        errorMessage = 'Error de conexión';
        solutionMessage = 'Verifica tu conexión a internet y que la hoja sea pública';
    }
    
    errorDiv.innerHTML = `
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin-top: 10px;">
            <h4 style="color: #721c24; margin: 0 0 10px 0;">❌ ${errorMessage}</h4>
            <p style="margin: 0 0 10px 0; color: #721c24;">
                <strong>Error:</strong> ${error.message}
            </p>
            <p style="margin: 0; color: #721c24;">
                <strong>Solución:</strong> ${solutionMessage}
            </p>
            <div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 5px;">
                <strong>Pasos para hacer la hoja pública:</strong>
                <ol style="margin: 5px 0 0 0; padding-left: 20px;">
                    <li>Ve a tu Google Sheets</li>
                    <li>Haz clic en "Compartir" (esquina superior derecha)</li>
                    <li>Cambia a "Cualquier usuario con el enlace"</li>
                    <li>Establece permiso como "Lector"</li>
                    <li>Haz clic en "Listo"</li>
                </ol>
            </div>
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
        treeMarkers.push(marker);
        marker.addTo(map);
    });
    
    // Ajustar vista del mapa para mostrar todos los marcadores
    if (filteredTrees.length > 0) {
        const group = new L.featureGroup(treeMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Crear marcador para un árbol
function createTreeMarker(tree) {
    const isSponsored = tree.PADRINO && tree.PADRINO.trim() !== '';
    
    // Crear icono personalizado
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-icon ${isSponsored ? 'sponsored-tree-marker' : 'tree-marker'}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    const marker = L.marker([parseFloat(tree.LATI), parseFloat(tree.LONG)], { icon });
    
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
