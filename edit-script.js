// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
getFirestore, 
collection, 
getDocs, 
addDoc, 
updateDoc, 
deleteDoc, 
doc, 
query, 
orderBy,
where 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firebase 設定
const firebaseConfig = {
apiKey: "AIzaSyDLzkPHjt93YHhsgcdhV5NAoeeIgD1hlRI",
authDomain: "my-video-database-a8054.firebaseapp.com",
projectId: "my-video-database-a8054",
storageBucket: "my-video-database-a8054.firebasestorage.app",
messagingSenderId: "876492351818",
appId: "1:876492351818:web:60f57dab840c1c5bd439b3",
measurementId: "G-PGB95QQV5S"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 全域變數
let videos = [];
let currentEditingTitle = null;
let currentDeletingTitle = null;

async function getPasswordData() {
try {
    const passwordRef = collection(db, 'password');
    const querySnapshot = await getDocs(passwordRef);
    
    let passwordData = null;
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        passwordData = {
            docId: doc.id,
            id: data.id,
            pass: data.pass
        };
    });
    
    return passwordData;
    
} catch (error) {
    console.error('取得密碼資料失敗:', error);
    return null;
}
}

// 🎬 專門處理 YouTube URL 的函數
function processYouTubeUrl(input) {
console.log('🔍 處理 YouTube URL:', input);

// 移除多餘的空白
input = input.trim();

let videoId = '';

try {
    // 方法1: 使用 URL API (最可靠)
    if (input.includes('youtube.com') && input.includes('v=')) {
        const url = new URL(input);
        videoId = url.searchParams.get('v');
        console.log('✅ 使用 URL API 提取 Video ID:', videoId);
    }
    // 方法2: youtu.be 短網址
    else if (input.includes('youtu.be/')) {
        videoId = input.split('youtu.be/')[1].split('?')[0].split('&')[0];
        console.log('✅ 從短網址提取 Video ID:', videoId);
    }
    // 方法3: embed 格式
    else if (input.includes('youtube.com/embed/')) {
        videoId = input.split('embed/')[1].split('?')[0].split('&')[0];
        console.log('✅ 從 embed 提取 Video ID:', videoId);
    }
    // 方法4: 假設直接輸入 Video ID
    else if (input.match(/^[a-zA-Z0-9_-]{11}$/)) {
        videoId = input;
        console.log('✅ 直接使用 Video ID:', videoId);
    }
    // 方法5: 正則表達式備用方案
    else {
        const patterns = [
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
            /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
        ];
        
        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) {
                videoId = match[1];
                console.log('✅ 正則表達式匹配 Video ID:', videoId);
                break;
            }
        }
    }
    
    // 驗證 Video ID 格式
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log('✅ 生成 Embed URL:', embedUrl);
        return embedUrl;
    } else {
        console.error('❌ 無效的 Video ID:', videoId);
        throw new Error('無法提取有效的 YouTube Video ID');
    }
    
} catch (error) {
    console.error('❌ YouTube URL 處理失敗:', error);
    // 如果所有方法都失敗，嘗試最後的備用方案
    return handleYouTubeUrlFallback(input);
}
}

// 🔧 YouTube URL 處理的備用方案
function handleYouTubeUrlFallback(input) {
console.log('🔄 使用備用方案處理:', input);

// 移除所有非字母數字、底線、連字號的字符，然後尋找11位的字符串
const cleanInput = input.replace(/[^a-zA-Z0-9_-]/g, '');
const possibleIds = cleanInput.match(/[a-zA-Z0-9_-]{11}/g);

if (possibleIds && possibleIds.length > 0) {
    const videoId = possibleIds[0];
    console.log('🔄 備用方案找到 Video ID:', videoId);
    return `https://www.youtube.com/embed/${videoId}`;
}

console.error('❌ 所有方法都無法處理此 URL');
throw new Error('無法識別的 YouTube URL 格式');
}

// 🔗 影片網址處理函數 - 增強 YouTube 處理
function processVideoUrl(source, input) {
if (!input || typeof input !== 'string') {
    console.warn('無效的輸入:', input);
    return '';
}

if (source === 'vimeo') {
    // Vimeo: 只需要 ID，自動生成嵌入網址
    const videoId = input.replace(/[^0-9]/g, ''); // 只保留數字
    return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
} else if (source === 'youtube') {
    // 🎯 增強的 YouTube 處理 - 使用更可靠的方法
    return processYouTubeUrl(input);
}

return input; // 如果都不是，返回原始輸入
}

