document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the details page
    if (document.getElementById('details-container')) {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('details-sidebar');
        const overlay = document.getElementById('overlay');
        const urlParams = new URLSearchParams(window.location.search);
        const domainId = urlParams.get('domain');
        const toolId = urlParams.get('tool');

        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });

        if (domainId && toolId) {
            loadToolDetails(domainId, toolId);
        }

        // Tab switching logic for Details Page
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                // Remove active class from all contents
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active class to clicked button
                btn.classList.add('active');

                // Show corresponding content
                const targetId = btn.getAttribute('data-tab');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
    // popup/login variables
    const wrapper = document.querySelector('.wrapper');
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.btn-secondary');
    const closeBtn = document.querySelector('.icon-close');
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const authSection = document.getElementById('auth-section');
    const welcomeMessage = document.getElementById('welcome-message');

    const loginForm = document.querySelector('.form-box.login form');
    const registerForm = document.querySelector('.form-box.register form');

    // Registration handler (sends data to register.php)
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = registerForm.querySelector('input[type="text"]').value.trim();
        const email = registerForm.querySelector('input[type="email"]').value.trim();
        const password = registerForm.querySelector('input[type="password"]').value;
        if (!username || !email || !password) { alert('Please complete the form'); return; }
        
        try {
            const response = await fetch('register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const result = await response.json();
            
            if (result.success) {
                alert('Registration successful! Please log in.');
                wrapper.classList.remove('active'); // switch to login form
                registerForm.reset();
            } else {
                alert(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration.');
        }
    });

    // Login handler (sends data to login.php)
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value.trim();
        const password = loginForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch('login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();

            if (result.success) {
                localStorage.setItem('loggedInUser', JSON.stringify(result.user));
                alert(`Welcome back, ${result.user.username}!`);
                wrapper.classList.remove('active-popup');
                updateUIForLoggedInUser(result.user);
                loginForm.reset();
            } else {
                alert(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login.');
        }
    });

    // popup & links
    registerBtn?.addEventListener('click', (e) => { e.preventDefault(); wrapper.classList.add('active-popup'); wrapper.classList.add('active'); });
    loginBtn?.addEventListener('click', (e) => { e.preventDefault(); wrapper.classList.add('active-popup'); wrapper.classList.remove('active'); });
    closeBtn?.addEventListener('click', () => wrapper.classList.remove('active-popup'));
    registerLink?.addEventListener('click', (e) => { e.preventDefault(); wrapper.classList.add('active'); });
    loginLink?.addEventListener('click', (e) => { e.preventDefault(); wrapper.classList.remove('active'); });

    function updateUIForLoggedInUser(user) {
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${user.username}.`;
        }
        if (authSection) {
            const firstLetter = user.username.charAt(0).toUpperCase();
            authSection.innerHTML = `
                <div id="profile-circle" class="profile-circle">${firstLetter}</div>
                <a href="#" id="logout-btn" style="margin-left: 12px; color: #fff; text-decoration: none; font-size: 1rem;">Logout</a>
            `;
            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('loggedInUser');
                updateUIForLoggedOutUser();
                window.location.reload();
            });
            document.getElementById('profile-circle').addEventListener('click', (e) => {
                e.preventDefault();
                const u = JSON.parse(localStorage.getItem('loggedInUser'));
                alert(`Username: ${u.username}\nEmail: ${u.email}`);
            });
        }
    }

    function updateUIForLoggedOutUser() {
        if (welcomeMessage) {
            welcomeMessage.textContent = 'Find Your Path.';
        }
        if (authSection) {
            authSection.innerHTML = '<a href="#" class="login-btn" data-i18n="login" style="color: inherit; text-decoration: none; font-weight: 600;">Login</a>';
            const newLogin = authSection.querySelector('.login-btn');
            newLogin?.addEventListener('click', (e) => { 
                e.preventDefault(); 
                if(wrapper) {
                    wrapper.classList.add('active-popup'); 
                    wrapper.classList.remove('active'); 
                }
            });
        }
    }

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) updateUIForLoggedInUser(loggedInUser);
    else updateUIForLoggedOutUser();

    // --- Language selector ---
    const langRoot = 'lang';
    const dropdown = document.querySelector('.language-dropdown');
    const langToggle = document.querySelector('.lang-toggle');
    const langList = document.querySelector('.language-list');

    // toggle dropdown
    langToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('open');
        const hidden = dropdown.classList.contains('open') ? 'false' : 'true';
        langList?.setAttribute('aria-hidden', hidden);
    });

    // close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            langList?.setAttribute('aria-hidden', 'true');
        }
    });

    // apply translations to elements with data-i18n
    function applyTranslations(data) {
        // set direction and lang attribute
        if (data.__dir === 'rtl') {
            document.documentElement.setAttribute('dir', 'rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
        }
        document.documentElement.lang = data.__lang || document.documentElement.lang;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (!key) return;
            const value = data[key];
            if (value !== undefined) el.textContent = value;
        });
        // update title if present
        if (data.title) document.title = data.title;
    }

    function loadLanguage(lang) {
        fetch(`${langRoot}/${lang}.json`)
            .then(r => { if (!r.ok) throw new Error('missing lang'); return r.json(); })
            .then(data => {
                localStorage.setItem('site_lang', lang);
                applyTranslations(data);
            })
            .catch(err => console.error('Language load error', err));
    }

    langList?.addEventListener('click', (e) => {
        const li = e.target.closest('li[data-lang]');
        if (!li) return;
        const lang = li.dataset.lang;
        loadLanguage(lang);
        dropdown.classList.remove('open');
        langList?.setAttribute('aria-hidden', 'true');
    });

    // load saved or default language
    const savedLang = localStorage.getItem('site_lang') || 'en';
    loadLanguage(savedLang);

    // Load Leaderboard
    loadLeaderboard();
});
// ... (keep all the code inside DOMContentLoaded) ...

function loadToolDetails(domainId, toolId) {
    fetch('roadmaps.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}. The file roadmaps.json could not be found.`);
            }
            return response.json();
        })
        .then(data => {
            const domain = data[domainId];
            const tool = domain ? domain.tools.find(t => t.id === toolId) : null;

            if (domain && tool) {
                // Populate Sidebar
                const sidebarList = document.getElementById('sidebar-tool-list');
                document.getElementById('sidebar-domain-title').textContent = domain.title;
                sidebarList.innerHTML = '';
                domain.tools.forEach(item => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `details.html?domain=${domainId}&tool=${item.id}`;
                    a.textContent = item.name;
                    if (item.id === toolId) a.classList.add('active');
                    li.appendChild(a);
                    sidebarList.appendChild(li);
                });

                // Populate Main Content
                document.title = `${tool.name} | ${domain.title}`;
                document.getElementById('tool-title').textContent = tool.name;
                document.getElementById('tool-introduction').textContent = tool.introduction;

                // --- Progress Tracking Logic ---
                const user = JSON.parse(localStorage.getItem('loggedInUser'));
                const username = user ? user.username : 'guest';
                const storageKey = `progress_${username}`;
                let savedProgress = JSON.parse(localStorage.getItem(storageKey)) || {};
                const getProgressKey = (type, idx) => `${domainId}_${toolId}_${type}_${idx}`;

                // Progress Bar UI
                let progressContainer = document.getElementById('course-progress-container');
                if (!progressContainer) {
                    progressContainer = document.createElement('div');
                    progressContainer.id = 'course-progress-container';
                    progressContainer.style.cssText = 'margin-bottom: 20px; background: #2d2d2d; border-radius: 8px; padding: 15px; border: 1px solid #444;';
                    progressContainer.innerHTML = `
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:#fff; font-weight:bold;">
                            <span>Course Progress</span>
                            <span id="progress-percentage">0%</span>
                        </div>
                        <div style="width:100%; height:8px; background:#444; border-radius:4px; overflow:hidden;">
                            <div id="progress-fill" style="width:0%; height:100%; background:#4caf50; transition:width 0.3s ease;"></div>
                        </div>
                    `;
                    const intro = document.getElementById('tool-introduction');
                    intro.parentNode.insertBefore(progressContainer, intro.nextSibling);
                }

                const updateProgressBar = () => {
                    const totalItems = tool.courses.length + tool.youtube.length;
                    if (totalItems === 0) return;
                    let completed = 0;
                    tool.courses.forEach((_, i) => { if (savedProgress[getProgressKey('course', i)]) completed++; });
                    tool.youtube.forEach((_, i) => { if (savedProgress[getProgressKey('video', i)]) completed++; });
                    const percent = Math.round((completed / totalItems) * 100);
                    document.getElementById('progress-percentage').textContent = `${percent}%`;
                    document.getElementById('progress-fill').style.width = `${percent}%`;
                };

                const coursesList = document.getElementById('courses-list');
                coursesList.innerHTML = '';
                tool.courses.forEach((course, index) => {
                    const li = document.createElement('li');
                    li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';
                    
                    const a = document.createElement('a');
                    a.href = course.url;
                    a.textContent = course.name;
                    a.target = '_blank';
                    
                    const check = document.createElement('input');
                    check.type = 'checkbox';
                    check.style.cursor = 'pointer';
                    check.checked = !!savedProgress[getProgressKey('course', index)];
                    check.addEventListener('change', () => {
                        if (check.checked) savedProgress[getProgressKey('course', index)] = true;
                        else delete savedProgress[getProgressKey('course', index)];
                        localStorage.setItem(storageKey, JSON.stringify(savedProgress));
                        updateProgressBar();
                    });

                    li.appendChild(a);
                    li.appendChild(check);
                    coursesList.appendChild(li);
                });

                const youtubeContainer = document.getElementById('youtube-embed-container');
                youtubeContainer.innerHTML = '';
                tool.youtube.forEach((video, index) => {
                    let videoId = null;
                    try {
                        const url = new URL(video.url);
                        if (url.hostname === 'youtu.be') {
                            videoId = url.pathname.substring(1);
                        } else if (url.hostname.includes('youtube.com')) {
                            videoId = url.searchParams.get('v');
                        }
                    } catch (e) {
                        console.error("Could not parse YouTube URL: ", video.url);
                    }

                    if (videoId) {
                        const videoWrapper = document.createElement('div');
                        videoWrapper.className = 'video-wrapper';

                        const header = document.createElement('div');
                        header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';

                        const videoTitle = document.createElement('h3');
                        videoTitle.textContent = video.name;
                        videoTitle.style.margin = '0';

                        const check = document.createElement('input');
                        check.type = 'checkbox';
                        check.style.cssText = 'transform: scale(1.5); cursor: pointer;';
                        check.checked = !!savedProgress[getProgressKey('video', index)];
                        check.addEventListener('change', () => {
                            if (check.checked) savedProgress[getProgressKey('video', index)] = true;
                            else delete savedProgress[getProgressKey('video', index)];
                            localStorage.setItem(storageKey, JSON.stringify(savedProgress));
                            updateProgressBar();
                        });

                        header.appendChild(videoTitle);
                        header.appendChild(check);

                        const iframe = document.createElement('iframe');
                        iframe.src = `https://www.youtube.com/embed/${videoId}`;
                        iframe.title = video.name;
                        iframe.frameBorder = "0";
                        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                        iframe.allowFullscreen = true;

                        videoWrapper.appendChild(header);
                        videoWrapper.appendChild(iframe);
                        youtubeContainer.appendChild(videoWrapper);
                    }
                });

                updateProgressBar(); // Initialize progress bar

                // Populate Practice / Compiler Section
                setupPracticeSection(tool);

                // Populate Quiz
                const quizContainer = document.getElementById('quiz-section');
                const quizTabBtn = document.querySelector('.tab-btn[data-tab="quiz-section"]');
                quizContainer.innerHTML = ''; // Clear previous content

                if (tool.quiz && tool.quiz.length > 0) {
                    if (quizTabBtn) quizTabBtn.style.display = 'inline-block';

                    // Level Selector
                    const levelSelector = document.createElement('div');
                    levelSelector.className = 'level-selector';
                    
                    const levels = [
                        { name: 'Beginner', start: 0, end: 5 },
                        { name: 'Intermediate', start: 5, end: 10 },
                        { name: 'Advanced', start: 10, end: 15 }
                    ];

                    const quizContentDiv = document.createElement('div');
                    
                    let hasLevels = false;
                    levels.forEach((level, idx) => {
                        if (tool.quiz.length > level.start) {
                            hasLevels = true;
                            const btn = document.createElement('button');
                            btn.textContent = level.name;
                            btn.className = 'level-btn';
                            btn.type = 'button';
                            if (idx === 0) btn.classList.add('active');
                            
                            btn.addEventListener('click', () => {
                                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                                btn.classList.add('active');
                                renderQuiz(level.start, level.end);
                            });
                            levelSelector.appendChild(btn);
                        }
                    });

                    if (hasLevels) {
                        quizContainer.appendChild(levelSelector);
                    }
                    quizContainer.appendChild(quizContentDiv);

                    function renderQuiz(start, end) {
                        quizContentDiv.innerHTML = '';
                        const questions = tool.quiz.slice(start, end);
                        
                        if (questions.length === 0) {
                            quizContentDiv.innerHTML = '<p>No questions available for this level.</p>';
                            return;
                        }

                        const form = document.createElement('form');
                        form.id = 'quiz-form';

                        questions.forEach((q, index) => {
                            const absoluteIndex = start + index;
                            const qDiv = document.createElement('div');
                            qDiv.className = 'quiz-question';

                            const p = document.createElement('p');
                            p.textContent = `${absoluteIndex + 1}. ${q.question}`;
                            qDiv.appendChild(p);

                            q.options.forEach((opt, optIndex) => {
                                const label = document.createElement('label');
                                const input = document.createElement('input');
                                input.type = 'radio';
                                input.name = `question-${absoluteIndex}`;
                                input.value = optIndex;
                                
                                label.appendChild(input);
                                label.appendChild(document.createTextNode(opt));
                                qDiv.appendChild(label);
                            });
                            form.appendChild(qDiv);
                        });

                        const submitBtn = document.createElement('button');
                        submitBtn.type = 'submit';
                        submitBtn.textContent = 'Check Answers';
                        submitBtn.className = 'btn-primary';
                        submitBtn.style.marginTop = '10px';
                        form.appendChild(submitBtn);

                        const resultDiv = document.createElement('div');
                        resultDiv.id = 'quiz-result';
                        resultDiv.style.marginTop = '15px';
                        resultDiv.style.fontWeight = 'bold';
                        resultDiv.style.color = '#fff';

                        form.addEventListener('submit', (e) => {
                            e.preventDefault();
                            let score = 0;
                            questions.forEach((q, index) => {
                                const absoluteIndex = start + index;
                                const selected = form.querySelector(`input[name="question-${absoluteIndex}"]:checked`);
                                const qDiv = form.querySelectorAll('.quiz-question')[index];
                                
                                // Reset styles
                                qDiv.style.borderColor = 'transparent';
                                
                                if (selected) {
                                    if (parseInt(selected.value) === q.answer) {
                                        score++;
                                        qDiv.style.borderColor = '#7cf03d'; // Green border for correct
                                    } else {
                                        qDiv.style.borderColor = '#ff4d4d'; // Red border for incorrect
                                    }
                                }
                            });
                            resultDiv.textContent = `You scored ${score} out of ${questions.length}`;
                        });

                        quizContentDiv.appendChild(form);
                        quizContentDiv.appendChild(resultDiv);
                    }

                    // Initial render
                    renderQuiz(0, 5);
                } else {
                    if (quizTabBtn) quizTabBtn.style.display = 'none';
                }
            } else {
                document.getElementById('details-container').innerHTML = `<h1>Error: Tool or Domain not found in JSON.</h1>`;
            }
        })
        .catch(error => {
            console.error('Detailed error:', error);
            let userMessage = "Error: Could not fetch roadmap data.";
            if (error instanceof SyntaxError) {
                userMessage = "Error: The 'roadmaps.json' file has a syntax error.";
            } else if (error.message.includes("HTTP error")) {
                userMessage = "Error: The 'roadmaps.json' file could not be found. Check its location.";
            }
            document.getElementById('details-container').innerHTML = `<h1>${userMessage}</h1>`;
        });
}

