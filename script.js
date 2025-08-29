// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

// 🔥 從 Firebase 載入影片資料
async function loadVideosFromFirebase() {
try {
    console.log('🔄 正在從 Firebase 載入影片資料...');
    
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const videos = [];
    querySnapshot.forEach((doc) => {
        const videoData = doc.data();
        videos.push({
            id: videoData.id,
            title: videoData.title,
            src: videoData.src,
            tags: videoData.tags || []
        });
    });
    
    console.log(`✅ 成功載入 ${videos.length} 個影片`);
    return videos;
    
} catch (error) {
    console.error('❌ 載入影片失敗:', error);
    return [];
}
}


// 取得 password 集合中的資料
async function getPasswordData() {
    try {
        const passwordRef = collection(db, 'password');
        const querySnapshot = await getDocs(passwordRef);
        
        let passwordData = null;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            passwordData = {
                docId: doc.id, // 文檔 ID (IJq9a0qrtgihsLq42JgZ)
                id: data.id,   // id 欄位的值
                pass: data.pass // pass 欄位的值
            };
        });
        
        return passwordData;
        
    } catch (error) {
        console.error('取得密碼資料失敗:', error);
        return null;
    }
}


// 改為動態變數
let videos = [];
let currentVideos = [];
let recommendedVideos = [];
let isShowingAll = false;

// 初始化 - 修改這裡
document.addEventListener('DOMContentLoaded', async function() {
  // 先載入 Firebase 資料
  videos = await loadVideosFromFirebase();
  currentVideos = videos;
  
  // 然後執行原本的初始化
  generateRecommendedVideos();
  setupSearch();
  setupButtons();
  setupAdminMode(); // 新增：設置管理員模式
});

// 生成推薦影片（隨機選擇9部）
function generateRecommendedVideos() {
  if (videos.length === 0) return; // 防止空陣列錯誤
  
  const shuffled = [...videos].sort(() => 0.5 - Math.random());
  recommendedVideos = shuffled.slice(0, 9);
  renderRecommendedVideos();
}

// 渲染推薦影片
function renderRecommendedVideos() {
  const grid = document.getElementById('recommendedGrid');
  grid.innerHTML = '';

  recommendedVideos.forEach(video => {
      const videoCard = createVideoCard(video, true);
      grid.appendChild(videoCard);
  });
}

// 渲染所有影片
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
  
  // 從最後一個開始往前輸出
  for (let i = currentVideos.length - 1; i >= 0; i--) {
      const video = currentVideos[i];
      const videoCard = createVideoCard(video);
      grid.appendChild(videoCard);
  }
}

// 創建影片卡片
function createVideoCard(video, isRecommended = false) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.onclick = () => playVideo(video);
  
  card.innerHTML = `
      <div class="video-thumbnail">
          ${isRecommended ? '' : ''}
          <iframe src="${video.src}" loading="lazy"></iframe>
          <div class="play-overlay">
              <i class="fas fa-play play-icon"></i>
          </div>
      </div>
      <div class="video-info">
          <div class="video-title">${video.title}</div>
      </div>
  `;
  
  return card;
}

