<?php
// Router for PHP built-in server
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route gov.php or gov.html to the government schemes page
if ($uri === '/gov.php' || $uri === '/gov.html' || $uri === '/gov') {
    require __DIR__ . '/gov.php';
    exit;
}

// For other PHP files, include them
if (preg_match('/\.php$/', $uri)) {
    $file = __DIR__ . $uri;
    if (file_exists($file)) {
        require $file;
        exit;
    }
}

// Return false to serve static files
return false;