// 🔍 從 URL 判斷影片來源
function getVideoSourceFromUrl(url) {
if (!url || typeof url !== 'string') return 'unknown';

if (url.includes('vimeo')) return 'vimeo';
if (url.includes('youtube')) return 'youtube';
return 'unknown';
}

// 🖼️ 取得影片縮圖 - 修復錯誤處理
function getVideoThumbnail(url) {
// 🔧 防護：檢查 url 是否存在且為字串
if (!url || typeof url !== 'string') {
    console.warn('無效的 URL:', url);
    return getDefaultThumbnail();
}

try {
    if (url.includes('player.vimeo.com')) {
        // Vimeo 縮圖
        const videoId = url.match(/video\/(\d+)/)?.[1];
        if (videoId) {
            return `https://vumbnail.com/${videoId}.jpg`;
        }
    } else if (url.includes('youtube.com/embed/')) {
        // YouTube 縮圖
        const videoId = url.split('embed/')[1]?.split('?')[0];
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
    }
} catch (error) {
    console.warn('處理縮圖時發生錯誤:', error);
}

// 預設縮圖
return getDefaultThumbnail();
}

// 🎨 預設縮圖
function getDefaultThumbnail() {
return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTYwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMzMzIi8+CjxjaXJjbGUgY3g9IjgwIiBjeT0iNDUiIHI9IjIwIiBmaWxsPSIjNjY2Ii8+Cjxwb2x5Z29uIHBvaW50cz0iNzUsNDAgODUsNDUgNzUsNTAiIGZpbGw9IiNmZmYiLz4KPHN2Zz4K';
}

// 🔐 檢查 URL 參數和密碼保護
document.addEventListener('DOMContentLoaded', async function() {
const urlParams = new URLSearchParams(window.location.search);
const iParam = urlParams.get('i');
const password = await getPasswordData();
if (iParam !== `${password.id*1865410021}`) {
    window.location.href = 'index.html';
    return;
}

// 🔧 傳遞密碼資料給 SecurePasswordProtection
new SecurePasswordProtection(password);
});

// 密碼保護類別 - 修改為接收密碼資料
class SecurePasswordProtection {
constructor(passwordData) {
    // 🔧 使用傳入的密碼資料，如果沒有則使用預設值
    this.correctPassword = passwordData?.pass || '0227';
    this.sessionKey = 'stupikid_admin_authenticated';
    this.sessionDuration = 30 * 60 * 1000;
    this.isUnlocked = false;
    this.errorCount = 0; // 新增錯誤計數

    // console.log('密碼保護初始化，正確密碼:', this.correctPassword);
    
    this.init();
    this.setupSecurityMeasures();
}

init() {
    if (this.isAuthenticated()) {
        setTimeout(() => {
            this.unlockContent();
        }, 10);
    } else {
        this.showPasswordOverlay();
    }

    this.bindEvents();
}

setupSecurityMeasures() {
    document.addEventListener('contextmenu', (e) => {
        if (!this.isUnlocked) {
            e.preventDefault();
            return false;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!this.isUnlocked) {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'u') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C')) {
                e.preventDefault();
                return false;
            }
        }
    });
}

bindEvents() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordBtn = document.getElementById('passwordBtn');
    const passwordError = document.getElementById('passwordError');
    const passwordExitBtn = document.getElementById('passwordExitBtn'); // 新增

    if (passwordBtn) {
        passwordBtn.addEventListener('click', () => {
            this.checkPassword();
        });
    }
    // 新增退出按鈕事件
    if (passwordExitBtn) {
        passwordExitBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkPassword();
            }
        });

        passwordInput.addEventListener('input', () => {
            if (passwordError) {
                passwordError.classList.remove('show');
            }
        });
    }
}

checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const inputPassword = passwordInput?.value?.trim();

    console.log('檢查密碼:', inputPassword, '正確密碼:', this.correctPassword);

    if (inputPassword === this.correctPassword) {
        this.setAuthentication();
        this.unlockContent();
        if (passwordInput) passwordInput.value = '';
        this.errorCount = 0; // 重置錯誤計數
    } else {
        this.errorCount++; // 增加錯誤計數
        console.log('密碼錯誤次數:', this.errorCount);
        
        if (this.errorCount >= 3) {
            // 連續錯誤3次，跳轉回首頁
            window.location.href = 'index.html';
            return;
        }
        
        if (passwordError) passwordError.classList.add('show');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}


setAuthentication() {
    const authData = {
        timestamp: Date.now(),
        authenticated: true
    };
    sessionStorage.setItem(this.sessionKey, JSON.stringify(authData));
}

isAuthenticated() {
    const authData = sessionStorage.getItem(this.sessionKey);
    if (!authData) return false;

    try {
        const parsed = JSON.parse(authData);
        const isExpired = Date.now() - parsed.timestamp > this.sessionDuration;
        
        if (isExpired) {
            sessionStorage.removeItem(this.sessionKey);
            return false;
        }
        
        return parsed.authenticated === true;
    } catch {
        return false;
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
            
            // 初始化管理功能
            initializeAdminFeatures();
        }, 500);
    }
}
}

// 🚀 初始化管理功能
async function initializeAdminFeatures() {
await loadVideos();
setupEventListeners();
setupVideoSourceToggle();
}

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

// 📂 載入影片資料 - 修正文檔 ID 處理
async function loadVideos() {
try {
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    videos = [];
    querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        // 🔧 使用 Firestore 文檔 ID，而不是自定義的 id 欄位
        videos.push({
            docId: docSnapshot.id,  // Firestore 文檔 ID
            id: data.id || null,    // 自定義 ID（如果有的話）
            title: data.title || '未命名影片',
            url: data.url || data.src || '', // 支援舊格式 src
            tags: data.tags || [],
            source: data.source || 'unknown',
            createdAt: data.createdAt || new Date(),
            ...data
        });
    });
    
    console.log('載入影片數量:', videos.length);
    displayVideos();
    updateVideoCount();
    
} catch (error) {
    console.error('載入影片失敗:', error);
    showNotification('載入影片失敗: ' + error.message, 'error');
}
}

// 📊 更新影片數量顯示
function updateVideoCount() {
const countElement = document.getElementById('videoCount');
if (countElement) {
    countElement.textContent = videos.length;
}
}

