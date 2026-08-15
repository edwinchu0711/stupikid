import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// 🛡️ 閉包封裝：防止所有變數與資料被外部 F12 Console 訪問
(() => {
    'use strict';

    // 🔒 生產環境 Console 靜音保護 (防止 F12 追蹤輸出與洩漏流程)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log = () => { };
        console.warn = () => { };
        console.info = () => { };
    }

    // 🛡️ 基礎反探查保護 (防右鍵選單與常見 F12 / 檢視原始碼熱鍵)
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
        ) {
            e.preventDefault();
            return false;
        }
    });

    // 🔒 閉包內部私有變數 (外部 window.videos 無法存取)
    let db = null;
    let videos = [];
    let currentVideos = [];
    let recommendedVideos = [];
    let isShowingAll = false;

    // AES 加密後的 Firebase 配置密文
    const encryptedConfig = "U2FsdGVkX18u6/aFtmeJezRT4C46lbrHrB1i2jaxLeAa3fT6Z9FZytSSF3k43cLFJ5EgiICvqx9f+AJAqne4ILaLcMBZQ7zhtKR5SZxa38m+hF9jF9kF3YU0W/B+UFcIjpmQiWyjQEsk1JaxxP4kuG4iYVfoJy/OZh/qFRcCdpEiOjvwJw6eDflA0nihtukmF1kETTcPgZqyFWCfUI6Uo5pl7LDOuEKeY6z4MrjFGmDZPTY9CvNM5/xKC6+jbXF1yV0JhLkG67DjY1vi5CXfls5Z/kocTr67w05qePQ/XaAH2ZzQ9sLAW4qX6hwT4iMU06yLaO3kEhkVFquIaM/Fl25Msr9xZAOeu7Cfv5b2vdFr9jAc9eaebL6C58ydEy4hl0/T4m2ltAXCMzYXrp66AKNqYiYumRejEr/hEBVLIcesJURfrJe0ei9mo/76Zjpxwnwqy3VqQETmJdm0kLH7sg==";

    // 格式化可嵌入播放的 URL (支援 Vimeo / YouTube 多種格式)
    function formatEmbedUrl(url, autoplay = false) {
        if (!url || typeof url !== 'string') return '';
        url = url.trim();
        let embedUrl = url;

        try {
            // 1. 純數字 ID (Vimeo)
            if (/^\d{6,12}$/.test(url)) {
                embedUrl = `https://player.vimeo.com/video/${url}?title=0&byline=0&portrait=0`;
            }
            // 2. Vimeo 完整網址
            else if (url.includes('vimeo.com')) {
                const match = url.match(/(?:video\/|vimeo\.com\/)(\d+)/);
                const videoId = match ? match[1] : url.replace(/[^0-9]/g, '');
                if (videoId) {
                    embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
                }
            }
            // 3. YouTube 格式解析
            else if (url.includes('youtube.com') || url.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(url)) {
                let videoId = '';
                if (url.includes('youtube.com/watch')) {
                    videoId = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1];
                } else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
                } else if (url.includes('youtube.com/embed/')) {
                    videoId = url.split('embed/')[1]?.split('?')[0]?.split('&')[0];
                } else if (url.includes('youtube.com/shorts/')) {
                    videoId = url.split('shorts/')[1]?.split('?')[0]?.split('&')[0];
                } else if (url.includes('youtube.com/live/')) {
                    videoId = url.split('live/')[1]?.split('?')[0]?.split('&')[0];
                } else if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
                    videoId = url;
                }

                if (videoId) {
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                }
            }
        } catch (e) {
            embedUrl = url;
        }

        if (autoplay) {
            const sep = embedUrl.includes('?') ? '&' : '?';
            embedUrl += `${sep}autoplay=1&playsinline=1`;
        }
        return embedUrl;
    }

    // 獲取影片縮圖 URL
    function getVideoThumbnailUrl(src) {
        if (!src || typeof src !== 'string') return '';
        src = src.trim();
        try {
            if (/^\d{6,12}$/.test(src)) {
                return `https://vumbnail.com/${src}.jpg`;
            }
            if (src.includes('vimeo.com')) {
                const match = src.match(/(?:video\/|vimeo\.com\/)(\d+)/);
                const videoId = match ? match[1] : src.replace(/[^0-9]/g, '');
                if (videoId) return `https://vumbnail.com/${videoId}.jpg`;
            }
            if (src.includes('youtube.com') || src.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(src)) {
                let videoId = '';
                if (src.includes('embed/')) videoId = src.split('embed/')[1]?.split('?')[0]?.split('&')[0];
                else if (src.includes('v=')) videoId = src.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1];
                else if (src.includes('youtu.be/')) videoId = src.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
                else if (src.includes('shorts/')) videoId = src.split('shorts/')[1]?.split('?')[0]?.split('&')[0];
                else if (src.includes('live/')) videoId = src.split('live/')[1]?.split('?')[0]?.split('&')[0];
                else if (/^[a-zA-Z0-9_-]{11}$/.test(src)) videoId = src;
                if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }
        } catch (e) { }
        return '';
    }

    // 初始化內容 (密碼驗證解密成功後啟動)
    async function startLoadingContent(config) {
        try {
            const app = initializeApp(config);
            db = getFirestore(app);

            videos = await loadVideosFromFirebase();
            currentVideos = videos;

            generateRecommendedVideos();
            setupSearch();
            setupButtons();
            setupAdminMode();
        } catch (err) {
            // 靜默處理錯誤
        }
    }

    // 從 Firestore 讀取影片列表
    async function loadVideosFromFirebase() {
        try {
            const videosRef = collection(db, 'videos');
            const q = query(videosRef, orderBy('createdAt', 'asc'));
            const querySnapshot = await getDocs(q);

            const loadedVideos = [];
            querySnapshot.forEach((doc) => {
                const videoData = doc.data();
                loadedVideos.push({
                    docId: doc.id,
                    id: videoData.id,
                    title: videoData.title || '未命名影片',
                    src: videoData.src || videoData.url || '',
                    tags: videoData.tags || [],
                    createdAt: videoData.createdAt || null
                });
            });
            return loadedVideos;
        } catch (error) {
            return [];
        }
    }

    // 取得驗證 ID
    async function getPasswordData() {
        try {
            const passwordRef = collection(db, 'password');
            const querySnapshot = await getDocs(passwordRef);
            let passwordData = null;
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                passwordData = { docId: doc.id, id: data.id, pass: data.pass };
            });
            return passwordData;
        } catch (error) {
            return null;
        }
    }

    // 產生推薦影片
    function generateRecommendedVideos() {
        if (videos.length === 0) return;
        const allVideosDesc = [...videos].reverse();
        const latestCount = Math.min(5, allVideosDesc.length);
        const latest5 = allVideosDesc.slice(0, latestCount);
        const remainingVideos = allVideosDesc.slice(latestCount);
        const shuffledRemaining = remainingVideos.sort(() => 0.5 - Math.random());
        const randomExtra = shuffledRemaining.slice(0, Math.max(0, 9 - latestCount));

        recommendedVideos = [...latest5, ...randomExtra];
        renderRecommendedVideos();
    }

    function renderRecommendedVideos() {
        const grid = document.getElementById('recommendedGrid');
        if (!grid) return;
        grid.innerHTML = '';
        recommendedVideos.forEach(video => {
            grid.appendChild(createVideoCard(video));
        });
    }

    function renderAllVideos() {
        const grid = document.getElementById('videoGrid');
        const noResults = document.getElementById('noResults');
        const statsInfo = document.getElementById('statsInfo');
        if (!grid || !noResults || !statsInfo) return;

        grid.innerHTML = '';

        if (currentVideos.length === 0) {
            noResults.classList.remove('hidden');
            statsInfo.textContent = '找不到相關影片';
            return;
        }

        noResults.classList.add('hidden');
        statsInfo.textContent = `顯示 ${currentVideos.length} 部影片`;

        for (let i = currentVideos.length - 1; i >= 0; i--) {
            grid.appendChild(createVideoCard(currentVideos[i]));
        }
    }

    // 建立卡片節點
    function createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.addEventListener('click', () => playVideo(video));

        const embedUrl = formatEmbedUrl(video.src);
        const thumbnailUrl = getVideoThumbnailUrl(video.src);

        const tagsHtml = (video.tags && video.tags.length > 0)
            ? `<div class="video-tags">${video.tags.map(t => `<span class="video-tag">#${t}</span>`).join('')}</div>`
            : '';

        card.innerHTML = `
            <div class="video-thumbnail">
                ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="${video.title}" class="thumb-img" loading="lazy">` : ''}
                <iframe src="${embedUrl}" loading="lazy" tabindex="-1" class="thumb-iframe" style="${thumbnailUrl ? 'display:none;' : ''}"></iframe>
                <div class="play-overlay"><i class="fas fa-play play-icon"></i></div>
            </div>
            <div class="video-meta-row">
                <div class="video-avatar">
                    <i class="fas fa-play"></i>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    ${tagsHtml}
                </div>
            </div>
        `;
        return card;
    }

    // 播放彈窗
    function playVideo(video) {
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        const autoplayUrl = formatEmbedUrl(video.src, true);

        modal.innerHTML = `
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3>${video.title}</h3>
                    <button class="close-modal" id="modalCloseBtn"><i class="fas fa-times"></i></button>
                </div>
                <div class="video-modal-body">
                    <iframe src="${autoplayUrl}" width="100%" height="100%" frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen></iframe>
                </div>
            </div>
        `;

        const closeBtn = modal.querySelector('#modalCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeVideoModal(modal));
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeVideoModal(modal);
        });

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal(modal) {
        const target = modal || document.querySelector('.video-modal');
        if (target) {
            target.remove();
            document.body.style.overflow = 'auto';
        }
    }

    function setupButtons() {
        const viewAllBtn = document.getElementById('viewAllBtn');
        const backBtn = document.getElementById('backBtn');

        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                isShowingAll = true;
                currentVideos = videos;
                document.getElementById('recommendedSection')?.classList.add('hidden');
                document.getElementById('allVideosSection')?.classList.remove('hidden');
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
                renderAllVideos();
            });
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                isShowingAll = false;
                document.getElementById('allVideosSection')?.classList.add('hidden');
                document.getElementById('recommendedSection')?.classList.remove('hidden');
                document.getElementById('noResults')?.classList.add('hidden');
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
                hideAdminButton();
                generateRecommendedVideos();
            });
        }
    }

    async function setupAdminMode() {
        const password = await getPasswordData();
        if (!password) return;
        const adminButton = document.createElement('button');
        adminButton.id = 'adminModeBtn';
        adminButton.className = 'admin-mode-btn hidden';
        adminButton.innerHTML = '<i class="fas fa-crown"></i> 管理員模式';
        adminButton.addEventListener('click', () => {
            window.location.href = `edit.html?i=${password.id * 1865410021}`;
        });

        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) searchContainer.appendChild(adminButton);
    }

    function showAdminButton() {
        const adminBtn = document.getElementById('adminModeBtn');
        if (adminBtn) {
            adminBtn.classList.remove('hidden');
            adminBtn.classList.add('show');
        }
    }

    function hideAdminButton() {
        const adminBtn = document.getElementById('adminModeBtn');
        if (adminBtn) {
            adminBtn.classList.add('hidden');
            adminBtn.classList.remove('show');
        }
    }

    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => performSearch(this.value.trim()), 300);
        });
    }

    function performSearch(query) {
        if (query === '高齊的洞穴') {
            showAdminButton();
            return;
        } else {
            hideAdminButton();
        }

        if (query === '') {
            if (isShowingAll) {
                currentVideos = videos;
                const title = document.getElementById('allVideoTitle');
                if (title) title.innerHTML = '所有影片';
                renderAllVideos();
            }
            return;
        }

        if (!isShowingAll) {
            document.getElementById('recommendedSection')?.classList.add('hidden');
            document.getElementById('allVideosSection')?.classList.remove('hidden');
            isShowingAll = true;
        }

        currentVideos = videos.filter(video =>
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        const title = document.getElementById('allVideoTitle');
        if (title) title.innerHTML = `搜尋結果：${query} (${currentVideos.length}部)`;
        renderAllVideos();
    }

    function setupThemeToggle() {
        const toggleButtons = document.querySelectorAll('.theme-toggle-btn, #themeToggle');
        if (!toggleButtons || toggleButtons.length === 0) return;

        toggleButtons.forEach((btn) => {
            if (btn.dataset.boundTheme) return;
            btn.dataset.boundTheme = 'true';

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', nextTheme);
                localStorage.setItem('stupikid_theme', nextTheme);

                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor) {
                    metaThemeColor.setAttribute('content', nextTheme === 'dark' ? '#090e17' : '#ffffff');
                }
            });
        });
    }

    // =========================================================================
    // 🔐 安全認證類別：移除 localStorage 明文密碼，改為 Session 短期記憶體防護
    // =========================================================================
    class SecurePasswordProtection {
        constructor() {
            // 改用 sessionStorage (關閉瀏覽器分頁即時銷毀，不在硬碟/LocalStorage留存)
            this.sessionStorageKey = '_sk_session_auth';
            this.init();
        }

        init() {
            // 先檢查當前分頁是否有解鎖過
            const cachedConfig = this.getSessionConfig();
            if (cachedConfig) {
                this.unlockContent();
                startLoadingContent(cachedConfig);
            } else {
                this.showPasswordOverlay();
            }
            this.bindEvents();
            setupThemeToggle();
        }

        bindEvents() {
            const passwordInput = document.getElementById('passwordInput');
            const passwordBtn = document.getElementById('passwordBtn');
            const passwordError = document.getElementById('passwordError');

            if (passwordBtn && passwordInput) {
                passwordBtn.addEventListener('click', () => this.tryUnlock(passwordInput.value.trim()));
                passwordInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.tryUnlock(passwordInput.value.trim());
                });
                passwordInput.addEventListener('input', () => passwordError?.classList.remove('show'));
            }
        }

        tryUnlock(inputPassword) {
            if (!inputPassword) return;

            try {
                // 使用 CryptoJS AES 解密
                const bytes = CryptoJS.AES.decrypt(encryptedConfig, inputPassword);
                const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
                const config = JSON.parse(decryptedString);

                if (config && config.apiKey) {
                    // 🛡️ 安全提升：不在 localStorage 存放密碼！只在當前分頁 sessionStorage 存放短期 config
                    this.saveSessionConfig(config);
                    this.unlockContent();

                    const passwordInput = document.getElementById('passwordInput');
                    if (passwordInput) passwordInput.value = '';

                    startLoadingContent(config);
                } else {
                    throw new Error("Invalid config");
                }
            } catch (e) {
                this.showError();
            }
        }

        showError() {
            const passwordInput = document.getElementById('passwordInput');
            const passwordError = document.getElementById('passwordError');
            if (passwordError) passwordError.classList.add('show');
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
                passwordInput.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => passwordInput.style.animation = '', 500);
            }
            this.clearSession();
        }

        // 🛡️ 僅使用 sessionStorage，不存放明文密碼
        saveSessionConfig(config) {
            try {
                sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(config));
                // 清除歷史版本可能殘留的 localStorage 明文
                localStorage.removeItem('stupikid_key');
                localStorage.removeItem('stupikid_session');
            } catch (e) { }
        }

        getSessionConfig() {
            try {
                // 清理舊版本明文
                localStorage.removeItem('stupikid_key');
                localStorage.removeItem('stupikid_session');

                const data = sessionStorage.getItem(this.sessionStorageKey);
                if (!data) return null;
                return JSON.parse(data);
            } catch (e) {
                this.clearSession();
                return null;
            }
        }

        clearSession() {
            sessionStorage.removeItem(this.sessionStorageKey);
            localStorage.removeItem('stupikid_key');
            localStorage.removeItem('stupikid_session');
        }

        showPasswordOverlay() {
            const overlay = document.getElementById('passwordOverlay');
            const mainContent = document.getElementById('mainContent');
            if (overlay) overlay.style.display = 'flex';
            if (mainContent) mainContent.classList.remove('unlocked');
            document.body.style.overflow = 'hidden';
            setTimeout(() => document.getElementById('passwordInput')?.focus(), 100);
        }

        unlockContent() {
            const overlay = document.getElementById('passwordOverlay');
            const mainContent = document.getElementById('mainContent');
            if (overlay) overlay.classList.add('fade-out');
            if (mainContent) mainContent.classList.add('unlocked');
            document.body.style.overflow = 'auto';
            setTimeout(() => {
                if (overlay) overlay.style.display = 'none';
            }, 500);
        }
    }

    // 啟動保護
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new SecurePasswordProtection());
    } else {
        new SecurePasswordProtection();
    }
})();