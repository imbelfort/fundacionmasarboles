<?php
// Configurar las cabeceras para permitir CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Ruta al directorio de imágenes
$imageDir = __DIR__ . '/imagen/';
$imageFiles = [];

// Verificar si el directorio existe y es legible
if (is_dir($imageDir) && $handle = opendir($imageDir)) {
    // Leer todos los archivos del directorio
    while (false !== ($entry = readdir($handle))) {
        // Omitir directorios y archivos ocultos
        if ($entry !== "." && $entry !== ".." && !is_dir($imageDir . $entry)) {
            // Obtener información del archivo
            $fileInfo = pathinfo($entry);
            
            // Filtrar por extensiones de imagen comunes
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (isset($fileInfo['extension']) && in_array(strtolower($fileInfo['extension']), $allowedExtensions)) {
                $imageFiles[] = $entry;
            }
        }
    }
    closedir($handle);
}

// Devolver la lista de imágenes en formato JSON
echo json_encode($imageFiles);
?>