// 🎬 顯示影片列表 - 修改為使用 title
function displayVideos() {
const videoList = document.getElementById('videoList');

if (!videoList) {
    console.error('找不到 videoList 元素');
    return;
}

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
        // 🔧 安全地取得縮圖 - 修正為 url
        const thumbnailUrl = getVideoThumbnail(video.url || video.src);
        const videoSource = getVideoSource(video.url || video.src);
        // 🔧 確保 title 安全用於 HTML 屬性
        const safeTitle = (video.title || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        
        return `
            <div class="video-item" data-title="${safeTitle}">
                <div class="video-thumbnail">
                    <img src="${thumbnailUrl}" 
                         alt="${video.title || '影片縮圖'}" 
                         onerror="this.src='${getDefaultThumbnail()}'">
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="video-source-badge">
                        ${videoSource}
                    </div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title || '未命名影片'}</h3>
                    <div class="video-url">${video.url || video.src || '無網址'}</div>
                    <div class="video-tags">
                        ${video.tags && Array.isArray(video.tags) ? 
                          video.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : 
                          ''}
                    </div>
                </div>
                <div class="video-actions">
                    <button class="btn-edit" onclick="editVideo('${safeTitle}')">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="btn-delete" onclick="deleteVideo('${safeTitle}')">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            </div>
        `;
    }).join('');
} catch (error) {
    console.error('顯示影片列表時發生錯誤:', error);
    videoList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>載入錯誤</h3>
            <p>顯示影片列表時發生錯誤</p>
        </div>
    `;
}
}

// 🔍 取得影片來源
function getVideoSource(url) {
if (!url || typeof url !== 'string') return 'Unknown';

if (url.includes('vimeo')) return 'Vimeo';
if (url.includes('youtube')) return 'YouTube';
return 'Other';
}

// 🎯 設定事件監聽器
function setupEventListeners() {
// 新增影片表單
const addForm = document.getElementById('addVideoForm');
if (addForm) {
    addForm.addEventListener('submit', handleAddVideo);
}

// 編輯影片表單
const editForm = document.getElementById('editVideoForm');
if (editForm) {
    editForm.addEventListener('submit', handleEditVideo);
}

// 取消編輯
const cancelEdit = document.getElementById('cancelEdit');
if (cancelEdit) {
    cancelEdit.addEventListener('click', () => closeModal('editModal'));
}

// 確認刪除
const confirmDelete = document.getElementById('confirmDelete');
if (confirmDelete) {
    confirmDelete.addEventListener('click', confirmDeleteAction);
}

// 取消刪除
const cancelDelete = document.getElementById('cancelDelete');
if (cancelDelete) {
    cancelDelete.addEventListener('click', () => closeModal('deleteModal'));
}

// 關閉彈窗
document.querySelectorAll('.modal').forEach(modal => {
    let mouseDownTarget = null;
    
    modal.addEventListener('mousedown', (e) => {
        mouseDownTarget = e.target;
    });
    
    modal.addEventListener('click', (e) => {
        // 只有當 mousedown 和 click 都在 modal 背景時才關閉
        if (e.target == modal && mouseDownTarget == modal) {
            closeModal(modal.id);
        }
    });
});

}

// ➕ 處理新增影片 - 增加 YouTube URL 驗證
async function handleAddVideo(e) {
e.preventDefault();

const formData = new FormData(e.target);
const source = formData.get('videoSource');
const urlInput = formData.get('videoUrl');
const title = formData.get('videoTitle');
const tagsInput = formData.get('videoTags');

if (!urlInput || !title) {
    showNotification('請填寫所有必填欄位', 'error');
    return;
}

// 檢查標題是否重複
const existingVideo = videos.find(v => v.title === title);
if (existingVideo) {
    showNotification('影片標題已存在，請使用不同的標題', 'error');
    return;
}

try {
    // 🎯 處理影片 URL，如果是 YouTube 會進行增強處理
    let processedUrl;
    try {
        processedUrl = processVideoUrl(source, urlInput);
    } catch (urlError) {
        console.error('URL 處理錯誤:', urlError);
        showNotification(`URL 處理失敗: ${urlError.message}`, 'error');
        return;
    }
    
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    const videoData = {
        title: title,
        url: processedUrl,  // 使用處理後的 URL
        src: processedUrl,  // 保持兼容性
        tags: tags,
        source: source,
        createdAt: new Date()
    };
    
    console.log('📝 準備新增影片:', videoData);
    
    await addDoc(collection(db, 'videos'), videoData);
    
    showNotification('影片新增成功！', 'success');
    e.target.reset();
    await loadVideos();
    
} catch (error) {
    console.error('新增影片失敗:', error);
    showNotification('新增影片失敗: ' + error.message, 'error');
}
}

// ✏️ 編輯影片 - 使用 title 搜尋
function editVideo(videoTitle) {
// 🔧 還原 HTML 實體編碼
const decodedTitle = videoTitle.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const video = videos.find(v => v.title === decodedTitle);
if (!video) {
    showNotification('找不到要編輯的影片', 'error');
    return;
}

currentEditingTitle = decodedTitle;
console.log('設定 currentEditingTitle:', currentEditingTitle);

// 填入編輯表單
const titleInput = document.getElementById('editVideoTitle');
const urlInput = document.getElementById('editVideoUrl');
const tagsInput = document.getElementById('editVideoTags');

if (titleInput) titleInput.value = video.title || '';
if (urlInput) urlInput.value = video.url || video.src || '';
if (tagsInput) tagsInput.value = video.tags ? video.tags.join(', ') : '';

// 顯示編輯彈窗
showModal('editModal');
}

// 💾 處理編輯影片 - 增加 YouTube URL 驗證
async function handleEditVideo(e) {
e.preventDefault();

if (!currentEditingTitle) {
    showNotification('沒有選擇要編輯的影片', 'error');
    return;
}

const formData = new FormData(e.target);
const newTitle = formData.get('editVideoTitle');
const urlInput = formData.get('editVideoUrl');
const tagsInput = formData.get('editVideoTags');

if (!newTitle || !urlInput) {
    showNotification('請填寫所有必填欄位', 'error');
    return;
}

// 如果標題有變更，檢查新標題是否重複
if (newTitle !== currentEditingTitle) {
    const existingVideo = videos.find(v => v.title === newTitle);
    if (existingVideo) {
        showNotification('新標題已存在，請使用不同的標題', 'error');
        return;
    }
}

try {
    // 找到要編輯的影片文檔
    const video = videos.find(v => v.title === currentEditingTitle);
    if (!video) {
        showNotification('找不到要編輯的影片', 'error');
        return;
    }
    
    console.log('找到影片:', video);
    console.log('Firestore 文檔 ID:', video.docId, '類型:', typeof video.docId);
    
    // 🎯 處理影片 URL，如果是 YouTube 會進行增強處理
    let processedUrl;
    try {
        // 判斷影片來源
        const source = getVideoSourceFromUrl(urlInput);
        processedUrl = processVideoUrl(source, urlInput);
    } catch (urlError) {
        console.error('URL 處理錯誤:', urlError);
        showNotification(`URL 處理失敗: ${urlError.message}`, 'error');
        return;
    }
    
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // 🔧 使用正確的 Firestore 文檔 ID
    const videoRef = doc(db, 'videos', video.docId);
    await updateDoc(videoRef, {
        title: newTitle,
        url: processedUrl,  // 使用處理後的 URL
        src: processedUrl,  // 保持兼容性
        tags: tags,
        source: getVideoSourceFromUrl(processedUrl), // 更新來源
        updatedAt: new Date()
    });
    
    showNotification('影片更新成功！', 'success');
    closeModal('editModal');
    currentEditingTitle = null;
    await loadVideos();
    
} catch (error) {
    console.error('更新影片失敗:', error);
    showNotification('更新影片失敗: ' + error.message, 'error');
}
}

// 🗑️ 刪除影片 - 使用 title 搜尋
function deleteVideo(videoTitle) {
// 🔧 還原 HTML 實體編碼
const decodedTitle = videoTitle.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const video = videos.find(v => v.title === decodedTitle);
if (!video) {
    showNotification('找不到要刪除的影片', 'error');
    return;
}

currentDeletingTitle = decodedTitle;
const titleElement = document.getElementById('deleteVideoTitle');
if (titleElement) {
    titleElement.textContent = video.title || '未命名影片';
}
showModal('deleteModal');
}

// ✅ 確認刪除 - 使用正確的文檔 ID
async function confirmDeleteAction() {
  if (!currentDeletingTitle) {
      showNotification('沒有選擇要刪除的影片', 'error');
      return;
  }
  
  try {
      // 找到要刪除的影片文檔
      const video = videos.find(v => v.title === currentDeletingTitle);
      if (!video) {
          showNotification('找不到要刪除的影片', 'error');
          return;
      }
      
      console.log('準備刪除影片:', video);
      console.log('Firestore 文檔 ID:', video.docId, '類型:', typeof video.docId);
      
      // 🔧 使用正確的 Firestore 文檔 ID
      await deleteDoc(doc(db, 'videos', video.docId));
      
      showNotification('影片刪除成功！', 'success');
      closeModal('deleteModal');
      currentDeletingTitle = null;
      await loadVideos();
      
  } catch (error) {
      console.error('刪除影片失敗:', error);
      showNotification('刪除影片失敗: ' + error.message, 'error');
  }
}

// 🔧 彈窗控制
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
  
  // 清除編輯狀態
  if (modalId == 'editModal') {
      currentEditingTitle = null;
  }
  
  // 清除刪除狀態
  if (modalId == 'deleteModal') {
      currentDeletingTitle = null;
  }
}

// 📢 通知系統
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
      notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
          if (document.body.contains(notification)) {
              document.body.removeChild(notification);
          }
      }, 300);
  }, 3000);
}

// 🚪 登出功能
function logout() {
  sessionStorage.removeItem('stupikid_admin_authenticated');
  window.location.href = 'index.html';
}

// 🌍 將所有需要的函數設為全域
window.editVideo = editVideo;
window.deleteVideo = deleteVideo;
window.logout = logout;
window.showModal = showModal;
window.closeModal = closeModal;
window.confirmDeleteAction = confirmDeleteAction;
