/**
 * 超慢跑助手 - 辅助方法模块
 * 包含UI操作、事件处理、动画效果等辅助功能
 */

class SuperSlowRunMethods {
    constructor(core) {
        this.core = core;
        
        // UI控制
        this.ui = {
            exerciseOverlay: null,
            currentPresetButton: null
        };

        // 初始化UI
        this.initUI();
        this.bindEvents();
    }

    /**
     * 初始化UI元素
     */
    initUI() {
        // 获取重要的UI元素引用
        this.ui.exerciseOverlay = document.getElementById('exercise-overlay');
        
        // 设置初始状态
        this.updateAllDisplays();
        
        // 初始化预设按钮状态
        this.updatePresetButtons();
        this.updateTimePresetButtons();
        this.updateSoundButtons();
    }

    /**
     * 绑定所有事件
     */
    bindEvents() {
        // BPM控制事件
        this.bindBPMEvents();
        
        // 节拍器事件
        this.bindMetronomeEvents();
        
        // 计时器事件
        this.bindTimerEvents();
        
        // 运动覆盖层事件
        this.bindExerciseOverlayEvents();
        
        // 页面生命周期事件
        this.bindLifecycleEvents();
    }

    /**
     * 绑定BPM控制事件
     */
    bindBPMEvents() {
        // BPM增减按钮
        const decreaseBtn = document.getElementById('bpm-decrease');
        const increaseBtn = document.getElementById('bpm-increase');
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                const newBPM = this.core.state.bpm - 5;
                this.core.setBPM(newBPM);
                this.updatePresetButtons();
                this.showFeedback('BPM已调整');
            });
        }
        
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                const newBPM = this.core.state.bpm + 5;
                this.core.setBPM(newBPM);
                this.updatePresetButtons();
                this.showFeedback('BPM已调整');
            });
        }

        // BPM预设按钮
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bpm = parseInt(btn.dataset.bpm);
                if (bpm) {
                    this.core.setBPM(bpm);
                    this.updatePresetButtons();
                    this.showFeedback(`BPM已设为${bpm}`);
                }
            });
        });
    }

    /**
     * 绑定节拍器事件
     */
    bindMetronomeEvents() {
        // 播放/停止按钮
        const toggleBtn = document.getElementById('metronome-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMetronome();
            });
        }

        // 音量滑块
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseFloat(e.target.value) / 100;
                this.core.setVolume(volume);
                this.updateVolumeDisplay();
            });

            // 设置初始音量
            volumeSlider.value = this.core.state.volume * 100;
        }

        // 音效选择按钮
        document.querySelectorAll('.sound-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const soundType = btn.dataset.sound;
                if (soundType) {
                    this.core.setSoundType(soundType);
                    this.updateSoundButtons();
                    this.showFeedback(`音效已切换为${btn.textContent}`);
                    
                    // 播放预览音效
                    this.core.playMetronomeSound();
                }
            });
        });
    }

    /**
     * 绑定计时器事件
     */
    bindTimerEvents() {
        // 时间预设按钮
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const time = parseInt(btn.dataset.time);
                if (time) {
                    this.setCustomTime(time);
                    this.updateTimePresetButtons();
                    this.showFeedback(`时间已设为${time}分钟`);
                }
            });
        });

        // 自定义时间输入
        const customInput = document.getElementById('custom-minutes');
        if (customInput) {
            customInput.addEventListener('input', (e) => {
                const time = parseInt(e.target.value);
                if (time && time > 0 && time <= 999) {
                    this.setCustomTime(time);
                    this.updateTimePresetButtons();
                }
            });

            customInput.addEventListener('focus', () => {
                this.updateTimePresetButtons(); // 清除预设按钮选中状态
            });
        }

        // 开始运动按钮
        const startBtn = document.getElementById('start-exercise');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startExercise();
            });
        }
    }

    /**
     * 绑定运动覆盖层事件
     */
    bindExerciseOverlayEvents() {
        // 关闭按钮
        const closeBtn = document.getElementById('close-exercise');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideExerciseOverlay();
            });
        }

        // 暂停按钮
        const pauseBtn = document.getElementById('pause-exercise');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.core.toggleExercisePause();
                this.updateExerciseControls();
            });
        }

        // 停止按钮
        const stopBtn = document.getElementById('stop-exercise');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.confirmStopExercise();
            });
        }

        // 点击覆盖层外部不关闭
        if (this.ui.exerciseOverlay) {
            this.ui.exerciseOverlay.addEventListener('click', (e) => {
                // 只有点击覆盖层本身才关闭，点击内容区域不关闭
                if (e.target === this.ui.exerciseOverlay) {
                    // this.hideExerciseOverlay(); // 运动中不允许意外关闭
                }
            });
        }
    }

    /**
     * 绑定页面生命周期事件
     */
    bindLifecycleEvents() {
        // 页面卸载时清理资源
        window.addEventListener('beforeunload', () => {
            this.core.cleanup();
        });

        // 页面失去焦点时保存数据
        window.addEventListener('blur', () => {
            this.core.saveData();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // 空格键控制节拍器
            if (e.code === 'Space' && !e.target.matches('input')) {
                e.preventDefault();
                this.toggleMetronome();
            }
            
            // ESC键关闭运动覆盖层
            if (e.key === 'Escape' && this.core.state.isExerciseRunning) {
                this.confirmStopExercise();
            }
        });
    }

    /**
     * 切换节拍器状态
     */
    toggleMetronome() {
        if (this.core.state.isMetronomeRunning) {
            this.core.stopMetronome();
        } else {
            this.core.startMetronome();
        }
        this.updateMetronomeUI();
    }

    /**
     * 设置自定义时间
     */
    setCustomTime(minutes) {
        this.core.state.currentDuration = minutes;
        
        const customInput = document.getElementById('custom-minutes');
        if (customInput) {
            customInput.value = minutes;
        }
    }

    /**
     * 开始运动
     */
    startExercise() {
        const duration = this.core.state.currentDuration;
        
        if (duration < 1 || duration > 999) {
            this.showFeedback('请设置有效的运动时间（1-999分钟）', 'error');
            return;
        }

        // 启动运动
        this.core.startExercise(duration);
        
        // 显示运动覆盖层
        this.showExerciseOverlay();
        
        // 更新UI
        this.updateExerciseControls();
        this.showFeedback(`开始${duration}分钟超慢跑训练`);
    }

    /**
     * 确认停止运动
     */
    confirmStopExercise() {
        if (!this.core.state.isExerciseRunning) return;

        const elapsedMinutes = Math.floor(this.core.state.elapsedTime / 60);
        const message = `确定要停止运动吗？\n已运动${elapsedMinutes}分钟`;
        
        if (confirm(message)) {
            this.core.stopExercise();
            this.hideExerciseOverlay();
            this.showFeedback('运动已停止');
        }
    }

    /**
     * 显示运动覆盖层
     */
    showExerciseOverlay() {
        if (this.ui.exerciseOverlay) {
            this.ui.exerciseOverlay.style.display = 'flex';
            this.ui.exerciseOverlay.classList.add('active');
            
            // 防止页面滚动
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * 隐藏运动覆盖层
     */
    hideExerciseOverlay() {
        if (this.ui.exerciseOverlay) {
            this.ui.exerciseOverlay.style.display = 'none';
            this.ui.exerciseOverlay.classList.remove('active');
            
            // 恢复页面滚动
            document.body.style.overflow = '';
        }
    }

    /**
     * 更新所有显示
     */
    updateAllDisplays() {
        this.core.updateBPMDisplay();
        this.core.updateStatsDisplay();
        this.updateMetronomeUI();
        this.updateVolumeDisplay();
    }

    /**
     * 更新节拍器UI
     */
    updateMetronomeUI() {
        const toggleBtn = document.getElementById('metronome-toggle');
        const statusElement = document.getElementById('metronome-status');
        const playButton = document.querySelector('.play-button');
        
        if (this.core.state.isMetronomeRunning) {
            if (toggleBtn) {
                toggleBtn.textContent = '⏸';
                toggleBtn.classList.add('playing');
            }
            if (playButton) {
                playButton.classList.add('playing');
                playButton.innerHTML = '<span class="play-icon">⏸</span>';
            }
            if (statusElement) {
                statusElement.textContent = '正在播放';
            }
        } else {
            if (toggleBtn) {
                toggleBtn.textContent = '▶';
                toggleBtn.classList.remove('playing');
            }
            if (playButton) {
                playButton.classList.remove('playing');
                playButton.innerHTML = '<span class="play-icon">▶</span>';
            }
            if (statusElement) {
                statusElement.textContent = '点击播放';
            }
        }
    }

    /**
     * 更新音量显示
     */
    updateVolumeDisplay() {
        const volumeText = document.querySelector('.volume-text');
        if (volumeText) {
            const percentage = Math.round(this.core.state.volume * 100);
            volumeText.textContent = `音量调节 ${percentage}%`;
        }
    }

    /**
     * 更新BPM预设按钮状态
     */
    updatePresetButtons() {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            const bpm = parseInt(btn.dataset.bpm);
            if (bpm === this.core.state.bpm) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * 更新时间预设按钮状态
     */
    updateTimePresetButtons() {
        document.querySelectorAll('.time-btn').forEach(btn => {
            const time = parseInt(btn.dataset.time);
            if (time === this.core.state.currentDuration) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * 更新音效按钮状态
     */
    updateSoundButtons() {
        document.querySelectorAll('.sound-btn').forEach(btn => {
            const sound = btn.dataset.sound;
            if (sound === this.core.state.currentSound) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * 更新运动控制按钮
     */
    updateExerciseControls() {
        const pauseBtn = document.getElementById('pause-exercise');
        if (pauseBtn) {
            if (this.core.state.exercisePaused) {
                pauseBtn.textContent = '继续';
                pauseBtn.classList.add('resume');
            } else {
                pauseBtn.textContent = '暂停';
                pauseBtn.classList.remove('resume');
            }
        }
    }

    /**
     * 显示反馈信息
     */
    showFeedback(message, type = 'success') {
        // 创建临时提示元素
        const feedback = document.createElement('div');
        feedback.className = `feedback ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? 'rgba(244, 67, 54, 0.9)' : 'rgba(76, 175, 80, 0.9)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            animation: fadeInOut 2.5s ease-in-out;
        `;

        // 添加动画样式
        if (!document.getElementById('feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'feedback-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(feedback);

        // 2.5秒后自动移除
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2500);
    }

    /**
     * 显示运动完成对话框
     */
    showCompletionDialog(sessionData) {
        const duration = Math.floor(sessionData.duration / 60);
        const steps = sessionData.steps;
        const calories = Math.floor(sessionData.calories);

        const message = `🎉 运动完成！\n\n` +
                       `⏱️ 运动时长: ${duration}分钟\n` +
                       `👟 步数: ${steps}步\n` +
                       `🔥 消耗: ${calories}卡路里\n` +
                       `💓 平均步频: ${sessionData.bpm}步/分\n\n` +
                       `继续保持，健康生活！`;

        alert(message);
        
        // 隐藏运动覆盖层
        this.hideExerciseOverlay();
        
        // 更新统计显示
        this.core.updateStatsDisplay();
    }

    /**
     * 格式化时间显示
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 触发震动反馈（如果设备支持）
     */
    triggerVibration(pattern = [50]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    /**
     * 添加触觉反馈到按钮
     */
    addHapticFeedback(element) {
        if (element) {
            element.addEventListener('click', () => {
                this.triggerVibration([10]);
            });
        }
    }
}

// 导出辅助方法类
window.SuperSlowRunMethods = SuperSlowRunMethods;

// 全局完成对话框函数
window.showCompletionDialog = function(sessionData) {
    if (window.appMethods) {
        window.appMethods.showCompletionDialog(sessionData);
    }
};