// 播放影片
function playVideo(video) {
  // 創建模態框
  const modal = document.createElement('div');
  modal.className = 'video-modal';
  modal.innerHTML = `
      <div class="video-modal-content">
          <div class="video-modal-header">
              <h3>${video.title}</h3>
              <button class="close-modal" onclick="closeVideoModal()">
                  <i class="fas fa-times"></i>
              </button>
          </div>
          <div class="video-modal-body">
              <iframe src="${video.src}?autoplay=1" 
                      width="100%" 
                      height="100%" 
                      frameborder="0" 
                      allow="autoplay; fullscreen; picture-in-picture" 
                      allowfullscreen>
              </iframe>
          </div>
      </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

// 關閉影片模態框
function closeVideoModal() {
  const modal = document.querySelector('.video-modal');
  if (modal) {
      modal.remove();
      document.body.style.overflow = 'auto';
  }
}

// 設置按鈕功能
function setupButtons() {
  const viewAllBtn = document.getElementById('viewAllBtn');
  const backBtn = document.getElementById('backBtn');

  viewAllBtn.addEventListener('click', showAllVideos);
  backBtn.addEventListener('click', showRecommended);
}

// 顯示所有影片
function showAllVideos() {
  isShowingAll = true;
  currentVideos = videos;
  
  document.getElementById('recommendedSection').classList.add('hidden');
  document.getElementById('allVideosSection').classList.remove('hidden');
  
  // 清空搜尋框
  document.getElementById('searchInput').value = '';
  
  renderAllVideos();
}

// 返回推薦頁面
function showRecommended() {
  isShowingAll = false;
  
  document.getElementById('allVideosSection').classList.add('hidden');
  document.getElementById('recommendedSection').classList.remove('hidden');
  document.getElementById('noResults').classList.add('hidden');
  
  // 清空搜尋框
  document.getElementById('searchInput').value = '';
  
  // 隱藏管理員按鈕
  hideAdminButton();
  
  // 重新生成推薦影片
  generateRecommendedVideos();
}

// 🔧 新增：設置管理員模式
async function setupAdminMode() {
  const password = await getPasswordData();
  // 創建管理員按鈕（預設隱藏）
  const adminButton = document.createElement('button');
  adminButton.id = 'adminModeBtn';
  adminButton.className = 'admin-mode-btn hidden';
  adminButton.innerHTML = '<i class="fas fa-cog"></i> 管理員模式';
  adminButton.onclick = () => {
      window.location.href = `edit.html?i=${password.id*1865410021}`;
  };
  
  // 將按鈕添加到搜尋區域
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer) {
      searchContainer.appendChild(adminButton);
  }
}

// 🔧 新增：顯示管理員按鈕
function showAdminButton() {
  const adminBtn = document.getElementById('adminModeBtn');
  if (adminBtn) {
      adminBtn.classList.remove('hidden');
      adminBtn.classList.add('show');
      
      // 添加閃爍效果
      adminBtn.style.animation = 'pulse 1s ease-in-out 3';
      setTimeout(() => {
          adminBtn.style.animation = '';
      }, 3000);
  }
}

// 🔧 新增：隱藏管理員按鈕
function hideAdminButton() {
  const adminBtn = document.getElementById('adminModeBtn');
  if (adminBtn) {
      adminBtn.classList.add('hidden');
      adminBtn.classList.remove('show');
  }
}

// 設置搜尋功能
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;

  searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
          performSearch(this.value.trim());
      }, 300); // 延遲300ms搜尋
  });
}

// 執行搜尋
function performSearch(query) {
  // 🔧 新增：檢查管理員模式觸發詞
  if (query === '高齊的洞穴') {
      showAdminButton();
      // 不執行實際搜尋，保持當前狀態
      return;
  } else {
      // 如果不是觸發詞，隱藏管理員按鈕
      hideAdminButton();
  }
  
  if (query === '') {
      // 如果搜尋框為空
      if (isShowingAll) {
          // 如果在全部影片頁面，顯示所有影片
          currentVideos = videos;
          document.getElementById('allVideoTitle').innerHTML = 
              '<i class="fas fa-video"></i> 所有影片';
          renderAllVideos();
      }
      return;
  }

  // 有搜尋內容時，自動切換到全部影片頁面並搜尋
  if (!isShowingAll) {
      document.getElementById('recommendedSection').classList.add('hidden');
      document.getElementById('allVideosSection').classList.remove('hidden');
      isShowingAll = true;
  }

  // 在所有影片中搜尋
  currentVideos = videos.filter(video => 
      video.title.toLowerCase().includes(query.toLowerCase()) ||
      video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  document.getElementById('allVideoTitle').innerHTML = 
      `<i class="fas fa-search"></i> 搜尋結果：${query} (${currentVideos.length}部)`;
  
  renderAllVideos();
}

// 定期更新推薦影片（每10分鐘）
setInterval(() => {
  if (!isShowingAll) {
      generateRecommendedVideos();
  }
}, 600000);

// 加強安全性的密碼保護功能
class SecurePasswordProtection {
  constructor() {
      this.correctPassword = '0227'; // 設定您的密碼
      this.sessionKey = 'stupikid_authenticated';
      this.sessionDuration = 30 * 60 * 1000; // 30分鐘
      this.isUnlocked = false;
      
      this.init();
      this.setupSecurityMeasures();
  }

  init() {
      // 檢查是否已經認證過
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
      // 禁用右鍵菜單
      document.addEventListener('contextmenu', (e) => {
          if (!this.isUnlocked) {
              e.preventDefault();
              return false;
          }
      });

      // 禁用F12、Ctrl+Shift+I等開發者工具快捷鍵
      document.addEventListener('keydown', (e) => {
          if (!this.isUnlocked) {
              // F12
              if (e.key === 'F12') {
                  e.preventDefault();
                  return false;
              }
              // Ctrl+Shift+I
              if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                  e.preventDefault();
                  return false;
              }
              // Ctrl+Shift+J
              if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                  e.preventDefault();
                  return false;
              }
              // Ctrl+U
              if (e.ctrlKey && e.key === 'u') {
                  e.preventDefault();
                  return false;
              }
              // Ctrl+Shift+C
              if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                  e.preventDefault();
                  return false;
              }
          }
      });

      // 檢測開發者工具
      let devtools = {
          open: false,
          orientation: null
      };

      const threshold = 160;

      setInterval(() => {
          if (!this.isUnlocked) {
              if (window.outerHeight - window.innerHeight > threshold || 
                  window.outerWidth - window.innerWidth > threshold) {
                  if (!devtools.open) {
                      devtools.open = true;
                      this.handleDevToolsDetected();
                  }
              } else {
                  devtools.open = false;
              }
          }
      }, 500);

      // 防止通過console操作
      if (!this.isUnlocked) {
          Object.defineProperty(window, 'console', {
              value: console,
              writable: false,
              configurable: false
          });
      }
  }

  handleDevToolsDetected() {
      // 重新載入頁面或其他安全措施
      document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-size:2rem;z-index:999999;">⚠️ 檢測到非法操作</div>';
      setTimeout(() => {
          window.location.reload();
      }, 2000);
  }

  bindEvents() {
      const passwordInput = document.getElementById('passwordInput');
      const passwordBtn = document.getElementById('passwordBtn');
      const passwordError = document.getElementById('passwordError');

      // 按鈕點擊事件
      passwordBtn.addEventListener('click', () => {
          this.checkPassword();
      });

      // Enter鍵事件
      passwordInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
              this.checkPassword();
          }
      });

      // 清除錯誤信息
      passwordInput.addEventListener('input', () => {
          passwordError.classList.remove('show');
      });
  }

  checkPassword() {
      const passwordInput = document.getElementById('passwordInput');
      const passwordError = document.getElementById('passwordError');
      const inputPassword = passwordInput.value.trim();

      if (inputPassword === this.correctPassword) {
          // 密碼正確
          this.setAuthentication();
          this.unlockContent();
          passwordInput.value = '';
      } else {
          // 密碼錯誤
          passwordError.classList.add('show');
          passwordInput.value = '';
          passwordInput.focus();
          
          // 搖晃效果
          passwordInput.style.animation = 'shake 0.5s ease-in-out';
          setTimeout(() => {
              passwordInput.style.animation = '';
          }, 500);
      }
  }

  setAuthentication() {
      const authData = {
          timestamp: Date.now(),
          authenticated: true,
          token: btoa(Math.random().toString()).substr(10, 10)
      };
      localStorage.setItem(this.sessionKey, JSON.stringify(authData));
  }

  isAuthenticated() {
      const authData = localStorage.getItem(this.sessionKey);
      if (!authData) return false;

      try {
          const parsed = JSON.parse(authData);
          const now = Date.now();
          const elapsed = now - parsed.timestamp;

          // 檢查是否在有效期內
          if (elapsed < this.sessionDuration && parsed.authenticated) {
              return true;
          } else {
              // 超時，清除認證
              localStorage.removeItem(this.sessionKey);
              return false;
          }
      } catch (e) {
          localStorage.removeItem(this.sessionKey);
          return false;
      }
  }

  showPasswordOverlay() {
      const overlay = document.getElementById('passwordOverlay');
      const mainContent = document.getElementById('mainContent');
      
      overlay.style.display = 'flex';
      mainContent.classList.remove('unlocked');
      document.body.style.overflow = 'hidden';
      
      // 自動聚焦到密碼輸入框
      setTimeout(() => {
          document.getElementById('passwordInput').focus();
      }, 100);
  }

  unlockContent() {
      const overlay = document.getElementById('passwordOverlay');
      const mainContent = document.getElementById('mainContent');
      
      this.isUnlocked = true;
      
      overlay.classList.add('fade-out');
      mainContent.classList.add('unlocked');
      document.body.style.overflow = 'auto';
      
      setTimeout(() => {
          overlay.style.display = 'none';
      }, 500);
  }
}

// 初始化密碼保護
document.addEventListener('DOMContentLoaded', () => {
  new SecurePasswordProtection();
});

// 將函數掛載到 window 物件，讓 HTML 可以存取
window.closeVideoModal = closeVideoModal;