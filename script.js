import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// 全域變數宣告
let db; 
let videos = [];
let currentVideos = [];
let recommendedVideos = [];
let isShowingAll = false;


// 👇 最終你的程式碼只要留下這個變數，引號裡面貼上你用密碼加密後的亂碼
let encryptedConfig = "U2FsdGVkX18u6/aFtmeJezRT4C46lbrHrB1i2jaxLeAa3fT6Z9FZytSSF3k43cLFJ5EgiICvqx9f+AJAqne4ILaLcMBZQ7zhtKR5SZxa38m+hF9jF9kF3YU0W/B+UFcIjpmQiWyjQEsk1JaxxP4kuG4iYVfoJy/OZh/qFRcCdpEiOjvwJw6eDflA0nihtukmF1kETTcPgZqyFWCfUI6Uo5pl7LDOuEKeY6z4MrjFGmDZPTY9CvNM5/xKC6+jbXF1yV0JhLkG67DjY1vi5CXfls5Z/kocTr67w05qePQ/XaAH2ZzQ9sLAW4qX6hwT4iMU06yLaO3kEhkVFquIaM/Fl25Msr9xZAOeu7Cfv5b2vdFr9jAc9eaebL6C58ydEy4hl0/T4m2ltAXCMzYXrp66AKNqYiYumRejEr/hEBVLIcesJURfrJe0ei9mo/76Zjpxwnwqy3VqQETmJdm0kLH7sg=="; 



// 初始化內容 (只有密碼解密成功後才會呼叫)
async function startLoadingContent(config) {
    console.log('🔓 密碼正確，開始連線資料庫...');
    const app = initializeApp(config);
    db = getFirestore(app);
    
    videos = await loadVideosFromFirebase();
    currentVideos = videos;
    
    generateRecommendedVideos();
    setupSearch();
    setupButtons();
    setupAdminMode();
}

