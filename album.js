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
                    
                    // Función para cargar imágenes dinámicamente
                    function loadImagesFromDirectory() {
                        return new Promise((resolve) => {
                            // Intenta cargar las imágenes usando el endpoint PHP si está disponible
                            fetch('list-images.php')
                                .then(response => response.json())
                                .then(images => resolve(images))
                                .catch(() => {
                                    // Si falla, usa imágenes predefinidas
                                    const defaultImages = [
    "F1-10-CU (2).webp",
    "F1-10-CU (3).webp",
    "F1-10-CU (4).webp",
    "F1-10-CU.webp",
    "F1-11-CU (2).webp",
    "F1-11-CU (3).webp",
    "F1-11-CU (4).webp",
    "F1-11-CU.webp",
    "F1-12-AJ (2).webp",
    "F1-12-AJ (3).webp",
    "F1-12-AJ (4).webp",
    "F1-12-AJ.webp",
    "F1-13-CU (2).webp",
    "F1-13-CU (3).webp",
    "F1-13-CU (4).webp",
    "F1-13-CU.webp",
    "F1-14-CU (2).webp",
    "F1-14-CU (3).webp",
    "F1-14-CU (4).webp",
    "F1-14-CU.webp",
    "F1-15-ALG (2).webp",
    "F1-15-ALG (3).webp",
    "F1-15-ALG.webp",
    "F1-16-CU (2).webp",
    "F1-16-CU (3).webp",
    "F1-16-CU (4).webp",
    "F1-16-CU.webp",
    "F1-17-CU (2).webp",
    "F1-17-CU (3).webp",
    "F1-17-CU (4).webp",
    "F1-17-CU.webp",
    "F1-18-CU (2).webp",
    "F1-18-CU (3).webp",
    "F1-18-CU (4).webp",
    "F1-18-CU.webp",
    "F1-19-CU (2).webp",
    "F1-19-CU (3).webp",
    "F1-19-CU.webp",
    "F1-2-MO (2).webp",
    "F1-2-MO (3).webp",
    "F1-2-MO.webp",
    "F1-20-MO (2).webp",
    "F1-20-MO (3).webp",
    "F1-20-MO (4).webp",
    "F1-20-MO.webp",
    "F1-21-MO (2).webp",
    "F1-21-MO (3).webp",
    "F1-21-MO.webp",
    "F1-22-CH (2).webp",
    "F1-22-CH (3).webp",
    "F1-22-CH.webp",
    "F1-22-CU (2).webp",
    "F1-22-CU (3).webp",
    "F1-22-CU.webp",
    "F1-23-CU (2).webp",
    "F1-23-CU (3).webp",
    "F1-23-CU (4).webp",
    "F1-23-CU (5).webp",
    "F1-23-CU.webp",
    "F1-24-CU (2).webp",
    "F1-24-CU (3).webp",
    "F1-24-CU.webp",
    "F1-25-CU (2).webp",
    "F1-25-CU (3).webp",
    "F1-25-CU.webp",
    "F1-26-CU (2).webp",
    "F1-26-CU (3).webp",
    "F1-26-CU.webp",
    "F1-27-MO (2).webp",
    "F1-27-MO (3).webp",
    "F1-27-MO.webp",
    "F1-28-CU (2).webp",
    "F1-28-CU (3).webp",
    "F1-28-CU.webp",
    "F1-29-CU (2).webp",
    "F1-29-CU (3).webp",
    "F1-29-CU (4).webp",
    "F1-29-CU.webp",
    "F1-3-CU (2).webp",
    "F1-3-CU (3).webp",
    "F1-3-CU (4).webp",
    "F1-3-CU (5).webp",
    "F1-3-CU.webp",
    "F1-30-MO (2).webp",
    "F1-30-MO (3).webp",
    "F1-30-MO.webp",
    "F1-31-CU (2).webp",
    "F1-31-CU (3).webp",
    "F1-31-CU (4).webp",
    "F1-31-CU.webp",
    "F1-32-CU (2).webp",
    "F1-32-CU (3).webp",
    "F1-32-CU (4).webp",
    "F1-32-CU.webp",
    "F1-33-CU (2).webp",
    "F1-33-CU (3).webp",
    "F1-33-CU (4).webp",
    "F1-33-CU (5).webp",
    "F1-33-CU.webp",
    "F1-34-CU (2).webp",
    "F1-34-CU (3).webp",
    "F1-34-CU (4).webp",
    "F1-34-CU.webp",
    "F1-35-CU (2).webp",
    "F1-35-CU (3).webp",
    "F1-35-CU.webp",
    "F1-36-MO (2).webp",
    "F1-36-MO (3).webp",
    "F1-36-MO.webp",
    "F1-37-MO (2).webp",
    "F1-37-MO (3).webp",
    "F1-37-MO.webp",
    "F1-38-CU (2).webp",
    "F1-38-CU (3).webp",
    "F1-38-CU (4).webp",
    "F1-38-CU.webp",
    "F1-39-MO (2).webp",
    "F1-39-MO (3).webp",
    "F1-39-MO.webp",
    "F1-3CU (3).webp",
    "F1-4-BAL (2).webp",
    "F1-4-BAL (3).webp",
    "F1-4-BAL (4).webp",
    "F1-4-BAL.webp",
    "F1-40-MO (2).webp",
    "F1-40-MO (3).webp",
    "F1-40-MO.webp",
    "F1-41-CU (2).webp",
    "F1-41-CU (3).webp",
    "F1-41-CU.webp",
    "F1-42-CU (2).webp",
    "F1-42-CU (3).webp",
    "F1-42-CU.webp",
    "F1-43-CU (2).webp",
    "F1-43-CU (3).webp",
    "F1-43-CU (4).webp",
    "F1-43-CU.webp",
    "F1-44-CH (2).webp",
    "F1-44-CH (3).webp",
    "F1-44-CH.webp",
    "F1-45-CU (2).webp",
    "F1-45-CU (3).webp",
    "F1-45-CU (4).webp",
    "F1-45-CU.webp",
    "F1-46-MO (2).webp",
    "F1-46-MO (3).webp",
    "F1-46-MO (4).webp",
    "F1-46-MO.webp",
    "F1-47-MO (2).webp",
    "F1-47-MO (3).webp",
    "F1-47-MO.webp",
    "F1-48-CE (2).webp",
    "F1-48-CE (3).webp",
    "F1-48-CE.webp",
    "F1-49-CE (2).webp",
    "F1-49-CE (3).webp",
    "F1-49-CE.webp",
    "F1-5-CU (2).webp",
    "F1-5-CU (3).webp",
    "F1-5-CU (4).webp",
    "F1-5-CU.webp",
    "F1-50-MO (2).webp",
    "F1-50-MO (3).webp",
    "F1-50-MO (4).webp",
    "F1-50-MO.webp",
    "F1-51-CU (2).webp",
    "F1-51-CU (3).webp",
    "F1-51-CU (4).webp",
    "F1-51-CU.webp",
    "F1-52-CU (2).webp",
    "F1-52-CU (3).webp",
    "F1-52-CU (4).webp",
    "F1-52-CU.webp",
    "F1-53-MO (2).webp",
    "F1-53-MO (3).webp",
    "F1-53-MO.webp",
    "F1-54-MO (2).webp",
    "F1-54-MO (3).webp",
    "F1-54-MO (4).webp",
    "F1-54-MO.webp",
    "F1-55-AL (2).webp",
    "F1-55-AL (3).webp",
    "F1-55-AL.webp",
    "F1-56-AJ (2).webp",
    "F1-56-AJ (3).webp",
    "F1-56-AJ.webp",
    "F1-57-CU (2).webp",
    "F1-57-CU (3).webp",
    "F1-57-CU (4).webp",
    "F1-57-CU.webp",
    "F1-58-AJ (2).webp",
    "F1-58-AJ (3).webp",
    "F1-58-AJ.webp",
    "F1-59-AJ (2).webp",
    "F1-59-AJ (3).webp",
    "F1-59-AJ.webp",
    "F1-6-CU (2).webp",
    "F1-6-CU (3).webp",
    "F1-6-CU (4).webp",
    "F1-6-CU.webp",
    "F1-60-RB (2).webp",
    "F1-60-RB (3).webp",
    "F1-60-RB.webp",
    "F1-61-MO (2).webp",
    "F1-61-MO (3).webp",
    "F1-61-MO.webp",
    "F1-61-MR (2).webp",
    "F1-61-MR (3).webp",
    "F1-61-MR.webp",
    "F1-63-PI (2).webp",
    "F1-63-PI (3).webp",
    "F1-63-PI (4).webp",
    "F1-63-PI.webp",
    "F1-64-AJ (2).webp",
    "F1-64-AJ (3).webp",
    "F1-64-AJ.webp",
    "F1-65-PI (2).webp",
    "F1-65-PI (3).webp",
    "F1-65-PI.webp",
    "F1-66-MO (2).webp",
    "F1-66-MO (3).webp",
    "F1-66-MO.webp",
    "F1-67-MO (2).webp",
    "F1-67-MO (3).webp",
    "F1-67-MO.webp",
    "F1-68-PI (2).webp",
    "F1-68-PI (3).webp",
    "F1-68-PI.webp",
    "F1-69-MO (2).webp",
    "F1-69-MO (3).webp",
    "F1-69-MO.webp",
    "F1-7-TA (2).webp",
    "F1-7-TA (3).webp",
    "F1-7-TA (4).webp",
    "F1-7-TA.webp",
    "F1-70-MO (2).webp",
    "F1-70-MO (3).webp",
    "F1-70-MO.webp",
    "F1-71-MO (2).webp",
    "F1-71-MO (3).webp",
    "F1-71-MO.webp",
    "F1-72-MO (2).webp",
    "F1-72-MO (3).webp",
    "F1-72-MO.webp",
    "F1-73-SO (2).webp",
    "F1-73-SO (3).webp",
    "F1-73-SO.webp",
    "F1-74-AR (2).webp",
    "F1-74-AR (3).webp",
    "F1-74-AR (4).webp",
    "F1-74-AR (5).webp",
    "F1-74-AR.webp",
    "F1-74-CU (2).webp",
    "F1-74-CU (3).webp",
    "F1-74-CU.webp",
    "F1-75-MO (2).webp",
    "F1-75-MO (3).webp",
    "F1-75-MO.webp",
    "F1-76-CU (2).webp",
    "F1-76-CU (3).webp",
    "F1-76-CU.webp",
    "F1-77-CU (2).webp",
    "F1-77-CU (3).webp",
    "F1-77-CU.webp",
    "F1-78-AJ (2).webp",
    "F1-78-AJ (3).webp",
    "F1-78-AJ.webp",
    "F1-8-MO (2).webp",
    "F1-8-MO (3).webp",
    "F1-8-MO (4).webp",
    "F1-8-MO.webp",
    "F1-80-BI (2).webp",
    "F1-80-BI (3).webp",
    "F1-80-BI.webp",
    "F1-81-AR (2).webp",
    "F1-81-AR (3).webp",
    "F1-81-AR.webp",
    "F1-82-CT (2).webp",
    "F1-82-CT (3).webp",
    "F1-82-CT.webp",
    "F1-83-CU (2).webp",
    "F1-83-CU (3).webp",
    "F1-83-CU.webp",
    "F1-84-MO (2).webp",
    "F1-84-MO (3).webp",
    "F1-84-MO.webp",
    "F1-85-CU (2).webp",
    "F1-85-CU (3).webp",
    "F1-85-CU.webp",
    "F1-86-QJ (2).webp",
    "F1-86-QJ (3).webp",
    "F1-86-QJ.webp",
    "F1-87-CED (2).webp",
    "F1-87-CED (3).webp",
    "F1-87-CED.webp",
    "F1-88-ST (2).webp",
    "F1-88-ST (3).webp",
    "F1-88-ST.webp",
    "F1-89-PI (2).webp",
    "F1-89-PI (3).webp",
    "F1-89-PI.webp",
    "F1-9-CU (2).webp",
    "F1-9-CU (3).webp",
    "F1-9-CU (4).webp",
    "F1-9-CU.webp",
    "F1-90-PI (2).webp",
    "F1-90-PI (3).webp",
    "F1-90-PI.webp",
    "F1-CU-1 (2).webp",
    "F1-CU-1 (3).webp",
    "F1-CU-1.webp",
    "F2-1-JO (2).webp",
    "F2-1-JO (3).webp",
    "F2-1-JO.webp",
    "F2-10-PI (2).webp",
    "F2-10-PI (3).webp",
    "F2-10-PI.webp",
    "F2-11-ALM (2).webp",
    "F2-11-ALM (3).webp",
    "F2-11-ALM.webp",
    "F2-12-PI (2).webp",
    "F2-12-PI (3).webp",
    "F2-12-PI.webp",
    "F2-13-TO (2).webp",
    "F2-13-TO (3).webp",
    "F2-13-TO.webp",
    "F2-14-PI (2).webp",
    "F2-14-PI (3).webp",
    "F2-14-PI.webp",
    "F2-15-MO (2).webp",
    "F2-15-MO (3).webp",
    "F2-15-MO.webp",
    "F2-16-MO (2).webp",
    "F2-16-MO (3).webp",
    "F2-16-MO.webp",
    "F2-17-ST (2).webp",
    "F2-17-ST (3).webp",
    "F2-17-ST.webp",
    "F2-18-PI (2).webp",
    "F2-18-PI (3).webp",
    "F2-18-PI.webp",
    "F2-19-TO (2).webp",
    "F2-19-TO (3).webp",
    "F2-19-TO.webp",
    "F2-2-CU (2).webp",
    "F2-2-CU (3).webp",
    "F2-2-CU (4).webp",
    "F2-2-CU.webp",
    "F2-20-PI (2).webp",
    "F2-20-PI (3).webp",
    "F2-20-PI.webp",
    "F2-21-TO (2).webp",
    "F2-21-TO (3).webp",
    "F2-21-TO.webp",
    "F2-22-AJ (2).webp",
    "F2-22-AJ (3).webp",
    "F2-22-AJ.webp",
    "F2-23-PI (2).webp",
    "F2-23-PI (3).webp",
    "F2-23-PI.webp",
    "F2-24-ST (2).webp",
    "F2-24-ST (3).webp",
    "F2-24-ST.webp",
    "F2-25-CU (2).webp",
    "F2-25-CU (3).webp",
    "F2-25-CU.webp",
    "F2-26-CU (2).webp",
    "F2-26-CU (3).webp",
    "F2-26-CU.webp",
    "F2-27-CE (2).webp",
    "F2-27-CE (3).webp",
    "F2-27-CE.webp",
    "F2-28-CE (2).webp",
    "F2-28-CE (3).webp",
    "F2-28-CE.webp",
    "F2-29-CE (2).webp",
    "F2-29-CE (3).webp",
    "F2-29-CE.webp",
    "F2-30-CU (2).webp",
    "F2-30-CU (3).webp",
    "F2-30-CU.webp",
    "F2-31-MO (2).webp",
    "F2-31-MO (3).webp",
    "F2-31-MO.webp",
    "F2-32-CU (2).webp",
    "F2-32-CU (3).webp",
    "F2-32-CU.webp",
    "F2-33-CU (2).webp",
    "F2-33-CU (3).webp",
    "F2-33-CU.webp",
    "F2-34-CU (2).webp",
    "F2-34-CU (3).webp",
    "F2-34-CU.webp",
    "F2-34-ST (2).webp",
    "F2-34-ST (3).webp",
    "F2-34-ST.webp",
    "F2-35-ST (2).webp",
    "F2-35-ST (3).webp",
    "F2-35-ST.webp",
    "F2-36-ARC (2).webp",
    "F2-36-ARC (3).webp",
    "F2-36-ARC.webp",
    "F2-37-ST (2).webp",
    "F2-37-ST (3).webp",
    "F2-37-ST.webp",
    "F2-38-ST (2).webp",
    "F2-38-ST (3).webp",
    "F2-38-ST.webp",
    "F2-39-CU (2).webp",
    "F2-39-CU (3).webp",
    "F2-39-CU.webp",
    "F2-4-ST (2).webp",
    "F2-4-ST (3).webp",
    "F2-4-ST.webp",
    "F2-40-ST (2).webp",
    "F2-40-ST (3).webp",
    "F2-40-ST.webp",
    "F2-41-ST (2).webp",
    "F2-41-ST (3).webp",
    "F2-41-ST.webp",
    "F2-42-MO (2).webp",
    "F2-42-MO (3).webp",
    "F2-42-MO.webp",
    "F2-44-MO (2).webp",
    "F2-44-MO (3).webp",
    "F2-44-MO.webp",
    "F2-45-MO (2).webp",
    "F2-45-MO (3).webp",
    "F2-45-MO.webp",
    "F2-46-ST (2).webp",
    "F2-46-ST (3).webp",
    "F2-46-ST.webp",
    "F2-47-MO (2).webp",
    "F2-47-MO (3).webp",
    "F2-47-MO.webp",
    "F2-48-MO (2).webp",
    "F2-48-MO (3).webp",
    "F2-48-MO.webp",
    "F2-49-MO (2).webp",
    "F2-49-MO (3).webp",
    "F2-49-MO.webp",
    "F2-5-MO (2).webp",
    "F2-5-MO (3).webp",
    "F2-5-MO.webp",
    "F2-50-ST (2).webp",
    "F2-50-ST (3).webp",
    "F2-50-ST.webp",
    "F2-51-MO (2).webp",
    "F2-51-MO (3).webp",
    "F2-51-MO.webp",
    "F2-52-CH (2).webp",
    "F2-52-CH (3).webp",
    "F2-52-CH.webp",
    "F2-53-MO (2).webp",
    "F2-53-MO (3).webp",
    "F2-53-MO.webp",
    "F2-54-CU (2).webp",
    "F2-54-CU (3).webp",
    "F2-54-CU.webp",
    "F2-55-MO (2).webp",
    "F2-55-MO (3).webp",
    "F2-55-MO.webp",
    "F2-56-MO (2).webp",
    "F2-56-MO (3).webp",
    "F2-56-MO.webp",
    "F2-57-MO (2).webp",
    "F2-57-MO (3).webp",
    "F2-57-MO.webp",
    "F2-58-TJ (2).webp",
    "F2-58-TJ (3).webp",
    "F2-58-TJ.webp",
    "F2-59-CU (2).webp",
    "F2-59-CU (3).webp",
    "F2-59-CU.webp",
    "F2-6-MO (2).webp",
    "F2-6-MO (3).webp",
    "F2-6-MO.webp",
    "F2-60-ST (2).webp",
    "F2-60-ST (3).webp",
    "F2-60-ST.webp",
    "F2-61-MO (2).webp",
    "F2-61-MO (3).webp",
    "F2-61-MO.webp",
    "F2-62-MO (2).webp",
    "F2-62-MO (3).webp",
    "F2-62-MO.webp",
    "F2-63-CU (2).webp",
    "F2-63-CU (3).webp",
    "F2-63-CU.webp",
    "F2-64-ST (2).webp",
    "F2-64-ST (3).webp",
    "F2-64-ST.webp",
    "F2-65-MO (2).webp",
    "F2-65-MO (3).webp",
    "F2-65-MO.webp",
    "F2-66-ST (2).webp",
    "F2-66-ST (3).webp",
    "F2-66-ST.webp",
    "F2-67-MO (2).webp",
    "F2-67-MO (3).webp",
    "F2-67-MO.webp",
    "F2-68-CU (2).webp",
    "F2-68-CU (3).webp",
    "F2-68-CU.webp",
    "F2-69-MO (2).webp",
    "F2-69-MO (3).webp",
    "F2-69-MO.webp",
    "F2-7-MO (2).webp",
    "F2-7-MO (3).webp",
    "F2-7-MO.webp",
    "F2-70-ST (2).webp",
    "F2-70-ST (3).webp",
    "F2-70-ST.webp",
    "F2-71-ST (2).webp",
    "F2-71-ST (3).webp",
    "F2-71-ST.webp",
    "F2-72-CH (2).webp",
    "F2-72-CH (3).webp",
    "F2-72-CH.webp",
    "F2-73-CU (2).webp",
    "F2-73-CU (3).webp",
    "F2-73-CU.webp",
    "F2-74-MO (2).webp",
    "F2-74-MO (3).webp",
    "F2-74-MO.webp",
    "F2-75-MO (2).webp",
    "F2-75-MO (3).webp",
    "F2-75-MO.webp",
    "F2-77-CU (2).webp",
    "F2-77-CU (3).webp",
    "F2-77-CU.webp",
    "F2-78-CU (2).webp",
    "F2-78-CU (3).webp",
    "F2-78-CU.webp",
    "F2-78-SO (2).webp",
    "F2-78-SO (3).webp",
    "F2-78-SO.webp",
    "F2-8-AL (2).webp",
    "F2-8-AL (3).webp",
    "F2-8-AL.webp",
    "F2-80-ST (2).webp",
    "F2-80-ST (3).webp",
    "F2-80-ST.webp",
    "F2-81-AL (2).webp",
    "F2-81-AL (3).webp",
    "F2-81-AL.webp",
    "F2-9-MO (2).webp",
    "F2-9-MO (3).webp",
    "F2-9-MO.webp",
    "F3-1-CU (2).webp",
    "F3-1-CU (3).webp",
    "F3-1-CU.webp",
    "F3-11-ST (2).webp",
    "F3-11-ST (3).webp",
    "F3-11-ST.webp",
    "F3-12-CU (2).webp",
    "F3-12-CU (3).webp",
    "F3-12-CU.webp",
    "F3-13-CU (2).webp",
    "F3-13-CU (3).webp",
    "F3-13-CU.webp",
    "F3-14-CU (2).webp",
    "F3-14-CU (3).webp",
    "F3-14-CU.webp",
    "F3-15-ST (2).webp",
    "F3-15-ST (3).webp",
    "F3-15-ST.webp",
    "F3-16-CU (2).webp",
    "F3-16-CU (3).webp",
    "F3-16-CU.webp",
    "F3-17-CU (2).webp",
    "F3-17-CU (3).webp",
    "F3-17-CU.webp",
    "F3-18-ST (2).webp",
    "F3-18-ST (3).webp",
    "F3-18-ST.webp",
    "F3-19-MO (2).webp",
    "F3-19-MO (3).webp",
    "F3-19-MO.webp",
    "F3-2-ST (2).webp",
    "F3-2-ST (3).webp",
    "F3-2-ST.webp",
    "F3-20-AJ (2).webp",
    "F3-20-AJ (3).webp",
    "F3-20-AJ.webp",
    "F3-21-CU (2).webp",
    "F3-21-CU (3).webp",
    "F3-21-CU (4).webp",
    "F3-21-CU.webp",
    "F3-22-CU (2).webp",
    "F3-22-CU (3).webp",
    "F3-22-CU.webp",
    "F3-23-CU (2).webp",
    "F3-23-CU (3).webp",
    "F3-23-CU.webp",
    "F3-24-CU (2).webp",
    "F3-24-CU (3).webp",
    "F3-24-CU.webp",
    "F3-25-CU (2).webp",
    "F3-25-CU (3).webp",
    "F3-25-CU.webp",
    "F3-26-CU (2).webp",
    "F3-26-CU (3).webp",
    "F3-26-CU.webp",
    "F3-27-CU (2).webp",
    "F3-27-CU (3).webp",
    "F3-27-CU.webp",
    "F3-28-CU (2).webp",
    "F3-28-CU (3).webp",
    "F3-28-CU.webp",
    "F3-29-CU (2).webp",
    "F3-29-CU (3).webp",
    "F3-29-CU.webp",
    "F3-30-CU (2).webp",
    "F3-30-CU (3).webp",
    "F3-30-CU.webp",
    "F3-4-AJ (2).webp",
    "F3-4-AJ (3).webp",
    "F3-4-AJ.webp",
    "F3-5-CU (2).webp",
    "F3-5-CU (3).webp",
    "F3-5-CU.webp",
    "F3-6-JCH (2).webp",
    "F3-6-JCH (3).webp",
    "F3-6-JCH.webp",
    "F3-7-MO (2).webp",
    "F3-7-MO (3).webp",
    "F3-7-MO.webp",
    "F3-8-CU (2).webp",
    "F3-8-CU (3).webp",
    "F3-8-CU.webp",
    "F3-9-C3 (2).webp",
    "F3-9-C3 (3).webp",
    "F3-9-C3.webp",
    "F3-9-MO (2).webp",
    "F3-9-MO (3).webp",
    "F3-9-MO.webp"
]
                                    resolve(defaultImages);
                                });
                        });
                    }

                    // Cargar y procesar imágenes
                    loadImagesFromDirectory()
                        .then(imageFiles => {
                            console.log('Imágenes cargadas:', imageFiles);
                            allTrees = mapImagesToTrees(trees, imageFiles);
                            filteredTrees = [...allTrees];
                            updateAlbumGrid();
                            updateSpeciesFilter();
                        })
                        .catch(error => {
                            console.error('Error al cargar imágenes:', error);
                            // Continuar sin imágenes si hay algún error
                            allTrees = trees.map(tree => ({
                                ...tree,
                                images: []
                            }));
                            filteredTrees = [...allTrees];
                            updateAlbumGrid();
                            updateSpeciesFilter();
                        });
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
