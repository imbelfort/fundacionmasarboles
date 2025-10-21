// Variables globales
let allTrees = [];
let filteredTrees = [];
let currentImageIndex = 0;
let currentTreeImages = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadTreeData();
    setupEventListeners();
});

// Función para extraer el ID base de un nombre de archivo
function extractBaseId(filename) {
    // Eliminar la extensión del archivo
    const withoutExt = filename.replace(/\.[^/.]+$/, '');
    // Eliminar los números entre paréntesis al final (como (2), (3), etc.)
    return withoutExt.replace(/\s*\(\d+\)$/, '');
}

// Mapear imágenes a sus árboles correspondientes
function mapImagesToTrees(trees, imageFiles) {
    // Primero, agrupar imágenes por su ID base
    const imagesByTreeId = {};
    
    imageFiles.forEach(filename => {
        if (filename.match(/\.(webp|jpg|jpeg|png)$/i)) {
            const baseId = extractBaseId(filename);
            if (!imagesByTreeId[baseId]) {
                imagesByTreeId[baseId] = [];
            }
            imagesByTreeId[baseId].push(`imagen/${filename}`);
        }
    });
    
    // Luego, asignar las imágenes a los árboles correspondientes
    return trees.map(tree => {
        if (!tree || !tree.ID) return null;
        
        const baseId = tree.ID.trim();
        tree.images = imagesByTreeId[baseId] || [];
        
        return tree;
    }).filter(Boolean); // Eliminar árboles nulos
}

// Cargar datos de árboles
function loadTreeData() {
    // Primero cargar el CSV
    fetch('c.csv')
        .then(response => {
            if (!response.ok) throw new Error(`Error al cargar CSV: ${response.status}`);
            return response.text();
        })
        .then(csvData => {
            // Parsear el CSV
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    const trees = results.data.filter(tree => tree && tree.ID && tree.ID.trim() !== '');
                    
                    // Obtener la lista de imágenes de la carpeta 'imagen'
                    // Nota: Esto requiere que el servidor tenga permisos para listar archivos
                    // o que uses un endpoint que devuelva la lista de imágenes
                    fetch('list-images.php')
                        .then(response => response.json())
                        .then(imageFiles => {
                            // Mapear imágenes a árboles
                            allTrees = mapImagesToTrees(trees, imageFiles);
                            filteredTrees = [...allTrees];
                            
                            updateAlbumGrid();
                            updateSpeciesFilter();
                        })
                        .catch(error => {
                            console.error('Error al cargar imágenes:', error);
                            // Si falla, mostrar un mensaje pero continuar sin imágenes
                            allTrees = trees.map(tree => {
                                tree.images = [];
                                return tree;
                            });
                            filteredTrees = [...allTrees];
                            updateAlbumGrid();
                            updateSpeciesFilter();
                        });
                },
                error: function(error) {
                    console.error('Error al parsear CSV:', error);
                    showErrorMessage('Error al procesar los datos del archivo CSV.');
                }
                },
                error: function(error) {
                    console.error('Error al parsear CSV:', error);
                    showErrorMessage('Error al procesar los datos del archivo CSV.');
                }
            });
        })
        .catch(error => {
            console.error('Error al cargar datos:', error);
            showErrorMessage('No se pudieron cargar los datos de los árboles.');
        });
}

// Configurar event listeners
function setupEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById('album-search');
    const speciesFilter = document.getElementById('album-species-filter');
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (speciesFilter) speciesFilter.addEventListener('change', applyFilters);
    
    // Modal
    const modal = document.getElementById('image-modal');
    const closeBtn = document.querySelector('.close');
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    if (prevBtn) prevBtn.onclick = showPreviousImage;
    if (nextBtn) nextBtn.onclick = showNextImage;
    
    // Cerrar al hacer clic fuera de la imagen
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Navegación con teclado
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'block') {
            if (e.key === 'ArrowLeft') showPreviousImage();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'Escape') modal.style.display = 'none';
        }
    });
}

// Actualizar el filtro de especies
function updateSpeciesFilter() {
    const speciesFilter = document.getElementById('album-species-filter');
    if (!speciesFilter) return;
    
    // Limpiar opciones existentes
    speciesFilter.innerHTML = '<option value="">Todas las especies</option>';
    
    // Obtener especies únicas
    const species = [...new Set(allTrees.map(tree => tree.NOMBRE).filter(Boolean))].sort();
    
    // Agregar opciones
    species.forEach(specie => {
        const option = document.createElement('option');
        option.value = specie;
        option.textContent = specie;
        speciesFilter.appendChild(option);
    });
}

