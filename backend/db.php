<?php
// backend/db.php

// 1. Cabeceras obligatorias para que React (Vercel) no te dé error de CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$user = "root";
$password = ""; // En XAMPP por defecto viene vacío
$dbname = "olist_crm_db";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de conexión: " . $e->getMessage()]);
    exit();
}
?>