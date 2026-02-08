/* ============================================
   主应用程序 - 初始化和事件管理
   ============================================ */

const App = {
  // 初始化应用
  init: async () => {
    console.log('初始化PluginMarket...');

    // 初始化各个模块
    Theme.init();
    Router.init();
    Modal.init();

    // 设置事件监听
    App.setupEventListeners();

    // 订阅状态变化
    Router.subscribe(App.handleStateChange);

    // 加载初始数据
    await App.loadPlugins();

    // 加载统计信息
    await App.loadStats();

    console.log('PluginMarket初始化完成');
  },

  // 设置事件监听
  setupEventListeners: () => {
    // 平台切换
    const platformBtns = document.querySelectorAll('.platform-btn');
    platformBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const platform = e.currentTarget.dataset.platform;
        Router.setState({ platform, page: 0, category: 'all' });
      });
    });

    // 搜索
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      const debouncedSearch = Utils.debounce((e) => {
        const query = e.target.value.trim();
        Router.setState({ search: query, page: 0 });
      }, CONFIG.SEARCH_DEBOUNCE);

      searchInput.addEventListener('input', debouncedSearch);

      // 快捷键支持 (/)
      document.addEventListener('keydown', (e) => {
        if ((e.key === '/' || e.key === '？') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }

    // 分类筛选
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        Router.setState({ category, page: 0 });
      });
    });

    // 排序
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const sort = e.target.value;
        Router.setState({ sort, page: 0 });
      });
    }

    // 视图切换
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const viewMode = e.currentTarget.dataset.view;
        Router.setState({ viewMode });
        
        // 更新按钮活跃状态
        viewBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // 更新网格视图
        const grid = document.querySelector('.plugin-grid');
        if (grid) {
          grid.classList.toggle('list-view', viewMode === 'list');
        }
      });
    });

    // 加载更多按钮
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', Cards.loadMore);
    }

    // 主题切换
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', Theme.toggle);
    }

    // 汉堡菜单
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', App.toggleMobileMenu);
    }

    // 滚动进度条
    window.addEventListener('scroll', App.updateScrollProgress);
  },

  // 处理状态变化
  handleStateChange: async (changed, state) => {
    console.log('状态已变化:', changed);

    // 更新UI
    App.updateUI(changed, state);

    // 重新加载插件
    if (changed.platform || changed.category || changed.sort || changed.search) {
      await App.loadPlugins();
    }
  },

  // 更新UI
  updateUI: (changed, state) => {
    // 更新平台按钮
    if (changed.platform) {
      document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.platform === state.platform) {
          btn.classList.add('active');
        }
      });
    }

    // 更新分类按钮
    if (changed.category) {
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === state.category) {
          btn.classList.add('active');
        }
      });
    }

    // 更新排序并选择
    if (changed.sort) {
      const sortSelect = document.querySelector('.sort-select');
      if (sortSelect) {
        sortSelect.value = state.sort;
      }
    }

    // 更新搜索输入
    if (changed.search !== undefined) {
      const searchInput = document.querySelector('.search-input');
      if (searchInput && searchInput.value !== state.search) {
        searchInput.value = state.search;
      }
    }
  },

  // 加载插件列表
  loadPlugins: async () => {
    const state = Router.getState();
    
    // 显示加载骨架
    const grid = document.querySelector('.plugin-grid');
    if (grid) {
      grid.innerHTML = Cards.createSkeletonLoaders();
    }

    try {
      const plugins = await App.fetchPlugins(state.page);

      if (grid) {
        const html = Cards.renderCards(plugins);
        grid.innerHTML = html;
        Cards.bindCardEvents();
      }

      // 隐藏或显示加载更多按钮
      const loadMoreBtn = document.querySelector('.load-more-btn');
      if (loadMoreBtn) {
        if (plugins.length < CONFIG.ITEMS_PER_PAGE) {
          loadMoreBtn.style.display = 'none';
        } else {
          loadMoreBtn.style.display = 'block';
        }
      }

      // 更新结果计数
      App.updateResultCount(plugins.length);

      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('加载插件失败:', error);
      if (grid) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 class="empty-state-title">加载失败</h3>
            <p class="empty-state-description">无法连接到插件源，请检查网络连接</p>
            <button class="btn btn-primary mt-4" onclick="App.loadPlugins()">
              <i class="fa-solid fa-arrow-rotate-right"></i>
              重试
            </button>
          </div>
        `;
      }
    }
  },

  // 获取插件数据
  fetchPlugins: async (page = 0) => {
    const state = Router.getState();
    let plugins = [];

    try {
      if (state.platform === CONFIG.PLATFORMS.ALL) {
        const result = await API.searchAll(state.search || '*', page, state.sort);
        plugins = [...(result.modrinth || []), ...(result.spigot || []), ...(result.hangar || [])];
      } else if (state.platform === CONFIG.PLATFORMS.MODRINTH) {
        const result = await API.searchModrinth(
          state.search || '*',
          page,
          CONFIG.SORT_OPTIONS[state.sort]?.modrinth || 'downloads',
          state.loader
        );
        plugins = result.projects || [];
      } else if (state.platform === CONFIG.PLATFORMS.SPIGOT) {
        const result = await API.searchSpigot(
          state.search || '',
          page + 1,
          CONFIG.SORT_OPTIONS[state.sort]?.spigot || '-downloads'
        );
        plugins = result.projects || [];
      } else if (state.platform === CONFIG.PLATFORMS.HANGAR) {
        const result = await API.searchHangar(
          state.search || '',
          page,
          CONFIG.SORT_OPTIONS[state.sort]?.hangar || '-downloads'
        );
        plugins = result.projects || [];
      }

      // 按类别筛选（如果需要）
      if (state.category && state.category !== 'all') {
        // 这里可以添加客户端过滤逻辑
      }

      return plugins;
    } catch (error) {
      console.error('获取插件失败:', error);
      throw error;
    }
  },

  // 加载统计信息
  loadStats: async () => {
    try {
      const state = Router.getState();
      const stats = await API.getStats(state.platform);

      if (stats.modrinth && stats.spigot && stats.hangar) {
        // ALL平台
        const totalPlugins = (stats.modrinth.plugins || 0) + (stats.spigot.plugins || 0) + (stats.hangar.plugins || 0);
        App.updateStats('all', {
          plugins: totalPlugins,
          downloads: 0
        });
      } else {
        // 单一平台
        App.updateStats(state.platform, stats);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  },

  // 更新统计显示
  updateStats: (platform, stats) => {
    const pluginsCount = document.querySelector('[data-stat-key="plugins"]');
    const downloadsCount = document.querySelector('[data-stat-key="downloads"]');

    if (pluginsCount) {
      pluginsCount.textContent = Utils.formatNumber(stats.plugins || 0);
      if (pluginsCount.parentElement) {
        pluginsCount.parentElement.classList.add('scale-in');
      }
    }

    if (downloadsCount) {
      downloadsCount.textContent = Utils.formatNumber(stats.downloads || 0);
      if (downloadsCount.parentElement) {
        downloadsCount.parentElement.classList.add('scale-in');
      }
    }
  },

  // 更新结果计数
  updateResultCount: (count) => {
    const countEl = document.querySelector('.result-count');
    if (countEl) {
      countEl.textContent = `显示 ${count} 个插件`;
    }
  },

  // 切换移动菜单
  toggleMobileMenu: () => {
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
      menu.classList.toggle('active');
    }
  },

  // 更新滚动进度
  updateScrollProgress: () => {
    const progress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
      indicator.style.width = progress + '%';
    }
  }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// 处理离线状态
window.addEventListener('offline', () => {
  const grid = document.querySelector('.plugin-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <i class="fa-solid fa-wifi-slash"></i>
        </div>
        <h3 class="empty-state-title">离线状态</h3>
        <p class="empty-state-description">请检查您的网络连接</p>
      </div>
    `;
  }
});

window.addEventListener('online', () => {
  App.loadPlugins();
});
