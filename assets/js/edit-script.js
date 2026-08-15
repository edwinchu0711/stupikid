import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
    getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// 🛡️ 閉包封裝：防止管理後台變數與函式暴露給外部 F12 Console
(() => {
    'use strict';

    // 🔒 生產環境 Console 靜音保護
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log = () => {};
        console.warn = () => {};
        console.info = () => {};
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

    // 🔒 閉包私有內部變數
    let app = null;
    let db = null;
    let videos = [];
    let currentEditingTitle = null;
    let currentDeletingTitle = null;

    // AES 加密後的 Firebase 配置密文
    const encryptedConfig = "U2FsdGVkX1/wcjOYaINQtSz1pEOtzMxoyRTImAoQc4XWn66xv92EiHcsV3/DnoxSkyBjgpVYKuMr8xCCaKQpKmqa5WM+eojFE1CEtbj8zjYmCCbt9puyh4uT1e3AW4RCOXWFKbME6+4foTZtFNkBzvQAeEQ02+g031KUCQHgCKEUsLWkqwKCNwlMm0qE9aKpLX60hIk+Ks9MabKcxW/9vTFMOCTrbsf//pyZijVX01sjrh4ViFvnfhXFgO99MxmWAYZHHHO0mxq4Id9KV1QofTSAKh4mYn6g655IEPQZq7LGOMC21hI15jpNgfZgqXd086LyiTs+G+AZKzNXTcF/qCc7XnL/65aAW6iS6yU5Oi4T7eWdBodFGSM+PQ0ny8lQR0jQ8/Ch/02HCPu8ThbyGYnlI9qTKsp+nk6iUOYuq6KMQXJiaizN/tm4Ie5ID5Mu3htQ14dfVbLFKBXCdPC09Q=="; 

    // 初始化管理功能
    async function initializeAdminFeatures(config) {
        try {
            app = initializeApp(config);
            db = getFirestore(app);

            // 驗證 URL 參數 (檢查是否為合法進入點)
            const urlParams = new URLSearchParams(window.location.search);
            const iParam = urlParams.get('i');
            const passwordData = await getPasswordData();
            
            if (passwordData && iParam !== `${passwordData.id * 1865410021}`) {
                window.location.href = 'index.html';
                return;
            }

            await loadVideos();
            setupEventListeners();
            setupVideoSourceToggle();
        } catch (err) {
            // 靜默處理
        }
    }

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

    // 處理 YouTube URL 格式
    function processYouTubeUrl(input) {
        if (!input || typeof input !== 'string') return '';
        input = input.trim();
        let videoId = '';
        try {
            if (input.includes('youtube.com') && input.includes('v=')) {
                const url = new URL(input);
                videoId = url.searchParams.get('v');
            } else if (input.includes('youtu.be/')) {
                videoId = input.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
            } else if (input.includes('youtube.com/embed/')) {
                videoId = input.split('embed/')[1]?.split('?')[0]?.split('&')[0];
            } else if (input.includes('youtube.com/shorts/')) {
                videoId = input.split('shorts/')[1]?.split('?')[0]?.split('&')[0];
            } else if (input.includes('youtube.com/live/')) {
                videoId = input.split('live/')[1]?.split('?')[0]?.split('&')[0];
            } else if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
                videoId = input;
            } else {
                const match = input.match(/[a-zA-Z0-9_-]{11}/);
                if (match) videoId = match[0];
            }

            if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                return `https://www.youtube.com/embed/${videoId}`;
            } else {
                throw new Error('無法識別的 YouTube Video ID');
            }
        } catch (error) {
            const clean = input.replace(/[^a-zA-Z0-9_-]/g, '');
            if (clean.length === 11) return `https://www.youtube.com/embed/${clean}`;
            throw new Error('無法識別的 YouTube URL 格式');
        }
    }

    function processVideoUrl(source, input) {
        if (!input || typeof input !== 'string') return '';
        input = input.trim();
        if (source === 'vimeo') {
            const videoId = input.replace(/[^0-9]/g, ''); 
            return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
        } else if (source === 'youtube') {
            return processYouTubeUrl(input);
        }
        return input; 
    }

    function getVideoSourceFromUrl(url) {
        if (!url || typeof url !== 'string') return 'unknown';
        if (/^\d{6,12}$/.test(url.trim())) return 'vimeo';
        if (url.includes('vimeo')) return 'vimeo';
        if (url.includes('youtube') || url.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return 'youtube';
        return 'unknown';
    }

    function getVideoThumbnail(url) {
        if (!url || typeof url !== 'string') return getDefaultThumbnail();
        url = url.trim();
        try {
            if (/^\d{6,12}$/.test(url)) {
                return `https://vumbnail.com/${url}.jpg`;
            }
            if (url.includes('vimeo.com') || url.includes('player.vimeo.com')) {
                const match = url.match(/(?:video\/|vimeo\.com\/)(\d+)/);
                const videoId = match ? match[1] : url.replace(/[^0-9]/g, '');
                if (videoId) return `https://vumbnail.com/${videoId}.jpg`;
            } else if (url.includes('youtube.com') || url.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(url)) {
                let videoId = '';
                if (url.includes('embed/')) videoId = url.split('embed/')[1]?.split('?')[0]?.split('&')[0];
                else if (url.includes('v=')) videoId = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1];
                else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
                else if (url.includes('shorts/')) videoId = url.split('shorts/')[1]?.split('?')[0]?.split('&')[0];
                else if (/^[a-zA-Z0-9_-]{11}$/.test(url)) videoId = url;
                if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }
        } catch (error) {}
        return getDefaultThumbnail();
    }

    function getDefaultThumbnail() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTYwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMzMzIi8+CjxjaXJjbGUgY3g9IjgwIiBjeT0iNDUiIHI9IjIwIiBmaWxsPSIjNjY2Ii8+Cjxwb2x5Z29uIHBvaW50cz0iNzUsNDAgODUsNDUgNzUsNTAiIGZpbGw9IiNmZmYiLz4KPHN2Zz4K';
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
    // 🔐 後台安全認證類別：移除明文密碼，改為 Session 短期記憶體防護
    // =========================================================================
    class SecurePasswordProtection {
        constructor() {
            this.sessionKey = '_sk_admin_auth';
            this.errorCount = 0; 
            this.init();
        }

        init() {
            const cachedConfig = this.getSessionConfig();
            if (cachedConfig) {
                this.unlockContent();
                initializeAdminFeatures(cachedConfig);
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
            const passwordExitBtn = document.getElementById('passwordExitBtn'); 

            if (passwordBtn) {
                passwordBtn.addEventListener('click', () => this.tryUnlock(passwordInput.value.trim()));
            }
            if (passwordExitBtn) {
                passwordExitBtn.addEventListener('click', () => window.location.href = 'index.html');
            }
            if (passwordInput) {
                passwordInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.tryUnlock(passwordInput.value.trim());
                });
                passwordInput.addEventListener('input', () => {
                    if (passwordError) passwordError.classList.remove('show');
                });
            }
        }

        tryUnlock(inputPassword) {
            if (!inputPassword) return;

            try {
                const bytes = CryptoJS.AES.decrypt(encryptedConfig, inputPassword);
                const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
                const config = JSON.parse(decryptedString);

                if (config && config.apiKey) {
                    this.saveSessionConfig(config);
                    this.errorCount = 0;
                    this.unlockContent();
                    
                    const pwdInput = document.getElementById('passwordInput');
                    if (pwdInput) pwdInput.value = '';

                    initializeAdminFeatures(config);
                } else {
                    throw new Error("Invalid config");
                }
            } catch (e) {
                this.handleError();
            }
        }

        handleError() {
            this.errorCount++;
            if (this.errorCount >= 3) {
                window.location.href = 'index.html';
                return;
            }
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

        // 🛡️ 不儲存明文密碼，僅在分頁 sessionStorage 存放 config 物件
        saveSessionConfig(config) {
            try {
                sessionStorage.setItem(this.sessionKey, JSON.stringify(config));
                localStorage.removeItem('stupikid_admin_key');
            } catch (e) {}
        }

        getSessionConfig() {
            try {
                localStorage.removeItem('stupikid_admin_key');
                const data = sessionStorage.getItem(this.sessionKey);
                if (!data) return null;
                return JSON.parse(data);
            } catch (e) {
                this.clearSession();
                return null;
            }
        }

        clearSession() {
            sessionStorage.removeItem(this.sessionKey);
            localStorage.removeItem('stupikid_admin_key');
        }

        showPasswordOverlay() {
            const overlay = document.getElementById('passwordOverlay');
            if (overlay) {
                overlay.style.display = 'flex';
                setTimeout(() => {
                    document.getElementById('passwordInput')?.focus();
                }, 100);
            }
        }

        unlockContent() {
            const overlay = document.getElementById('passwordOverlay');
            const mainContent = document.getElementById('mainContent');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    if (mainContent) mainContent.classList.add('unlocked');
                }, 500);
            }
        }
    }

    // 影片來源切換
    function setupVideoSourceToggle() {
        const sourceRadios = document.querySelectorAll('input[name="videoSource"]');
        const urlInput = document.getElementById('videoUrl');
        const urlLabel = document.querySelector('label[for="videoUrl"]');

        sourceRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'vimeo') {
                    if (urlLabel) urlLabel.textContent = 'Vimeo 影片 ID 或 網址';
                    if (urlInput) urlInput.placeholder = '例如：1113840188';
                } else {
                    if (urlLabel) urlLabel.textContent = 'YouTube 影片網址或 ID';
                    if (urlInput) urlInput.placeholder = '例如：https://www.youtube.com/watch?v=... 或 11碼ID';
                }
            });
        });
    }

    // 載入影片資料
    async function loadVideos() {
        try {
            const videosRef = collection(db, 'videos');
            const q = query(videosRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            videos = [];
            querySnapshot.forEach((docSnapshot) => {
                const data = docSnapshot.data();
                videos.push({
                    docId: docSnapshot.id, 
                    id: data.id || null, 
                    title: data.title || '未命名影片',
                    url: data.url || data.src || '', 
                    tags: data.tags || [],
                    source: data.source || getVideoSourceFromUrl(data.url || data.src),
                    createdAt: data.createdAt || new Date(),
                    ...data
                });
            });
            
            displayVideos();
            updateVideoCount();
        } catch (error) {
            showNotification('載入影片失敗', 'error');
        }
    }

    function updateVideoCount() {
        const countElement = document.getElementById('videoCount');
        if (countElement) countElement.textContent = videos.length;
    }

    // 顯示影片列表 (使用 data 屬性與事件委派，不掛載全域函式)
    function displayVideos() {
        const videoList = document.getElementById('videoList');
        if (!videoList) return;

        if (videos.length === 0) {
            videoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-video-slash"></i>
                    <h3>尚未建立任何影片</h3>
                    <p>請於上方填寫資訊並新增第一部影片！</p>
                </div>
            `;
            return;
        }

        try {
            videoList.innerHTML = videos.map(video => {
                const targetUrl = video.url || video.src || '';
                const thumbnailUrl = getVideoThumbnail(targetUrl);
                const videoSource = getVideoSourceFromUrl(targetUrl);
                const safeTitle = (video.title || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                
                return `
                    <div class="video-item" data-title="${safeTitle}">
                        <div class="video-thumbnail">
                            <img src="${thumbnailUrl}" alt="${video.title}" onerror="this.src='${getDefaultThumbnail()}'">
                            <div class="play-overlay"><i class="fas fa-play"></i></div>
                            <div class="video-source-badge ${videoSource}">${videoSource}</div>
                        </div>
                        <div class="video-info">
                            <h3 class="video-title">${video.title || '未命名影片'}</h3>
                            <div class="video-url">${targetUrl || '無網址'}</div>
                            <div class="video-tags">
                                ${video.tags && Array.isArray(video.tags) ? 
                                  video.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : ''}
                            </div>
                        </div>
                        <div class="video-actions">
                            <button class="btn-edit" data-action="edit" data-title="${safeTitle}"><i class="fas fa-pen"></i> 編輯</button>
                            <button class="btn-delete" data-action="delete" data-title="${safeTitle}"><i class="fas fa-trash-can"></i> 刪除</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            videoList.innerHTML = '<div class="empty-state"><h3>載入錯誤</h3></div>';
        }
    }

    // 事件監聽與委派
    function setupEventListeners() {
        const addForm = document.getElementById('addVideoForm');
        if (addForm) addForm.addEventListener('submit', handleAddVideo);

        const editForm = document.getElementById('editVideoForm');
        if (editForm) editForm.addEventListener('submit', handleEditVideo);

        const cancelEdit = document.getElementById('cancelEdit');
        if (cancelEdit) cancelEdit.addEventListener('click', () => closeModal('editModal'));

        const confirmDelete = document.getElementById('confirmDelete');
        if (confirmDelete) confirmDelete.addEventListener('click', confirmDeleteAction);

        const cancelDelete = document.getElementById('cancelDelete');
        if (cancelDelete) cancelDelete.addEventListener('click', () => closeModal('deleteModal'));

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);

        // 彈窗關閉按鈕委派
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = btn.closest('.modal');
                if (modal) closeModal(modal.id);
            });
        });

        // 影片列表點擊委派 (編輯 / 刪除)
        const videoList = document.getElementById('videoList');
        if (videoList) {
            videoList.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const action = btn.getAttribute('data-action');
                const title = btn.getAttribute('data-title');
                if (action === 'edit' && title) {
                    editVideo(title);
                } else if (action === 'delete' && title) {
                    deleteVideo(title);
                }
            });
        }

        // 彈窗背景點擊關閉
        document.querySelectorAll('.modal').forEach(modal => {
            let mouseDownTarget = null;
            modal.addEventListener('mousedown', (e) => mouseDownTarget = e.target);
            modal.addEventListener('click', (e) => {
                if (e.target === modal && mouseDownTarget === modal) closeModal(modal.id);
            });
        });
    }

    // 新增影片
    async function handleAddVideo(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const source = formData.get('videoSource');
        const urlInput = formData.get('videoUrl');
        const title = formData.get('videoTitle');
        const tagsInput = formData.get('videoTags');

        if (!urlInput || !title) return showNotification('請填寫所有必填欄位', 'error');
        if (videos.find(v => v.title === title)) return showNotification('影片標題已存在', 'error');

        try {
            let processedUrl = processVideoUrl(source, urlInput);
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            await addDoc(collection(db, 'videos'), {
                title: title,
                url: processedUrl,  
                src: processedUrl,  
                tags: tags,
                source: source,
                createdAt: new Date()
            });
            
            showNotification('影片新增成功！', 'success');
            e.target.reset();
            await loadVideos();
        } catch (error) {
            showNotification('新增影片失敗: ' + error.message, 'error');
        }
    }

    // 編輯影片
    function editVideo(videoTitle) {
        const decodedTitle = videoTitle.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        const video = videos.find(v => v.title === decodedTitle);
        if (!video) return showNotification('找不到要編輯的影片', 'error');

        currentEditingTitle = decodedTitle;
        const titleInput = document.getElementById('editVideoTitle');
        const urlInput = document.getElementById('editVideoUrl');
        const tagsInput = document.getElementById('editVideoTags');

        if (titleInput) titleInput.value = video.title || '';
        if (urlInput) urlInput.value = video.url || video.src || '';
        if (tagsInput) tagsInput.value = video.tags ? video.tags.join(', ') : '';

        showModal('editModal');
    }

    // 處理編輯儲存
    async function handleEditVideo(e) {
        e.preventDefault();
        if (!currentEditingTitle) return;

        const formData = new FormData(e.target);
        const newTitle = formData.get('editVideoTitle');
        const urlInput = formData.get('editVideoUrl');
        const tagsInput = formData.get('editVideoTags');

        if (!newTitle || !urlInput) return showNotification('請填寫所有必填欄位', 'error');

        if (newTitle !== currentEditingTitle && videos.find(v => v.title === newTitle)) {
            return showNotification('新標題已存在', 'error');
        }

        try {
            const video = videos.find(v => v.title === currentEditingTitle);
            let processedUrl = processVideoUrl(getVideoSourceFromUrl(urlInput), urlInput);
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            await updateDoc(doc(db, 'videos', video.docId), {
                title: newTitle,
                url: processedUrl,
                src: processedUrl,
                tags: tags,
                source: getVideoSourceFromUrl(processedUrl),
                updatedAt: new Date()
            });
            
            showNotification('影片更新成功！', 'success');
            closeModal('editModal');
            await loadVideos();
        } catch (error) {
            showNotification('更新影片失敗: ' + error.message, 'error');
        }
    }

    // 刪除影片
    function deleteVideo(videoTitle) {
        const decodedTitle = videoTitle.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        const video = videos.find(v => v.title === decodedTitle);
        if (!video) return;

        currentDeletingTitle = decodedTitle;
        const target = document.getElementById('deleteVideoTitle');
        if (target) target.textContent = video.title || '未命名影片';
        showModal('deleteModal');
    }

    // 確認刪除
    async function confirmDeleteAction() {
        if (!currentDeletingTitle) return;
        try {
            const video = videos.find(v => v.title === currentDeletingTitle);
            await deleteDoc(doc(db, 'videos', video.docId));
            
            showNotification('影片刪除成功！', 'success');
            closeModal('deleteModal');
            await loadVideos();
        } catch (error) {
            showNotification('刪除影片失敗: ' + error.message, 'error');
        }
    }

    // 工具函式
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (modalId === 'editModal') currentEditingTitle = null;
        if (modalId === 'deleteModal') currentDeletingTitle = null;
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i> <span>${message}</span>`;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 300);
        }, 3000);
    }

    // 登出功能
    function logout() {
        sessionStorage.removeItem('_sk_admin_auth');
        localStorage.removeItem('stupikid_admin_key');
        window.location.href = 'index.html';
    }

    // 啟動管理端保護
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new SecurePasswordProtection());
    } else {
        new SecurePasswordProtection();
    }
})();