/**
 * 超慢跑助手 - 核心功能模块
 * 包含基础数据管理、音频处理、本地存储等核心功能
 */

class SuperSlowRunCore {
    constructor() {
        // 基础配置
        this.config = {
            defaultBPM: 180,
            minBPM: 170,
            maxBPM: 190,
            defaultDuration: 15, // 分钟
            maxDuration: 999,
            volumeDefault: 0.65
        };

        // 应用状态
        this.state = {
            bpm: this.config.defaultBPM,
            isMetronomeRunning: false,
            isExerciseRunning: false,
            exercisePaused: false,
            currentDuration: this.config.defaultDuration,
            elapsedTime: 0,
            currentSound: 'click',
            volume: this.config.volumeDefault
        };

        // 统计数据
        this.stats = {
            totalSessions: 6,
            totalTime: 35, // 分钟
            totalSteps: 6738,
            totalCalories: 2700,
            averageBPM: 180,
            weeklyTarget: 27 * 60, // 秒
            todayTime: 16 * 60 // 秒，默认今日16分钟
        };

        // 定时器和间隔器
        this.timers = {
            metronome: null,
            exercise: null,
            stats: null
        };

        // 音频上下文
        this.audioContext = null;
        this.audioBuffer = null;

        // 初始化
        this.initAudio();
        this.loadData();
    }

