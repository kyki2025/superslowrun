// 打卡记录管理类
class CheckinManager {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.checkinData = this.loadCheckinData();
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }

    // 初始化DOM元素
    initializeElements() {
        this.elements = {
            // 统计元素
            currentStreak: document.getElementById('currentStreak'),
            monthTotal: document.getElementById('monthTotal'),
            totalTime: document.getElementById('totalTime'),
            totalDays: document.getElementById('totalDays'),
            
            // 月份导航
            prevMonth: document.getElementById('prevMonth'),
            nextMonth: document.getElementById('nextMonth'),
            currentMonthYear: document.getElementById('currentMonthYear'),
            
            // 日历
            calendarGrid: document.getElementById('calendarGrid'),
            
            // 打卡表单
            todayCheckin: document.getElementById('todayCheckin'),
            checkinForm: document.getElementById('checkinForm'),
            checkinSuccess: document.getElementById('checkinSuccess'),
            duration: document.getElementById('duration'),
            feeling: document.getElementById('feeling'),
            notes: document.getElementById('notes'),
            checkinBtn: document.getElementById('checkinBtn'),
            editBtn: document.getElementById('editBtn'),
            
            // 弹窗
            modalOverlay: document.getElementById('modalOverlay'),
            modalTitle: document.getElementById('modalTitle'),
            modalBody: document.getElementById('modalBody'),
            closeModal: document.getElementById('closeModal')
        };
    }

    // 绑定事件
    bindEvents() {
        // 月份导航
        this.elements.prevMonth.addEventListener('click', () => this.navigateMonth(-1));
        this.elements.nextMonth.addEventListener('click', () => this.navigateMonth(1));
        
        // 打卡按钮
        this.elements.checkinBtn.addEventListener('click', () => this.handleCheckin());
        this.elements.editBtn.addEventListener('click', () => this.showEditForm());
        
        // 弹窗关闭
        this.elements.closeModal.addEventListener('click', () => this.closeModal());
        this.elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.modalOverlay) {
                this.closeModal();
            }
        });
        
        // 表单验证
        this.elements.duration.addEventListener('input', () => this.validateForm());
        this.elements.feeling.addEventListener('change', () => this.validateForm());
    }

    // 加载打卡数据
    loadCheckinData() {
        try {
            const data = localStorage.getItem('superslowrun_checkin_data');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('加载打卡数据失败:', error);
            return {};
        }
    }

    // 保存打卡数据
    saveCheckinData() {
        try {
            localStorage.setItem('superslowrun_checkin_data', JSON.stringify(this.checkinData));
        } catch (error) {
            console.error('保存打卡数据失败:', error);
        }
    }

    // 获取日期键
    getDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // 月份导航
    navigateMonth(direction) {
        this.currentMonth += direction;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.updateDisplay();
    }

    // 更新显示
    updateDisplay() {
        this.updateMonthDisplay();
        this.updateCalendar();
        this.updateStats();
        this.updateTodayCheckin();
    }

    // 更新月份显示
    updateMonthDisplay() {
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', 
                           '7月', '8月', '9月', '10月', '11月', '12月'];
        this.elements.currentMonthYear.textContent = `${this.currentYear}年${monthNames[this.currentMonth]}`;
    }

    // 更新日历
    updateCalendar() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const today = new Date();
        const todayKey = this.getDateKey(today);
        
        let html = '';
        let currentDate = new Date(startDate);
        
        // 生成6周的日历
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const dateKey = this.getDateKey(currentDate);
                const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
                const isToday = dateKey === todayKey;
                const checkinRecord = this.checkinData[dateKey];
                const hasCheckin = !!checkinRecord;
                
                let classes = ['calendar-day'];
                if (!isCurrentMonth) classes.push('other-month');
                if (isToday) classes.push('today');
                if (hasCheckin) classes.push('checked-in');
                
                let indicator = '';
                if (hasCheckin && checkinRecord.feeling) {
                    indicator = `<div class="day-indicator indicator-${checkinRecord.feeling}"></div>`;
                }
                
                html += `
                    <div class="${classes.join(' ')}" data-date="${dateKey}">
                        <span class="day-number">${currentDate.getDate()}</span>
                        ${indicator}
                    </div>
                `;
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        
        this.elements.calendarGrid.innerHTML = html;
        
        // 绑定日历点击事件
        this.elements.calendarGrid.addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day');
            if (dayElement && dayElement.dataset.date) {
                this.showDayDetails(dayElement.dataset.date);
            }
        });
    }

    // 更新统计数据
    updateStats() {
        const stats = this.calculateStats();
        this.elements.currentStreak.textContent = stats.currentStreak;
        this.elements.monthTotal.textContent = stats.monthTotal;
        this.elements.totalTime.textContent = stats.totalTime;
        this.elements.totalDays.textContent = stats.totalDays;
    }

    // 计算统计数据
    calculateStats() {
        const today = new Date();
        const todayKey = this.getDateKey(today);
        
        // 计算连续打卡天数
        let currentStreak = 0;
        let checkDate = new Date(today);
        
        while (true) {
            const dateKey = this.getDateKey(checkDate);
            if (this.checkinData[dateKey]) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        // 计算本月打卡天数
        let monthTotal = 0;
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            const dateKey = this.getDateKey(d);
            if (this.checkinData[dateKey]) {
                monthTotal++;
            }
        }
        
        // 计算总时长和总天数
        let totalTime = 0;
        let totalDays = 0;
        
        Object.values(this.checkinData).forEach(record => {
            if (record.duration) {
                totalTime += parseInt(record.duration) || 0;
                totalDays++;
            }
        });
        
        return {
            currentStreak,
            monthTotal,
            totalTime,
            totalDays
        };
    }

    // 更新今日打卡状态
    updateTodayCheckin() {
        const today = new Date();
        const todayKey = this.getDateKey(today);
        const todayRecord = this.checkinData[todayKey];
        
        if (todayRecord) {
            this.elements.checkinForm.style.display = 'none';
            this.elements.checkinSuccess.style.display = 'block';
        } else {
            this.elements.checkinForm.style.display = 'block';
            this.elements.checkinSuccess.style.display = 'none';
        }
    }

    // 表单验证
    validateForm() {
        const duration = this.elements.duration.value;
        const feeling = this.elements.feeling.value;
        
        const isValid = duration && parseInt(duration) > 0 && feeling;
        this.elements.checkinBtn.disabled = !isValid;
        
        if (isValid) {
            this.elements.checkinBtn.style.opacity = '1';
            this.elements.checkinBtn.style.cursor = 'pointer';
        } else {
            this.elements.checkinBtn.style.opacity = '0.6';
            this.elements.checkinBtn.style.cursor = 'not-allowed';
        }
    }

    // 处理打卡
    handleCheckin() {
        const duration = this.elements.duration.value;
        const feeling = this.elements.feeling.value;
        const notes = this.elements.notes.value;
        
        if (!duration || !feeling) {
            alert('请填写运动时长和感受');
            return;
        }
        
        const today = new Date();
        const todayKey = this.getDateKey(today);
        
        // 保存打卡记录
        this.checkinData[todayKey] = {
            date: todayKey,
            duration: parseInt(duration),
            feeling: feeling,
            notes: notes,
            timestamp: Date.now()
        };
        
        this.saveCheckinData();
        this.updateDisplay();
        
        // 添加动画效果
        const todayElement = document.querySelector(`[data-date="${todayKey}"]`);
        if (todayElement) {
            todayElement.classList.add('just-checked');
            setTimeout(() => {
                todayElement.classList.remove('just-checked');
            }, 500);
        }
        
        // 清空表单
        this.elements.duration.value = '';
        this.elements.feeling.value = '';
        this.elements.notes.value = '';
    }

    // 显示编辑表单
    showEditForm() {
        this.elements.checkinForm.style.display = 'block';
        this.elements.checkinSuccess.style.display = 'none';
        
        // 填充当前数据
        const today = new Date();
        const todayKey = this.getDateKey(today);
        const todayRecord = this.checkinData[todayKey];
        
        if (todayRecord) {
            this.elements.duration.value = todayRecord.duration || '';
            this.elements.feeling.value = todayRecord.feeling || '';
            this.elements.notes.value = todayRecord.notes || '';
        }
        
        this.validateForm();
    }

    // 显示日期详情
    showDayDetails(dateKey) {
        const record = this.checkinData[dateKey];
        const date = new Date(dateKey);
        const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        
        this.elements.modalTitle.textContent = dateStr;
        
        if (record) {
            const feelingMap = {
                'excellent': '😄 非常棒',
                'good': '😊 感觉良好',
                'normal': '😐 一般般',
                'tired': '😓 有点累',
                'hard': '😰 很辛苦'
            };
            
            this.elements.modalBody.innerHTML = `
                <div class="detail-item">
                    <div class="detail-label">运动时长</div>
                    <div class="detail-value">${record.duration} 分钟</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">运动感受</div>
                    <div class="detail-value">
                        <div class="feeling-display">${feelingMap[record.feeling] || record.feeling}</div>
                    </div>
                </div>
                ${record.notes ? `
                <div class="detail-item">
                    <div class="detail-label">备注</div>
                    <div class="detail-value">${record.notes}</div>
                </div>
                ` : ''}
                <div class="detail-item">
                    <div class="detail-label">打卡时间</div>
                    <div class="detail-value">${new Date(record.timestamp).toLocaleString('zh-CN')}</div>
                </div>
            `;
        } else {
            this.elements.modalBody.innerHTML = `
                <div class="detail-item">
                    <div class="detail-value" style="text-align: center; color: var(--text-secondary);">
                        这一天还没有打卡记录
                    </div>
                </div>
            `;
        }
        
        this.elements.modalOverlay.style.display = 'flex';
    }

    // 关闭弹窗
    closeModal() {
        this.elements.modalOverlay.style.display = 'none';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new CheckinManager();
});

// 导出数据功能
function exportCheckinData() {
    const checkinManager = new CheckinManager();
    const data = checkinManager.checkinData;
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `超慢跑打卡记录_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// 导入数据功能
function importCheckinData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('superslowrun_checkin_data', JSON.stringify(data));
            location.reload();
        } catch (error) {
            alert('导入失败，请检查文件格式');
        }
    };
    reader.readAsText(file);
}