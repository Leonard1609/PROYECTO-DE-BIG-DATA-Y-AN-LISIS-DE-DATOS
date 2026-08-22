<?php
// backend/get_kpis.php
require_once 'db.php';

try {
    // 1. Contar total de pedidos
    $stmt1 = $pdo->query("SELECT COUNT(*) as total_orders FROM olist_orders_dataset");
    $orders = $stmt1->fetch(PDO::FETCH_ASSOC);

    // 2. Sumar total de dinero ingresado
    $stmt2 = $pdo->query("SELECT SUM(payment_value) as total_revenue FROM olist_order_payments_dataset");
    $revenue = $stmt2->fetch(PDO::FETCH_ASSOC);

    // 3. Contar total de clientes únicos
    $stmt3 = $pdo->query("SELECT COUNT(DISTINCT customer_unique_id) as total_customers FROM olist_order_customer_dataset");
    $customers = $stmt3->fetch(PDO::FETCH_ASSOC);

    // 4. Empaquetar todo en la bandeja (JSON)
    $response = [
        "status" => "success",
        "data" => [
            "total_orders" => (int)$orders['total_orders'],
            "total_revenue" => round((float)$revenue['total_revenue'], 2),
            "total_customers" => (int)$customers['total_customers']
        ]
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>