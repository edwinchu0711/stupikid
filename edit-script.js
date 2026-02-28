import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// 全域變數
let app;
let db;
let videos = [];
let currentEditingTitle = null;
let currentDeletingTitle = null;



// 👇 最終你的程式碼只要留下這個變數，引號裡面貼上亂碼 (和 index.js 用的亂碼是同一組)
let encryptedConfig = "U2FsdGVkX1/wcjOYaINQtSz1pEOtzMxoyRTImAoQc4XWn66xv92EiHcsV3/DnoxSkyBjgpVYKuMr8xCCaKQpKmqa5WM+eojFE1CEtbj8zjYmCCbt9puyh4uT1e3AW4RCOXWFKbME6+4foTZtFNkBzvQAeEQ02+g031KUCQHgCKEUsLWkqwKCNwlMm0qE9aKpLX60hIk+Ks9MabKcxW/9vTFMOCTrbsf//pyZijVX01sjrh4ViFvnfhXFgO99MxmWAYZHHHO0mxq4Id9KV1QofTSAKh4mYn6g655IEPQZq7LGOMC21hI15jpNgfZgqXd086LyiTs+G+AZKzNXTcF/qCc7XnL/65aAW6iS6yU5Oi4T7eWdBodFGSM+PQ0ny8lQR0jQ8/Ch/02HCPu8ThbyGYnlI9qTKsp+nk6iUOYuq6KMQXJiaizN/tm4Ie5ID5Mu3htQ14dfVbLFKBXCdPC09Q=="; 



// 🚀 初始化管理功能 (只有 AES 密碼解密成功後才會呼叫)
async function initializeAdminFeatures(config) {
    console.log('🔓 密碼正確，開始連線資料庫...');
    app = initializeApp(config);
    db = getFirestore(app);

    // 驗證 URL 參數 (檢查是否為合法進入點)
    const urlParams = new URLSearchParams(window.location.search);
    const iParam = urlParams.get('i');
    const passwordData = await getPasswordData();
    
    if (passwordData && iParam !== `${passwordData.id*1865410021}`) {
        console.warn('URL 驗證失敗，返回首頁');
        window.location.href = 'index.html';
        return;
    }

    await loadVideos();
    setupEventListeners();
    setupVideoSourceToggle();
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
        console.error('取得密碼資料失敗:', error);
        return null;
    }
}

// 🎬 專門處理 YouTube URL 的函數 (維持原邏輯)
function processYouTubeUrl(input) {
    input = input.trim();
    let videoId = '';
    try {
        if (input.includes('youtube.com') && input.includes('v=')) {
            const url = new URL(input);
            videoId = url.searchParams.get('v');
        } else if (input.includes('youtu.be/')) {
            videoId = input.split('youtu.be/')[1].split('?')[0].split('&')[0];
        } else if (input.includes('youtube.com/embed/')) {
            videoId = input.split('embed/')[1].split('?')[0].split('&')[0];
        } else if (input.match(/^[a-zA-Z0-9_-]{11}$/)) {
            videoId = input;
        } else {
            const patterns = [
                /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
                /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
                /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
            ];
            for (const pattern of patterns) {
                const match = input.match(pattern);
                if (match) {
                    videoId = match[1];
                    break;
                }
            }
        }
        if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            return `https://www.youtube.com/embed/${videoId}`;
        } else {
            throw new Error('無法提取有效的 YouTube Video ID');
        }
    } catch (error) {
        return handleYouTubeUrlFallback(input);
    }
}

function handleYouTubeUrlFallback(input) {
    const cleanInput = input.replace(/[^a-zA-Z0-9_-]/g, '');
    const possibleIds = cleanInput.match(/[a-zA-Z0-9_-]{11}/g);
    if (possibleIds && possibleIds.length > 0) {
        return `https://www.youtube.com/embed/${possibleIds[0]}`;
    }
    throw new Error('無法識別的 YouTube URL 格式');
}

