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

// 2. Handle Requests
if ($method === 'GET') {
    // Return list of completed tools for this user
    $stmt = $conn->prepare("SELECT tool_id FROM user_progress WHERE user_id = ? AND is_completed = 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $completedTools = [];
    while ($row = $result->fetch_assoc()) {
        $completedTools[] = $row['tool_id'];
    }
    
    echo json_encode(['success' => true, 'completed_tools' => $completedTools]);

} elseif ($method === 'POST') {
    // Update progress
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (isset($input['tool_id']) && isset($input['completed'])) {
        $toolId = $input['tool_id'];
        $completed = $input['completed'] ? 1 : 0;

        // Check if tool exists first to avoid foreign key error
        $checkTool = $conn->prepare("SELECT id FROM tools WHERE tool_id = ?");
        $checkTool->bind_param("s", $toolId);
        $checkTool->execute();
        if ($checkTool->get_result()->num_rows === 0) {
             echo json_encode(['success' => false, 'message' => 'Invalid Tool ID']);
             exit;
        }

        // Insert or Update
        $stmt = $conn->prepare("INSERT INTO user_progress (user_id, tool_id, is_completed) VALUES (?, ?, ?) 
                                ON DUPLICATE KEY UPDATE is_completed = ?");
        $stmt->bind_param("isii", $userId, $toolId, $completed, $completed);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Progress updated']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Database error']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid input']);
    }
}
?>