class CalorieCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
        this.setupChart();
    }

    initializeElements() {
        // 输入元素
        this.inputs = {
            weight: document.getElementById('weight'),
            age: document.getElementById('age'),
            gender: document.getElementById('gender'),
            height: document.getElementById('height'),
            duration: document.getElementById('duration'),
            intensity: document.getElementById('intensity'),
            terrain: document.getElementById('terrain'),
            temperature: document.getElementById('temperature')
        };

        // 按钮元素
        this.calculateBtn = document.getElementById('calculateBtn');
        this.resetBtn = document.getElementById('resetBtn');

        // 结果显示元素
        this.resultPanel = document.getElementById('resultPanel');
        this.calorieNumber = document.getElementById('calorieNumber');
        this.bmrCalories = document.getElementById('bmrCalories');
        this.exerciseCalories = document.getElementById('exerciseCalories');
        this.perMinuteCalories = document.getElementById('perMinuteCalories');
        this.foodComparisons = document.getElementById('foodComparisons');
        this.insightsList = document.getElementById('insightsList');

        // 历史记录元素
        this.historyPanel = document.getElementById('historyPanel');
        this.historyContent = document.getElementById('historyContent');

        // 图表元素
        this.chartCanvas = document.getElementById('calorieChart');
        this.chartContext = this.chartCanvas.getContext('2d');
    }

    bindEvents() {
        // 计算按钮
        this.calculateBtn.addEventListener('click', () => this.calculateCalories());

        // 重置按钮
        this.resetBtn.addEventListener('click', () => this.resetForm());

        // 输入验证
        Object.values(this.inputs).forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('blur', () => this.validateInput(input));
        });

        // 回车键计算
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.validateAllInputs()) {
                this.calculateCalories();
            }
        });

        // 历史面板关闭
        document.addEventListener('click', (e) => {
            if (e.target === this.historyPanel) {
                this.closeHistory();
            }
        });
    }

    validateInput(input) {
        const group = input.closest('.input-group');
        group.classList.remove('error', 'success');

        let isValid = true;
        const value = input.value.trim();

        if (!value) {
            isValid = false;
        } else {
            switch (input.id) {
                case 'weight':
                    isValid = value >= 30 && value <= 200;
                    break;
                case 'age':
                    isValid = value >= 16 && value <= 80;
                    break;
                case 'height':
                    isValid = value >= 140 && value <= 220;
                    break;
                case 'duration':
                    isValid = value >= 1 && value <= 300;
                    break;
            }
        }

        group.classList.add(isValid ? 'success' : 'error');
        return isValid;
    }

    validateAllInputs() {
        let allValid = true;
        Object.values(this.inputs).forEach(input => {
            if (!this.validateInput(input)) {
                allValid = false;
            }
        });
        return allValid;
    }

    calculateCalories() {
        if (!this.validateAllInputs()) {
            this.showError('请检查输入信息是否完整和正确');
            return;
        }

        // 显示加载状态
        this.showLoading();

        // 模拟计算延迟
        setTimeout(() => {
            const result = this.performCalculation();
            this.displayResult(result);
            this.saveToHistory(result);
            this.updateChart();
        }, 1000);
    }

    performCalculation() {
        const data = this.getInputData();
        
        // 计算基础代谢率 (BMR)
        const bmr = this.calculateBMR(data);
        
        // 计算METs值
        const mets = this.getMETsValue(data);
        
        // 计算总消耗
        const totalCalories = this.calculateTotalCalories(data, bmr, mets);
        
        // 计算各项分解
        const bmrCalories = (bmr / 1440) * data.duration; // 基础代谢消耗
        const exerciseCalories = totalCalories - bmrCalories; // 运动额外消耗
        const perMinute = totalCalories / data.duration; // 每分钟消耗

        return {
            total: Math.round(totalCalories),
            bmr: Math.round(bmrCalories),
            exercise: Math.round(exerciseCalories),
            perMinute: Math.round(perMinute * 10) / 10,
            data: data,
            timestamp: new Date()
        };
    }

    getInputData() {
        return {
            weight: parseFloat(this.inputs.weight.value),
            age: parseInt(this.inputs.age.value),
            gender: this.inputs.gender.value,
            height: parseInt(this.inputs.height.value),
            duration: parseInt(this.inputs.duration.value),
            intensity: this.inputs.intensity.value,
            terrain: this.inputs.terrain.value,
            temperature: this.inputs.temperature.value
        };
    }

    calculateBMR(data) {
        // Harris-Benedict公式
        if (data.gender === 'male') {
            return 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
        } else {
            return 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
        }
    }

    getMETsValue(data) {
        let baseMets;
        
        // 基础METs值
        switch (data.intensity) {
            case 'light':
                baseMets = 3.5;
                break;
            case 'moderate':
                baseMets = 4.5;
                break;
            case 'vigorous':
                baseMets = 5.5;
                break;
            default:
                baseMets = 4.0;
        }

        // 地形调整
        switch (data.terrain) {
            case 'slight-incline':
                baseMets *= 1.1;
                break;
            case 'moderate-incline':
                baseMets *= 1.2;
                break;
            case 'steep-incline':
                baseMets *= 1.4;
                break;
        }

        // 温度调整
        switch (data.temperature) {
            case 'cold':
                baseMets *= 1.05;
                break;
            case 'hot':
                baseMets *= 1.1;
                break;
        }

        return baseMets;
    }

    calculateTotalCalories(data, bmr, mets) {
        // 卡路里 = METs × 体重(kg) × 时间(小时)
        const hours = data.duration / 60;
        return mets * data.weight * hours;
    }

    displayResult(result) {
        // 显示主要结果
        this.animateNumber(this.calorieNumber, 0, result.total, 1000);
        this.bmrCalories.textContent = `${result.bmr} kcal`;
        this.exerciseCalories.textContent = `${result.exercise} kcal`;
        this.perMinuteCalories.textContent = `${result.perMinute} kcal/min`;

        // 显示食物对比
        this.displayFoodComparisons(result.total);

        // 显示健康洞察
        this.displayInsights(result);

        // 显示结果面板
        this.resultPanel.classList.add('show');
        this.resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(start + (end - start) * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    displayFoodComparisons(calories) {
        const foods = [
            { name: '苹果', emoji: '🍎', caloriesPer100g: 52 },
            { name: '香蕉', emoji: '🍌', caloriesPer100g: 89 },
            { name: '米饭', emoji: '🍚', caloriesPer100g: 130 },
            { name: '面包', emoji: '🍞', caloriesPer100g: 265 },
            { name: '巧克力', emoji: '🍫', caloriesPer100g: 546 },
            { name: '可乐', emoji: '🥤', caloriesPer100ml: 42 }
        ];

        this.foodComparisons.innerHTML = foods.map(food => {
            const amount = food.caloriesPer100ml 
                ? Math.round(calories / food.caloriesPer100ml * 100)
                : Math.round(calories / food.caloriesPer100g * 100);
            const unit = food.caloriesPer100ml ? 'ml' : 'g';
            
            return `
                <div class="food-item fade-in">
                    <div class="food-emoji">${food.emoji}</div>
                    <div class="food-name">${food.name}</div>
                    <div class="food-amount">${amount}${unit}</div>
                </div>
            `;
        }).join('');
    }

    displayInsights(result) {
        const insights = [];
        const data = result.data;
        const bmi = data.weight / ((data.height / 100) ** 2);

        // BMI相关建议
        if (bmi < 18.5) {
            insights.push({
                type: 'warning',
                text: '您的BMI偏低，建议在运动的同时注意营养补充，增加健康体重。'
            });
        } else if (bmi > 25) {
            insights.push({
                type: 'success',
                text: '超慢跑是很好的减重运动，坚持训练配合合理饮食会有显著效果。'
            });
        }

        // 运动强度建议
        if (result.perMinute < 5) {
            insights.push({
                type: 'warning',
                text: '当前运动强度较低，可以适当增加运动时长或提高强度以获得更好效果。'
            });
        } else if (result.perMinute > 8) {
            insights.push({
                type: 'success',
                text: '很好的运动强度！这个消耗水平有助于有效改善心肺功能。'
            });
        }

        // 运动时长建议
        if (data.duration < 20) {
            insights.push({
                type: 'warning',
                text: '建议每次运动至少20分钟，这样才能有效激活脂肪燃烧机制。'
            });
        } else if (data.duration > 60) {
            insights.push({
                type: 'warning',
                text: '运动时间较长，注意补充水分，避免过度疲劳。'
            });
        }

        // 年龄相关建议
        if (data.age > 50) {
            insights.push({
                type: 'normal',
                text: '超慢跑非常适合您的年龄段，低冲击运动有助于保护关节健康。'
            });
        }

        this.insightsList.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type} slide-up">
                <div class="insight-text">${insight.text}</div>
            </div>
        `).join('');
    }

    showLoading() {
        this.calculateBtn.innerHTML = '<span class="loading"></span> 计算中...';
        this.calculateBtn.disabled = true;
    }

    hideLoading() {
        this.calculateBtn.innerHTML = '<span class="btn-icon">🔥</span> 计算卡路里消耗';
        this.calculateBtn.disabled = false;
    }

    showError(message) {
        alert(message); // 简单的错误提示，可以改为更优雅的提示
        this.hideLoading();
    }

    resetForm() {
        // 重置所有输入
        Object.values(this.inputs).forEach(input => {
            input.value = '';
            const group = input.closest('.input-group');
            group.classList.remove('error', 'success');
        });

        // 隐藏结果面板
        this.resultPanel.classList.remove('show');
        this.hideLoading();
    }

    // 历史记录功能
    saveToHistory(result) {
        let history = JSON.parse(localStorage.getItem('calorieHistory') || '[]');
        history.unshift(result);
        
        // 只保留最近20条记录
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        
        localStorage.setItem('calorieHistory', JSON.stringify(history));
    }

    loadHistory() {
        this.history = JSON.parse(localStorage.getItem('calorieHistory') || '[]');
    }

    showHistory() {
        this.loadHistory();
        
        if (this.history.length === 0) {
            this.historyContent.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p>暂无运动记录</p>
                    <p>开始您的第一次计算吧！</p>
                </div>
            `;
        } else {
            this.historyContent.innerHTML = this.history.map(record => `
                <div class="history-item">
                    <div class="history-date">${new Date(record.timestamp).toLocaleString('zh-CN')}</div>
                    <div class="history-calories">${record.total} 千卡</div>
                    <div class="history-details">
                        运动时长: ${record.data.duration}分钟 | 
                        强度: ${this.getIntensityText(record.data.intensity)} | 
                        体重: ${record.data.weight}kg
                    </div>
                </div>
            `).join('');
        }
        
        this.historyPanel.style.display = 'flex';
    }

    closeHistory() {
        this.historyPanel.style.display = 'none';
    }

    getIntensityText(intensity) {
        const texts = {
            'light': '轻度',
            'moderate': '中度',
            'vigorous': '高强度'
        };
        return texts[intensity] || '中度';
    }

    // 图表功能
    setupChart() {
        this.chartData = {
            labels: [],
            calories: []
        };
    }

    updateChart() {
        this.loadHistory();
        
        // 获取最近7天的数据
        const recentData = this.history.slice(0, 7).reverse();
        
        this.chartData.labels = recentData.map(record => 
            new Date(record.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
        );
        this.chartData.calories = recentData.map(record => record.total);
        
        this.drawChart();
    }

    drawChart() {
        const ctx = this.chartContext;
        const canvas = this.chartCanvas;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.chartData.calories.length === 0) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('暂无数据', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        
        const maxCalories = Math.max(...this.chartData.calories);
        const minCalories = Math.min(...this.chartData.calories);
        const range = maxCalories - minCalories || 100;
        
        // 绘制网格线
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        
        // 绘制数据线
        if (this.chartData.calories.length > 1) {
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            this.chartData.calories.forEach((calories, index) => {
                const x = padding + (chartWidth / (this.chartData.calories.length - 1)) * index;
                const y = padding + chartHeight - ((calories - minCalories) / range) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // 绘制数据点
        this.chartData.calories.forEach((calories, index) => {
            const x = padding + (chartWidth / Math.max(this.chartData.calories.length - 1, 1)) * index;
            const y = padding + chartHeight - ((calories - minCalories) / range) * chartHeight;
            
            ctx.fillStyle = '#6366f1';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // 显示数值
            ctx.fillStyle = '#374151';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(calories.toString(), x, y - 10);
        });
        
        // 绘制标签
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        this.chartData.labels.forEach((label, index) => {
            const x = padding + (chartWidth / Math.max(this.chartData.labels.length - 1, 1)) * index;
            ctx.fillText(label, x, canvas.height - 10);
        });
    }
}

// 全局函数
function saveResult() {
    if (window.calculator && window.calculator.history.length > 0) {
        const latest = window.calculator.history[0];
        const data = `运动记录 - ${new Date(latest.timestamp).toLocaleString('zh-CN')}
消耗卡路里: ${latest.total} kcal
运动时长: ${latest.data.duration} 分钟
运动强度: ${window.calculator.getIntensityText(latest.data.intensity)}
体重: ${latest.data.weight} kg`;
        
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `运动记录_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

function shareResult() {
    if (window.calculator && window.calculator.history.length > 0) {
        const latest = window.calculator.history[0];
        const text = `我刚刚完成了${latest.data.duration}分钟的超慢跑，消耗了${latest.total}千卡！一起来健康运动吧！`;
        
        if (navigator.share) {
            navigator.share({
                title: '我的运动成果',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('运动成果已复制到剪贴板！');
            });
        }
    }
}

function showHistory() {
    if (window.calculator) {
        window.calculator.showHistory();
    }
}

function closeHistory() {
    if (window.calculator) {
        window.calculator.closeHistory();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new CalorieCalculator();
    
    // 延迟显示加载完成状态
    setTimeout(() => {
        document.querySelector('.calculator-main').style.opacity = '1';
    }, 100);
});