function processVideoUrl(source, input) {
    if (!input || typeof input !== 'string') return '';
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
    if (url.includes('vimeo')) return 'vimeo';
    if (url.includes('youtube')) return 'youtube';
    return 'unknown';
}

function getVideoThumbnail(url) {
    if (!url || typeof url !== 'string') return getDefaultThumbnail();
    try {
        if (url.includes('player.vimeo.com')) {
            const videoId = url.match(/video\/(\d+)/)?.[1];
            if (videoId) return `https://vumbnail.com/${videoId}.jpg`;
        } else if (url.includes('youtube.com/embed/')) {
            const videoId = url.split('embed/')[1]?.split('?')[0];
            if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
    } catch (error) {}
    return getDefaultThumbnail();
}

function getDefaultThumbnail() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTYwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMzMzIi8+CjxjaXJjbGUgY3g9IjgwIiBjeT0iNDUiIHI9IjIwIiBmaWxsPSIjNjY2Ii8+Cjxwb2x5Z29uIHBvaW50cz0iNzUsNDAgODUsNDUgNzUsNTAiIGZpbGw9IiNmZmYiLz4KPHN2Zz4K';
}

// === 🔐 核心安全防護類別 ===
class SecurePasswordProtection {
    constructor() {
        // 管理員的儲存 Key
        this.sessionKey = 'stupikid_admin_key'; 
        this.sessionDuration = 30 * 60 * 1000;
        this.isUnlocked = false;
        this.errorCount = 0; 
        this.init();
    }

    init() {
        const savedPassword = this.getValidSessionPassword();
        if (savedPassword) {
            this.tryUnlock(savedPassword);
        } else {
            this.showPasswordOverlay();
        }
        this.bindEvents();
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
        try {
            // 嘗試用輸入的密碼解密 AES 亂碼
            const bytes = CryptoJS.AES.decrypt(encryptedConfig, inputPassword);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
            const config = JSON.parse(decryptedString);

            if (config.apiKey) {
                // 解密成功
                this.saveSessionPassword(inputPassword);
                this.errorCount = 0;
                this.unlockContent();
                
                const pwdInput = document.getElementById('passwordInput');
                if (pwdInput) pwdInput.value = '';

                // 啟動 Firebase 和載入影片
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
        sessionStorage.removeItem(this.sessionKey);
    }

    saveSessionPassword(password) {
        const authData = {
            timestamp: Date.now(),
            pass: password
        };
        // 管理員介面使用 sessionStorage 比較安全 (關閉分頁就登出)
        sessionStorage.setItem(this.sessionKey, JSON.stringify(authData));
    }

    getValidSessionPassword() {
        const authData = sessionStorage.getItem(this.sessionKey);
        if (!authData) return null;
        try {
            const parsed = JSON.parse(authData);
            if (Date.now() - parsed.timestamp < this.sessionDuration) {
                return parsed.pass;
            } else {
                sessionStorage.removeItem(this.sessionKey);
                return null;
            }
        } catch (e) {
            sessionStorage.removeItem(this.sessionKey);
            return null;
        }
    }

    showPasswordOverlay() {
        const overlay = document.getElementById('passwordOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            setTimeout(() => {
                const passwordInput = document.getElementById('passwordInput');
                if (passwordInput) passwordInput.focus();
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
                this.isUnlocked = true;
            }, 500);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new SecurePasswordProtection();
});

// 📹 影片來源切換設定
function setupVideoSourceToggle() {
    const sourceRadios = document.querySelectorAll('input[name="videoSource"]');
    const urlInput = document.getElementById('videoUrl');
    const urlLabel = document.querySelector('label[for="videoUrl"]');

    sourceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'vimeo') {
                urlLabel.textContent = 'Vimeo 影片 ID';
                urlInput.placeholder = '例如：1113840188';
            } else {
                urlLabel.textContent = 'YouTube 影片網址';
                urlInput.placeholder = '例如：https://www.youtube.com/watch?v=...';
            }
        });
    });
}