const guestLevelProgress = {};

async function setupPracticeSection(tool) {
    // 1. Find or Create the Practice Tab Button
    let practiceTabBtn = document.querySelector('.tab-btn[data-tab="practice-section"]');
    const tabContainer = document.querySelector('.tab-btn').parentElement;
    
    if (!practiceTabBtn && tabContainer) {
        practiceTabBtn = document.createElement('button');
        practiceTabBtn.className = 'tab-btn';
        practiceTabBtn.setAttribute('data-tab', 'practice-section');
        practiceTabBtn.textContent = 'Practice';
        
        // Add click event listener for the new button
        practiceTabBtn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            practiceTabBtn.classList.add('active');
            const content = document.getElementById('practice-section');
            if (content) content.classList.add('active');
        });
        
        tabContainer.appendChild(practiceTabBtn);
    }

    // 2. Find or Create the Practice Content Area
    let practiceContent = document.getElementById('practice-section');
    const contentContainer = document.querySelector('.tab-content').parentElement;

    if (!practiceContent && contentContainer) {
        practiceContent = document.createElement('div');
        practiceContent.id = 'practice-section';
        practiceContent.className = 'tab-content';
        contentContainer.appendChild(practiceContent);
    }

    // 3. Populate Content
    if (practiceContent) {
        practiceContent.innerHTML = ''; // Clear previous

        // Try to load from API first (Dynamic Progression)
        const token = localStorage.getItem('jwt_token');
        let apiLevelData = null;

        if (token) {
            try {
                // Add timestamp to prevent caching
                const res = await fetch(`api_practice.php?tool_id=${tool.id}&_=${new Date().getTime()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    if (data.completed_all) {
                        practiceContent.innerHTML = '<div style="padding: 20px; color: #fff;"><h3>🎉 You have completed all levels for this tool!</h3></div>';
                        if (practiceTabBtn) practiceTabBtn.style.display = 'inline-block';
                        return;
                    }
                    apiLevelData = data;
                }
            } catch (e) {
                console.error("API Load error", e);
            }
        }

        if (apiLevelData) {
            if (practiceTabBtn) practiceTabBtn.style.display = 'inline-block';
            renderPracticeLevel(apiLevelData.level, apiLevelData.current_level_number, tool, practiceContent);
        } else {
            // Guest Mode: Use practice_data (all levels) or fallback to practice
            const exercises = tool.practice_data || tool.practice || [];
            
            if (exercises.length > 0) {
                if (practiceTabBtn) practiceTabBtn.style.display = 'inline-block';

                // Initialize guest progress if needed
                if (!guestLevelProgress[tool.id]) {
                    guestLevelProgress[tool.id] = 1;
                }
                
                const currentLevelNum = guestLevelProgress[tool.id];
                const index = currentLevelNum - 1;

                if (index < exercises.length) {
                    renderPracticeLevel(exercises[index], currentLevelNum, tool, practiceContent, true);
                } else {
                    practiceContent.innerHTML = '<div style="padding: 20px; color: #fff;"><h3>🎉 You have completed all available levels!</h3><p>Register to save your progress permanently.</p></div>';
                }
            } else {
                if (practiceTabBtn) practiceTabBtn.style.display = 'inline-block';
                practiceContent.innerHTML = '<div style="padding: 20px; color: #fff;"><h3>Practice Area</h3><p>No practice exercises available for this tool yet. Check back later!</p></div>';
            }
        }
    }
}

async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;

    try {
        const response = await fetch('api_leaderboard.php');
        const data = await response.json();

        if (data.success && data.leaderboard.length > 0) {
            tbody.innerHTML = '';
            data.leaderboard.forEach((user, index) => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #444';
                // Highlight top 3
                const rankColor = index === 0 ? '#FFD700' : (index === 1 ? '#C0C0C0' : (index === 2 ? '#CD7F32' : '#fff'));
                
                tr.innerHTML = `
                    <td style="padding: 12px; color: ${rankColor}; font-weight: bold;">${index + 1}</td>
                    <td style="padding: 12px;">${user.username}</td>
                    <td style="padding: 12px; text-align: right; color: #0ef;">${user.score}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="3" style="padding: 20px; text-align: center;">No records yet. Be the first!</td></tr>';
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        tbody.innerHTML = '<tr><td colspan="3" style="padding: 20px; text-align: center; color: #ff4d4d;">Failed to load leaderboard.</td></tr>';
    }
}

function renderPracticeLevel(exercise, levelNum, tool, container, isStatic = false) {
    container.innerHTML = '';
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    
    editorContainer.innerHTML = `
        <div style="margin-bottom: 15px;">
            <span style="background: #4caf50; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">Level ${levelNum}</span>
        </div>
        <h3 style="color: #fff; margin-bottom: 10px;">${exercise.title}</h3>
        <p style="color: #ccc; margin-bottom: 15px;">${exercise.description}</p>
        <textarea id="code-editor" style="width: 100%; height: 200px; background: #1e1e1e; color: #d4d4d4; border: 1px solid #333; padding: 10px; font-family: monospace; border-radius: 5px;">${exercise.starter_code || exercise.starterCode || ''}</textarea>
        <div style="margin-top: 10px;">
            <button id="run-code-btn" type="button" class="btn-primary">Run Code <i class='bx bx-play'></i></button>
            <button id="next-level-btn" type="button" class="btn-primary" style="margin-left: 10px; background-color: #27ae60; display: none;">Next Level <i class='bx bx-right-arrow-alt'></i></button>
            ${exercise.hint ? `<button id="hint-btn" type="button" class="btn-secondary" style="margin-left: 10px; background-color: #444;">Show Hint <i class='bx bx-bulb'></i></button>` : ''}
            ${exercise.solution ? `<button id="solution-btn" type="button" class="btn-secondary" style="margin-left: 10px; background-color: #e74c3c;">Show Solution <i class='bx bx-check-circle'></i></button>` : ''}
        </div>
        ${exercise.hint ? `<div id="hint-box" style="display: none; margin-top: 15px; padding: 10px; background: #2d2d2d; border-left: 4px solid #f39c12; color: #ddd; font-style: italic;"><strong>Hint:</strong> ${exercise.hint}</div>` : ''}
        ${exercise.solution ? `<div id="solution-box" style="display: none; margin-top: 15px; padding: 10px; background: #2d2d2d; border-left: 4px solid #e74c3c; color: #ddd; font-family: monospace; white-space: pre-wrap;"><strong>Solution:</strong>\n${exercise.solution}</div>` : ''}
        <div id="code-output" style="margin-top: 15px; background: #000; color: #0f0; padding: 10px; border-radius: 5px; min-height: 50px; white-space: pre-wrap; font-family: monospace;"></div>
    `;
    
    container.appendChild(editorContainer);

    const codeEditor = editorContainer.querySelector('#code-editor');
    const outputDiv = editorContainer.querySelector('#code-output');
    const runBtn = editorContainer.querySelector('#run-code-btn');
    const nextBtn = editorContainer.querySelector('#next-level-btn');
    const hintBtn = editorContainer.querySelector('#hint-btn');
    const hintBox = editorContainer.querySelector('#hint-box');
    const solutionBtn = editorContainer.querySelector('#solution-btn');
    const solutionBox = editorContainer.querySelector('#solution-box');

    runBtn.addEventListener('click', async () => {
        await runCompiler(tool.id, codeEditor.value, outputDiv);
        
        // Auto-check answer on run
        const userCode = codeEditor.value.trim();
        const solution = (exercise.solution || '').trim();
        const normalize = s => s.replace(/\s+/g, ' ').trim();
        
        if (normalize(userCode) === normalize(solution)) {
            const successMsg = document.createElement('div');
            successMsg.textContent = "\n✅ Correct! Well done.";
            successMsg.style.color = "#4caf50";
            successMsg.style.fontWeight = "bold";
            outputDiv.appendChild(successMsg);
            
            if (!isStatic) {
                const token = localStorage.getItem('jwt_token');
                if (token) {
                    try {
                        const res = await fetch('api_practice.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ tool_id: tool.id, level_number: levelNum })
                        });
                        const data = await res.json();
                        if (data.success) {
                            nextBtn.style.display = 'inline-block';
                        }
                    } catch(e) { console.error(e); }
                }
            } else {
                // If static (not logged in), just show next button
                nextBtn.style.display = 'inline-block';
            }
        }
    });

    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            const isHidden = hintBox.style.display === 'none';
            hintBox.style.display = isHidden ? 'block' : 'none';
        });
    }

    if (solutionBtn) {
        solutionBtn.addEventListener('click', () => {
            const isHidden = solutionBox.style.display === 'none';
            solutionBox.style.display = isHidden ? 'block' : 'none';
            solutionBtn.innerHTML = isHidden ? `Hide Solution <i class='bx bx-check-circle'></i>` : `Show Solution <i class='bx bx-check-circle'></i>`;
            // Allow proceeding if solution is viewed
            nextBtn.style.display = 'inline-block';
        });
    }

    // Handle Next Level click
    nextBtn.addEventListener('click', () => {
        if (isStatic) {
            if (!guestLevelProgress[tool.id]) guestLevelProgress[tool.id] = 1;
            guestLevelProgress[tool.id]++;
            setupPracticeSection(tool);
        } else {
            setupPracticeSection(tool);
        }
    });
}

