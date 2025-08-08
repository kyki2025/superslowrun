class SuperSlowRunApp {
    constructor() {
        this.currentPage = 'bpm';
        this.bpm = 180;
        this.isMetronomeRunning = false;
        this.isTimerRunning = false;
        this.metronomeInterval = null;
        this.timerInterval = null;
        this.currentTime = 0;
        this.targetTime = 0;
        this.audioContext = null;
        this.currentSound = 'beep1';
        this.volume = 0.5;
        this.stats = {
            totalSessions: 0,
            totalTime: 0,
            totalSteps: 0,
            averageBPM: 0
        };
        this.loadStats();
        this.init();
    }

    init() {
        this.createUI();
        this.bindEvents();
        this.showPage('bpm');
        this.updateBPMDisplay();
    }

    createUI() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="app-container">
                <nav class="bottom-nav">
                    <button class="nav-btn active" data-page="bpm">
                        <span class="nav-icon">⚡</span>
                        <span class="nav-text">步频</span>
                    </button>
                    <button class="nav-btn" data-page="metronome">
                        <span class="nav-icon">🎵</span>
                        <span class="nav-text">节拍器</span>
                    </button>
                    <button class="nav-btn" data-page="timer">
                        <span class="nav-icon">⏱️</span>
                        <span class="nav-text">计时器</span>
                    </button>
                    <button class="nav-btn" data-page="stats">
                        <span class="nav-icon">📊</span>
                        <span class="nav-text">统计</span>
                    </button>
                    <button class="nav-btn" data-page="countdown">
                        <span class="nav-icon">⏰</span>
                        <span class="nav-text">倒计时</span>
                        <span class="countdown-badge">3</span>
                    </button>
                </nav>

                <div class="page-container">
                    <!-- BPM页面 -->
                    <div class="page" id="page-bpm">
                        <div class="page-header">
                            <h2>步频控制</h2>
                        </div>
                        <div class="bpm-display">
                            <div class="bpm-value" id="bpm-value">180</div>
                            <div class="bpm-unit">BPM</div>
                        </div>
                        <div class="bpm-controls">
                            <button class="bpm-btn decrease" id="bpm-decrease">-</button>
                            <button class="bpm-btn increase" id="bpm-increase">+</button>
                        </div>
                        <div class="bpm-presets">
                            <button class="preset-btn" data-bpm="170">170</button>
                            <button class="preset-btn active" data-bpm="180">180</button>
                            <button class="preset-btn" data-bpm="190">190</button>
                        </div>
                    </div>

                    <!-- 节拍器页面 -->
                    <div class="page" id="page-metronome">
                        <div class="page-header">
                            <h2>节拍器</h2>
                        </div>
                        <div class="metronome-circle" id="metronome-circle">
                            <div class="metronome-bpm" id="metronome-bpm">180</div>
                            <div class="metronome-status" id="metronome-status">点击开始</div>
                        </div>
                        <div class="metronome-controls">
                            <button class="control-btn" id="metronome-toggle">开始</button>
                        </div>
                        <div class="sound-controls">
                            <div class="volume-control">
                                <label>音量</label>
                                <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="0.5">
                            </div>
                            <div class="sound-selection">
                                <label>音效</label>
                                <select id="sound-select">
                                    <option value="beep1">哔哔声1</option>
                                    <option value="beep2">哔哔声2</option>
                                    <option value="click">点击声</option>
                                    <option value="tick">滴答声</option>
                                    <option value="bell">铃声</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- 计时器页面 -->
                    <div class="page" id="page-timer">
                        <div class="page-header">
                            <h2>跑步计时器</h2>
                        </div>
                        <div class="timer-display">
                            <div class="timer-time" id="timer-time">00:00</div>
                            <div class="timer-status" id="timer-status">准备开始</div>
                        </div>
                        <div class="timer-presets">
                            <button class="preset-time-btn" data-time="300">5分钟</button>
                            <button class="preset-time-btn" data-time="600">10分钟</button>
                            <button class="preset-time-btn" data-time="900">15分钟</button>
                            <button class="preset-time-btn" data-time="1200">20分钟</button>
                            <button class="preset-time-btn" data-time="1800">30分钟</button>
                            <button class="preset-time-btn" data-time="3600">60分钟</button>
                        </div>
                        <div class="custom-time">
                            <input type="number" id="custom-minutes" placeholder="自定义分钟" min="1" max="999">
                            <button id="set-custom-time">设置</button>
                        </div>
                        <div class="timer-controls">
                            <button class="control-btn" id="timer-toggle">开始跑步</button>
                            <button class="control-btn secondary" id="timer-reset">重置</button>
                        </div>
                    </div>

                    <!-- 统计页面 -->
                    <div class="page" id="page-stats">
                        <div class="page-header">
                            <h2>运动统计</h2>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value" id="total-sessions">0</div>
                                <div class="stat-label">总次数</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="total-time">0分钟</div>
                                <div class="stat-label">运动时长</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="total-steps">0</div>
                                <div class="stat-label">总步数</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="average-bpm">0</div>
                                <div class="stat-label">平均BPM</div>
                            </div>
                        </div>
                        <div class="recent-sessions">
                            <h3>最近记录</h3>
                            <div class="session-list" id="session-list">
                                <div class="no-data">暂无运动记录</div>
                            </div>
                        </div>
                    </div>

                    <!-- 倒计时页面 -->
                    <div class="page" id="page-countdown">
                        <div class="page-header">
                            <h2>3秒倒计时</h2>
                        </div>
                        <div class="countdown-circle" id="countdown-circle">
                            <div class="countdown-number" id="countdown-number">3</div>
                        </div>
                        <div class="countdown-controls">
                            <button class="control-btn" id="countdown-start">开始倒计时</button>
                        </div>
                        <div class="quick-stats">
                            <div class="quick-stat">
                                <span>当前BPM:</span>
                                <span id="quick-bpm">180</span>
                            </div>
                            <div class="quick-stat">
                                <span>总运动次数:</span>
                                <span id="quick-sessions">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 导航事件
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.showPage(page);
            });
        });

        // BPM控制事件
        document.getElementById('bpm-decrease').addEventListener('click', () => {
            this.setBPM(Math.max(100, this.bpm - 5));
        });

        document.getElementById('bpm-increase').addEventListener('click', () => {
            this.setBPM(Math.min(300, this.bpm + 5));
        });

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bpm = parseInt(e.target.dataset.bpm);
                this.setBPM(bpm);
            });
        });

        // 节拍器事件
        document.getElementById('metronome-toggle').addEventListener('click', () => {
            this.toggleMetronome();
        });

        document.getElementById('volume-slider').addEventListener('input', (e) => {
            this.volume = parseFloat(e.target.value);
        });

        document.getElementById('sound-select').addEventListener('change', (e) => {
            this.currentSound = e.target.value;
        });

        // 计时器事件
        document.querySelectorAll('.preset-time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const time = parseInt(e.target.dataset.time);
                this.setTimerTime(time);
            });
        });

        document.getElementById('set-custom-time').addEventListener('click', () => {
            const minutes = parseInt(document.getElementById('custom-minutes').value);
            if (minutes && minutes > 0) {
                this.setTimerTime(minutes * 60);
            }
        });

        document.getElementById('timer-toggle').addEventListener('click', () => {
            this.toggleTimer();
        });

        document.getElementById('timer-reset').addEventListener('click', () => {
            this.resetTimer();
        });

        // 倒计时事件
        document.getElementById('countdown-start').addEventListener('click', () => {
            this.startCountdown();
        });
    }

    showPage(pageId) {
        // 更新导航状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // 显示页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`page-${pageId}`).classList.add('active');

        this.currentPage = pageId;

        // 页面特定更新
        if (pageId === 'stats') {
            this.updateStatsDisplay();
        } else if (pageId === 'countdown') {
            this.updateQuickStats();
        }
    }

    setBPM(newBPM) {
        this.bpm = newBPM;
        this.updateBPMDisplay();
        
        // 更新预设按钮状态
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.bpm) === newBPM) {
                btn.classList.add('active');
            }
        });

        // 如果节拍器正在运行，重启以应用新BPM
        if (this.isMetronomeRunning) {
            this.stopMetronome();
            this.startMetronome();
        }
    }

    updateBPMDisplay() {
        document.getElementById('bpm-value').textContent = this.bpm;
        document.getElementById('metronome-bpm').textContent = this.bpm;
        document.getElementById('quick-bpm').textContent = this.bpm;
    }

    toggleMetronome() {
        if (this.isMetronomeRunning) {
            this.stopMetronome();
        } else {
            this.startMetronome();
        }
    }

    startMetronome() {
        this.isMetronomeRunning = true;
        const interval = 60000 / this.bpm; // 毫秒间隔
        
        this.metronomeInterval = setInterval(() => {
            this.playSound();
            this.animateMetronome();
        }, interval);

        document.getElementById('metronome-toggle').textContent = '停止';
        document.getElementById('metronome-status').textContent = '运行中';
        document.getElementById('metronome-circle').classList.add('active');
    }

    stopMetronome() {
        this.isMetronomeRunning = false;
        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            this.metronomeInterval = null;
        }

        document.getElementById('metronome-toggle').textContent = '开始';
        document.getElementById('metronome-status').textContent = '已停止';
        document.getElementById('metronome-circle').classList.remove('active');
    }

    animateMetronome() {
        const circle = document.getElementById('metronome-circle');
        circle.style.transform = 'scale(1.1)';
        setTimeout(() => {
            circle.style.transform = 'scale(1)';
        }, 100);
    }

    playSound() {
        // 简单的音频播放实现
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // 根据音效类型设置频率
        const frequencies = {
            beep1: 800,
            beep2: 1000,
            click: 2000,
            tick: 1200,
            bell: 660
        };

        oscillator.frequency.setValueAtTime(frequencies[this.currentSound] || 800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    setTimerTime(seconds) {
        this.targetTime = seconds;
        this.currentTime = 0;
        this.updateTimerDisplay();
    }

    toggleTimer() {
        if (this.isTimerRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.targetTime === 0) {
            alert('请先设置计时时间');
            return;
        }

        this.isTimerRunning = true;
        this.timerInterval = setInterval(() => {
            this.currentTime++;
            this.updateTimerDisplay();

            if (this.currentTime >= this.targetTime) {
                this.completeTimer();
            }
        }, 1000);

        document.getElementById('timer-toggle').textContent = '暂停';
        document.getElementById('timer-status').textContent = '运行中';
    }

    stopTimer() {
        this.isTimerRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        document.getElementById('timer-toggle').textContent = '继续';
        document.getElementById('timer-status').textContent = '已暂停';
    }

    resetTimer() {
        this.stopTimer();
        this.currentTime = 0;
        this.updateTimerDisplay();
        document.getElementById('timer-toggle').textContent = '开始跑步';
        document.getElementById('timer-status').textContent = '准备开始';
    }

    completeTimer() {
        this.stopTimer();
        this.saveSession();
        alert('运动完成！');
        document.getElementById('timer-status').textContent = '运动完成';
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        document.getElementById('timer-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    saveSession() {
        const session = {
            date: new Date().toISOString(),
            duration: this.currentTime,
            bpm: this.bpm,
            steps: Math.floor(this.currentTime * this.bpm / 60)
        };

        this.stats.totalSessions++;
        this.stats.totalTime += this.currentTime;
        this.stats.totalSteps += session.steps;
        this.stats.averageBPM = Math.round((this.stats.averageBPM * (this.stats.totalSessions - 1) + this.bpm) / this.stats.totalSessions);

        // 保存到localStorage
        let sessions = JSON.parse(localStorage.getItem('superslowrun_sessions') || '[]');
        sessions.unshift(session);
        sessions = sessions.slice(0, 10); // 只保留最近10次记录
        localStorage.setItem('superslowrun_sessions', JSON.stringify(sessions));
        localStorage.setItem('superslowrun_stats', JSON.stringify(this.stats));
    }

    loadStats() {
        const savedStats = localStorage.getItem('superslowrun_stats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
    }

    updateStatsDisplay() {
        document.getElementById('total-sessions').textContent = this.stats.totalSessions;
        document.getElementById('total-time').textContent = Math.floor(this.stats.totalTime / 60) + '分钟';
        document.getElementById('total-steps').textContent = this.stats.totalSteps;
        document.getElementById('average-bpm').textContent = this.stats.averageBPM;

        // 更新最近记录
        const sessions = JSON.parse(localStorage.getItem('superslowrun_sessions') || '[]');
        const sessionList = document.getElementById('session-list');
        
        if (sessions.length === 0) {
            sessionList.innerHTML = '<div class="no-data">暂无运动记录</div>';
        } else {
            sessionList.innerHTML = sessions.map(session => {
                const date = new Date(session.date);
                const duration = Math.floor(session.duration / 60);
                return `
                    <div class="session-item">
                        <div class="session-date">${date.toLocaleDateString()}</div>
                        <div class="session-details">
                            <span>${duration}分钟</span>
                            <span>${session.bpm} BPM</span>
                            <span>${session.steps}步</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    updateQuickStats() {
        document.getElementById('quick-bpm').textContent = this.bpm;
        document.getElementById('quick-sessions').textContent = this.stats.totalSessions;
    }

    startCountdown() {
        let count = 3;
        const countdownNumber = document.getElementById('countdown-number');
        const countdownCircle = document.getElementById('countdown-circle');
        const startBtn = document.getElementById('countdown-start');
        
        startBtn.disabled = true;
        countdownCircle.classList.add('active');
        
        const countdownInterval = setInterval(() => {
            countdownNumber.textContent = count;
            
            if (count === 0) {
                clearInterval(countdownInterval);
                countdownNumber.textContent = 'GO!';
                
                setTimeout(() => {
                    countdownCircle.classList.remove('active');
                    countdownNumber.textContent = '3';
                    startBtn.disabled = false;
                    
                    // 可以在这里添加开始运动的逻辑
                    alert('开始运动！');
                }, 1000);
            }
            
            count--;
        }, 1000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new SuperSlowRunApp();
});