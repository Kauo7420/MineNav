// 打字机动画模块
class TypingAnimation {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        if (!this.element) return;

        // 配置项
        this.phrases = options.phrases || ['发现最好的', '探索顶尖的', '寻找优质的'];
        this.typingSpeed = options.typingSpeed || 100; // 打字速度 (ms)
        this.deletingSpeed = options.deletingSpeed || 50; // 删除速度 (ms)
        this.pauseDuration = options.pauseDuration || 2000; // 暂停时长 (ms)
        this.loop = options.loop !== false; // 是否循环

        // 状态
        this.currentPhraseIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;

        // 启动
        this.start();
    }

    start() {
        this.element.innerHTML = '<span class="typing-text"></span><span class="typing-cursor">|</span>';
        this.textElement = this.element.querySelector('.typing-text');
        this.animate();
    }

    animate() {
        const currentPhrase = this.phrases[this.currentPhraseIndex];
        
        if (this.isPaused) {
            setTimeout(() => {
                this.isPaused = false;
                this.isDeleting = true;
                this.animate();
            }, this.pauseDuration);
            return;
        }

        // 打字过程
        if (!this.isDeleting && this.currentCharIndex < currentPhrase.length) {
            this.textElement.textContent = currentPhrase.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
            setTimeout(() => this.animate(), this.typingSpeed);
        }
        // 完成一个短语,暂停
        else if (!this.isDeleting && this.currentCharIndex === currentPhrase.length) {
            this.isPaused = true;
            this.animate();
        }
        // 删除过程
        else if (this.isDeleting && this.currentCharIndex > 0) {
            this.textElement.textContent = currentPhrase.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
            setTimeout(() => this.animate(), this.deletingSpeed);
        }
        // 删除完成,切换到下一个短语
        else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
            
            // 如果不循环且已完成所有短语
            if (!this.loop && this.currentPhraseIndex === 0) {
                this.textElement.textContent = this.phrases[0];
                return;
            }
            
            setTimeout(() => this.animate(), 500);
        }
    }

    destroy() {
        if (this.element) {
            this.element.innerHTML = this.phrases[0];
        }
    }
}

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new TypingAnimation('hero-typing-text', {
        phrases: [
            '发现最好的',
            '探索顶尖的',
            '寻找优质的',
            '体验精选的'
        ],
        typingSpeed: 120,
        deletingSpeed: 60,
        pauseDuration: 2000,
        loop: true
    });
});