// 📂 載入影片資料
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
                source: data.source || 'unknown',
                createdAt: data.createdAt || new Date(),
                ...data
            });
        });
        
        displayVideos();
        updateVideoCount();
    } catch (error) {
        showNotification('載入影片失敗: ' + error.message, 'error');
    }
}

function updateVideoCount() {
    const countElement = document.getElementById('videoCount');
    if (countElement) countElement.textContent = videos.length;
}

// 🎬 顯示影片列表
function displayVideos() {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;

    if (videos.length === 0) {
        videoList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-video-slash"></i>
                <h3>還沒有影片</h3>
                <p>新增第一部影片開始吧！</p>
            </div>
        `;
        return;
    }

    try {
        videoList.innerHTML = videos.map(video => {
            const thumbnailUrl = getVideoThumbnail(video.url || video.src);
            const videoSource = getVideoSourceFromUrl(video.url || video.src);
            const safeTitle = (video.title || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            
            return `
                <div class="video-item" data-title="${safeTitle}">
                    <div class="video-thumbnail">
                        <img src="${thumbnailUrl}" alt="${video.title}" onerror="this.src='${getDefaultThumbnail()}'">
                        <div class="play-overlay"><i class="fas fa-play"></i></div>
                        <div class="video-source-badge">${videoSource}</div>
                    </div>
                    <div class="video-info">
                        <h3 class="video-title">${video.title || '未命名影片'}</h3>
                        <div class="video-url">${video.url || video.src || '無網址'}</div>
                        <div class="video-tags">
                            ${video.tags && Array.isArray(video.tags) ? 
                              video.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                        </div>
                    </div>
                    <div class="video-actions">
                        <button class="btn-edit" onclick="editVideo('${safeTitle}')"><i class="fas fa-edit"></i> 編輯</button>
                        <button class="btn-delete" onclick="deleteVideo('${safeTitle}')"><i class="fas fa-trash"></i> 刪除</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        videoList.innerHTML = '<div class="empty-state"><h3>載入錯誤</h3></div>';
    }
}

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

    document.querySelectorAll('.modal').forEach(modal => {
        let mouseDownTarget = null;
        modal.addEventListener('mousedown', (e) => mouseDownTarget = e.target);
        modal.addEventListener('click', (e) => {
            if (e.target == modal && mouseDownTarget == modal) closeModal(modal.id);
        });
    });
}

// ➕ 處理新增影片
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

// ✏️ 編輯影片
function editVideo(videoTitle) {
    const decodedTitle = videoTitle.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const video = videos.find(v => v.title === decodedTitle);
    if (!video) return showNotification('找不到要編輯的影片', 'error');

    currentEditingTitle = decodedTitle;
    document.getElementById('editVideoTitle').value = video.title || '';
    document.getElementById('editVideoUrl').value = video.url || video.src || '';
    document.getElementById('editVideoTags').value = video.tags ? video.tags.join(', ') : '';

    showModal('editModal');
}

// 💾 處理編輯影片
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

// 🗑️ 刪除影片
function deleteVideo(videoTitle) {
    const decodedTitle = videoTitle.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const video = videos.find(v => v.title === decodedTitle);
    if (!video) return;

    currentDeletingTitle = decodedTitle;
    document.getElementById('deleteVideoTitle').textContent = video.title || '未命名影片';
    showModal('deleteModal');
}

// ✅ 確認刪除
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

// 🔧 工具函數
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
    if (modalId == 'editModal') currentEditingTitle = null;
    if (modalId == 'deleteModal') currentDeletingTitle = null;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> <span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 300);
    }, 3000);
}

// 🚪 登出功能
function logout() {
    // 登出時清除 AES 密碼
    sessionStorage.removeItem('stupikid_admin_key');
    window.location.href = 'index.html';
}

// 🌍 掛載全域
window.editVideo = editVideo;
window.deleteVideo = deleteVideo;
window.logout = logout;
window.showModal = showModal;
window.closeModal = closeModal;
window.confirmDeleteAction = confirmDeleteAction;