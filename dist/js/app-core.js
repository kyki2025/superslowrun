class SuperSlowRunApp {
    constructor() {
        this.bpm = 180;
        this.volume = 0.65;
        this.currentSound = 'tick';
        this.isRunning = false;
        this.isCountingDown = false;
        this.targetTime = 15 * 60;
        this.currentPage = 'bmp';
        this.stats = this.loadStats();
        this.audioContext = null;
        this.init();
    }
    
    init() {
        this.initAudio();
        this.createUI();
        this.bindEvents();
        this.updateDisplay();
        this.showPage('bpm');
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    loadStats() {
        return {
            totalSessions: 6,
            totalTime: 2098,
            totalSteps: 6738,
            avgBpm: 180,
            records: [
                { date: '8月8日 08:34', bpm: 180, steps: 2700, duration: 900, pauseTime: 99 },
                { date: '8月7日 20:30', bpm: 180, steps: 2781, duration: 927 },
                { date: '8月7日 17:29', bpm: 180, steps: 42, duration: 14 },
                { date: '8月7日 17:06', bpm: 180, steps: 1140, duration: 232, pauseTime: 148 },
                { date: '8月7日 12:31', bpm: 180, steps: 42, duration: 14 }
            ]
        };
    }
    
    playSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const frequencies = {
            'mute': 800,
            'beep': 1000,
            'tick': 600,
            'wood': 400,
            'bell': 1200
        };
        
        oscillator.frequency.setValueAtTime(frequencies[this.currentSound] || 600, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    playTestSound() {
        this.playSound();
        setTimeout(() => this.playSound(), 500);
        setTimeout(() => this.playSound(), 1000);
        setTimeout(() => this.playSound(), 1500);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    renderRecords() {
        return this.stats.records.map(record => `
            <div class="record-item">
                <div class="record-info">
                    <div class="record-date">${record.date}</div>
                    <div class="record-details">
                        ${record.bpm} BPM • ${record.steps} 步${record.pauseTime ? ` • 暂停 ${this.formatTime(record.pauseTime)}` : ''}
                    </div>
                </div>
                <div class="record-duration ${record.pauseTime ? 'record-pause' : ''}">${this.formatTime(record.duration)}</div>
            </div>
        `).join('');
    }
    
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(pageId + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
        }
    }
    
    updateBpmDisplay() {
        const elements = ['.bmp-value', '.bpm-large', '.countdown-bpm'];
        elements.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                if (selector === '.countdown-bpm') {
                    el.textContent = this.bpm + ' BPM';
                } else {
                    el.textContent = this.bpm;
                }
            }
        });
        
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.bpm) === this.bpm);
        });
    }
    
    updateVolumeDisplay() {
        const volumeValue = document.querySelector('.volume-value');
        if (volumeValue) {
            volumeValue.textContent = Math.round(this.volume * 100) + '%';
        }
    }
    
    updateSoundDisplay() {
        const soundNames = {
            'mute': '哔声',
            'beep': '咔嗒', 
            'tick': '滴答',
            'wood': '木鱼',
            'bell': '铃声'
        };
        
        const currentSound = document.querySelector('.current-sound');
        if (currentSound) {
            currentSound.textContent = '当前: ' + soundNames[this.currentSound];
        }
    }
    
    updateTimeDisplay() {
        const currentTime = document.getElementById('currentTime');
        if (currentTime) {
            const minutes = Math.floor(this.targetTime / 60);
            currentTime.textContent = minutes + '分钟';
        }
    }
    
    updateDisplay() {
        this.updateBpmDisplay();
        this.updateVolumeDisplay();
        this.updateSoundDisplay();
        this.updateTimeDisplay();
    }
    
    startCountdown() {
        this.showPage('countdown');
        this.isCountingDown = true;
        let count = 3;
        
        const updateCountdown = () => {
            const countdownNumber = document.getElementById('countdownNumber');
            const countdownBadge = document.getElementById('countdownBadge');
            
            if (countdownNumber) countdownNumber.textContent = count;
            if (countdownBadge) countdownBadge.textContent = count;
            
            if (count > 0) {
                this.playSound();
                count--;
                setTimeout(updateCountdown, 1000);
            } else {
                this.isCountingDown = false;
                this.startRunning();
            }
        };
        
        updateCountdown();
    }
    
    startRunning() {
        this.isRunning = true;
        this.startMetronome();
        // 这里可以添加运动计时逻辑
    }
    
    toggleMetronome() {
        if (this.isRunning) {
            this.stopMetronome();
        } else {
            this.startMetronome();
        }
    }
    
    startMetronome() {
        this.isRunning = true;
        const interval = 60000 / this.bpm;
        
        this.metronomeTimer = setInterval(() => {
            this.playSound();
            this.animateMetronome();
        }, interval);
        
        this.updateMetronomeUI();
    }
    
    stopMetronome() {
        this.isRunning = false;
        if (this.metronomeTimer) {
            clearInterval(this.metronomeTimer);
            this.metronomeTimer = null;
        }
        this.updateMetronomeUI();
    }
    
    updateMetronomeUI() {
        const playBtn = document.getElementById('playBtn');
        const statusText = document.querySelector('.status-text');
        
        if (playBtn && statusText) {
            const icon = playBtn.querySelector('.play-icon path');
            if (this.isRunning) {
                icon.setAttribute('d', 'M6 4H10V20H6V4ZM14 4H18V20H14V4Z');
                statusText.textContent = '运行中';
            } else {
                icon.setAttribute('d', 'M8 5V19L19 12L8 5Z');
                statusText.textContent = '已停止';
            }
        }
    }
    
    animateMetronome() {
        const circle = document.querySelector('.metronome-circle');
        if (circle) {
            circle.classList.add('active');
            setTimeout(() => circle.classList.remove('active'), 100);
        }
    }
}

// 全局变量
let app;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    app = new SuperSlowRunApp();
});