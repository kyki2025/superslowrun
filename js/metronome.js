class Metronome {
    constructor() {
        this.bpm = 180;
        this.isPlaying = false;
        this.intervalId = null;
        this.audioContext = null;
        this.currentSound = 'click';
        this.volume = 0.7;
        this.totalTime = 30 * 60; // 30分钟，以秒为单位
        this.remainingTime = this.totalTime;
        this.timerInterval = null;
        this.beatCount = 0;
        
        this.initializeElements();
        this.initializeAudio();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeElements() {
        // 获取DOM元素
        this.bpmDisplay = document.getElementById('bpmDisplay');
        this.bpmSlider = document.getElementById('bpmSlider');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.soundSelect = document.getElementById('soundSelect');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.timerInput = document.getElementById('timerInput');
        this.timeRemaining = document.getElementById('timeRemaining');
        this.progressFill = document.getElementById('progressFill');
        this.pendulum = document.getElementById('pendulum');
        this.beatIndicator = document.getElementById('beatIndicator');
        
        // 预设按钮
        this.presetBtns = document.querySelectorAll('.preset-btn');
        this.timerPresets = document.querySelectorAll('.timer-preset');
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 预加载音效
            this.sounds = {
                click: await this.createClickSound(),
                beep: await this.createBeepSound(),
                wood: await this.createWoodSound(),
                bell: await this.createBellSound()
            };
        } catch (error) {
            console.error('音频初始化失败:', error);
        }
    }

    createClickSound() {
        return new Promise((resolve) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            resolve({ oscillator, gainNode });
        });
    }

    createBeepSound() {
        return new Promise((resolve) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
            
            resolve({ oscillator, gainNode });
        });
    }

    createWoodSound() {
        return new Promise((resolve) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.type = 'sawtooth';
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            
            resolve({ oscillator, gainNode, filter });
        });
    }

    createBellSound() {
        return new Promise((resolve) => {
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator1.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator2.frequency.setValueAtTime(1200, this.audioContext.currentTime);
            oscillator1.type = 'sine';
            oscillator2.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            
            resolve({ oscillator1, oscillator2, gainNode });
        });
    }

    bindEvents() {
        // BPM滑块
        this.bpmSlider.addEventListener('input', (e) => {
            this.setBPM(parseInt(e.target.value));
        });

        // 预设BPM按钮
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bpm = parseInt(e.target.dataset.bpm);
                this.setBPM(bpm);
                this.updatePresetButtons(e.target);
            });
        });

        // 音效选择
        this.soundSelect.addEventListener('change', (e) => {
            this.currentSound = e.target.value;
        });

        // 音量控制
        this.volumeSlider.addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
        });

        // 计时器输入
        this.timerInput.addEventListener('change', (e) => {
            const minutes = parseInt(e.target.value);
            this.setTimer(minutes);
        });

        // 计时器预设
        this.timerPresets.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.target.dataset.time);
                this.setTimer(minutes);
                this.updateTimerPresets(e.target);
            });
        });

        // 主控制按钮
        this.playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        this.stopBtn.addEventListener('click', () => {
            this.stop();
        });

        this.resetBtn.addEventListener('click', () => {
            this.reset();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlayPause();
            } else if (e.code === 'Escape') {
                this.stop();
            }
        });
    }

    setBPM(bpm) {
        this.bpm = bpm;
        this.bpmSlider.value = bpm;
        this.updateDisplay();
        
        if (this.isPlaying) {
            this.stop();
            this.start();
        }
    }

    setTimer(minutes) {
        this.totalTime = minutes * 60;
        this.remainingTime = this.totalTime;
        this.timerInput.value = minutes;
        this.updateTimerDisplay();
    }

    updatePresetButtons(activeBtn) {
        this.presetBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    updateTimerPresets(activeBtn) {
        this.timerPresets.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    updateDisplay() {
        this.bpmDisplay.textContent = this.bpm;
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        this.timeRemaining.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const progress = ((this.totalTime - this.remainingTime) / this.totalTime) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    async playSound() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        try {
            let sound;
            const now = this.audioContext.currentTime;

            switch (this.currentSound) {
                case 'click':
                    sound = await this.createClickSound();
                    sound.oscillator.start(now);
                    sound.oscillator.stop(now + 0.1);
                    break;
                case 'beep':
                    sound = await this.createBeepSound();
                    sound.oscillator.start(now);
                    sound.oscillator.stop(now + 0.15);
                    break;
                case 'wood':
                    sound = await this.createWoodSound();
                    sound.oscillator.start(now);
                    sound.oscillator.stop(now + 0.2);
                    break;
                case 'bell':
                    sound = await this.createBellSound();
                    sound.oscillator1.start(now);
                    sound.oscillator2.start(now);
                    sound.oscillator1.stop(now + 0.5);
                    sound.oscillator2.stop(now + 0.5);
                    break;
            }
        } catch (error) {
            console.error('播放音效失败:', error);
        }
    }

    animatePendulum() {
        this.beatCount++;
        const isLeft = this.beatCount % 2 === 0;
        
        this.pendulum.classList.remove('swing-left', 'swing-right');
        setTimeout(() => {
            this.pendulum.classList.add(isLeft ? 'swing-left' : 'swing-right');
        }, 10);
        
        // 节拍指示器动画
        this.beatIndicator.classList.add('active');
        setTimeout(() => {
            this.beatIndicator.classList.remove('active');
        }, 100);
    }

    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        const interval = 60000 / this.bpm; // 毫秒
        
        // 立即播放第一个节拍
        this.playSound();
        this.animatePendulum();
        
        this.intervalId = setInterval(() => {
            this.playSound();
            this.animatePendulum();
        }, interval);
        
        // 启动计时器
        this.timerInterval = setInterval(() => {
            this.remainingTime--;
            this.updateTimerDisplay();
            
            if (this.remainingTime <= 0) {
                this.stop();
                this.showCompletionMessage();
            }
        }, 1000);
        
        this.updatePlayPauseButton();
    }

    pause() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        clearInterval(this.intervalId);
        clearInterval(this.timerInterval);
        this.updatePlayPauseButton();
    }

    stop() {
        this.isPlaying = false;
        clearInterval(this.intervalId);
        clearInterval(this.timerInterval);
        this.updatePlayPauseButton();
        
        // 重置摆锤位置
        this.pendulum.classList.remove('swing-left', 'swing-right');
        this.beatIndicator.classList.remove('active');
    }

    reset() {
        this.stop();
        this.remainingTime = this.totalTime;
        this.beatCount = 0;
        this.updateTimerDisplay();
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.start();
        }
    }

    updatePlayPauseButton() {
        const icon = this.playPauseBtn.querySelector('.btn-icon');
        const text = this.playPauseBtn.querySelector('.btn-text');
        
        if (this.isPlaying) {
            icon.textContent = '⏸';
            text.textContent = '暂停';
            this.playPauseBtn.classList.add('playing');
        } else {
            icon.textContent = '▶';
            text.textContent = '开始';
            this.playPauseBtn.classList.remove('playing');
        }
    }

    showCompletionMessage() {
        // 创建完成提示
        const notification = document.createElement('div');
        notification.className = 'completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 训练完成！</h3>
                <p>恭喜您完成了 ${this.totalTime / 60} 分钟的超慢跑训练</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary">确定</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .completion-notification {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .notification-content {
                background: white;
                padding: 2rem;
                border-radius: 16px;
                text-align: center;
                box-shadow: var(--shadow-xl);
                max-width: 400px;
                margin: 0 20px;
            }
            .notification-content h3 {
                margin-bottom: 1rem;
                color: var(--primary-color);
            }
            .notification-content p {
                margin-bottom: 1.5rem;
                color: var(--text-secondary);
            }
        `;
        document.head.appendChild(style);
    }
}

// 页面加载完成后初始化节拍器
document.addEventListener('DOMContentLoaded', () => {
    const metronome = new Metronome();
    
    // 全局暴露节拍器实例，方便调试
    window.metronome = metronome;
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.metronome && window.metronome.isPlaying) {
        // 页面隐藏时暂停，避免后台运行
        window.metronome.pause();
    }
});