async function loadVideosFromFirebase() {
    try {
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const loadedVideos = [];
        querySnapshot.forEach((doc) => {
            const videoData = doc.data();
            loadedVideos.push({
                id: videoData.id,
                title: videoData.title,
                src: videoData.src,
                tags: videoData.tags || []
            });
        });
        return loadedVideos;
    } catch (error) {
        console.error('❌ 載入影片失敗:', error);
        return [];
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

// 產生與渲染影片
function generateRecommendedVideos() {
    if (videos.length === 0) return;
    const shuffled = [...videos].sort(() => 0.5 - Math.random());
    recommendedVideos = shuffled.slice(0, 9);
    renderRecommendedVideos();
}

function renderRecommendedVideos() {
    const grid = document.getElementById('recommendedGrid');
    grid.innerHTML = '';
    recommendedVideos.forEach(video => {
        grid.appendChild(createVideoCard(video, true));
    });
}

function renderAllVideos() {
    const grid = document.getElementById('videoGrid');
    const noResults = document.getElementById('noResults');
    const statsInfo = document.getElementById('statsInfo');
    
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

function createVideoCard(video, isRecommended = false) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.onclick = () => playVideo(video);
    card.innerHTML = `
        <div class="video-thumbnail">
            <iframe src="${video.src}" loading="lazy"></iframe>
            <div class="play-overlay"><i class="fas fa-play play-icon"></i></div>
        </div>
        <div class="video-info"><div class="video-title">${video.title}</div></div>
    `;
    return card;
}

function playVideo(video) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-content">
            <div class="video-modal-header">
                <h3>${video.title}</h3>
                <button class="close-modal" onclick="closeVideoModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="video-modal-body">
                <iframe src="${video.src}?autoplay=1" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.querySelector('.video-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}
window.closeVideoModal = closeVideoModal;

function setupButtons() {
    document.getElementById('viewAllBtn').addEventListener('click', () => {
        isShowingAll = true;
        currentVideos = videos;
        document.getElementById('recommendedSection').classList.add('hidden');
        document.getElementById('allVideosSection').classList.remove('hidden');
        document.getElementById('searchInput').value = '';
        renderAllVideos();
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        isShowingAll = false;
        document.getElementById('allVideosSection').classList.add('hidden');
        document.getElementById('recommendedSection').classList.remove('hidden');
        document.getElementById('noResults').classList.add('hidden');
        document.getElementById('searchInput').value = '';
        hideAdminButton();
        generateRecommendedVideos();
    });
}

async function setupAdminMode() {
    const password = await getPasswordData();
    if (!password) return;
    const adminButton = document.createElement('button');
    adminButton.id = 'adminModeBtn';
    adminButton.className = 'admin-mode-btn hidden';
    adminButton.innerHTML = '<i class="fas fa-cog"></i> 管理員模式';
    adminButton.onclick = () => window.location.href = `edit.html?i=${password.id*1865410021}`;
    
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
    let searchTimeout;
    searchInput.addEventListener('input', function() {
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
            document.getElementById('allVideoTitle').innerHTML = '<i class="fas fa-video"></i> 所有影片';
            renderAllVideos();
        }
        return;
    }

    if (!isShowingAll) {
        document.getElementById('recommendedSection').classList.add('hidden');
        document.getElementById('allVideosSection').classList.remove('hidden');
        isShowingAll = true;
    }

    currentVideos = videos.filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    document.getElementById('allVideoTitle').innerHTML = `<i class="fas fa-search"></i> 搜尋結果：${query} (${currentVideos.length}部)`;
    renderAllVideos();
}

// === 🔐 核心安全防護類別 ===
class SecurePasswordProtection {
    constructor() {
        this.sessionKey = 'stupikid_key'; // 現在我們存的是 AES 密碼
        this.sessionDuration = 30 * 60 * 1000;
        this.init();
    }

    init() {
        const savedPassword = this.getValidSessionPassword();
        if (savedPassword) {
            // 如果之前登入過，直接嘗試用保存的密碼解密
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

        passwordBtn.addEventListener('click', () => this.tryUnlock(passwordInput.value.trim()));
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.tryUnlock(passwordInput.value.trim());
        });
        passwordInput.addEventListener('input', () => passwordError.classList.remove('show'));
    }

    tryUnlock(inputPassword) {
        try {
            // 嘗試用輸入的密碼解密 AES 亂碼
            const bytes = CryptoJS.AES.decrypt(encryptedConfig, inputPassword);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

            // 如果解密出來的東西不是正確的 JSON，這裡會報錯並跳到 catch
            const config = JSON.parse(decryptedString);

            if (config.apiKey) {
                // 解密成功！
                this.saveSessionPassword(inputPassword);
                this.unlockContent();
                document.getElementById('passwordInput').value = '';
                
                // 正式載入資料庫
                startLoadingContent(config);
            } else {
                throw new Error("Invalid config");
            }
        } catch (e) {
            // 密碼錯誤，解密失敗
            this.showError();
        }
    }

    showError() {
        const passwordInput = document.getElementById('passwordInput');
        const passwordError = document.getElementById('passwordError');
        passwordError.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
        passwordInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => passwordInput.style.animation = '', 500);
        localStorage.removeItem(this.sessionKey);
    }

    saveSessionPassword(password) {
        const authData = {
            timestamp: Date.now(),
            pass: password // 將密碼存起來以便重整網頁時自動解密
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(authData));
    }

    getValidSessionPassword() {
        const authData = localStorage.getItem(this.sessionKey);
        if (!authData) return null;
        try {
            const parsed = JSON.parse(authData);
            if (Date.now() - parsed.timestamp < this.sessionDuration) {
                return parsed.pass;
            } else {
                localStorage.removeItem(this.sessionKey);
                return null;
            }
        } catch (e) {
            localStorage.removeItem(this.sessionKey);
            return null;
        }
    }

    showPasswordOverlay() {
        document.getElementById('passwordOverlay').style.display = 'flex';
        document.getElementById('mainContent').classList.remove('unlocked');
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('passwordInput').focus(), 100);
    }

    unlockContent() {
        const overlay = document.getElementById('passwordOverlay');
        const mainContent = document.getElementById('mainContent');
        overlay.classList.add('fade-out');
        mainContent.classList.add('unlocked');
        document.body.style.overflow = 'auto';
        setTimeout(() => overlay.style.display = 'none', 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SecurePasswordProtection();
});