<?php
require 'db.php';

// 1. Create Tables
$queries = [
    "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    )",
    "CREATE TABLE IF NOT EXISTS domains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(100) NOT NULL
    )",
    "CREATE TABLE IF NOT EXISTS tools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        domain_id INT,
        tool_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'html', 'css'
        name VARCHAR(100) NOT NULL,
        FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tool_id VARCHAR(50) NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        difficulty VARCHAR(20),
        UNIQUE KEY unique_project (tool_id, title),
        FOREIGN KEY (tool_id) REFERENCES tools(tool_id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tool_id VARCHAR(50) NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_progress (user_id, tool_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tool_id) REFERENCES tools(tool_id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS user_practice_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tool_id VARCHAR(50) NOT NULL,
        level_number INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_level_progress (user_id, tool_id, level_number),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tool_id) REFERENCES tools(tool_id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS practice_levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tool_id VARCHAR(50) NOT NULL,
        level_number INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        starter_code TEXT,
        hint TEXT,
        solution TEXT,
        UNIQUE KEY unique_practice (tool_id, level_number),
        FOREIGN KEY (tool_id) REFERENCES tools(tool_id) ON DELETE CASCADE
    )"
];

foreach ($queries as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "Table created/checked successfully.<br>";
    } else {
        echo "Error creating table: " . $conn->error . "<br>";
    }
}

// 2. Migrate Data from JSON to MySQL
$jsonFile = 'roadmaps.json';
if (file_exists($jsonFile)) {
    $jsonData = json_decode(file_get_contents($jsonFile), true);

    foreach ($jsonData as $domainKey => $domainData) {
        // Insert Domain
        $stmt = $conn->prepare("INSERT IGNORE INTO domains (key_name, title) VALUES (?, ?)");
        $stmt->bind_param("ss", $domainKey, $domainData['title']);
        $stmt->execute();
        $domainDbId = $conn->insert_id;
        
        // If insert_id is 0 (record existed), fetch the ID
        if ($domainDbId == 0) {
            $res = $conn->query("SELECT id FROM domains WHERE key_name = '$domainKey'");
            $domainDbId = $res->fetch_assoc()['id'];
        }

        // Insert Tools
        if (isset($domainData['tools'])) {
            $stmtTool = $conn->prepare("INSERT IGNORE INTO tools (domain_id, tool_id, name) VALUES (?, ?, ?)");
            $stmtProject = $conn->prepare("INSERT IGNORE INTO projects (tool_id, title, description, difficulty) VALUES (?, ?, ?, ?)");
            $stmtPractice = $conn->prepare("INSERT IGNORE INTO practice_levels (tool_id, level_number, title, description, starter_code, hint, solution) VALUES (?, ?, ?, ?, ?, ?, ?)");

            foreach ($domainData['tools'] as $tool) {
                $stmtTool->bind_param("iss", $domainDbId, $tool['id'], $tool['name']);
                $stmtTool->execute();

                // Insert Projects
                if (isset($tool['projects'])) {
                    foreach ($tool['projects'] as $project) {
                        $stmtProject->bind_param("ssss", $tool['id'], $project['title'], $project['description'], $project['difficulty']);
                        $stmtProject->execute();
                    }
                }

                // Insert Practice Levels
                $practices = isset($tool['practice_data']) ? $tool['practice_data'] : (isset($tool['practice']) ? $tool['practice'] : []);
                if (!empty($practices)) {
                    $levelIndex = 1;
                    foreach ($practices as $practice) {
                        $stmtPractice->bind_param("sisssss", $tool['id'], $levelIndex, $practice['title'], $practice['description'], $practice['starterCode'], $practice['hint'], $practice['solution']);
                        $stmtPractice->execute();
                        $levelIndex++;
                    }
                }
            }
        }
    }
    echo "Data migration completed successfully.";
} else {
    echo "roadmaps.json not found.";
}
?>