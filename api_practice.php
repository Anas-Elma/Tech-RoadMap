<?php
header('Content-Type: application/json');
require 'db.php';
require 'jwt_helper.php';

// 1. Get Headers and Extract Token
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
$token = str_replace('Bearer ', '', $authHeader);

$userData = JWT::decode($token);

if (!$userData) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = $userData['id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get the current active level for a specific tool
    $toolId = isset($_GET['tool_id']) ? $_GET['tool_id'] : '';

    if (empty($toolId)) {
        echo json_encode(['success' => false, 'message' => 'Tool ID is required']);
        exit;
    }

    // 1. Find the highest level completed by the user for this tool
    $stmt = $conn->prepare("SELECT MAX(level_number) as max_level FROM user_practice_progress WHERE user_id = ? AND tool_id = ?");
    $stmt->bind_param("is", $userId, $toolId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    $lastCompletedLevel = $row['max_level'] ? (int)$row['max_level'] : 0;
    $currentLevel = $lastCompletedLevel + 1;

    // 2. Fetch the details for the current level
    $stmtLevel = $conn->prepare("SELECT * FROM practice_levels WHERE tool_id = ? AND level_number = ?");
    $stmtLevel->bind_param("si", $toolId, $currentLevel);
    $stmtLevel->execute();
    $resultLevel = $stmtLevel->get_result();

    if ($resultLevel->num_rows > 0) {
        $levelData = $resultLevel->fetch_assoc();
        
        // Get total levels count to know if we are close to the end
        $stmtCount = $conn->prepare("SELECT COUNT(*) as total FROM practice_levels WHERE tool_id = ?");
        $stmtCount->bind_param("s", $toolId);
        $stmtCount->execute();
        $totalLevels = $stmtCount->get_result()->fetch_assoc()['total'];

        echo json_encode([
            'success' => true, 
            'level' => $levelData,
            'current_level_number' => $currentLevel,
            'total_levels' => $totalLevels
        ]);
    } else {
        // If no level found, check if user completed all
        $stmtCount = $conn->prepare("SELECT COUNT(*) as total FROM practice_levels WHERE tool_id = ?");
        $stmtCount->bind_param("s", $toolId);
        $stmtCount->execute();
        $totalLevels = $stmtCount->get_result()->fetch_assoc()['total'];

        if ($lastCompletedLevel >= $totalLevels && $totalLevels > 0) {
            echo json_encode(['success' => true, 'message' => 'All levels completed!', 'completed_all' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Level not found']);
        }
    }

} elseif ($method === 'POST') {
    // Mark a level as completed
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['tool_id']) && isset($input['level_number'])) {
        $toolId = $input['tool_id'];
        $levelNumber = (int)$input['level_number'];

        // Insert progress
        $stmt = $conn->prepare("INSERT IGNORE INTO user_practice_progress (user_id, tool_id, level_number) VALUES (?, ?, ?)");
        $stmt->bind_param("isi", $userId, $toolId, $levelNumber);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Level completed']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid input']);
    }
}

$conn->close();
?>