/**
 * Practice Mode Logic
 * Handles fetching levels, checking solutions, and progress tracking.
 */

const API_BASE = 'api_practice.php';
let currentToolId = '';
let currentLevelNumber = 0;
let currentSolution = '';

// Helper to get JWT token (assumes you store it in localStorage on login)
const getToken = () => localStorage.getItem('token');

// Initialize Practice Mode
function initPractice(toolId) {
    currentToolId = toolId;
    loadLevel(toolId);
}

// Fetch the current level for a tool from the API
async function loadLevel(toolId) {
    try {
        const token = getToken();
        if (!token) {
            alert("Please login to save progress.");
            return;
        }

        const response = await fetch(`${API_BASE}?tool_id=${toolId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            if (data.completed_all) {
                document.getElementById('practice-container').innerHTML = '<h3>🎉 You have completed all levels for this tool!</h3>';
            } else {
                renderLevel(data.level, data.current_level_number, data.total_levels);
            }
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error loading level:', error);
    }
}

// Render level details into the UI
function renderLevel(level, currentNum, total) {
    // Update UI elements (Ensure these IDs exist in your HTML)
    const titleEl = document.getElementById('level-title');
    const descEl = document.getElementById('level-description');
    const hintEl = document.getElementById('level-hint');
    const codeInput = document.getElementById('code-input'); // Textarea or code editor
    
    if(titleEl) titleEl.textContent = `Level ${currentNum}: ${level.title}`;
    if(descEl) descEl.textContent = level.description;
    if(hintEl) hintEl.textContent = `Hint: ${level.hint}`;
    
    // The DB column is 'starter_code', but JSON might have 'starterCode'
    if(codeInput) codeInput.value = level.starter_code || level.starterCode || '';

    // Store current state
    currentSolution = level.solution;
    currentLevelNumber = currentNum;
    
    // Reset Buttons: Show Submit, Hide Next Level
    toggleButtons('submit');
    
    // Update Progress Bar
    updateProgressBar(currentNum - 1, total);
}

// Check user's answer
async function checkAnswer() {
    const codeInput = document.getElementById('code-input');
    const userCode = codeInput ? codeInput.value : '';
    
    // Simple normalization: remove extra whitespace for comparison
    const normalize = str => str.replace(/\s+/g, ' ').trim();
    
    if (normalize(userCode) === normalize(currentSolution)) {
        alert('Correct! Great job.');
        
        // Save progress to backend
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ tool_id: currentToolId, level_number: currentLevelNumber })
        });
        
        const data = await response.json();
        if (data.success) {
            toggleButtons('next'); // Reveal the Next Level button
        }
    } else {
        alert('Incorrect. Try again!');
    }
}

// Toggle between Submit and Next Level buttons
function toggleButtons(state) {
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-level-btn');
    
    if (state === 'submit') {
        if(submitBtn) submitBtn.style.display = 'inline-block';
        if(nextBtn) nextBtn.style.display = 'none';
    } else {
        if(submitBtn) submitBtn.style.display = 'none';
        if(nextBtn) nextBtn.style.display = 'inline-block';
    }
}

function updateProgressBar(completed, total) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const percent = (completed / total) * 100;
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${Math.round(percent)}%`;
    }
}

// Event Listeners (Attach these in your HTML or here)
document.getElementById('submit-btn')?.addEventListener('click', checkAnswer);
document.getElementById('next-level-btn')?.addEventListener('click', () => loadLevel(currentToolId));