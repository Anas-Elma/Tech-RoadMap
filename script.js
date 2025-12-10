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
                <a href="#" id="logout-btn" style="margin-left: 12px; color: inherit; text-decoration: none; font-size: 1rem;">Logout</a>
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

                const coursesList = document.getElementById('courses-list');
                coursesList.innerHTML = '';
                tool.courses.forEach(course => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = course.url;
                    a.textContent = course.name;
                    a.target = '_blank';
                    li.appendChild(a);
                    coursesList.appendChild(li);
                });

                const youtubeContainer = document.getElementById('youtube-embed-container');
                youtubeContainer.innerHTML = '';
                tool.youtube.forEach(video => {
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

                        const videoTitle = document.createElement('h3');
                        videoTitle.textContent = video.name;

                        const iframe = document.createElement('iframe');
                        iframe.src = `https://www.youtube.com/embed/${videoId}`;
                        iframe.title = video.name;
                        iframe.frameBorder = "0";
                        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                        iframe.allowFullscreen = true;

                        videoWrapper.appendChild(videoTitle);
                        videoWrapper.appendChild(iframe);
                        youtubeContainer.appendChild(videoWrapper);
                    }
                });

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