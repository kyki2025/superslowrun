class TrainingPlanner {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        
        this.initializeElements();
        this.bindEvents();
        this.updateStepDisplay();
    }

    initializeElements() {
        // 步骤相关元素
        this.steps = document.querySelectorAll('.step');
        this.formSteps = document.querySelectorAll('.form-step');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        
        // 表单元素
        this.formElements = {
            // 基本信息
            age: document.getElementById('age'),
            gender: document.getElementById('gender'),
            height: document.getElementById('height'),
            weight: document.getElementById('weight'),
            healthConditions: {
                normal: document.getElementById('health-normal'),
                joint: document.getElementById('health-joint'),
                heart: document.getElementById('health-heart'),
                other: document.getElementById('health-other')
            },
            
            // 运动经验
            exerciseFrequency: document.querySelectorAll('input[name="exercise-frequency"]'),
            runningExperience: document.querySelectorAll('input[name="running-experience"]'),
            availableTime: document.getElementById('available-time'),
            preferredTimes: {
                morning: document.getElementById('time-morning'),
                afternoon: document.getElementById('time-afternoon'),
                evening: document.getElementById('time-evening')
            },
            
            // 目标设定
            goalCards: document.querySelectorAll('.goal-card'),
            targetWeight: document.getElementById('target-weight'),
            planDuration: document.getElementById('plan-duration'),
            intensityPreference: document.getElementById('intensity-preference')
        };
        
        // 生成状态元素
        this.generationStatus = document.getElementById('generationStatus');
        this.generatedPlan = document.getElementById('generatedPlan');
    }

    bindEvents() {
        // 导航按钮
        this.prevBtn.addEventListener('click', () => this.previousStep());
        this.nextBtn.addEventListener('click', () => this.nextStep());
        
        // 目标卡片选择
        this.formElements.goalCards.forEach(card => {
            card.addEventListener('click', () => this.selectGoal(card));
        });
        
        // 健康状况复选框逻辑
        this.formElements.healthConditions.normal.addEventListener('change', (e) => {
            if (e.target.checked) {
                Object.values(this.formElements.healthConditions).forEach(checkbox => {
                    if (checkbox !== e.target) checkbox.checked = false;
                });
            }
        });
        
        Object.values(this.formElements.healthConditions).forEach(checkbox => {
            if (checkbox !== this.formElements.healthConditions.normal) {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.formElements.healthConditions.normal.checked = false;
                    }
                });
            }
        });
        
        // 强度滑块更新
        this.formElements.intensityPreference.addEventListener('input', (e) => {
            this.updateIntensityDisplay(e.target.value);
        });
        
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.currentStep < this.totalSteps) {
                this.nextStep();
            } else if (e.key === 'Escape' && this.currentStep > 1) {
                this.previousStep();
            }
        });
    }

    updateStepDisplay() {
        // 更新步骤指示器
        this.steps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });
        
        // 更新表单步骤显示
        this.formSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });
        
        // 更新导航按钮
        this.prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        
        if (this.currentStep === this.totalSteps) {
            this.nextBtn.style.display = 'none';
        } else {
            this.nextBtn.style.display = 'block';
            this.nextBtn.textContent = this.currentStep === this.totalSteps - 1 ? '生成计划' : '下一步';
        }
    }

    validateCurrentStep() {
        const errors = [];
        
        switch (this.currentStep) {
            case 1:
                if (!this.formElements.age.value || this.formElements.age.value < 16 || this.formElements.age.value > 80) {
                    errors.push('请输入有效的年龄（16-80岁）');
                }
                if (!this.formElements.gender.value) {
                    errors.push('请选择性别');
                }
                if (!this.formElements.height.value || this.formElements.height.value < 140 || this.formElements.height.value > 220) {
                    errors.push('请输入有效的身高（140-220cm）');
                }
                if (!this.formElements.weight.value || this.formElements.weight.value < 40 || this.formElements.weight.value > 150) {
                    errors.push('请输入有效的体重（40-150kg）');
                }
                break;
                
            case 2:
                const exerciseFrequencySelected = Array.from(this.formElements.exerciseFrequency).some(radio => radio.checked);
                if (!exerciseFrequencySelected) {
                    errors.push('请选择当前运动频率');
                }
                
                const runningExperienceSelected = Array.from(this.formElements.runningExperience).some(radio => radio.checked);
                if (!runningExperienceSelected) {
                    errors.push('请选择跑步经验');
                }
                
                if (!this.formElements.availableTime.value) {
                    errors.push('请选择每周可用训练时间');
                }
                
                const preferredTimeSelected = Object.values(this.formElements.preferredTimes).some(checkbox => checkbox.checked);
                if (!preferredTimeSelected) {
                    errors.push('请选择至少一个偏好的训练时间');
                }
                break;
                
            case 3:
                const goalSelected = document.querySelector('.goal-card.selected');
                if (!goalSelected) {
                    errors.push('请选择主要目标');
                }
                
                if (!this.formElements.planDuration.value) {
                    errors.push('请选择计划周期');
                }
                break;
        }
        
        if (errors.length > 0) {
            this.showErrors(errors);
            return false;
        }
        
        this.clearErrors();
        return true;
    }

    showErrors(errors) {
        // 移除之前的错误提示
        this.clearErrors();
        
        // 创建错误提示
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.innerHTML = `
            <div class="error-message-box">
                <h4>请完善以下信息：</h4>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        
        const currentStepElement = document.querySelector('.form-step.active');
        currentStepElement.insertBefore(errorContainer, currentStepElement.firstChild);
        
        // 添加错误样式
        const style = document.createElement('style');
        style.textContent = `
            .error-container {
                margin-bottom: 2rem;
            }
            .error-message-box {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 1rem;
                color: #dc2626;
            }
            .error-message-box h4 {
                margin-bottom: 0.5rem;
                font-size: 1rem;
            }
            .error-message-box ul {
                margin: 0;
                padding-left: 1.5rem;
            }
            .error-message-box li {
                margin-bottom: 0.25rem;
            }
        `;
        document.head.appendChild(style);
    }

    clearErrors() {
        const errorContainer = document.querySelector('.error-container');
        if (errorContainer) {
            errorContainer.remove();
        }
    }

    collectFormData() {
        this.formData = {
            // 基本信息
            age: parseInt(this.formElements.age.value),
            gender: this.formElements.gender.value,
            height: parseInt(this.formElements.height.value),
            weight: parseInt(this.formElements.weight.value),
            healthConditions: {
                normal: this.formElements.healthConditions.normal.checked,
                joint: this.formElements.healthConditions.joint.checked,
                heart: this.formElements.healthConditions.heart.checked,
                other: this.formElements.healthConditions.other.checked
            },
            
            // 运动经验
            exerciseFrequency: Array.from(this.formElements.exerciseFrequency).find(radio => radio.checked)?.value,
            runningExperience: Array.from(this.formElements.runningExperience).find(radio => radio.checked)?.value,
            availableTime: this.formElements.availableTime.value,
            preferredTimes: {
                morning: this.formElements.preferredTimes.morning.checked,
                afternoon: this.formElements.preferredTimes.afternoon.checked,
                evening: this.formElements.preferredTimes.evening.checked
            },
            
            // 目标设定
            goal: document.querySelector('.goal-card.selected')?.dataset.goal,
            targetWeight: this.formElements.targetWeight.value ? parseInt(this.formElements.targetWeight.value) : null,
            planDuration: parseInt(this.formElements.planDuration.value),
            intensityPreference: parseInt(this.formElements.intensityPreference.value)
        };
    }

    selectGoal(selectedCard) {
        // 移除其他卡片的选中状态
        this.formElements.goalCards.forEach(card => {
            card.classList.remove('selected');
        });
        
        // 选中当前卡片
        selectedCard.classList.add('selected');
    }

    updateIntensityDisplay(value) {
        const labels = ['很轻松', '轻松', '适中', '有挑战', '很有挑战'];
        // 可以在这里添加实时显示当前强度的逻辑
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            if (this.validateCurrentStep()) {
                this.currentStep++;
                this.updateStepDisplay();
                
                if (this.currentStep === this.totalSteps) {
                    this.generatePlan();
                }
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    async generatePlan() {
        this.collectFormData();
        
        // 显示生成状态
        this.generationStatus.style.display = 'block';
        this.generatedPlan.style.display = 'none';
        
        // 模拟生成过程
        await this.simulateGeneration();
        
        // 生成计划内容
        const planContent = this.createPlanContent();
        
        // 显示生成的计划
        this.generationStatus.style.display = 'none';
        this.generatedPlan.innerHTML = planContent;
        this.generatedPlan.style.display = 'block';
        
        // 绑定计划操作事件
        this.bindPlanActions();
    }

    async simulateGeneration() {
        const messages = [
            '分析您的基本信息...',
            '评估运动能力...',
            '制定训练强度...',
            '安排训练计划...',
            '优化训练方案...'
        ];
        
        for (let i = 0; i < messages.length; i++) {
            const statusElement = this.generationStatus.querySelector('p');
            statusElement.textContent = messages[i];
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }

    createPlanContent() {
        const data = this.formData;
        const bmi = (data.weight / ((data.height / 100) ** 2)).toFixed(1);
        
        // 根据用户信息计算训练参数
        const trainingParams = this.calculateTrainingParams(data);
        
        return `
            <div class="plan-overview">
                <h3>您的专属超慢跑训练计划</h3>
                <div class="plan-stats">
                    <div class="plan-stat">
                        <span class="stat-value">${data.planDuration}</span>
                        <span class="stat-label">周训练计划</span>
                    </div>
                    <div class="plan-stat">
                        <span class="stat-value">${trainingParams.sessionsPerWeek}</span>
                        <span class="stat-label">每周训练次数</span>
                    </div>
                    <div class="plan-stat">
                        <span class="stat-value">${trainingParams.avgDuration}</span>
                        <span class="stat-label">平均训练时长</span>
                    </div>
                    <div class="plan-stat">
                        <span class="stat-value">${trainingParams.targetBPM}</span>
                        <span class="stat-label">目标节拍(BPM)</span>
                    </div>
                </div>
                <p><strong>BMI指数：</strong>${bmi} ${this.getBMICategory(bmi)}</p>
                <p><strong>训练目标：</strong>${this.getGoalDescription(data.goal)}</p>
            </div>
            
            ${this.generateWeeklySchedule(trainingParams)}
            
            <div class="training-guidelines">
                <h4>训练指导</h4>
                ${this.generateGuidelines(data, trainingParams)}
            </div>
            
            <div class="nutrition-tips">
                <h4>营养建议</h4>
                ${this.generateNutritionTips(data)}
            </div>
            
            <div class="plan-actions">
                <button class="action-btn download" onclick="window.print()">
                    📄 下载计划
                </button>
                <button class="action-btn share" onclick="planner.sharePlan()">
                    📤 分享计划
                </button>
                <button class="action-btn restart" onclick="planner.restartPlanner()">
                    🔄 重新制定
                </button>
            </div>
        `;
    }

    calculateTrainingParams(data) {
        let sessionsPerWeek, avgDuration, targetBPM, intensity;
        
        // 根据运动经验确定基础参数
        switch (data.runningExperience) {
            case 'beginner':
                sessionsPerWeek = 3;
                avgDuration = '20-30分钟';
                targetBPM = 160;
                intensity = 'low';
                break;
            case 'intermediate':
                sessionsPerWeek = 4;
                avgDuration = '30-45分钟';
                targetBPM = 170;
                intensity = 'medium';
                break;
            case 'advanced':
                sessionsPerWeek = 5;
                avgDuration = '45-60分钟';
                targetBPM = 180;
                intensity = 'high';
                break;
        }
        
        // 根据可用时间调整
        if (data.availableTime === '2-3') {
            sessionsPerWeek = Math.min(sessionsPerWeek, 3);
        } else if (data.availableTime === '7+') {
            sessionsPerWeek = Math.min(sessionsPerWeek + 1, 6);
        }
        
        // 根据强度偏好调整
        if (data.intensityPreference <= 2) {
            targetBPM -= 10;
            avgDuration = avgDuration.replace(/\d+/g, (match) => Math.max(parseInt(match) - 5, 15));
        } else if (data.intensityPreference >= 4) {
            targetBPM += 10;
            avgDuration = avgDuration.replace(/\d+/g, (match) => parseInt(match) + 5);
        }
        
        // 健康状况调整
        if (data.healthConditions.joint || data.healthConditions.heart) {
            targetBPM = Math.min(targetBPM, 160);
            sessionsPerWeek = Math.min(sessionsPerWeek, 3);
        }
        
        return { sessionsPerWeek, avgDuration, targetBPM, intensity };
    }

    generateWeeklySchedule(params) {
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const schedule = this.createWeeklySchedule(params.sessionsPerWeek);
        
        let scheduleHTML = `
            <div class="weekly-schedule">
                <h4>第1周训练安排</h4>
                <div class="week-grid">
        `;
        
        days.forEach((day, index) => {
            const daySchedule = schedule[index];
            scheduleHTML += `
                <div class="day-card ${daySchedule.type}">
                    <div class="day-name">${day}</div>
                    <div class="day-activity">${daySchedule.activity}</div>
                    ${daySchedule.duration ? `<div class="training-duration">${daySchedule.duration}</div>` : ''}
                </div>
            `;
        });
        
        scheduleHTML += `
                </div>
                <p class="schedule-note">💡 后续周次将根据您的进度逐步调整强度和时长</p>
            </div>
        `;
        
        return scheduleHTML;
    }

    createWeeklySchedule(sessionsPerWeek) {
        const schedule = Array(7).fill({ type: 'rest', activity: '休息' });
        const trainingDays = [];
        
        // 根据偏好时间和训练次数安排
        const preferredTimes = this.formData.preferredTimes;
        
        if (sessionsPerWeek >= 3) {
            trainingDays.push(1, 3, 5); // 周二、周四、周六
        }
        if (sessionsPerWeek >= 4) {
            trainingDays.push(0); // 周一
        }
        if (sessionsPerWeek >= 5) {
            trainingDays.push(6); // 周日
        }
        if (sessionsPerWeek >= 6) {
            trainingDays.push(2); // 周三
        }
        
        trainingDays.slice(0, sessionsPerWeek).forEach((dayIndex, i) => {
            const isLongRun = i === trainingDays.length - 1 && sessionsPerWeek >= 4;
            schedule[dayIndex] = {
                type: 'training',
                activity: isLongRun ? '长距离慢跑' : '超慢跑训练',
                duration: isLongRun ? '45-60分钟' : '25-35分钟'
            };
        });
        
        return schedule;
    }

    generateGuidelines(data, params) {
        const guidelines = [
            `<li><strong>节拍控制：</strong>使用节拍器保持${params.targetBPM}BPM的节奏</li>`,
            `<li><strong>呼吸方法：</strong>保持自然呼吸，不要刻意控制呼吸频率</li>`,
            `<li><strong>姿势要点：</strong>上身挺直，步幅较小，脚步轻盈</li>`,
            `<li><strong>强度控制：</strong>能够轻松对话的强度，心率控制在最大心率的60-70%</li>`
        ];
        
        if (data.healthConditions.joint) {
            guidelines.push(`<li><strong>关节保护：</strong>选择软质跑道，穿着缓震跑鞋，如有不适立即停止</li>`);
        }
        
        if (data.goal === 'weight-loss') {
            guidelines.push(`<li><strong>减重建议：</strong>训练后30分钟内避免大量进食，保持训练一致性</li>`);
        }
        
        return `<ul>${guidelines.join('')}</ul>`;
    }

    generateNutritionTips(data) {
        const tips = [
            `<li><strong>训练前：</strong>训练前1-2小时可适量进食，避免空腹或过饱运动</li>`,
            `<li><strong>水分补充：</strong>训练前后及时补水，训练中可少量多次饮水</li>`,
            `<li><strong>训练后：</strong>训练后30分钟内补充蛋白质和碳水化合物</li>`
        ];
        
        if (data.goal === 'weight-loss') {
            tips.push(`<li><strong>减重饮食：</strong>控制总热量摄入，增加蛋白质比例，减少精制糖摄入</li>`);
        }
        
        if (data.age >= 50) {
            tips.push(`<li><strong>营养补充：</strong>注意钙质和维生素D的补充，保护骨骼健康</li>`);
        }
        
        return `<ul>${tips.join('')}</ul>`;
    }

    getBMICategory(bmi) {
        if (bmi < 18.5) return '(偏瘦)';
        if (bmi < 24) return '(正常)';
        if (bmi < 28) return '(超重)';
        return '(肥胖)';
    }

    getGoalDescription(goal) {
        const descriptions = {
            'weight-loss': '减重塑形，提高代谢',
            'health': '增强体质，预防疾病',
            'endurance': '提升心肺功能和耐力',
            'stress-relief': '缓解压力，改善心情'
        };
        return descriptions[goal] || '全面健康提升';
    }

    bindPlanActions() {
        // 分享功能
        window.planner = this;
    }

    sharePlan() {
        if (navigator.share) {
            navigator.share({
                title: '我的超慢跑训练计划',
                text: '我刚刚制定了专属的超慢跑训练计划，一起来健康运动吧！',
                url: window.location.href
            });
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('计划链接已复制到剪贴板！');
            });
        }
    }

    restartPlanner() {
        if (confirm('确定要重新制定训练计划吗？当前进度将会丢失。')) {
            this.currentStep = 1;
            this.formData = {};
            
            // 重置表单
            document.querySelectorAll('input, select').forEach(element => {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = false;
                } else {
                    element.value = '';
                }
            });
            
            // 重置目标卡片
            this.formElements.goalCards.forEach(card => {
                card.classList.remove('selected');
            });
            
            // 重置健康状况默认选项
            this.formElements.healthConditions.normal.checked = true;
            
            this.updateStepDisplay();
            this.clearErrors();
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const planner = new TrainingPlanner();
    
    // 全局暴露实例
    window.planner = planner;
});

// 添加打印样式
const printStyles = document.createElement('style');
printStyles.textContent = `
    @media print {
        .navbar, .form-navigation, .steps-indicator {
            display: none !important;
        }
        
        .form-container {
            box-shadow: none;
            border: none;
        }
        
        .generated-plan {
            padding: 0;
        }
        
        .plan-actions {
            display: none;
        }
        
        body {
            background: white !important;
        }
        
        .planner-main {
            background: white !important;
            padding-top: 0;
        }
    }
`;
document.head.appendChild(printStyles);
