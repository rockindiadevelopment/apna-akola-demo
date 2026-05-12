// ==================== STATE & CONFIG ====================
const ADMIN_CREDS = { username: 'admin', password: 'akola@123' };
const STORAGE_KEY = 'apnaAkolaNews';
const THEME_KEY = 'apnaAkolaTheme';

let newsData = [];
let currentCategory = 'All';
let isAdmin = false;
let firebaseReady = false;
let db = null;

// ==================== FIREBASE CONFIG ====================
// 🔥 SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Click "Add Project" → name it "apna-akola" → Continue
// 3. In the project dashboard, click the Web icon "</>" to add a web app
// 4. Copy the firebaseConfig object and paste it below
// 5. Go to "Realtime Database" → "Create Database" → choose "Start in TEST mode"
// 6. Done! Your news will now sync across all devices.

const firebaseConfig = {
    // ⬇️ PASTE YOUR FIREBASE CONFIG HERE ⬇️
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// ==================== FIREBASE INIT ====================
function initFirebase() {
    try {
        // Check if config is filled in
        if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
            console.warn('⚠️ Firebase config not set. Using localStorage only (no cross-device sync).');
            console.warn('📋 To enable sync, follow the setup instructions in app.js');
            return false;
        }
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        firebaseReady = true;
        console.log('✅ Firebase connected! Cross-device sync is active.');
        return true;
    } catch (err) {
        console.error('Firebase init error:', err);
        return false;
    }
}

// ==================== FIREBASE CRUD ====================
function firebaseSaveNews() {
    if (!firebaseReady || !db) return;
    db.ref('news').set(newsData).catch(err => {
        console.error('Firebase save error:', err);
    });
}

function firebaseListenForChanges() {
    if (!firebaseReady || !db) return;
    db.ref('news').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && Array.isArray(data)) {
            newsData = data;
            // Also cache in localStorage for offline access
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newsData));
            renderUserNews();
            updateTicker();
            if (isAdmin) renderAdminTable();
        } else if (data === null) {
            // Database is empty, push seed data
            newsData = [...seedNews];
            firebaseSaveNews();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newsData));
            renderUserNews();
            updateTicker();
        }
    });
}

// ==================== SEED DATA ====================
const seedNews = [
    {
        id: Date.now() - 50000,
        title: 'Akola Municipal Corporation Launches Smart City Phase-II Project',
        category: 'Local',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
        content: 'The Akola Municipal Corporation has officially announced the second phase of its Smart City project, focusing on digital infrastructure, improved water supply systems, and modernized public transport. The project is expected to benefit over 5 lakh residents.\n\nKey highlights include:\n• Installation of 500+ smart CCTV cameras\n• Wi-Fi enabled public spaces\n• Upgraded drainage and sewage systems\n• New electric bus routes connecting major areas\n\nThe estimated budget for Phase-II is Rs. 850 crores, with completion targeted by 2028.',
        date: new Date(Date.now() - 86400000).toISOString(),
        breaking: true
    },
    {
        id: Date.now() - 40000,
        title: 'Akola District Cricket Team Wins Vidarbha Trophy',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80',
        content: 'In a thrilling final match, the Akola District Cricket Team has clinched the prestigious Vidarbha Trophy, defeating Nagpur by 45 runs at the VCA Stadium.\n\nCaptain Rahul Deshmukh scored a brilliant 127 runs off 134 balls, earning the Player of the Match award. The team\'s bowling attack, led by fast bowler Akash Patil who took 4 wickets, proved decisive in the victory.\n\nThis is Akola\'s third Vidarbha Trophy win in the last decade, marking a significant milestone for cricket in the district.',
        date: new Date(Date.now() - 172800000).toISOString(),
        breaking: false
    },
    {
        id: Date.now() - 30000,
        title: 'New Education Hub Planned Near Akola Railway Station',
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=600&q=80',
        content: 'A major education hub featuring coaching centers, a digital library, and skill development workshops is being planned near the Akola Railway Station area.\n\nThe project, backed by the state education department, aims to provide accessible learning resources to students from rural and semi-urban backgrounds. The hub will feature:\n\n• A 3-floor digital library with 10,000+ books\n• Free coding and AI workshops\n• Competitive exam preparation centers\n• Career counseling services\n\nConstruction is set to begin in Q3 2026.',
        date: new Date(Date.now() - 259200000).toISOString(),
        breaking: false
    },
    {
        id: Date.now() - 20000,
        title: 'Local Entrepreneurs Launch Organic Farming Collective in Akola',
        category: 'Business',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
        content: 'A group of young entrepreneurs from Akola has launched an organic farming collective, connecting local farmers directly with consumers through a mobile app.\n\nThe initiative, named "Akola Green," currently supports over 200 farmers and delivers fresh organic produce to doorsteps across the city. The collective also conducts free workshops on sustainable farming techniques.\n\nThe project has received recognition from the Maharashtra Agricultural Board and is being considered as a model for other districts.',
        date: new Date(Date.now() - 345600000).toISOString(),
        breaking: false
    }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();

    // Try Firebase first, fall back to localStorage
    const fbOk = initFirebase();

    loadNews(); // Load from localStorage (immediate, no delay)
    renderUserNews();
    updateTicker();

    if (fbOk) {
        // Listen for real-time changes from Firebase
        firebaseListenForChanges();
    }
});

