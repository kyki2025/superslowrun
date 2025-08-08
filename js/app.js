// 应用页面JavaScript功能

// 编码后的应用地址（避免明文显示）
const encodedAppUrl = 'aHR0cHM6Ly9hcHAtNWFhbzIyajA5eHhlLmFwcG1pYW9kYS5jb20v';

// 解码应用地址
function decodeAppUrl() {
    try {
        return atob(encodedAppUrl);
    } catch (e) {
        console.error('地址解码失败:', e);
        return null;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    const appFrame = document.getElementById('appFrame');
    const appUrl = decodeAppUrl();
    
    if (appUrl) {
        // 设置iframe源地址
        appFrame.src = appUrl;
        
        // 设置加载超时
        setTimeout(() => {
            if (document.getElementById('loadingOverlay').style.display !== 'none') {
                showError();
            }
        }, 15000); // 15秒超时
    } else {
        showError();
    }
}

// 隐藏加载动画
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const appFrame = document.getElementById('appFrame');
    
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    
    if (appFrame) {
        appFrame.classList.add('loaded');
    }
}

// 显示错误信息
function showError() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    
    if (errorMessage) {
        errorMessage.style.display = 'flex';
    }
}

// 重新加载应用
function retryLoad() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const errorMessage = document.getElementById('errorMessage');
    const appFrame = document.getElementById('appFrame');
    
    // 显示加载动画
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // 隐藏错误信息
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
    
    // 重置iframe
    if (appFrame) {
        appFrame.classList.remove('loaded');
        appFrame.src = '';
        
        // 延迟重新加载
        setTimeout(() => {
            const appUrl = decodeAppUrl();
            if (appUrl) {
                appFrame.src = appUrl;
            }
        }, 500);
    }
}

// 返回主页
function goBack() {
    // 检查是否有历史记录
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // 直接跳转到主页
        window.location.href = '../index.html';
    }
}

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // ESC键返回主页
    if (e.key === 'Escape') {
        goBack();
    }
    
    // F5或Ctrl+R刷新应用
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        retryLoad();
    }
});

// 处理iframe通信（如果需要）
window.addEventListener('message', function(event) {
    // 验证消息来源
    const appUrl = decodeAppUrl();
    if (appUrl && event.origin === new URL(appUrl).origin) {
        // 处理来自应用的消息
        handleAppMessage(event.data);
    }
});

// 处理应用消息
function handleAppMessage(data) {
    try {
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        
        // 根据消息类型处理
        switch (data.type) {
            case 'app_ready':
                console.log('应用已准备就绪');
                break;
            case 'app_error':
                console.error('应用错误:', data.message);
                showError();
                break;
            default:
                console.log('收到应用消息:', data);
        }
    } catch (e) {
        console.error('消息处理错误:', e);
    }
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时的处理
        console.log('页面已隐藏');
    } else {
        // 页面显示时的处理
        console.log('页面已显示');
    }
});

// 窗口大小变化处理
window.addEventListener('resize', function() {
    // 确保iframe适应新的窗口大小
    const appFrame = document.getElementById('appFrame');
    if (appFrame) {
        // 触发iframe重新计算大小
        appFrame.style.height = 'calc(100vh - 60px)';
    }
});

// 防止右键菜单（可选）
document.addEventListener('contextmenu', function(e) {
    // 只在iframe区域禁用右键菜单
    if (e.target.tagName === 'IFRAME') {
        e.preventDefault();
    }
});

// 页面卸载前的清理
window.addEventListener('beforeunload', function() {
    // 清理资源
    const appFrame = document.getElementById('appFrame');
    if (appFrame) {
        appFrame.src = 'about:blank';
    }
});