async function runCompiler(toolId, code, outputDiv) {
    if (outputDiv) outputDiv.textContent = 'Running...';

    // Map tool IDs to Piston API languages
    const languageMap = {
        'python-prog': 'python',
        'python-ds': 'python',
        'python-backend': 'python',
        'python-for-ml': 'python',
        'java-prog': 'java',
        'cplusplus-prog': 'c++',
        'javascript': 'javascript',
        'nodejs': 'javascript',
        'typescript': 'typescript',
        'php': 'php',
        'sql-mastery': 'sqlite3'
    };

    // 1. Handle HTML/CSS (Client-side rendering)
    if (toolId === 'html' || toolId === 'css') {
        if (outputDiv) outputDiv.innerHTML = ''; // Clear text
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '200px';
        iframe.style.background = '#fff';
        iframe.style.border = 'none';
        if (outputDiv) outputDiv.appendChild(iframe);
        
        const doc = iframe.contentWindow.document;
        doc.open();
        if (toolId === 'css') {
            doc.write(`<style>${code}</style><h1>CSS Test</h1><p>If your CSS is correct, this text should change.</p>`);
        } else {
            doc.write(code);
        }
        doc.close();
        return;
    }

    // 2. Handle Programming Languages via Piston API
    const lang = languageMap[toolId];
    if (!lang) {
        if (outputDiv) outputDiv.textContent = 'Compiler not supported for this tool yet.';
        return;
    }

    try {
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: lang,
                version: '*', 
                files: [{ content: code }]
            })
        });
        const result = await response.json();
        if (outputDiv) outputDiv.textContent = result.run.output || result.message || 'No output';
    } catch (error) {
        if (outputDiv) outputDiv.textContent = 'Error executing code: ' + error.message;
    }
}