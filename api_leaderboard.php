<?php
header('Content-Type: application/json');
require 'db.php';

// Count completed levels per user and sort by descending order
$sql = "SELECT u.username, COUNT(upp.id) as score 
        FROM users u 
        JOIN user_practice_progress upp ON u.id = upp.user_id 
        GROUP BY u.id 
        ORDER BY score DESC 
        LIMIT 10";

$result = $conn->query($sql);

$leaderboard = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        $leaderboard[] = $row;
    }
}

echo json_encode(['success' => true, 'leaderboard' => $leaderboard]);
$conn->close();
?>