// 补充app.js的剩余方法
SuperSlowRunApp.prototype.updateSoundDisplay = function() {
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
};

SuperSlowRunApp.prototype.updateTimeDisplay = function() {
    const currentTime = document.getElementById('currentTime');
    if (currentTime) {
        const minutes = Math.floor(this.targetTime / 60);
        currentTime.textContent = minutes + '分钟';
    }
};

SuperSlowRunApp.prototype.updateDisplay = function() {
    this.updateBpmDisplay();
    this.updateVolumeDisplay();
    this.updateSoundDisplay();
    this.updateTimeDisplay();
};

SuperSlowRunApp.prototype.startCountdown = function() {
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
};

SuperSlowRunApp.prototype.startRunning = function() {
    this.isRunning = true;
    this.startMetronome();
};

SuperSlowRunApp.prototype.toggleMetronome = function() {
    if (this.isRunning) {
        this.stopMetronome();
    } else {
        this.startMetronome();
    }
};

SuperSlowRunApp.prototype.startMetronome = function() {
    this.isRunning = true;
    const interval = 60000 / this.bpm;
    
    this.metronomeTimer = setInterval(() => {
        this.playSound();
        this.animateMetronome();
    }, interval);
    
    this.updateMetronomeUI();
};

SuperSlowRunApp.prototype.stopMetronome = function() {
    this.isRunning = false;
    if (this.metronomeTimer) {
        clearInterval(this.metronomeTimer);
        this.metronomeTimer = null;
    }
    this.updateMetronomeUI();
};

SuperSlowRunApp.prototype.updateMetronomeUI = function() {
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
};

SuperSlowRunApp.prototype.animateMetronome = function() {
    const circle = document.querySelector('.metronome-circle');
    if (circle) {
        circle.classList.add('active');
        setTimeout(() => circle.classList.remove('active'), 100);
    }
};

// 全局变量
let app;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    app = new SuperSlowRunApp();
});