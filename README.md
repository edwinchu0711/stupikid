# Stupikid 影音串流平台

一個現代簡約、具備密碼防護與後台管理功能的影音精選串流網站。

 **線上展示網址**：[https://edwinchu0711.github.io/stupikid/](https://edwinchu0711.github.io/stupikid/)

---

## ✨ 核心特色

-  **串流影音 Feed**：支援 Vimeo 與 YouTube 多種格式嵌入與彈窗播放。
-  **前端零知識加密防護**：全域閉包封裝、AES 金鑰防護與 Session 短期記憶體管理。
-  **後台管理中心**：影片新增、編輯、標籤分類與刪除等完整管理功能。
-  **深淺色主題自由切換**：支援自適應微光藍點點陣背景 (Dot Matrix)。
-  **PWA 支援**：支援離線快取與 Service Worker 漸進式 Web 應用體驗。

---

## 📁 檔案架構

```text
stupikid/
├── index.html                   # 前台影音串流首頁
├── edit.html                    # 後台影片管理中心
├── favicon.ico                  # 網站圖示 (Favicon)
├── manifest.json                # PWA 設定檔
├── robots.txt                   # 封鎖搜尋引擎爬蟲設定
├── service-worker.js            # 快取與離線 Service Worker
├── README.md                    # 專案說明文件
├── assets/                      # 前端靜態資源
│   ├── css/
│   │   ├── style.css            # 前台現代串流樣式表 (含藍點背景)
│   │   └── edit-style.css       # 後台管理系統樣式表 (含藍點背景)
│   ├── js/
│   │   ├── script.js            # 前台核心影音邏輯與 Firebase 串接
│   │   └── edit-script.js       # 後台管理 CRUD 邏輯與授權驗證
│   └── images/
│       ├── favicon.ico          # 網站圖示備份
│       └── SK.png               # App Icon / Logo
```
