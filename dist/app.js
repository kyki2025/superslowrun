/**
 * 超慢跑助手 - 主应用类
 * 整合所有功能模块，提供统一的入口
 */

class SuperSlowRunApp {
    constructor() {
        // 初始化核心功能
        this.core = new SuperSlowRunCore();
        
        // 初始化辅助方法
        this.methods = new SuperSlowRunMethods(this.core);
        
        // 全局引用
        window.appCore = this.core;
        window.appMethods = this.methods;
        
        // 初始化应用
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        console.log('🏃‍♂️ 超慢跑助手应用初始化中...');
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    /**
     * DOM加载完成后的初始化
     */
    onDOMReady() {
        // 初始化页面显示
        this.initPageDisplay();
        
        // 启动页面动画
        this.startPageAnimations();
        
        console.log('✅ 超慢跑助手应用初始化完成');
        console.log('📊 当前统计数据:', this.core.stats);
    }

    /**
     * 初始化页面显示
     */
    initPageDisplay() {
        // 更新所有显示元素
        this.methods.updateAllDisplays();
        
        // 设置初始状态
        this.setInitialStates();
        
        // 更新按钮状态
        this.updateButtonStates();
    }

    /**
     * 设置初始状态
     */
    setInitialStates() {
        // 设置音量滑块
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.core.state.volume * 100;
        }
        
        // 设置自定义时间输入
        const customInput = document.getElementById('custom-minutes');
        if (customInput) {
            customInput.value = this.core.state.currentDuration;
        }
        
        // 隐藏运动覆盖层
        const exerciseOverlay = document.getElementById('exercise-overlay');
        if (exerciseOverlay) {
            exerciseOverlay.style.display = 'none';
        }
    }

    /**
     * 更新按钮状态
     */
    updateButtonStates() {
        this.methods.updatePresetButtons();
        this.methods.updateTimePresetButtons();
        this.methods.updateSoundButtons();
        this.methods.updateMetronomeUI();
        this.methods.updateVolumeDisplay();
    }

    /**
     * 启动页面动画
     */
    startPageAnimations() {
        // 渐次显示卡片
        const cards = document.querySelectorAll('.module-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
        
        // 头部区域动画
        const header = document.querySelector('.app-header');
        if (header) {
            header.style.opacity = '0';
            header.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                header.style.opacity = '1';
                header.style.transform = 'translateY(0)';
            }, 50);
        }
    }

    /**
     * 获取应用版本信息
     */
    getAppInfo() {
        return {
            name: '超慢跑助手',
            version: '1.0.0',
            author: '超慢跑团队',
            description: '专业的超慢跑辅助工具',
            features: [
                '智能节拍器',
                '运动计时器', 
                '数据统计',
                '本地存储'
            ]
        };
    }

    /**
     * 获取应用统计信息
     */
    getAppStats() {
        return {
            core: this.core.stats,
            runtime: {
                isMetronomeRunning: this.core.state.isMetronomeRunning,
                isExerciseRunning: this.core.state.isExerciseRunning,
                currentBPM: this.core.state.bpm,
                currentSound: this.core.state.currentSound,
                volume: this.core.state.volume
            }
        };
    }

    /**
     * 重置应用数据
     */
    resetAppData() {
        if (confirm('确定要重置所有数据吗？这操作不可撤销！')) {
            // 停止所有运行中的功能
            this.core.stopMetronome();
            this.core.stopExercise();
            
            // 清除本地存储
            localStorage.removeItem('superslowrun_data');
            localStorage.removeItem('superslowrun_records');
            
            // 重新加载页面
            location.reload();
        }
    }

    /**
     * 导出数据
     */
    exportData() {
        const data = {
            stats: this.core.stats,
            records: this.core.loadExerciseRecords(),
            exportTime: new Date().toISOString(),
            appVersion: this.getAppInfo().version
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `超慢跑数据_${new Date().getFullYear()}_${(new Date().getMonth() + 1).toString().padStart(2, '0')}_${new Date().getDate().toString().padStart(2, '0')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.methods.showFeedback('数据已导出');
    }

    /**
     * 导入数据
     */
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.stats && data.records) {
                    // 备份当前数据
                    const backup = {
                        stats: this.core.stats,
                        records: this.core.loadExerciseRecords()
                    };
                    localStorage.setItem('superslowrun_backup', JSON.stringify(backup));
                    
                    // 导入新数据
                    Object.assign(this.core.stats, data.stats);
                    localStorage.setItem('superslowrun_records', JSON.stringify(data.records));
                    
                    // 保存并更新显示
                    this.core.saveData();
                    this.methods.updateAllDisplays();
                    
                    this.methods.showFeedback('数据导入成功');
                } else {
                    throw new Error('文件格式错误');
                }
            } catch (error) {
                console.error('导入数据失败:', error);
                this.methods.showFeedback('导入失败，请检查文件格式', 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * 获取帮助信息
     */
    showHelp() {
        const helpText = `
🏃‍♂️ 超慢跑助手使用指南

✨ 主要功能:
• 步频控制: 调节跑步节奏(170-190BPM)
• 智能节拍器: 多种音效选择
• 运动计时: 精确记录运动时间
• 数据统计: 跑步数据分析

⏱️ 快捷键:
• 空格键: 开始/停止节拍器
• ESC键: 退出运动模式

📊 超慢跑建议:
• 步频: 170-190步/分钟
• 时长: 每次15-60分钟
• 频率: 每周3-5次
• 强度: 轻松交谈程度

👍 提示: 数据自动本地存储，无需担心丢失！
        `;
        
        alert(helpText);
    }

    /**
     * 清理资源
     */
    destroy() {
        if (this.core) {
            this.core.cleanup();
        }
        
        // 清理全局引用
        delete window.appCore;
        delete window.appMethods;
        delete window.showCompletionDialog;
        
        console.log('✅ 超慢跑助手应用已清理');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.superSlowRunApp = new SuperSlowRunApp();
    console.log('🎯 超慢跑助手应用启动完成');
});
