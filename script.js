        // 完整的93部影片資料
        const videos =[
             { "id": 1, "title": "隨便拋的", "src": "https://player.vimeo.com/video/284067118?title=0&byline=0&portrait=0", "tags": ["搞笑", "日常"] },
             { "id": 2, "title": "儲藏室搶案（一定要看完啊！)40%聚酯纖維", "src": "https://player.vimeo.com/video/284067371?title=0&byline=0&portrait=0", "tags": ["劇情", "搞笑"] },
             { "id": 3, "title": "踢到桌腳 教你防止踢到的好方法 桌腳我的主場 可憐的陳彥廷", "src": "https://player.vimeo.com/video/284067398?title=0&byline=0&portrait=0", "tags": ["教學", "搞笑"] },
             { "id": 4, "title": "輕功水上飄？簡單 池塘我的主場", "src": "https://player.vimeo.com/video/284067458?title=0&byline=0&portrait=0", "tags": ["特技", "搞笑"] },
             { "id": 5, "title": "臺灣有點小，美國有點大。臺灣有小點，美國有什麼？", "src": "https://player.vimeo.com/video/284067481?title=0&byline=0&portrait=0", "tags": ["搞笑", "對話"] },
             { "id": 6, "title": "街頭實驗 看在路人旁邊跳抖肩舞，會不會跟跳呢", "src": "https://player.vimeo.com/video/284067547?title=0&byline=0&portrait=0", "tags": ["實驗", "街頭", "舞蹈"] },
             { "id": 7, "title": "煎蛋界阮經天94我", "src": "https://player.vimeo.com/video/284067502?title=0&byline=0&portrait=0", "tags": ["料理", "搞笑"] },
             { "id": 8, "title": "騎車到嘉義特集", "src": "https://player.vimeo.com/video/284068715?title=0&byline=0&portrait=0", "tags": ["旅遊", "日常"] },
             { "id": 9, "title": "賽車", "src": "https://player.vimeo.com/video/284068974?title=0&byline=0&portrait=0", "tags": ["動作", "賽車"] },
             { "id": 10, "title": "微電影", "src": "https://player.vimeo.com/video/284069086?title=0&byline=0&portrait=0", "tags": ["劇情", "微電影"] },
             { "id": 11, "title": "好熱啊...", "src": "https://player.vimeo.com/video/284070184?title=0&byline=0&portrait=0", "tags": ["日常", "搞笑"] },
             { "id": 12, "title": "黃色物體跟蹤", "src": "https://player.vimeo.com/video/284069437?title=0&byline=0&portrait=0", "tags": ["懸疑", "搞笑"] },
             { "id": 13, "title": "無所不知新聞台1", "src": "https://player.vimeo.com/video/285233446?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑"] },
             { "id": 14, "title": "無所不知新聞台2", "src": "https://player.vimeo.com/video/285206836?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑"] },
             { "id": 15, "title": "無所不知新聞台4", "src": "https://player.vimeo.com/video/285587284?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑"] },
             { "id": 16, "title": "無所不知新聞台5", "src": "https://player.vimeo.com/video/285207010?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑"] },
             { "id": 17, "title": "無所不知新聞台6", "src": "https://player.vimeo.com/video/285587489?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑"] },
             { "id": 18, "title": "無所不知新聞台9", "src": "https://player.vimeo.com/video/285233647?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑"] },
             { "id": 19, "title": "無所不知新聞台10", "src": "https://player.vimeo.com/video/284074741?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑"] },
             { "id": 20, "title": "無所不知新聞台11", "src": "https://player.vimeo.com/video/284074971?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑"] },
             { "id": 21, "title": "無所不知新聞台12", "src": "https://player.vimeo.com/video/284075098?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑"] },
             { "id": 22, "title": "無所不知新聞台vs ICRT", "src": "https://player.vimeo.com/video/284075250?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑", "電台"] },
             { "id": 23, "title": "無所不知新聞台之下雪特集", "src": "https://player.vimeo.com/video/285424719?title=0&byline=0&portrait=0", "tags": ["新聞", "天氣", "搞笑"] },
             { "id": 24, "title": "如何交朋友", "src": "https://player.vimeo.com/video/284066372?title=0&byline=0&portrait=0", "tags": ["教學", "社交"] },
             { "id": 25, "title": "what the spy", "src": "https://player.vimeo.com/video/284081257?title=0&byline=0&portrait=0", "tags": ["動作", "間諜"] },
             { "id": 26, "title": "FREEFIRE大電影", "src": "https://player.vimeo.com/video/284081610?title=0&byline=0&portrait=0", "tags": ["遊戲", "動作"] },
             { "id": 27, "title": "STUPIKID-MV15顛覆你對MV的想像", "src": "https://player.vimeo.com/video/284093793?title=0&byline=0&portrait=0", "tags": ["MV", "音樂"] },
             { "id": 28, "title": "我只想要你的頭 慎入", "src": "https://player.vimeo.com/video/284094120?title=0&byline=0&portrait=0", "tags": ["恐怖", "搞笑"] },
             { "id": 29, "title": "仙草茶廣告", "src": "https://player.vimeo.com/video/284094297?title=0&byline=0&portrait=0", "tags": ["廣告", "搞笑"] },
             { "id": 30, "title": "屎屎一族", "src": "https://player.vimeo.com/video/284094372?title=0&byline=0&portrait=0", "tags": ["搞笑", "惡搞"] },
             { "id": 31, "title": "美味晚餐", "src": "https://player.vimeo.com/video/284094436?title=0&byline=0&portrait=0", "tags": ["料理", "搞笑"] },
             { "id": 32, "title": "天線寶寶", "src": "https://player.vimeo.com/video/284095730?title=0&byline=0&portrait=0", "tags": ["惡搞", "童年"] },
             { "id": 33, "title": "小丑", "src": "https://player.vimeo.com/video/284095036?title=0&byline=0&portrait=0", "tags": ["恐怖", "搞笑"] },
             { "id": 34, "title": "招便車啦遇到誠實的大嬸", "src": "https://player.vimeo.com/video/285424639?title=0&byline=0&portrait=0", "tags": ["日常", "搞笑"] },
             { "id": 35, "title": "輕鬆把手插入口袋", "src": "https://player.vimeo.com/video/284065007?title=0&byline=0&portrait=0", "tags": ["教學", "搞笑"] },
             { "id": 36, "title": "神片", "src": "https://player.vimeo.com/video/284070271?title=0&byline=0&portrait=0", "tags": ["搞笑", "經典"] },
             { "id": 37, "title": "肥皂劇", "src": "https://player.vimeo.com/video/284095950?title=0&byline=0&portrait=0", "tags": ["劇情", "搞笑"] },
             { "id": 38, "title": "獨角獸", "src": "https://player.vimeo.com/video/284096474?title=0&byline=0&portrait=0", "tags": ["奇幻", "搞笑"] },
             { "id": 39, "title": "fly me to the moon", "src": "https://player.vimeo.com/video/284574601?title=0&byline=0&portrait=0", "tags": ["音樂", "浪漫"] },
             { "id": 40, "title": "礦泉水", "src": "https://player.vimeo.com/video/285588008?title=0&byline=0&portrait=0", "tags": ["廣告", "搞笑"] },
             { "id": 41, "title": "The Lazy Song", "src": "https://player.vimeo.com/video/285206309?title=0&byline=0&portrait=0", "tags": ["音樂", "搞笑"] },
             { "id": 42, "title": "獻給暑假生日的傢伙", "src": "https://player.vimeo.com/video/285206466?title=0&byline=0&portrait=0", "tags": ["生日", "搞笑"] },
             { "id": 43, "title": "原始人與現代人的差別", "src": "https://player.vimeo.com/video/285206504?title=0&byline=0&portrait=0", "tags": ["教育", "搞笑"] },
             { "id": 44, "title": "恐怖預告-可愛巧虎島", "src": "https://player.vimeo.com/video/285206629?title=0&byline=0&portrait=0", "tags": ["恐怖", "惡搞"] },
             { "id": 45, "title": "閃電十一人", "src": "https://player.vimeo.com/video/285206707?title=0&byline=0&portrait=0", "tags": ["運動", "搞笑"] },
             { "id": 46, "title": "尋找香菇", "src": "https://player.vimeo.com/video/285206775?title=0&byline=0&portrait=0", "tags": ["冒險", "搞笑"] },
             { "id": 47, "title": "牙齒山的興建過程", "src": "https://player.vimeo.com/video/284073841?title=0&byline=0&portrait=0", "tags": ["建築", "搞笑"] },
             { "id": 48, "title": "今天晚上八點 準時上映不看不後悔", "src": "https://player.vimeo.com/video/284073898?title=0&byline=0&portrait=0", "tags": ["預告", "搞笑"] },
             { "id": 49, "title": "無所不知科學台", "src": "https://player.vimeo.com/video/285207087?title=0&byline=0&portrait=0", "tags": ["科學", "搞笑"] },
             { "id": 50, "title": "好神拖鞋來啦 保證你看完你會........？ 看看吧！", "src": "https://player.vimeo.com/video/284073682?title=0&byline=0&portrait=0", "tags": ["廣告", "搞笑"] },
             { "id": 51, "title": "如何對付詐騙集團", "src": "https://player.vimeo.com/video/284073616?title=0&byline=0&portrait=0", "tags": ["教學", "防詐"] },
             { "id": 52, "title": "無所不知美食台", "src": "https://player.vimeo.com/video/285233980?title=0&byline=0&portrait=0", "tags": ["美食", "搞笑"] },
             { "id": 53, "title": "無所不知新聞台之我好無聊", "src": "https://player.vimeo.com/video/285234197?title=0&byline=0&portrait=0", "tags": ["新聞", "搞笑"] },
             { "id": 54, "title": "SK粉絲大調查 第一季 第1集", "src": "https://player.vimeo.com/video/285246349?title=0&byline=0&portrait=0", "tags": ["調查", "粉絲"] },
             { "id": 55, "title": "What Do You Mean", "src": "https://player.vimeo.com/video/285423654?title=0&byline=0&portrait=0", "tags": ["音樂", "MV"] },
             { "id": 56, "title": "冰淇淋要加香腸比較好吃", "src": "https://player.vimeo.com/video/285423742?title=0&byline=0&portrait=0", "tags": ["美食", "搞笑"] },
             { "id": 57, "title": "don't wanna know", "src": "https://player.vimeo.com/video/285424037?title=0&byline=0&portrait=0", "tags": ["音樂", "MV"] },
             { "id": 58, "title": "彥之跟你來talk", "src": "https://player.vimeo.com/video/285424291?title=0&byline=0&portrait=0", "tags": ["談話", "搞笑"] },
             { "id": 59, "title": "animal", "src": "https://player.vimeo.com/video/285424526?title=0&byline=0&portrait=0", "tags": ["音樂", "動物"] },
             { "id": 60, "title": "別亂丟垃圾 心機片 冬天將至 來偷手機", "src": "https://player.vimeo.com/video/285587229?title=0&byline=0&portrait=0", "tags": ["環保", "搞笑"] },
             { "id": 61, "title": "父親節影片", "src": "https://player.vimeo.com/video/285587201?title=0&byline=0&portrait=0", "tags": ["節日", "溫馨"] },
             { "id": 62, "title": "特技投籃什麼的我才不怕呢", "src": "https://player.vimeo.com/video/284070380?title=0&byline=0&portrait=0", "tags": ["運動", "特技"] },
             { "id": 63, "title": "特效大集合", "src": "https://player.vimeo.com/video/285587815?title=0&byline=0&portrait=0", "tags": ["特效", "技術"] },
             { "id": 64, "title": "惡作劇電話", "src": "https://player.vimeo.com/video/286105666?title=0&byline=0&portrait=0", "tags": ["惡作劇", "搞笑"] },
             { "id": 65, "title": "七月半 鬼門開", "src": "https://player.vimeo.com/video/286170134?title=0&byline=0&portrait=0", "tags": ["恐怖", "節日"] },
             { "id": 66, "title": "七月半 鬼門開 2", "src": "https://player.vimeo.com/video/286170149?title=0&byline=0&portrait=0", "tags": ["恐怖", "節日"] },
             { "id": 67, "title": "不要回頭 絕對…不要", "src": "https://player.vimeo.com/video/286299717?title=0&byline=0&portrait=0", "tags": ["恐怖", "懸疑"] },
             { "id": 68, "title": "台灣好歌聲 第1季", "src": "https://player.vimeo.com/video/286451538?title=0&byline=0&portrait=0", "tags": ["音樂", "比賽"] },
             { "id": 69, "title": "台灣好歌聲 第2季", "src": "https://player.vimeo.com/video/286451223?title=0&byline=0&portrait=0", "tags": ["音樂", "比賽"] },
             { "id": 70, "title": "SK做出了史上最殘酷的決定", "src": "https://player.vimeo.com/video/287023770?title=0&byline=0&portrait=0", "tags": ["劇情", "決定"] },
             { "id": 71, "title": "星期天的讀報室 浴火重生的真英雄", "src": "https://player.vimeo.com/video/345601695?title=0&byline=0&portrait=0", "tags": ["新聞", "英雄"] },
             { "id": 72, "title": "八點檔之吾黨所忠 #1", "src": "https://player.vimeo.com/video/345601758?title=0&byline=0&portrait=0", "tags": ["劇情", "政治"] },
             { "id": 73, "title": "中秋節 月圓人團圓 真開心", "src": "https://player.vimeo.com/video/345601792?title=0&byline=0&portrait=0", "tags": ["節日", "溫馨"] },
             { "id": 74, "title": "陳顏霆官方競選影片\"作伙拚經濟\"", "src": "https://player.vimeo.com/video/345601819?title=0&byline=0&portrait=0", "tags": ["政治", "競選"] },
             { "id": 75, "title": "都是交換禮物的錯", "src": "https://player.vimeo.com/video/345601847?title=0&byline=0&portrait=0", "tags": ["節日", "搞笑"] },
             { "id": 76, "title": "陰盛陽衰之際 你怎麼能 ...頭髮", "src": "https://player.vimeo.com/video/345601910?title=0&byline=0&portrait=0", "tags": ["搞笑", "頭髮"] },
             { "id": 77, "title": "MV15 即將回歸 part2", "src": "https://player.vimeo.com/video/345601940?title=0&byline=0&portrait=0", "tags": ["MV", "預告"] },
             { "id": 78, "title": "Stupikid—韓劇", "src": "https://player.vimeo.com/video/345602002?title=0&byline=0&portrait=0", "tags": ["韓劇", "搞笑"] },
             { "id": 79, "title": "Stupikid—長髮幫的策反", "src": "https://player.vimeo.com/video/345602128?title=0&byline=0&portrait=0", "tags": ["劇情", "長髮"] },
             { "id": 80, "title": "七月最新強檔動作片", "src": "https://player.vimeo.com/video/346067907?title=0&byline=0&portrait=0", "tags": ["動作", "電影"] },
             { "id": 81, "title": "準備好亦能踏入真正的苦難，但苦難準備好了嗎？STUPIKID—枕頭戰", "src": "https://player.vimeo.com/video/346805981?title=0&byline=0&portrait=0", "tags": ["動作", "枕頭戰"] },
             { "id": 82, "title": "這是一部動作片", "src": "https://player.vimeo.com/video/558884331?title=0&byline=0&portrait=0", "tags": ["動作", "電影"] },
             { "id": 83, "title": "環島之旅-燕子", "src": "https://player.vimeo.com/video/558884375?title=0&byline=0&portrait=0", "tags": ["旅遊", "環島"] },
             { "id": 84, "title": "環島之旅-彥廷", "src": "https://player.vimeo.com/video/558884546?title=0&byline=0&portrait=0", "tags": ["旅遊", "環島"] },
             { "id": 85, "title": "少康戰情室 解決紛爭最佳良藥", "src": "https://player.vimeo.com/video/558887841?title=0&byline=0&portrait=0", "tags": ["新聞", "政治"] },
             { "id": 86, "title": "MV 15 #2 顛覆你對MV的看法", "src": "https://player.vimeo.com/video/558887877?title=0&byline=0&portrait=0", "tags": ["MV", "音樂"] },
             { "id": 87, "title": "大激戰! 人心的叵測! 矛盾對決! 鋼鐵手指大戰鋼鐵奶頭!", "src": "https://www.youtube.com/embed/0f3_zJBxjXA?title=0&byline=0&portrait=0", "tags": ["動作", "戰鬥"] },
             { "id": 88, "title": "Stupikid Returns", "src": "https://player.vimeo.com/video/558891006?title=0&byline=0&portrait=0", "tags": ["回歸", "經典"] },
             { "id": 89, "title": "失火啦", "src": "https://player.vimeo.com/video/563038130?title=0&byline=0&portrait=0", "tags": ["緊急", "搞笑"] },
             { "id": 90, "title": "都是第二名的錯", "src": "https://player.vimeo.com/video/563038082?title=0&byline=0&portrait=0", "tags": ["競爭", "搞笑"] },
             { "id": 91, "title": "秉豪的物理實驗室", "src": "https://player.vimeo.com/video/563037330?title=0&byline=0&portrait=0", "tags": ["科學", "實驗"] },
             { "id": 92, "title": "秉豪的物理實驗室 IG版", "src": "https://player.vimeo.com/video/563037007?title=0&byline=0&portrait=0", "tags": ["科學", "實驗", "IG"] },
             { "id": 93, "title": "端午佳節 闔家平安", "src": "https://player.vimeo.com/video/563037604?title=0&byline=0&portrait=0", "tags": ["節日", "端午"] }
            ];

        let currentVideos = videos;
        let recommendedVideos = [];
        let isShowingAll = false;

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            generateRecommendedVideos();
            setupSearch();
            setupButtons();
        });

        // 生成推薦影片（隨機選擇9部）
        function generateRecommendedVideos() {
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
            
            currentVideos.forEach(video => {
                const videoCard = createVideoCard(video);
                grid.appendChild(videoCard);
            });
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
                    <div class="video-number">#${video.id}</div>
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
                        <iframe src="${video.src}&autoplay=1" 
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
            
            // 重新生成推薦影片
            generateRecommendedVideos();
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

            // 在所有93部影片中搜尋
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
                // 等待Vimeo iframe加載完成後應用CSS


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
                // 檢查是否已經認證過
                if (this.isAuthenticated()) {
                    setTimeout(() => {
                        this.unlockContent();
                    }, 100);
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

       

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['style', 'class']
        });