// Aplicar filtros
function applyFilters() {
    const searchTerm = document.getElementById('album-search').value.toLowerCase();
    const speciesFilter = document.getElementById('album-species-filter').value;
    
    // Normalizar el término de búsqueda
    const normalizedSearchTerm = searchTerm.replace(/[-\s]/g, '').toLowerCase();
    
    filteredTrees = allTrees.filter(tree => {
        // Normalizar el ID del árbol
        const normalizedTreeId = tree.ID.replace(/[\s-]/g, '').toLowerCase();
        
        // Verificar búsqueda
        const matchesSearch = !searchTerm || 
            normalizedTreeId.includes(normalizedSearchTerm) ||
            tree.ID.toLowerCase().includes(searchTerm) ||
            (tree.NOMBRE && tree.NOMBRE.toLowerCase().includes(searchTerm));
        
        // Verificar especie
        const matchesSpecies = !speciesFilter || tree.NOMBRE === speciesFilter;
        
        return matchesSearch && matchesSpecies;
    });
    
    updateAlbumGrid();
}

// Actualizar la cuadrícula del álbum
function updateAlbumGrid() {
    const albumGrid = document.getElementById('album-grid');
    if (!albumGrid) return;
    
    albumGrid.innerHTML = '';
    
    if (filteredTrees.length === 0) {
        albumGrid.innerHTML = '<p class="no-results">No se encontraron árboles que coincidan con la búsqueda.</p>';
        return;
    }
    
    filteredTrees.forEach(tree => {
        const treeCard = document.createElement('div');
        treeCard.className = 'tree-card';
        
        // Usar la primera imagen disponible
        const imageUrl = tree.images && tree.images.length > 0 ? 
            tree.images[0] : '';
        
        treeCard.innerHTML = `
            <div class="tree-image-container">
                <img src="${imageUrl}" alt="${tree.ID}" class="tree-image" 
                     onerror="this.src='images/default-tree.jpg'"
                     data-tree-id="${tree.ID}">
            </div>
            <div class="tree-info">
                <h3>${tree.NOMBRE || 'Árbol'}</h3>
                <div class="tree-id">ID: ${tree.ID}</div>
                ${tree.images && tree.images.length > 0 ? 
                    `<span class="image-count">${tree.images.length} ${tree.images.length === 1 ? 'imagen' : 'imágenes'}</span>` : ''}
            </div>
        `;
        
        // Agregar evento de clic para abrir el modal
        treeCard.querySelector('.tree-image').addEventListener('click', function() {
            openImageModal(tree);
        });
        
        albumGrid.appendChild(treeCard);
    });
}

// Abrir el modal de imagen
function openImageModal(tree) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalSpecies = document.getElementById('modal-species');
    const modalId = document.getElementById('modal-id');
    
    if (!modal || !modalImg || !tree.images || tree.images.length === 0) return;
    
    // Guardar referencia a las imágenes del árbol actual
    currentTreeImages = tree.images;
    currentImageIndex = 0;
    
    // Actualizar información del modal
    modalTitle.textContent = tree.NOMBRE || 'Árbol';
    modalSpecies.textContent = `Especie: ${tree.NOMBRE || 'No especificada'}`;
    modalId.textContent = `ID: ${tree.ID}`;
    
    // Mostrar la primera imagen
    updateModalImage();
    
    // Mostrar el modal
    modal.style.display = 'block';
    
    // Actualizar contador
    updateImageCounter();
}

// Actualizar la imagen en el modal
function updateModalImage() {
    const modalImg = document.getElementById('modal-image');
    if (!modalImg || currentTreeImages.length === 0) return;
    
    // Asegurarse de que el índice esté dentro de los límites
    if (currentImageIndex < 0) currentImageIndex = currentTreeImages.length - 1;
    if (currentImageIndex >= currentTreeImages.length) currentImageIndex = 0;
    
    // Actualizar la imagen
    modalImg.src = currentTreeImages[currentImageIndex];
    
    // Actualizar contador
    updateImageCounter();
}

// Mostrar imagen anterior
function showPreviousImage() {
    if (currentTreeImages.length <= 1) return;
    currentImageIndex--;
    if (currentImageIndex < 0) currentImageIndex = currentTreeImages.length - 1;
    updateModalImage();
}

// Mostrar siguiente imagen
function showNextImage() {
    if (currentTreeImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentTreeImages.length;
    updateModalImage();
}

// Actualizar el contador de imágenes
function updateImageCounter() {
    const counter = document.getElementById('image-counter');
    if (!counter) return;
    
    counter.textContent = `${currentImageIndex + 1} / ${currentTreeImages.length}`;
}

// Mostrar mensaje de error
function showErrorMessage(message) {
    const albumGrid = document.getElementById('album-grid');
    if (albumGrid) {
        albumGrid.innerHTML = `<div class="error-message">${message}</div>`;
    }
    console.error(message);
}

// Hacer la función accesible globalmente
window.openImageModal = openImageModal;