    /**
     * 初始化音频系统
     */
    async initAudio() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 预设音效配置
            this.soundConfigs = {
                beep: { frequency: 800, duration: 0.1, wave: 'sine' },
                tick: { frequency: 1000, duration: 0.05, wave: 'square' },
                click: { frequency: 1200, duration: 0.08, wave: 'triangle' },
                bell: { frequency: 600, duration: 0.2, wave: 'sine' },
                drum: { frequency: 100, duration: 0.15, wave: 'sawtooth' }
            };

        } catch (error) {
            console.warn('音频初始化失败:', error);
        }
    }

    /**
     * 播放节拍音效
     */
    playMetronomeSound() {
        if (!this.audioContext || this.state.volume === 0) return;

        try {
            const config = this.soundConfigs[this.state.currentSound] || this.soundConfigs.click;
            
            // 创建振荡器
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // 连接音频节点
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 设置参数
            oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
            oscillator.type = config.wave;
            
            // 音量包络
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.state.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);
            
            // 播放音效
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + config.duration);
            
        } catch (error) {
            console.warn('音效播放失败:', error);
        }
    }

    /**
     * 开始节拍器
     */
    startMetronome() {
        if (this.state.isMetronomeRunning) return;

        // 确保音频上下文运行
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.state.isMetronomeRunning = true;
        const interval = 60000 / this.state.bpm; // 毫秒

        this.timers.metronome = setInterval(() => {
            if (this.state.isMetronomeRunning) {
                this.playMetronomeSound();
                this.triggerMetronomeVisual();
            }
        }, interval);

        console.log(`节拍器已启动 - BPM: ${this.state.bpm}`);
    }

    /**
     * 停止节拍器
     */
    stopMetronome() {
        this.state.isMetronomeRunning = false;
        
        if (this.timers.metronome) {
            clearInterval(this.timers.metronome);
            this.timers.metronome = null;
        }

        console.log('节拍器已停止');
    }

    /**
     * 触发节拍器视觉效果
     */
    triggerMetronomeVisual() {
        const circle = document.getElementById('metronome-circle');
        if (circle) {
            circle.classList.add('active');
            setTimeout(() => {
                circle.classList.remove('active');
            }, 100);
        }
    }

    /**
     * 设置BPM值
     */
    setBPM(newBPM) {
        newBPM = Math.max(this.config.minBPM, Math.min(this.config.maxBPM, parseInt(newBPM)));
        this.state.bpm = newBPM;

        // 如果节拍器正在运行，重启以应用新的BPM
        if (this.state.isMetronomeRunning) {
            this.stopMetronome();
            this.startMetronome();
        }

        this.updateBPMDisplay();
        this.saveData();

        console.log(`BPM已设置为: ${newBPM}`);
    }

    /**
     * 更新BPM显示
     */
    updateBPMDisplay() {
        // 更新所有BPM相关的显示元素
        const elements = [
            'bpm-value',
            'metronome-bpm',
            'current-cadence'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.state.bpm;
            }
        });

        // 更新状态描述
        const statusElement = document.getElementById('bpm-status');
        if (statusElement) {
            if (this.state.bpm <= 175) {
                statusElement.textContent = '轻度强度';
            } else if (this.state.bpm <= 185) {
                statusElement.textContent = '中等强度';
            } else {
                statusElement.textContent = '高等强度';
            }
        }
    }

    /**
     * 设置音量
     */
    setVolume(volume) {
        this.state.volume = Math.max(0, Math.min(1, parseFloat(volume)));
        this.saveData();
    }

    /**
     * 设置音效类型
     */
    setSoundType(soundType) {
        if (this.soundConfigs[soundType]) {
            this.state.currentSound = soundType;
            this.saveData();
        }
    }

    /**
     * 开始运动
     */
    startExercise(duration) {
        if (this.state.isExerciseRunning) return;

        this.state.isExerciseRunning = true;
        this.state.exercisePaused = false;
        this.state.currentDuration = parseInt(duration) || this.config.defaultDuration;
        this.state.elapsedTime = 0;

        // 启动计时器
        this.timers.exercise = setInterval(() => {
            if (this.state.isExerciseRunning && !this.state.exercisePaused) {
                this.state.elapsedTime++;
                this.updateExerciseDisplay();

                // 检查是否完成
                if (this.state.elapsedTime >= this.state.currentDuration * 60) {
                    this.finishExercise();
                }
            }
        }, 1000);

        // 自动启动节拍器
        if (!this.state.isMetronomeRunning) {
            this.startMetronome();
        }

        console.log(`运动已开始 - 时长: ${this.state.currentDuration}分钟`);
    }

    /**
     * 暂停/恢复运动
     */
    toggleExercisePause() {
        if (!this.state.isExerciseRunning) return;

        this.state.exercisePaused = !this.state.exercisePaused;

        if (this.state.exercisePaused) {
            this.stopMetronome();
            console.log('运动已暂停');
        } else {
            this.startMetronome();
            console.log('运动已恢复');
        }

        this.updateExerciseDisplay();
    }

    /**
     * 结束运动
     */
    finishExercise() {
        if (!this.state.isExerciseRunning) return;

        const sessionData = {
            date: new Date().toISOString(),
            duration: this.state.elapsedTime, // 秒
            targetDuration: this.state.currentDuration * 60,
            bpm: this.state.bpm,
            steps: Math.floor(this.state.bpm * this.state.elapsedTime / 60),
            calories: this.calculateCalories(this.state.elapsedTime / 60) // 估算卡路里
        };

        // 更新统计数据
        this.updateStats(sessionData);

        // 停止所有计时器
        this.stopExercise();

        // 保存数据
        this.saveData();

        console.log('运动已完成', sessionData);

        // 触发运动完成事件
        this.onExerciseComplete(sessionData);
    }

    /**
     * 停止运动
     */
    stopExercise() {
        this.state.isExerciseRunning = false;
        this.state.exercisePaused = false;

        if (this.timers.exercise) {
            clearInterval(this.timers.exercise);
            this.timers.exercise = null;
        }

        this.stopMetronome();
        this.state.elapsedTime = 0;

        console.log('运动已停止');
    }

    /**
     * 更新运动显示
     */
    updateExerciseDisplay() {
        const remainingTime = (this.state.currentDuration * 60) - this.state.elapsedTime;
        const elapsedMinutes = Math.floor(this.state.elapsedTime / 60);
        const elapsedSeconds = this.state.elapsedTime % 60;

        // 更新剩余时间显示
        const timerDisplay = document.getElementById('exercise-timer-display');
        if (timerDisplay) {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // 更新已用时间
        const elapsedElement = document.getElementById('elapsed-time');
        if (elapsedElement) {
            elapsedElement.textContent = `${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSeconds.toString().padStart(2, '0')}`;
        }

        // 更新预计步数
        const stepsElement = document.getElementById('estimated-steps');
        if (stepsElement) {
            const estimatedSteps = Math.floor(this.state.bpm * this.state.elapsedTime / 60);
            stepsElement.textContent = estimatedSteps.toString();
        }

        // 更新消耗热量
        const caloriesElement = document.getElementById('burned-calories');
        if (caloriesElement) {
            const burnedCalories = Math.floor(this.calculateCalories(this.state.elapsedTime / 60));
            caloriesElement.textContent = `${burnedCalories} kcal`;
        }
    }

    /**
     * 简单的卡路里计算
     */
    calculateCalories(minutes) {
        // 基于超慢跑的MET值约为4.0，平均体重60kg
        const met = 4.0;
        const weight = 60; // kg
        return met * weight * minutes / 60;
    }

    /**
     * 更新统计数据
     */
    updateStats(sessionData) {
        this.stats.totalSessions++;
        this.stats.totalTime += Math.floor(sessionData.duration / 60); // 转换为分钟
        this.stats.totalSteps += sessionData.steps;
        this.stats.totalCalories += sessionData.calories;
        this.stats.todayTime += sessionData.duration; // 秒

        // 计算平均BPM
        this.stats.averageBPM = Math.floor(
            (this.stats.averageBPM * (this.stats.totalSessions - 1) + sessionData.bpm) / this.stats.totalSessions
        );

        // 保存运动记录
        this.saveExerciseRecord(sessionData);
        this.updateStatsDisplay();
    }

    /**
     * 保存运动记录
     */
    saveExerciseRecord(sessionData) {
        let records = this.loadExerciseRecords();
        records.unshift(sessionData); // 添加到开头

        // 只保留最近20条记录
        if (records.length > 20) {
            records = records.slice(0, 20);
        }

        localStorage.setItem('superslowrun_records', JSON.stringify(records));
    }

    /**
     * 加载运动记录
     */
    loadExerciseRecords() {
        try {
            const records = localStorage.getItem('superslowrun_records');
            return records ? JSON.parse(records) : [];
        } catch (error) {
            console.warn('加载运动记录失败:', error);
            return [];
        }
    }

    /**
     * 更新统计显示
     */
    updateStatsDisplay() {
        // 更新今日运动时间
        const todayElement = document.getElementById('today-time');
        if (todayElement) {
            const minutes = Math.floor(this.stats.todayTime / 60);
            const seconds = this.stats.todayTime % 60;
            todayElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        // 更新总卡路里
        const caloriesElement = document.getElementById('total-calories');
        if (caloriesElement) {
            caloriesElement.textContent = Math.floor(this.stats.totalCalories).toString();
        }

        // 更新其他统计数据
        const statsElements = {
            'sessions-count': this.stats.totalSessions,
            'total-duration': this.formatTime(this.stats.totalTime),
            'step-count': this.stats.totalSteps,
            'avg-cadence': this.stats.averageBPM
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value.toString();
            }
        });

        // 更新活动记录列表
        this.updateActivityList();
    }

    /**
     * 更新活动记录列表
     */
    updateActivityList() {
        const listElement = document.getElementById('activity-list');
        if (!listElement) return;

        const records = this.loadExerciseRecords().slice(0, 5); // 显示最近5条
        
        if (records.length === 0) {
            listElement.innerHTML = this.getDefaultActivityList();
            return;
        }

        listElement.innerHTML = records.map(record => {
            const date = new Date(record.date);
            const timeStr = this.formatDateTime(date);
            const duration = this.formatDuration(record.duration);
            const intensity = this.getBPMIntensity(record.bpm);

            return `
                <div class="activity-item">
                    <div class="activity-time">${timeStr}</div>
                    <div class="activity-duration">${duration}</div>
                    ${intensity ? `<div class="activity-type">慢跑 · ${intensity}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * 获取默认活动列表（示例数据）
     */
    getDefaultActivityList() {
        return `
            <div class="activity-item">
                <div class="activity-time">今天 08:34</div>
                <div class="activity-duration">16:00</div>
                <div class="activity-type">慢跑 · 中等强度</div>
            </div>
            <div class="activity-item">
                <div class="activity-time">8月7日 20:30</div>
                <div class="activity-duration">16:27</div>
            </div>
            <div class="activity-item">
                <div class="activity-time">8月7日 17:29</div>
                <div class="activity-duration">6:14</div>
            </div>
            <div class="activity-item">
                <div class="activity-time">8月7日 17:06</div>
                <div class="activity-duration">5:52</div>
                <div class="activity-type">慢跑 · 轻度有氧</div>
            </div>
            <div class="activity-item">
                <div class="activity-time">8月7日 12:31</div>
                <div class="activity-duration">6:14</div>
                <div class="activity-type">慢跑 · 中等强度</div>
            </div>
        `;
    }

    /**
     * 格式化时长（秒转为分:秒）
     */
    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 格式化时间
     */
    formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes}:00`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    }

    /**
     * 格式化日期时间
     */
    formatDateTime(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (recordDate.getTime() === today.getTime()) {
            return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }

        return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    /**
     * 获取BPM强度描述
     */
    getBPMIntensity(bpm) {
        if (bpm <= 175) return '轻度有氧';
        if (bpm <= 185) return '中等强度';
        return '高等强度';
    }

    /**
     * 运动完成回调
     */
    onExerciseComplete(sessionData) {
        // 显示完成提示
        if (window.showCompletionDialog) {
            window.showCompletionDialog(sessionData);
        }
    }

    /**
     * 保存数据到本地存储
     */
    saveData() {
        try {
            const data = {
                state: this.state,
                stats: this.stats,
                timestamp: Date.now()
            };
            localStorage.setItem('superslowrun_data', JSON.stringify(data));
        } catch (error) {
            console.warn('保存数据失败:', error);
        }
    }

    /**
     * 从本地存储加载数据
     */
    loadData() {
        try {
            const saved = localStorage.getItem('superslowrun_data');
            if (saved) {
                const data = JSON.parse(saved);
                
                // 合并状态数据
                if (data.state) {
                    Object.assign(this.state, data.state);
                    // 重置运行状态
                    this.state.isMetronomeRunning = false;
                    this.state.isExerciseRunning = false;
                }
                
                // 合并统计数据
                if (data.stats) {
                    Object.assign(this.stats, data.stats);
                }
            }
        } catch (error) {
            console.warn('加载数据失败:', error);
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 停止所有计时器
        Object.values(this.timers).forEach(timer => {
            if (timer) clearInterval(timer);
        });

        // 关闭音频上下文
        if (this.audioContext) {
            this.audioContext.close();
        }

        console.log('应用资源已清理');
    }
}

// 导出核心类
window.SuperSlowRunCore = SuperSlowRunCore;
