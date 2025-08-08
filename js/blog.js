// 博客页面功能
class BlogManager {
    constructor() {
        this.articles = [];
        this.currentCategory = 'all';
        this.articlesPerPage = 6;
        this.currentPage = 1;
        
        this.initializeElements();
        this.bindEvents();
        this.loadArticles();
    }

    initializeElements() {
        this.articlesGrid = document.getElementById('articlesGrid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.newsletterForm = document.getElementById('newsletterForm');
    }

    bindEvents() {
        // 分类筛选
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterArticles(e.target.dataset.category);
            });
        });

        // 加载更多
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.loadMoreArticles();
            });
        }

        // 订阅表单
        if (this.newsletterForm) {
            this.newsletterForm.addEventListener('submit', (e) => {
                this.handleNewsletterSubmit(e);
            });
        }

        // 文章卡片点击
        this.articlesGrid.addEventListener('click', (e) => {
            const articleCard = e.target.closest('.article-card');
            if (articleCard) {
                this.handleArticleClick(articleCard);
            }
        });
    }

    loadArticles() {
        // 模拟从API加载文章数据
        this.articles = this.getArticlesData();
        this.renderArticles();
    }

    getArticlesData() {
        return [
            {
                id: 1,
                title: '超慢跑初学者完整指南',
                excerpt: '从零开始学习超慢跑，掌握正确的姿势和呼吸方法。本文将详细介绍超慢跑的基本原理、训练方法和注意事项...',
                category: 'training',
                categoryName: '训练技巧',
                date: '2024-01-15',
                readTime: '5分钟阅读',
                views: '1.2k 阅读',
                tags: ['初学者', '基础训练', '姿势指导'],
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            {
                id: 2,
                title: '超慢跑前后的营养补充',
                excerpt: '科学的营养搭配让你的训练效果事半功倍。了解运动前后应该吃什么，如何补充水分和电解质...',
                category: 'nutrition',
                categoryName: '营养建议',
                date: '2024-01-12',
                readTime: '3分钟阅读',
                views: '856 阅读',
                tags: ['营养', '补充', '水分'],
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            },
            {
                id: 3,
                title: '30天超慢跑挑战成功案例',
                excerpt: '真实用户分享他们的超慢跑转变之旅。看看他们是如何在30天内改善体质、减轻体重、提升精神状态的...',
                category: 'success',
                categoryName: '成功案例',
                date: '2024-01-10',
                readTime: '7分钟阅读',
                views: '2.1k 阅读',
                tags: ['案例分享', '30天挑战', '减重'],
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            },
            {
                id: 4,
                title: '超慢跑对心血管健康的影响',
                excerpt: '最新科学研究表明，超慢跑对心血管系统有显著的积极影响。本文解读相关研究数据和医学发现...',
                category: 'science',
                categoryName: '科学研究',
                date: '2024-01-08',
                readTime: '6分钟阅读',
                views: '945 阅读',
                tags: ['科学研究', '心血管', '健康'],
                gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
            },
            {
                id: 5,
                title: '如何制定个人超慢跑训练计划',
                excerpt: '根据个人情况制定科学的训练计划是成功的关键。学习如何评估自己的体能水平，设定合理目标...',
                category: 'training',
                categoryName: '训练技巧',
                date: '2024-01-05',
                readTime: '8分钟阅读',
                views: '1.5k 阅读',
                tags: ['训练计划', '个人定制', '目标设定'],
                gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            },
            {
                id: 6,
                title: '超慢跑减重的饮食搭配',
                excerpt: '想要通过超慢跑达到减重效果？合理的饮食搭配同样重要。了解如何在运动期间调整饮食结构...',
                category: 'nutrition',
                categoryName: '营养建议',
                date: '2024-01-03',
                readTime: '4分钟阅读',
                views: '1.8k 阅读',
                tags: ['减重', '饮食', '搭配'],
                gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
            },
            {
                id: 7,
                title: '超慢跑中的呼吸技巧',
                excerpt: '正确的呼吸方法能让你的超慢跑更加轻松有效。学习如何调节呼吸节奏，提高运动效率...',
                category: 'training',
                categoryName: '训练技巧',
                date: '2024-01-01',
                readTime: '5分钟阅读',
                views: '1.3k 阅读',
                tags: ['呼吸技巧', '运动效率', '节奏'],
                gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
            },
            {
                id: 8,
                title: '从久坐族到超慢跑达人',
                excerpt: '办公室白领小王的健康转变故事。看他如何从每天久坐8小时，到爱上超慢跑，重获健康活力...',
                category: 'success',
                categoryName: '成功案例',
                date: '2023-12-28',
                readTime: '6分钟阅读',
                views: '2.5k 阅读',
                tags: ['久坐族', '健康转变', '白领'],
                gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
            }
        ];
    }

    renderArticles() {
        const filteredArticles = this.getFilteredArticles();
        const articlesToShow = filteredArticles.slice(0, this.currentPage * this.articlesPerPage);
        
        this.articlesGrid.innerHTML = '';
        
        articlesToShow.forEach((article, index) => {
            const articleElement = this.createArticleElement(article);
            articleElement.style.animationDelay = `${index * 0.1}s`;
            this.articlesGrid.appendChild(articleElement);
        });

        // 更新加载更多按钮状态
        this.updateLoadMoreButton(filteredArticles.length, articlesToShow.length);
    }

    createArticleElement(article) {
        const articleDiv = document.createElement('article');
        articleDiv.className = 'article-card fade-in';
        articleDiv.dataset.category = article.category;
        articleDiv.dataset.id = article.id;

        articleDiv.innerHTML = `
            <div class="article-image">
                <div class="article-placeholder" style="background: ${article.gradient};"></div>
                <span class="article-category">${article.categoryName}</span>
            </div>
            <div class="article-content">
                <h2>${article.title}</h2>
                <p>${article.excerpt}</p>
                <div class="article-meta">
                    <span class="article-date">${article.date}</span>
                    <span class="article-read">${article.readTime}</span>
                    <span class="article-views">${article.views}</span>
                </div>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        return articleDiv;
    }

    getFilteredArticles() {
        if (this.currentCategory === 'all') {
            return this.articles;
        }
        return this.articles.filter(article => article.category === this.currentCategory);
    }

    filterArticles(category) {
        this.currentCategory = category;
        this.currentPage = 1;

        // 更新按钮状态
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        // 添加过渡效果
        this.articlesGrid.style.opacity = '0';
        setTimeout(() => {
            this.renderArticles();
            this.articlesGrid.style.opacity = '1';
        }, 200);
    }

    loadMoreArticles() {
        this.currentPage++;
        this.renderArticles();
        
        // 滚动到新加载的内容
        setTimeout(() => {
            const newArticles = this.articlesGrid.querySelectorAll('.article-card');
            const targetArticle = newArticles[Math.max(0, (this.currentPage - 1) * this.articlesPerPage)];
            if (targetArticle) {
                targetArticle.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    updateLoadMoreButton(totalFiltered, currentlyShown) {
        if (!this.loadMoreBtn) return;

        if (currentlyShown >= totalFiltered) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
            this.loadMoreBtn.textContent = `加载更多文章 (${totalFiltered - currentlyShown} 篇剩余)`;
        }
    }

    handleArticleClick(articleCard) {
        const articleId = articleCard.dataset.id;
        const article = this.articles.find(a => a.id == articleId);
        
        if (article) {
            // 这里可以跳转到文章详情页
            // window.location.href = `article.html?id=${articleId}`;
            
            // 或者显示文章预览模态框
            this.showArticlePreview(article);
        }
    }

    showArticlePreview(article) {
        // 创建模态框显示文章预览
        const modal = document.createElement('div');
        modal.className = 'article-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${article.title}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="article-meta">
                            <span class="article-category">${article.categoryName}</span>
                            <span class="article-date">${article.date}</span>
                            <span class="article-read">${article.readTime}</span>
                        </div>
                        <p>${article.excerpt}</p>
                        <div class="article-tags">
                            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-primary">阅读全文</button>
                            <button class="btn btn-secondary modal-close">关闭</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加模态框样式
        const style = document.createElement('style');
        style.textContent = `
            .article-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }
            
            .modal-content {
                background: white;
                border-radius: 16px;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: var(--shadow-xl);
                animation: slideUp 0.3s ease-out;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 2rem 2rem 1rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 1.5rem;
                line-height: 1.4;
                flex: 1;
                margin-right: 1rem;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: var(--text-light);
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .modal-close:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
            
            .modal-body {
                padding: 1rem 2rem 2rem;
            }
            
            .modal-body .article-meta {
                margin-bottom: 1rem;
                gap: 1rem;
            }
            
            .modal-body p {
                font-size: 1.1rem;
                line-height: 1.7;
                margin-bottom: 1.5rem;
                color: var(--text-secondary);
            }
            
            .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(30px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @media (max-width: 768px) {
                .modal-overlay {
                    padding: 1rem;
                }
                
                .modal-header {
                    padding: 1.5rem 1.5rem 1rem;
                }
                
                .modal-body {
                    padding: 1rem 1.5rem 1.5rem;
                }
                
                .modal-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // 绑定关闭事件
        const closeButtons = modal.querySelectorAll('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(modal, style));
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(modal, style);
            }
        });

        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal, style);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    closeModal(modal, style) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
            document.body.style.overflow = '';
        }, 300);
    }

    handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const emailInput = e.target.querySelector('input[type="email"]');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();

        if (!email) return;

        // 显示加载状态
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '订阅中...';
        submitBtn.disabled = true;

        // 模拟API调用
        setTimeout(() => {
            // 显示成功消息
            this.showNotification('订阅成功！感谢您的关注，我们会定期发送最新内容到您的邮箱。', 'success');
            
            // 重置表单
            emailInput.value = '';
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // 添加通知样式
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: var(--shadow-lg);
                border-left: 4px solid var(--primary-color);
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
                max-width: 400px;
                font-weight: 500;
            }
            
            .notification-success {
                border-left-color: #10b981;
                background: #f0fdf4;
                color: #065f46;
            }
            
            .notification-error {
                border-left-color: #ef4444;
                background: #fef2f2;
                color: #991b1b;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // 自动移除通知
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                    document.head.removeChild(style);
                }
            }, 300);
        }, 4000);
    }
}

// 初始化博客管理器
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});

// 导航栏滚动效果
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});