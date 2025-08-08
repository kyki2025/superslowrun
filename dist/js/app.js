// 超慢跑专业应用 JavaScript 功能

class SuperSlowRunApp {
    constructor() {
        this.currentTab = 'training';
        this.isTraining = false;
        this.isPaused = false;
        this.trainingStartTime = null;
        this.trainingDuration = 0;
        this.stepCount = 0;
        this.heartRate = 0;
        this.metronomeInterval = null;
        this.metronomeActive = false;
        this.currentBPM = 180;
        this.trainingInterval = null;
        this.heartRateInterval = null;
        this.settings = this.loadSettings();
        this.trainingRecords = this.loadRecords();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.loadUserSettings();
        this.updateRecordsDisplay();
    }

    setupEventListeners() {
        // 标签切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 训练控制
        document.getElementById('startTraining')?.addEventListener('click', () => this.startTraining());
        document.getElementById('pauseTraining')?.addEventListener('click', () => this.pauseTraining());
        document.getElementById('stopTraining')?.addEventListener('click', () => this.stopTraining());

        // 节拍器控制
        document.getElementById('startMetronome')?.addEventListener('click', () => this.startMetronome());
        document.getElementById('stopMetronome')?.addEventListener('click', () => this.stopMetronome());
        document.getElementById('increaseBpm')?.addEventListener('click', () => this.adjustBPM(5));
        document.getElementById('decreaseBpm')?.addEventListener('click', () => this.adjustBPM(-5));
        document.getElementById('bpmSlider')?.addEventListener('input', (e) => this.setBPM(parseInt(e.target.value)));

        // 预设节拍
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bpm = parseInt(e.target.dataset.bpm);
                this.setBPM(bpm);
                this.updatePresetButtons(bpm);
            });
        });

        // 设置保存
        document.getElementById('saveSettings')?.addEventListener('click', () => this.saveUserSettings());
        document.getElementById('resetSettings')?.addEventListener('click', () => this.resetUserSettings());

        // 导出记录
        document.getElementById('exportRecords')?.addEventListener('click', () => this.exportRecords());

        // 模态框控制
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('confirmComplete')?.addEventListener('click', () => this.closeModal());
        document.getElementById('shareResult')?.addEventListener('click', () => this.shareResult());

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    switchTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
    }

    // 训练功能
    startTraining() {
        if (this.isPaused) {
            this.resumeTraining();
            return;
        }

        this.isTraining = true;
        this.trainingStartTime = Date.now();
        this.stepCount = 0;
        
        // 更新UI状态
        document.getElementById('currentMode').textContent = '训练中';
        document.getElementById('startTraining').disabled = true;
        document.getElementById('pauseTraining').disabled = false;
        document.getElementById('stopTraining').disabled = false;

        // 开始计时器
        this.trainingInterval = setInterval(() => {
            this.updateTrainingTime();
            this.simulateSteps();
        }, 1000);

        // 开始心率监测
        this.startHeartRateMonitoring();

        // 更新指导文本
        this.updateGuidanceText('保持轻松的步伐，注意呼吸节奏。让身体自然摆动，享受超慢跑的乐趣！');
    }

    pauseTraining() {
        this.isPaused = true;
        clearInterval(this.trainingInterval);
        clearInterval(this.heartRateInterval);

        document.getElementById('currentMode').textContent = '已暂停';
        document.getElementById('startTraining').disabled = false;
        document.getElementById('startTraining').innerHTML = '<span class="btn-icon">▶️</span>继续训练';
        document.getElementById('pauseTraining').disabled = true;

        this.updateGuidanceText('训练已暂停。准备好后点击继续训练按钮。');
    }

    resumeTraining() {
        this.isPaused = false;
        this.isTraining = true;

        document.getElementById('currentMode').textContent = '训练中';
        document.getElementById('startTraining').disabled = true;
        document.getElementById('startTraining').innerHTML = '<span class="btn-icon">▶️</span>开始训练';
        document.getElementById('pauseTraining').disabled = false;

        this.trainingInterval = setInterval(() => {
            this.updateTrainingTime();
            this.simulateSteps();
        }, 1000);

        this.startHeartRateMonitoring();
        this.updateGuidanceText('继续保持良好的节奏，你做得很棒！');
    }

    stopTraining() {
        const duration = Math.floor((Date.now() - this.trainingStartTime) / 1000);
        const avgHeartRate = this.heartRate;
        const calories = this.calculateCalories(duration);

        // 停止所有计时器
        clearInterval(this.trainingInterval);
        clearInterval(this.heartRateInterval);

        // 重置状态
        this.isTraining = false;
        this.isPaused = false;
        this.trainingStartTime = null;

        // 保存训练记录
        this.saveTrainingRecord({
            date: new Date().toISOString(),
            duration: duration,
            steps: this.stepCount,
            avgHeartRate: avgHeartRate,
            calories: calories
        });

        // 重置UI
        this.resetTrainingUI();

        // 显示完成弹窗
        this.showCompletionModal(duration, avgHeartRate, calories);
    }

    resetTrainingUI() {
        document.getElementById('currentMode').textContent = '准备开始';
        document.getElementById('trainingTime').textContent = '00:00';
        document.getElementById('stepCount').textContent = '0';
        document.getElementById('currentPace').textContent = '--:--';
        document.getElementById('heartRate').textContent = '--';
        document.getElementById('hrZone').textContent = '准备中';

        document.getElementById('startTraining').disabled = false;
        document.getElementById('startTraining').innerHTML = '<span class="btn-icon">▶️</span>开始训练';
        document.getElementById('pauseTraining').disabled = true;
        document.getElementById('stopTraining').disabled = true;

        this.updateGuidanceText('准备开始超慢跑训练。保持轻松的步伐，让身体自然摆动。');
    }

    updateTrainingTime() {
        if (!this.trainingStartTime) return;
        
        const elapsed = Math.floor((Date.now() - this.trainingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('trainingTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    simulateSteps() {
        // 模拟步数增加（基于180BPM节拍）
        this.stepCount += Math.floor(Math.random() * 3) + 1;
        document.getElementById('stepCount').textContent = this.stepCount.toString();

        // 计算配速（模拟）
        if (this.trainingStartTime) {
            const elapsed = (Date.now() - this.trainingStartTime) / 1000 / 60; // 分钟
            if (elapsed > 0) {
                const pace = elapsed / (this.stepCount / 1000); // 分钟/公里（估算）
                const paceMin = Math.floor(pace);
                const paceSec = Math.floor((pace - paceMin) * 60);
                document.getElementById('currentPace').textContent = 
                    `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
            }
        }
    }

    startHeartRateMonitoring() {
        this.heartRateInterval = setInterval(() => {
            // 模拟心率数据（120-140 BPM范围）
            const baseHR = 130;
            const variation = Math.random() * 20 - 10;
            this.heartRate = Math.round(baseHR + variation);
            
            document.getElementById('heartRate').textContent = this.heartRate.toString();
            
            // 更新心率区间
            let zone = '目标区间';
            if (this.heartRate < 120) zone = '偏低';
            else if (this.heartRate > 140) zone = '偏高';
            
            document.getElementById('hrZone').textContent = zone;
            document.getElementById('hrZone').className = 'hr-zone';
            if (zone === '偏低') document.getElementById('hrZone').style.background = '#3498db';
            else if (zone === '偏高') document.getElementById('hrZone').style.background = '#e74c3c';
            else document.getElementById('hrZone').style.background = '#f39c12';

            // 更新心率图表（简单实现）
            this.updateHeartRateChart();
        }, 2000);
    }

    updateHeartRateChart() {
        const canvas = document.getElementById('hrChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制简单的心率波形
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const points = 20;
        for (let i = 0; i < points; i++) {
            const x = (canvas.width / points) * i;
            const y = canvas.height / 2 + Math.sin(i * 0.5) * 20 + (Math.random() - 0.5) * 10;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }

    updateGuidanceText(text) {
        document.getElementById('guidanceText').textContent = text;
    }

    // 节拍器功能
    startMetronome() {
        if (this.metronomeActive) return;
        
        this.metronomeActive = true;
        document.getElementById('startMetronome').disabled = true;
        document.getElementById('stopMetronome').disabled = false;
        
        const interval = 60000 / this.currentBPM; // 毫秒
        
        this.metronomeInterval = setInterval(() => {
            this.playMetronomeBeat();
            this.animateMetronome();
        }, interval);
    }

    stopMetronome() {
        this.metronomeActive = false;
        clearInterval(this.metronomeInterval);
        
        document.getElementById('startMetronome').disabled = false;
        document.getElementById('stopMetronome').disabled = true;
        
        // 重置动画
        document.getElementById('metronomeCircle').classList.remove('active');
    }

    playMetronomeBeat() {
        if (!this.settings.soundEnabled) return;
        
        // 创建音频上下文播放节拍音
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('音频播放不支持');
        }
    }

    animateMetronome() {
        const circle = document.getElementById('metronomeCircle');
        circle.classList.add('active');
        
        setTimeout(() => {
            circle.classList.remove('active');
        }, 100);
        
        // 震动反馈
        if (this.settings.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    setBPM(bpm) {
        this.currentBPM = Math.max(160, Math.min(200, bpm));
        document.getElementById('bpmDisplay').textContent = this.currentBPM.toString();
        document.getElementById('bpmSlider').value = this.currentBPM;
        
        // 如果节拍器正在运行，重新启动以应用新的BPM
        if (this.metronomeActive) {
            this.stopMetronome();
            setTimeout(() => this.startMetronome(), 100);
        }
    }

    adjustBPM(delta) {
        this.setBPM(this.currentBPM + delta);
    }

    updatePresetButtons(activeBpm) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.bpm) === activeBpm) {
                btn.classList.add('active');
            }
        });
    }

    // 记录管理
    saveTrainingRecord(record) {
        this.trainingRecords.unshift(record);
        // 只保留最近50条记录
        if (this.trainingRecords.length > 50) {
            this.trainingRecords = this.trainingRecords.slice(0, 50);
        }
        
        localStorage.setItem('superslowrun_records', JSON.stringify(this.trainingRecords));
        this.updateRecordsDisplay();
    }

    loadRecords() {
        try {
            const records = localStorage.getItem('superslowrun_records');
            return records ? JSON.parse(records) : [];
        } catch (e) {
            return [];
        }
    }

    updateRecordsDisplay() {
        const totalSessions = this.trainingRecords.length;
        const totalTime = this.trainingRecords.reduce((sum, record) => sum + record.duration, 0);
        const totalCalories = this.trainingRecords.reduce((sum, record) => sum + record.calories, 0);
        
        document.getElementById('totalSessions').textContent = totalSessions.toString();
        document.getElementById('totalTime').textContent = Math.floor(totalTime / 60).toString();
        document.getElementById('totalCalories').textContent = Math.round(totalCalories).toString();
        
        // 更新记录列表
        const recordsList = document.getElementById('recordsList');
        if (totalSessions === 0) {
            recordsList.innerHTML = `
                <div class="empty-records">
                    <div class="empty-icon">📊</div>
                    <p>暂无训练记录</p>
                    <p>开始你的第一次超慢跑训练吧！</p>
                </div>
            `;
        } else {
            recordsList.innerHTML = this.trainingRecords.slice(0, 10).map(record => {
                const date = new Date(record.date);
                const duration = Math.floor(record.duration / 60);
                return `
                    <div class="record-item">
                        <div class="record-date">${date.toLocaleDateString()}</div>
                        <div class="record-stats">
                            <span>时长: ${duration}分钟</span>
                            <span>步数: ${record.steps}</span>
                            <span>卡路里: ${Math.round(record.calories)}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    exportRecords() {
        if (this.trainingRecords.length === 0) {
            alert('暂无训练记录可导出');
            return;
        }
        
        const csvContent = [
            '日期,时长(秒),步数,平均心率,卡路里',
            ...this.trainingRecords.map(record => {
                const date = new Date(record.date).toLocaleDateString();
                return `${date},${record.duration},${record.steps},${record.avgHeartRate},${Math.round(record.calories)}`;
            })
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `超慢跑训练记录_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    // 设置管理
    loadSettings() {
        try {
            const settings = localStorage.getItem('superslowrun_settings');
            return settings ? JSON.parse(settings) : {
                weight: 70,
                age: 30,
                gender: 'male',
                defaultBpm: 180,
                minHR: 120,
                maxHR: 140,
                soundEnabled: true,
                vibrationEnabled: true,
                voiceGuidance: true
            };
        } catch (e) {
            return {
                weight: 70,
                age: 30,
                gender: 'male',
                defaultBpm: 180,
                minHR: 120,
                maxHR: 140,
                soundEnabled: true,
                vibrationEnabled: true,
                voiceGuidance: true
            };
        }
    }

    loadUserSettings() {
        document.getElementById('userWeight').value = this.settings.weight;
        document.getElementById('userAge').value = this.settings.age;
        document.getElementById('userGender').value = this.settings.gender;
        document.getElementById('defaultBpm').value = this.settings.defaultBpm;
        document.getElementById('minHR').value = this.settings.minHR;
        document.getElementById('maxHR').value = this.settings.maxHR;
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        document.getElementById('vibrationEnabled').checked = this.settings.vibrationEnabled;
        document.getElementById('voiceGuidance').checked = this.settings.voiceGuidance;
        
        // 应用默认BPM
        this.setBPM(this.settings.defaultBpm);
        this.updatePresetButtons(this.settings.defaultBpm);
    }

    saveUserSettings() {
        this.settings = {
            weight: parseInt(document.getElementById('userWeight').value),
            age: parseInt(document.getElementById('userAge').value),
            gender: document.getElementById('userGender').value,
            defaultBpm: parseInt(document.getElementById('defaultBpm').value),
            minHR: parseInt(document.getElementById('minHR').value),
            maxHR: parseInt(document.getElementById('maxHR').value),
            soundEnabled: document.getElementById('soundEnabled').checked,
            vibrationEnabled: document.getElementById('vibrationEnabled').checked,
            voiceGuidance: document.getElementById('voiceGuidance').checked
        };
        
        localStorage.setItem('superslowrun_settings', JSON.stringify(this.settings));
        
        // 显示保存成功提示
        const saveBtn = document.getElementById('saveSettings');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '已保存';
        saveBtn.style.background = '#00d4aa';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
        }, 2000);
    }

    resetUserSettings() {
        if (confirm('确定要重置所有设置吗？')) {
            localStorage.removeItem('superslowrun_settings');
            this.settings = this.loadSettings();
            this.loadUserSettings();
        }
    }

    // 工具函数
    calculateCalories(durationSeconds) {
        // 基于体重、时长计算卡路里消耗
        const weight = this.settings.weight;
        const hours = durationSeconds / 3600;
        // 超慢跑的MET值约为6
        return weight * 6 * hours;
    }

    showCompletionModal(duration, avgHeartRate, calories) {
        const modal = document.getElementById('trainingCompleteModal');
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        
        document.getElementById('completedTime').textContent = 
            `${minutes}分${seconds}秒`;
        document.getElementById('avgHeartRate').textContent = `${avgHeartRate} BPM`;
        document.getElementById('burnedCalories').textContent = `${Math.round(calories)} 卡`;
        
        modal.classList.add('show');
    }

    closeModal() {
        document.getElementById('trainingCompleteModal').classList.remove('show');
    }

    shareResult() {
        const duration = document.getElementById('completedTime').textContent;
        const calories = document.getElementById('burnedCalories').textContent;
        
        const shareText = `我刚完成了一次超慢跑训练！训练时长：${duration}，消耗卡路里：${calories}。超慢跑让健康生活变得简单有趣！`;
        
        if (navigator.share) {
            navigator.share({
                title: '超慢跑训练完成',
                text: shareText,
                url: window.location.href
            });
        } else {
            // 复制到剪贴板
            navigator.clipboard.writeText(shareText).then(() => {
                alert('训练成果已复制到剪贴板！');
            }).catch(() => {
                alert('分享功能暂不可用');
            });
        }
    }

    handleKeyboard(e) {
        // 空格键：开始/暂停训练
        if (e.code === 'Space' && this.currentTab === 'training') {
            e.preventDefault();
            if (!this.isTraining) {
                this.startTraining();
            } else if (!this.isPaused) {
                this.pauseTraining();
            } else {
                this.resumeTraining();
            }
        }
        
        // 回车键：开始/停止节拍器
        if (e.code === 'Enter' && this.currentTab === 'metronome') {
            e.preventDefault();
            if (!this.metronomeActive) {
                this.startMetronome();
            } else {
                this.stopMetronome();
            }
        }
        
        // 数字键：切换标签
        if (e.code >= 'Digit1' && e.code <= 'Digit4') {
            const tabIndex = parseInt(e.code.slice(-1)) - 1;
            const tabs = ['training', 'metronome', 'records', 'settings'];
            if (tabs[tabIndex]) {
                this.switchTab(tabs[tabIndex]);
            }
        }
    }

    updateUI() {
        // 初始化UI状态
        this.resetTrainingUI();
        this.setBPM(this.currentBPM);
        this.updatePresetButtons(this.currentBPM);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.superSlowRunApp = new SuperSlowRunApp();
});

// 添加记录项样式（动态生成的CSS）
const recordItemStyle = document.createElement('style');
recordItemStyle.textContent = `
.record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.3s ease;
}

.record-item:hover {
    background-color: var(--bg-secondary);
}

.record-item:last-child {
    border-bottom: none;
}

.record-date {
    font-weight: 600;
    color: var(--text-primary);
}

.record-stats {
    display: flex;
    gap: 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .record-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .record-stats {
        flex-direction: column;
        gap: 0.25rem;
    }
}
`;
document.head.appendChild(recordItemStyle);