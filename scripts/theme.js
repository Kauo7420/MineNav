/* ============================================
   主题管理 - 深色/浅色模式切换
   ============================================ */

const Theme = {
  // 初始化主题
  init: () => {
    const root = document.documentElement;
    const saved = Storage.get(CONFIG.STORAGE_KEYS.THEME);
    
    let theme = saved;
    
    // 如果没有保存的主题，检查系统偏好
    if (!theme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? CONFIG.THEMES.DARK : CONFIG.THEMES.LIGHT;
    }
    
    // 应用主题
    root.setAttribute('data-theme', theme);
    Theme.updateToggleButton();
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!Storage.get(CONFIG.STORAGE_KEYS.THEME)) {
        const newTheme = e.matches ? CONFIG.THEMES.DARK : CONFIG.THEMES.LIGHT;
        Theme.set(newTheme, false);
      }
    });
  },

  // 设置主题
  set: (theme, persist = true) => {
    const root = document.documentElement;
    
    // 添加过渡动画
    root.style.transition = 'background-color 0s, color 0s';
    
    // 应用主题
    root.setAttribute('data-theme', theme);
    
    // 持久化设置
    if (persist) {
      Storage.set(CONFIG.STORAGE_KEYS.THEME, theme);
    }
    
    // 更新按钮
    Theme.updateToggleButton();
    
    // 延迟恢复过渡
    setTimeout(() => {
      root.style.transition = '';
    }, 10);
  },

  // 切换主题
  toggle: () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    const newTheme = current === CONFIG.THEMES.DARK ? CONFIG.THEMES.LIGHT : CONFIG.THEMES.DARK;
    
    Theme.set(newTheme);
    
    // 添加切换动画
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.classList.add('theme-switch');
      setTimeout(() => btn.classList.remove('theme-switch'), 400);
    }
  },

  // 获取当前主题
  getCurrent: () => {
    return document.documentElement.getAttribute('data-theme');
  },

  // 更新切换按钮图标
  updateToggleButton: () => {
    const btn = document.querySelector('.theme-toggle i');
    if (!btn) return;
    
    const current = Theme.getCurrent();
    if (current === CONFIG.THEMES.DARK) {
      btn.className = 'fa-solid fa-sun';
      btn.title = '切换到浅色模式';
    } else {
      btn.className = 'fa-solid fa-moon';
      btn.title = '切换到深色模式';
    }
  },

  // 获取CSS变量值
  getVariable: (varName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  },

  // 设置CSS变量值
  setVariable: (varName, value) => {
    document.documentElement.style.setProperty(varName, value);
  }
};
