// ============================================
// 打字机动画模块
// ============================================

class TypingAnimation {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        if (!this.element) return;

        // 配置项
        this.phrases = options.phrases || [I18nService.t('hero.prefix')];
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

    updatePhrases(phrases) {
        if (!Array.isArray(phrases) || phrases.length === 0) return;
        this.phrases = phrases;
        this.currentPhraseIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.start();
    }
}

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const typingAnimation = new TypingAnimation('hero-typing-text', {
        phrases: I18N_PACKS[I18nService.locale]?.['hero.typingPhrases'] || [I18nService.t('hero.prefix')],
        typingSpeed: 120,
        deletingSpeed: 60,
        pauseDuration: 2000,
        loop: true
    });

    window.addEventListener('i18n:change', (event) => {
        const locale = event.detail?.locale || I18nService.locale;
        const phrases = I18N_PACKS[locale]?.['hero.typingPhrases'] || [I18nService.t('hero.prefix')];
        typingAnimation.updatePhrases(phrases);
    });
});
