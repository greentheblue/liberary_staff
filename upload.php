<?php
// Set more permissive CORS headers to allow cross-origin requests from any source
// In production, you should replace '*' with your actual origin domain
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Create upload directory if it doesn't exist
$uploadDir = 'uploads/member_photos/';

if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create upload directory']);
        exit();
    }
}

// Log request details for debugging
error_log('Upload request received: ' . print_r($_FILES, true));
error_log('POST data: ' . print_r($_POST, true));

// Check if image was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $error = isset($_FILES['image']) ? $_FILES['image']['error'] : 'No file uploaded';
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'No image uploaded or upload error: ' . $error
    ]);
    exit();
}

// Generate a unique filename
$fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
if (empty($fileExtension)) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $_FILES['image']['tmp_name']);
    finfo_close($finfo);
    
    // Determine extension from MIME type
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif'
    ];
    
    $fileExtension = $extensions[$mimeType] ?? 'jpg';
}

$fileName = uniqid('member_') . '_' . date('Ymd') . '.' . $fileExtension;
$targetFile = $uploadDir . $fileName;

// Check file type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$fileType = finfo_file($finfo, $_FILES['image']['tmp_name']);
finfo_close($finfo);

$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

if (!in_array($fileType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Invalid file type: ' . $fileType . '. Only JPG, PNG and GIF allowed'
    ]);
    exit();
}

// Check file size (limit to 5MB)
if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'File too large. Maximum size is 5MB'
    ]);
    exit();
}

// Process and save the image
if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
    // Get the base URL from the server or request
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . $host;
    
    // Handle cases where the script is not in the document root
    $scriptPath = dirname($_SERVER['SCRIPT_NAME']);
    if ($scriptPath !== '/' && $scriptPath !== '\\') {
        $baseUrl .= $scriptPath;
    }
    
    // Ensure the URL has trailing slash
    if (substr($baseUrl, -1) !== '/') {
        $baseUrl .= '/';
    }
    
    // Full image URL
    $imageUrl = $baseUrl . $targetFile;
    
    // Log the success
    error_log('Image uploaded successfully to: ' . $targetFile);
    error_log('Image URL: ' . $imageUrl);
    
    // Return success response with proper Content-Type header
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'imageUrl' => $imageUrl,
        'fileName' => $fileName
    ]);
} else {
    error_log('Failed to move uploaded file from ' . $_FILES['image']['tmp_name'] . ' to ' . $targetFile);
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Failed to save the uploaded file']);
}
?>
