/* ============================================
   配置文件 - API端点、常量、映射
   ============================================ */

const CONFIG = {
  // API 端点
  APIS: {
    MODRINTH: {
      BASE_URL: 'https://api.modrinth.com/v2',
      SEARCH: '/search',
      PROJECT: '/project',
      CATEGORIES: '/tag/category',
      LOADERS: '/tag/loader',
      NAME: 'Modrinth',
      ICON: 'fa-leaf',
      COLOR: '#1bd96a',
      ACCENT: 'modrinth'
    },
    SPIGOT: {
      BASE_URL: 'https://api.spiget.org/v2',
      RESOURCES: '/resources',
      SEARCH: '/search/resources',
      RESOURCE: '/resources',
      CATEGORIES: '/categories',
      NAME: 'SpigotMC',
      ICON: 'fa-cube',
      COLOR: '#f6a821',
      ACCENT: 'spigot'
    },
    HANGAR: {
      BASE_URL: 'https://hangar.papermc.io/api/v1',
      PROJECTS: '/projects',
      NAME: 'Hangar',
      ICON: 'fa-paper-plane',
      COLOR: '#1e88e5',
      ACCENT: 'hangar'
    }
  },

  // 分类映射
  CATEGORIES: {
    all: {
      name: '全部',
      icon: 'fa-border-all',
      modrinth: 'All',
      spigot: 'all',
      hangar: 'all'
    },
    admin: {
      name: '管理工具',
      icon: 'fa-shield-halved',
      modrinth: 'Admin',
      spigot: 'admin',
      hangar: 'admin_tools'
    },
    gameplay: {
      name: '游戏内容',
      icon: 'fa-bolt',
      modrinth: 'Gameplay',
      spigot: 'gameplay',
      hangar: 'gameplay'
    },
    world: {
      name: '世界管理',
      icon: 'fa-globe',
      modrinth: 'World',
      spigot: 'world',
      hangar: 'world_management'
    },
    economy: {
      name: '经济系统',
      icon: 'fa-coins',
      modrinth: 'Economy',
      spigot: 'economy',
      hangar: 'economy'
    },
    chat: {
      name: '聊天系统',
      icon: 'fa-comments',
      modrinth: 'Chat',
      spigot: 'chat',
      hangar: 'chat'
    },
    utility: {
      name: '实用工具',
      icon: 'fa-wrench',
      modrinth: 'Utility',
      spigot: 'utils',
      hangar: 'admin_tools'
    },
    dev: {
      name: '开发工具',
      icon: 'fa-code',
      modrinth: 'Development',
      spigot: 'dev',
      hangar: 'dev_tools'
    },
    misc: {
      name: '杂项',
      icon: 'fa-ellipsis',
      modrinth: 'Miscellaneous',
      spigot: 'misc',
      hangar: 'misc'
    }
  },

  // 排序选项
  SORT_OPTIONS: {
    downloads: {
      name: '下载量',
      modrinth: 'downloads',
      spigot: '-downloads',
      hangar: '-downloads'
    },
    newest: {
      name: '最新发布',
      modrinth: 'newest',
      spigot: '-newest',
      hangar: '-newest'
    },
    updated: {
      name: '最近更新',
      modrinth: 'updated',
      spigot: '-updated',
      hangar: '-updated'
    },
    follows: {
      name: '关注数',
      modrinth: 'follows',
      spigot: '-rating',
      hangar: '-stars'
    }
  },

  // 每页显示数量
  ITEMS_PER_PAGE: 12,

  // 搜索防抖延迟
  SEARCH_DEBOUNCE: 300,

  // 请求超时
  FETCH_TIMEOUT: 10000,

  // 缓存持续时间（毫秒）
  CACHE_DURATION: 300000, // 5分钟

  // 平台类型
  PLATFORMS: {
    ALL: 'all',
    MODRINTH: 'modrinth',
    SPIGOT: 'spigot',
    HANGAR: 'hangar'
  },

  // 加载器（针对Modrinth）
  LOADERS: {
    bukkit: { name: 'Bukkit', modrinth: 'bukkit' },
    paper: { name: 'Paper', modrinth: 'paper' },
    spigot: { name: 'Spigot', modrinth: 'spigot' },
    folia: { name: 'Folia', modrinth: 'folia' },
    fabric: { name: 'Fabric', modrinth: 'fabric' },
    forge: { name: 'Forge', modrinth: 'forge' }
  },

  // 本地存储键
  STORAGE_KEYS: {
    THEME: 'mineNav_theme',
    PLATFORM: 'mineNav_platform',
    CATEGORY: 'mineNav_category',
    SORT: 'mineNav_sort',
    VIEW_MODE: 'mineNav_viewMode'
  },

  // 主题选项
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark'
  }
};

// 本地存储辅助函数
const Storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage设置失败:', e);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('localStorage读取失败:', e);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage删除失败:', e);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage清空失败:', e);
    }
  }
};

// 缓存管理
const Cache = {
  data: {},

  set: (key, value) => {
    Cache.data[key] = {
      value,
      timestamp: Date.now()
    };
  },

  get: (key) => {
    const cached = Cache.data[key];
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CONFIG.CACHE_DURATION;
    if (isExpired) {
      delete Cache.data[key];
      return null;
    }

    return cached.value;
  },

  clear: () => {
    Cache.data = {};
  }
};

// 工具函数
const Utils = {
  // 格式化数字
  formatNumber: (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // 格式化日期
  formatDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  },

  // 截断文本
  truncate: (text, length = 50) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  },

  // 防抖
  debounce: (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // 节流
  throttle: (func, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // 获取图标类
  getIconClass: (iconName) => {
    return `fa-solid ${iconName}`;
  },

  // 创建加载骨架
  createSkeleton: (count = 12) => {
    return Array(count).fill(0).map((_, i) => `
      <div class="plugin-card skeleton" style="height: 300px;"></div>
    `).join('');
  }
};
