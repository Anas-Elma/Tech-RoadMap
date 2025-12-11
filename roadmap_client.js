const API_BASE = 'http://localhost/Tech-RoadMap';

/**
 * 1. Handle Login
 * Call this function when the Login form is submitted
 */
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (result.success) {
            // Store the token securely in LocalStorage
            localStorage.setItem('jwt_token', result.token);
            localStorage.setItem('user_info', JSON.stringify(result.user));
            alert('Login Successful!');
            window.location.reload(); // Refresh to load progress
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

/**
 * 2. Load User Progress
 * Runs automatically on page load to check off completed items
 */
async function loadUserProgress() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return; // User is not logged in

    try {
        const response = await fetch(`${API_BASE}/api_progress.php`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                updateUIWithProgress(data.completed_tools);
            }
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

/**
 * 3. Toggle Progress
 * Call this when a checkbox is clicked
 */
async function toggleToolProgress(toolId, isCompleted) {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        alert("Please login to save your progress.");
        return;
    }

    await fetch(`${API_BASE}/api_progress.php`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tool_id: toolId, completed: isCompleted })
    });
}

// Helper: Find HTML elements by ID and mark them as done
function updateUIWithProgress(completedTools) {
    completedTools.forEach(toolId => {
        // This assumes your HTML elements have IDs matching the tool IDs (e.g., id="html", id="css")
        const element = document.getElementById(toolId);
        if (element) {
            // Example: Add a class or check a checkbox inside the element
            element.classList.add('completed'); 
            const checkbox = element.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = true;
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadUserProgress);