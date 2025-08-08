// 国际化支持系统
class I18n {
    constructor() {
        this.currentLang = this.detectLanguage();
        this.translations = {};
        this.loadTranslations();
        this.init();
    }

    // 检测用户语言
    detectLanguage() {
        // 优先从localStorage获取用户设置
        const savedLang = localStorage.getItem('superslowrun_language');
        if (savedLang) return savedLang;
        
        // 从浏览器语言检测
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('zh')) return 'zh-CN';
        if (browserLang.startsWith('en')) return 'en';
        if (browserLang.startsWith('ja')) return 'ja';
        if (browserLang.startsWith('ko')) return 'ko';
        
        return 'zh-CN'; // 默认中文
    }

    // 加载翻译数据
    loadTranslations() {
        this.translations = {
            'zh-CN': {
                // 导航
                'nav.home': '首页',
                'nav.tools': '工具',
                'nav.blog': '博客',
                'nav.about': '关于',
                
                // 主页
                'hero.title': '超慢跑',
                'hero.subtitle': '健康生活新方式',
                'hero.description': '超慢跑是一种革命性的低强度有氧运动，以比走路稍快的速度进行，让您在享受运动乐趣的同时，获得最佳的健康效果。',
                'hero.stats.steps': '步/分钟',
                'hero.stats.speed': '公里/小时',
                'hero.stats.heartrate': '最大心率',
                'hero.btn.tools': '使用工具',
                'hero.btn.learn': '了解更多',
                
                // 工具
                'tools.title': '专业工具',
                'tools.subtitle': '科学训练，事半功倍',
                'tools.app.title': '超慢跑专业应用',
                'tools.app.desc': '完整的超慢跑训练体验，包含节拍器、实时指导、数据记录和社区功能',
                'tools.app.btn': '立即体验',
                'tools.checkin.title': '打卡记录工具',
                'tools.checkin.desc': '记录每天的超慢跑打卡，以月为单位查看运动记录，坚持每一天的运动习惯。',
                'tools.checkin.btn': '开始打卡',
                'tools.calculator.title': '卡路里计算器',
                'tools.calculator.desc': '精确计算运动消耗，帮助制定合理的健身目标',
                'tools.calculator.btn': '开始计算',
                
                // 关于
                'about.title': '什么是超慢跑？',
                'about.benefit1.title': '低强度高效果',
                'about.benefit1.desc': '以60-70%最大心率进行，既能燃脂又不会过度疲劳',
                'about.benefit2.title': '保护关节',
                'about.benefit2.desc': '减少对膝盖和脚踝的冲击，适合所有年龄段',
                'about.benefit3.title': '提升专注力',
                'about.benefit3.desc': '有氧运动促进大脑血液循环，提高认知能力',
                'about.benefit4.title': '改善心情',
                'about.benefit4.desc': '释放内啡肽，缓解压力，提升整体幸福感',
                'about.stats.title': '科学数据支持',
                'about.stats.fat': '燃脂效率',
                'about.stats.joint': '关节保护',
                'about.stats.sustain': '持续性',
                
                // 博客
                'blog.title': '最新文章',
                'blog.subtitle': '专业知识，助力健康',
                'blog.btn': '查看所有文章',
                
                // 打卡记录
                'checkin.title': '超慢跑打卡记录',
                'checkin.subtitle': '记录每一天的坚持，见证自己的成长',
                'checkin.stats.streak': '连续打卡',
                'checkin.stats.month': '本月打卡',
                'checkin.stats.time': '总时长(分钟)',
                'checkin.stats.days': '累计天数',
                'checkin.today.title': '今日打卡',
                'checkin.form.duration': '运动时长 (分钟)',
                'checkin.form.duration.placeholder': '请输入运动时长',
                'checkin.form.feeling': '运动感受',
                'checkin.form.feeling.placeholder': '选择感受',
                'checkin.form.feeling.excellent': '😄 非常棒',
                'checkin.form.feeling.good': '😊 感觉良好',
                'checkin.form.feeling.normal': '😐 一般般',
                'checkin.form.feeling.tired': '😓 有点累',
                'checkin.form.feeling.hard': '😰 很辛苦',
                'checkin.form.notes': '备注 (可选)',
                'checkin.form.notes.placeholder': '记录今天的运动心得...',
                'checkin.form.submit': '完成打卡',
                'checkin.success.title': '打卡成功！',
                'checkin.success.desc': '今天的运动已记录，继续保持！',
                'checkin.success.edit': '修改记录',
                'checkin.modal.title': '打卡详情',
                'checkin.modal.duration': '运动时长',
                'checkin.modal.feeling': '运动感受',
                'checkin.modal.notes': '备注',
                'checkin.modal.time': '打卡时间',
                'checkin.modal.empty': '这一天还没有打卡记录',
                
                // 日历
                'calendar.days': ['日', '一', '二', '三', '四', '五', '六'],
                'calendar.months': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                
                // 页脚
                'footer.description': '让健康生活变得简单而有趣',
                'footer.links': '快速链接',
                'footer.tools': '工具',
                'footer.contact': '联系我们',
                'footer.email': '邮箱: info@superslowrun.com',
                'footer.wechat': '微信: SuperSlowRun',
                'footer.copyright': '保留所有权利.',
                
                // 通用
                'common.loading': '加载中...',
                'common.error': '出错了',
                'common.success': '成功',
                'common.confirm': '确认',
                'common.cancel': '取消',
                'common.close': '关闭',
                'common.save': '保存',
                'common.delete': '删除',
                'common.edit': '编辑'
            },
            
            'en': {
                // Navigation
                'nav.home': 'Home',
                'nav.tools': 'Tools',
                'nav.blog': 'Blog',
                'nav.about': 'About',
                
                // Hero
                'hero.title': 'Super Slow Running',
                'hero.subtitle': 'A New Way of Healthy Living',
                'hero.description': 'Super slow running is a revolutionary low-intensity aerobic exercise performed at a pace slightly faster than walking, allowing you to enjoy the fun of exercise while achieving optimal health benefits.',
                'hero.stats.steps': 'steps/min',
                'hero.stats.speed': 'km/h',
                'hero.stats.heartrate': 'max heart rate',
                'hero.btn.tools': 'Use Tools',
                'hero.btn.learn': 'Learn More',
                
                // Tools
                'tools.title': 'Professional Tools',
                'tools.subtitle': 'Scientific Training, Maximum Efficiency',
                'tools.app.title': 'Super Slow Running App',
                'tools.app.desc': 'Complete super slow running training experience with metronome, real-time guidance, data recording and community features',
                'tools.app.btn': 'Try Now',
                'tools.checkin.title': 'Check-in Tracker',
                'tools.checkin.desc': 'Record your daily super slow running check-ins, view monthly exercise records, and maintain daily exercise habits.',
                'tools.checkin.btn': 'Start Check-in',
                'tools.calculator.title': 'Calorie Calculator',
                'tools.calculator.desc': 'Accurately calculate exercise consumption and help set reasonable fitness goals',
                'tools.calculator.btn': 'Start Calculating',
                
                // About
                'about.title': 'What is Super Slow Running?',
                'about.benefit1.title': 'Low Intensity, High Effect',
                'about.benefit1.desc': 'Exercise at 60-70% maximum heart rate for fat burning without excessive fatigue',
                'about.benefit2.title': 'Joint Protection',
                'about.benefit2.desc': 'Reduces impact on knees and ankles, suitable for all ages',
                'about.benefit3.title': 'Improve Focus',
                'about.benefit3.desc': 'Aerobic exercise promotes brain blood circulation and improves cognitive ability',
                'about.benefit4.title': 'Mood Enhancement',
                'about.benefit4.desc': 'Release endorphins, relieve stress, and improve overall well-being',
                'about.stats.title': 'Scientific Data Support',
                'about.stats.fat': 'Fat Burning Efficiency',
                'about.stats.joint': 'Joint Protection',
                'about.stats.sustain': 'Sustainability',
                
                // Blog
                'blog.title': 'Latest Articles',
                'blog.subtitle': 'Professional Knowledge for Better Health',
                'blog.btn': 'View All Articles',
                
                // Check-in
                'checkin.title': 'Super Slow Running Check-in',
                'checkin.subtitle': 'Record daily persistence and witness your growth',
                'checkin.stats.streak': 'Current Streak',
                'checkin.stats.month': 'This Month',
                'checkin.stats.time': 'Total Time (min)',
                'checkin.stats.days': 'Total Days',
                'checkin.today.title': 'Today\'s Check-in',
                'checkin.form.duration': 'Exercise Duration (minutes)',
                'checkin.form.duration.placeholder': 'Enter exercise duration',
                'checkin.form.feeling': 'How do you feel?',
                'checkin.form.feeling.placeholder': 'Select feeling',
                'checkin.form.feeling.excellent': '😄 Excellent',
                'checkin.form.feeling.good': '😊 Good',
                'checkin.form.feeling.normal': '😐 Normal',
                'checkin.form.feeling.tired': '😓 Tired',
                'checkin.form.feeling.hard': '😰 Hard',
                'checkin.form.notes': 'Notes (Optional)',
                'checkin.form.notes.placeholder': 'Record today\'s exercise thoughts...',
                'checkin.form.submit': 'Complete Check-in',
                'checkin.success.title': 'Check-in Successful!',
                'checkin.success.desc': 'Today\'s exercise has been recorded, keep it up!',
                'checkin.success.edit': 'Edit Record',
                'checkin.modal.title': 'Check-in Details',
                'checkin.modal.duration': 'Exercise Duration',
                'checkin.modal.feeling': 'Feeling',
                'checkin.modal.notes': 'Notes',
                'checkin.modal.time': 'Check-in Time',
                'checkin.modal.empty': 'No check-in record for this day',
                
                // Calendar
                'calendar.days': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                'calendar.months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                
                // Footer
                'footer.description': 'Making healthy living simple and fun',
                'footer.links': 'Quick Links',
                'footer.tools': 'Tools',
                'footer.contact': 'Contact Us',
                'footer.email': 'Email: info@superslowrun.com',
                'footer.wechat': 'WeChat: SuperSlowRun',
                'footer.copyright': 'All rights reserved.',
                
                // Common
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                'common.confirm': 'Confirm',
                'common.cancel': 'Cancel',
                'common.close': 'Close',
                'common.save': 'Save',
                'common.delete': 'Delete',
                'common.edit': 'Edit'
            },
            
            'ja': {
                // Navigation
                'nav.home': 'ホーム',
                'nav.tools': 'ツール',
                'nav.blog': 'ブログ',
                'nav.about': 'について',
                
                // Hero
                'hero.title': 'スーパースローランニング',
                'hero.subtitle': '健康的な生活の新しい方法',
                'hero.description': 'スーパースローランニングは、歩行よりもわずかに速いペースで行う革新的な低強度有酸素運動で、運動の楽しさを味わいながら最適な健康効果を得ることができます。',
                'hero.stats.steps': '歩/分',
                'hero.stats.speed': 'km/時',
                'hero.stats.heartrate': '最大心拍数',
                'hero.btn.tools': 'ツールを使用',
                'hero.btn.learn': '詳細を見る',
                
                // Tools
                'tools.title': 'プロフェッショナルツール',
                'tools.subtitle': '科学的トレーニング、最大効率',
                'tools.app.title': 'スーパースローランニングアプリ',
                'tools.app.desc': 'メトロノーム、リアルタイムガイダンス、データ記録、コミュニティ機能を含む完全なスーパースローランニングトレーニング体験',
                'tools.app.btn': '今すぐ試す',
                'tools.checkin.title': 'チェックイントラッカー',
                'tools.checkin.desc': '毎日のスーパースローランニングチェックインを記録し、月単位で運動記録を確認し、毎日の運動習慣を維持します。',
                'tools.checkin.btn': 'チェックイン開始',
                'tools.calculator.title': 'カロリー計算機',
                'tools.calculator.desc': '運動消費を正確に計算し、合理的なフィットネス目標の設定を支援',
                'tools.calculator.btn': '計算開始',
                
                // About
                'about.title': 'スーパースローランニングとは？',
                'about.benefit1.title': '低強度、高効果',
                'about.benefit1.desc': '最大心拍数の60-70%で運動し、過度な疲労なしに脂肪燃焼',
                'about.benefit2.title': '関節保護',
                'about.benefit2.desc': '膝と足首への衝撃を軽減し、すべての年齢に適している',
                'about.benefit3.title': '集中力向上',
                'about.benefit3.desc': '有酸素運動が脳の血液循環を促進し、認知能力を向上',
                'about.benefit4.title': '気分改善',
                'about.benefit4.desc': 'エンドルフィンを放出し、ストレスを軽減し、全体的な幸福感を向上',
                'about.stats.title': '科学的データサポート',
                'about.stats.fat': '脂肪燃焼効率',
                'about.stats.joint': '関節保護',
                'about.stats.sustain': '持続性',
                
                // Blog
                'blog.title': '最新記事',
                'blog.subtitle': 'より良い健康のための専門知識',
                'blog.btn': 'すべての記事を見る',
                
                // Check-in
                'checkin.title': 'スーパースローランニングチェックイン',
                'checkin.subtitle': '毎日の継続を記録し、成長を見届ける',
                'checkin.stats.streak': '連続チェックイン',
                'checkin.stats.month': '今月',
                'checkin.stats.time': '総時間（分）',
                'checkin.stats.days': '累計日数',
                'checkin.today.title': '今日のチェックイン',
                'checkin.form.duration': '運動時間（分）',
                'checkin.form.duration.placeholder': '運動時間を入力',
                'checkin.form.feeling': '気分はどうですか？',
                'checkin.form.feeling.placeholder': '気分を選択',
                'checkin.form.feeling.excellent': '😄 素晴らしい',
                'checkin.form.feeling.good': '😊 良い',
                'checkin.form.feeling.normal': '😐 普通',
                'checkin.form.feeling.tired': '😓 疲れた',
                'checkin.form.feeling.hard': '😰 きつい',
                'checkin.form.notes': 'メモ（オプション）',
                'checkin.form.notes.placeholder': '今日の運動の感想を記録...',
                'checkin.form.submit': 'チェックイン完了',
                'checkin.success.title': 'チェックイン成功！',
                'checkin.success.desc': '今日の運動が記録されました。続けてください！',
                'checkin.success.edit': '記録を編集',
                'checkin.modal.title': 'チェックイン詳細',
                'checkin.modal.duration': '運動時間',
                'checkin.modal.feeling': '気分',
                'checkin.modal.notes': 'メモ',
                'checkin.modal.time': 'チェックイン時間',
                'checkin.modal.empty': 'この日のチェックイン記録はありません',
                
                // Calendar
                'calendar.days': ['日', '月', '火', '水', '木', '金', '土'],
                'calendar.months': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                
                // Footer
                'footer.description': '健康的な生活をシンプルで楽しくする',
                'footer.links': 'クイックリンク',
                'footer.tools': 'ツール',
                'footer.contact': 'お問い合わせ',
                'footer.email': 'メール: info@superslowrun.com',
                'footer.wechat': 'WeChat: SuperSlowRun',
                'footer.copyright': 'すべての権利を保有。',
                
                // Common
                'common.loading': '読み込み中...',
                'common.error': 'エラー',
                'common.success': '成功',
                'common.confirm': '確認',
                'common.cancel': 'キャンセル',
                'common.close': '閉じる',
                'common.save': '保存',
                'common.delete': '削除',
                'common.edit': '編集'
            }
        };
    }

    // 初始化
    init() {
        this.createLanguageSelector();
        this.translatePage();
        this.updatePageLanguage();
    }

    // 创建语言选择器
    createLanguageSelector() {
        const selector = document.createElement('div');
        selector.className = 'language-selector';
        selector.innerHTML = `
            <button class="lang-btn" id="langBtn">
                <span class="lang-icon">🌐</span>
                <span class="lang-text">${this.getLanguageName(this.currentLang)}</span>
                <span class="lang-arrow">▼</span>
            </button>
            <div class="lang-dropdown" id="langDropdown">
                <div class="lang-option" data-lang="zh-CN">🇨🇳 中文</div>
                <div class="lang-option" data-lang="en">🇺🇸 English</div>
                <div class="lang-option" data-lang="ja">🇯🇵 日本語</div>
            </div>
        `;

        // 添加到导航栏
        const navbar = document.querySelector('.nav-container');
        if (navbar) {
            navbar.appendChild(selector);
        }

        // 绑定事件
        this.bindLanguageSelectorEvents();
    }

    // 绑定语言选择器事件
    bindLanguageSelectorEvents() {
        const langBtn = document.getElementById('langBtn');
        const langDropdown = document.getElementById('langDropdown');
        const langOptions = document.querySelectorAll('.lang-option');

        if (langBtn && langDropdown) {
            langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                langDropdown.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                langDropdown.classList.remove('show');
            });

            langOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    const lang = e.target.dataset.lang;
                    this.changeLanguage(lang);
                    langDropdown.classList.remove('show');
                });
            });
        }
    }

    // 获取语言名称
    getLanguageName(lang) {
        const names = {
            'zh-CN': '中文',
            'en': 'English',
            'ja': '日本語'
        };
        return names[lang] || '中文';
    }

    // 切换语言
    changeLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('superslowrun_language', lang);
            this.translatePage();
            this.updatePageLanguage();
            
            // 更新语言按钮文本
            const langText = document.querySelector('.lang-text');
            if (langText) {
                langText.textContent = this.getLanguageName(lang);
            }
            
            // 触发语言变更事件
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        }
    }

    // 翻译页面
    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.t(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type !== 'submit') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    // 更新页面语言属性
    updatePageLanguage() {
        document.documentElement.lang = this.currentLang;
        
        // 更新页面方向（如果需要RTL语言支持）
        const rtlLanguages = ['ar', 'he', 'fa'];
        document.documentElement.dir = rtlLanguages.includes(this.currentLang) ? 'rtl' : 'ltr';
    }

    // 获取翻译文本
    t(key, params = {}) {
        const translation = this.translations[this.currentLang]?.[key] || 
                          this.translations['zh-CN']?.[key] || 
                          key;
        
        // 简单的参数替换
        return Object.keys(params).reduce((text, param) => {
            return text.replace(`{${param}}`, params[param]);
        }, translation);
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 获取所有支持的语言
    getSupportedLanguages() {
        return Object.keys(this.translations);
    }
}

// 全局实例
window.i18n = new I18n();

// 导出翻译函数供其他脚本使用
window.t = (key, params) => window.i18n.t(key, params);