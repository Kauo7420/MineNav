/* ============================================
   路由和状态管理
   ============================================ */

const Router = {
  state: {
    platform: CONFIG.PLATFORMS.ALL,
    category: 'all',
    sort: 'downloads',
    search: '',
    page: 0,
    viewMode: 'grid',
    loader: null
  },

  // 初始化
  init: () => {
    Router.loadFromStorage();
    Router.loadFromURL();
    Router.setupListeners();
  },

  // 从存储加载状态
  loadFromStorage: () => {
    const saved = Storage.get(CONFIG.STORAGE_KEYS.PLATFORM);
    if (saved) Router.state.platform = saved;

    const category = Storage.get(CONFIG.STORAGE_KEYS.CATEGORY);
    if (category) Router.state.category = category;

    const sort = Storage.get(CONFIG.STORAGE_KEYS.SORT);
    if (sort) Router.state.sort = sort;

    const viewMode = Storage.get(CONFIG.STORAGE_KEYS.VIEW_MODE);
    if (viewMode) Router.state.viewMode = viewMode;
  },

  // 从URL加载状态
  loadFromURL: () => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('platform')) Router.state.platform = params.get('platform');
    if (params.has('category')) Router.state.category = params.get('category');
    if (params.has('sort')) Router.state.sort = params.get('sort');
    if (params.has('q')) Router.state.search = params.get('q');
    if (params.has('page')) Router.state.page = parseInt(params.get('page')) || 0;
  },

  // 设置状态
  setState: (updates) => {
    const changed = {};
    
    for (const key in updates) {
      if (Router.state[key] !== updates[key]) {
        changed[key] = updates[key];
        Router.state[key] = updates[key];
      }
    }

    if (Object.keys(changed).length > 0) {
      Router.updateURL();
      Router.saveToStorage(changed);
      Router.notifyObservers(changed);
    }

    return changed;
  },

  // 获取状态
  getState: () => {
    return { ...Router.state };
  },

  // 更新URL
  updateURL: () => {
    const params = new URLSearchParams();
    
    if (Router.state.platform !== CONFIG.PLATFORMS.ALL) {
      params.set('platform', Router.state.platform);
    }
    if (Router.state.category !== 'all') {
      params.set('category', Router.state.category);
    }
    if (Router.state.sort !== 'downloads') {
      params.set('sort', Router.state.sort);
    }
    if (Router.state.search) {
      params.set('q', Router.state.search);
    }
    if (Router.state.page > 0) {
      params.set('page', Router.state.page);
    }

    const url = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', url);
  },

  // 保存到存储
  saveToStorage: (changed) => {
    if ('platform' in changed) Storage.set(CONFIG.STORAGE_KEYS.PLATFORM, changed.platform);
    if ('category' in changed) Storage.set(CONFIG.STORAGE_KEYS.CATEGORY, changed.category);
    if ('sort' in changed) Storage.set(CONFIG.STORAGE_KEYS.SORT, changed.sort);
    if ('viewMode' in changed) Storage.set(CONFIG.STORAGE_KEYS.VIEW_MODE, changed.viewMode);
  },

  // 观察者
  observers: [],

  // 订阅状态变化
  subscribe: (callback) => {
    Router.observers.push(callback);
  },

  // 通知观察者
  notifyObservers: (changed) => {
    Router.observers.forEach(callback => {
      try {
        callback(changed, Router.state);
      } catch (error) {
        console.error('观察者回调出错:', error);
      }
    });
  },

  // 设置监听器
  setupListeners: () => {
    window.addEventListener('popstate', () => {
      Router.loadFromURL();
      Router.notifyObservers(Router.state);
    });
  },

  // 重置状态
  reset: () => {
    Router.setState({
      platform: CONFIG.PLATFORMS.ALL,
      category: 'all',
      sort: 'downloads',
      search: '',
      page: 0,
      viewMode: 'grid',
      loader: null
    });
  }
};