// ==================== THEME ====================
function loadTheme() {
    // ALWAYS force dark mode on all devices
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    updateThemeIcons();
}

function toggleTheme() {
    // Toggle still works if user wants light mode temporarily
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    if (!isDark) {
        document.documentElement.classList.add('light');
    } else {
        document.documentElement.classList.remove('light');
    }
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    document.getElementById('icon-sun').classList.toggle('hidden', !isDark);
    document.getElementById('icon-moon').classList.toggle('hidden', isDark);
}

// ==================== STORAGE ====================
function loadNews() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        newsData = JSON.parse(stored);
    } else {
        newsData = [...seedNews];
        saveNews();
    }
}

function saveNews() {
    // Always save to localStorage (offline cache)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newsData));
    // Also push to Firebase for cross-device sync
    firebaseSaveNews();
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const colors = {
        success: 'from-green-500 to-emerald-600',
        error: 'from-red-500 to-rose-600',
        info: 'from-brand-500 to-brand-600'
    };
    const icons = {
        success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
        error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
        info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
    };

    const toast = document.createElement('div');
    toast.className = `toast-enter flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r ${colors[type]} text-white shadow-2xl min-w-[280px] max-w-sm`;
    toast.innerHTML = `
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icons[type]}</svg>
        <p class="text-sm font-semibold flex-1">${message}</p>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==================== VIEW SWITCHING ====================
function showView(view) {
    const views = ['view-user', 'view-login', 'view-admin'];
    views.forEach(v => {
        const el = document.getElementById(v);
        el.classList.add('hidden');
        if (v === 'view-login') el.classList.remove('flex');
    });

    if (view === 'user') {
        document.getElementById('view-user').classList.remove('hidden');
        document.getElementById('btn-admin-login').classList.remove('hidden');
        document.getElementById('btn-admin-logout').classList.add('hidden');
        document.getElementById('ticker-bar').classList.remove('hidden');
        isAdmin = false;
        renderUserNews();
    } else if (view === 'login') {
        const loginView = document.getElementById('view-login');
        loginView.classList.remove('hidden');
        loginView.classList.add('flex');
        document.getElementById('ticker-bar').classList.add('hidden');
    } else if (view === 'admin') {
        document.getElementById('view-admin').classList.remove('hidden');
        document.getElementById('btn-admin-login').classList.add('hidden');
        document.getElementById('btn-admin-logout').classList.remove('hidden');
        document.getElementById('ticker-bar').classList.add('hidden');
        isAdmin = true;
        renderAdminTable();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== AUTH ====================
function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorEl = document.getElementById('login-error');

    if (user === ADMIN_CREDS.username && pass === ADMIN_CREDS.password) {
        errorEl.classList.add('hidden');
        document.getElementById('login-form').reset();
        showView('admin');
        showToast('Welcome back, Admin!', 'success');
    } else {
        errorEl.classList.remove('hidden');
        showToast('Invalid credentials!', 'error');
    }
}

function logoutAdmin() {
    isAdmin = false;
    showView('user');
    showToast('Logged out successfully', 'info');
}

// ==================== TICKER ====================
function updateTicker() {
    const ticker = document.getElementById('ticker-text');
    const breakingNews = newsData.filter(n => n.breaking);
    if (breakingNews.length === 0) {
        ticker.textContent = '🔴 Welcome to Apna Akola – Your trusted local news source. Stay tuned for updates!';
    } else {
        ticker.textContent = breakingNews.map(n => `🔴 ${n.title}`).join('   •   ');
    }
}

// ==================== CATEGORY FILTER ====================
function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active-cat', btn.dataset.cat === cat);
    });
    renderUserNews();
}

// ==================== RENDER USER NEWS ====================
function renderUserNews() {
    const grid = document.getElementById('news-grid');
    const empty = document.getElementById('empty-state');
    const filtered = currentCategory === 'All' ? newsData : newsData.filter(n => n.category === currentCategory);

    // Sort by date, newest first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    grid.innerHTML = filtered.map((news, i) => {
        const date = new Date(news.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const catColors = {
            Local: 'bg-emerald-500', Politics: 'bg-violet-500', Sports: 'bg-orange-500',
            Education: 'bg-blue-500', Business: 'bg-amber-500', Entertainment: 'bg-pink-500'
        };
        const fallbackImg = `https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=600&q=80`;
        return `
            <article class="news-card animate-card-in bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/40 overflow-hidden cursor-pointer group"
                     style="animation-delay: ${i * 80}ms" onclick="openReadModal(${news.id})">
                <div class="relative overflow-hidden h-48">
                    <img src="${news.image || fallbackImg}" alt="${news.title}" class="card-image w-full h-full object-cover"
                         onerror="this.src='${fallbackImg}'">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${catColors[news.category] || 'bg-slate-500'}">
                        ${news.category}
                    </span>
                    ${news.breaking ? '<span class="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500 text-white animate-pulse">Breaking</span>' : ''}
                </div>
                <div class="p-5">
                    <p class="text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium">${date}</p>
                    <h3 class="text-lg font-bold leading-snug mb-3 line-clamp-2 group-hover:text-brand-500 transition-colors duration-300">${news.title}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">${news.content.substring(0, 120)}...</p>
                    <span class="inline-flex items-center gap-1.5 text-brand-500 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                        Read More
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </span>
                </div>
            </article>`;
    }).join('');
}

// ==================== READ MORE MODAL ====================
function openReadModal(id) {
    const news = newsData.find(n => n.id === id);
    if (!news) return;

    const fallbackImg = `https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=600&q=80`;
    document.getElementById('modal-img').src = news.image || fallbackImg;
    document.getElementById('modal-img').onerror = function() { this.src = fallbackImg; };
    document.getElementById('modal-cat').textContent = news.category;
    document.getElementById('modal-title').textContent = news.title;
    document.getElementById('modal-body').textContent = news.content;
    document.getElementById('modal-date').textContent = new Date(news.date).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const modal = document.getElementById('modal-read');
    const content = document.getElementById('modal-content');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Trigger animation
    requestAnimationFrame(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('modal-animate-in');
    });
    document.body.style.overflow = 'hidden';
}

function closeReadModal() {
    const modal = document.getElementById('modal-read');
    const content = document.getElementById('modal-content');
    content.classList.add('scale-95', 'opacity-0');
    content.classList.remove('modal-animate-in');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
    document.body.style.overflow = '';
}

function closeModalOutside(e) {
    if (e.target === document.getElementById('modal-read')) {
        closeReadModal();
    }
}

// ==================== ADMIN: POST FORM ====================
function openPostForm(editId = null) {
    const wrapper = document.getElementById('post-form-wrapper');
    const heading = document.getElementById('form-heading');
    const form = document.getElementById('post-form');

    wrapper.classList.remove('hidden');
    document.getElementById('image-preview-box').classList.add('hidden');

    if (editId) {
        const news = newsData.find(n => n.id === editId);
        if (!news) return;
        heading.textContent = 'Edit Post';
        document.getElementById('edit-id').value = editId;
        document.getElementById('post-title').value = news.title;
        document.getElementById('post-category').value = news.category;
        document.getElementById('post-image').value = news.image || '';
        document.getElementById('post-content').value = news.content;
        if (news.image) previewImage(news.image);
    } else {
        heading.textContent = 'Add New Post';
        form.reset();
        document.getElementById('edit-id').value = '';
    }
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closePostForm() {
    document.getElementById('post-form-wrapper').classList.add('hidden');
    document.getElementById('post-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('image-preview-box').classList.add('hidden');
}

function previewImage(url) {
    const box = document.getElementById('image-preview-box');
    const img = document.getElementById('image-preview');
    if (url && url.trim()) {
        img.src = url;
        img.onerror = () => box.classList.add('hidden');
        img.onload = () => box.classList.remove('hidden');
    } else {
        box.classList.add('hidden');
    }
}

function handlePostSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-id').value;
    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const image = document.getElementById('post-image').value.trim();
    const content = document.getElementById('post-content').value.trim();

    if (editId) {
        // Edit existing
        const idx = newsData.findIndex(n => n.id === parseInt(editId));
        if (idx !== -1) {
            newsData[idx] = { ...newsData[idx], title, category, image, content };
            showToast('Post updated successfully!', 'success');
        }
    } else {
        // Add new
        const newPost = {
            id: Date.now(),
            title, category, image, content,
            date: new Date().toISOString(),
            breaking: false
        };
        newsData.unshift(newPost);
        showToast('🎉 New Update in Apna Akola!', 'info');
    }

    saveNews();
    updateTicker();
    closePostForm();
    renderAdminTable();
}

// ==================== ADMIN: TABLE ====================
function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    const emptyEl = document.getElementById('admin-empty');

    if (newsData.length === 0) {
        tbody.innerHTML = '';
        emptyEl.classList.remove('hidden');
        return;
    }

    emptyEl.classList.add('hidden');
    const sorted = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sorted.map(news => {
        const date = new Date(news.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const catColors = {
            Local: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
            Politics: 'text-violet-500 bg-violet-50 dark:bg-violet-500/10',
            Sports: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
            Education: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
            Business: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
            Entertainment: 'text-pink-500 bg-pink-50 dark:bg-pink-500/10'
        };
        return `
            <tr class="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        ${news.image ? `<img src="${news.image}" class="w-10 h-10 rounded-xl object-cover flex-shrink-0 hidden sm:block" onerror="this.style.display='none'">` : ''}
                        <span class="font-semibold line-clamp-1">${news.title}</span>
                    </div>
                </td>
                <td class="px-6 py-4 hidden sm:table-cell">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${catColors[news.category] || 'text-slate-500 bg-slate-100 dark:bg-slate-800'}">${news.category}</span>
                </td>
                <td class="px-6 py-4 text-slate-400 text-xs hidden md:table-cell">${date}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="toggleBreaking(${news.id})" class="action-btn p-2 rounded-xl ${news.breaking ? 'bg-red-100 dark:bg-red-500/20 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'} hover:scale-110" title="${news.breaking ? 'Remove Breaking' : 'Mark Breaking'}">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>
                        </button>
                        <button onclick="openPostForm(${news.id})" class="action-btn p-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 hover:scale-110" title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onclick="deletePost(${news.id})" class="action-btn p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:scale-110" title="Delete">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

// ==================== ADMIN: ACTIONS ====================
function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    newsData = newsData.filter(n => n.id !== id);
    saveNews();
    updateTicker();
    renderAdminTable();
    showToast('Post deleted', 'error');
}

function toggleBreaking(id) {
    const news = newsData.find(n => n.id === id);
    if (news) {
        news.breaking = !news.breaking;
        saveNews();
        updateTicker();
        renderAdminTable();
        showToast(news.breaking ? 'Marked as Breaking News!' : 'Removed from Breaking', 'info');
    }
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeReadModal();
});
