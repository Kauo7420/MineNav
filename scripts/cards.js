/* ============================================
   卡片渲染 - 插件卡片和渲染逻辑
   ============================================ */

const Cards = {
  // 渲染插件卡片
  renderPluginCard: (plugin) => {
    // 平台配置查找表
    const platformConfig = {
      modrinth: {
        class: 'modrinth',
        name: 'Modrinth',
        icon: 'fa-leaf',
        color: CONFIG.APIS.MODRINTH.COLOR,
        colorRgb: '27, 217, 106'
      },
      spigot: {
        class: 'spigot',
        name: 'SpigotMC',
        icon: 'fa-cube',
        color: CONFIG.APIS.SPIGOT.COLOR,
        colorRgb: '246, 168, 33'
      },
      hangar: {
        class: 'hangar',
        name: 'Hangar',
        icon: 'fa-paper-plane',
        color: CONFIG.APIS.HANGAR.COLOR,
        colorRgb: '30, 136, 229'
      }
    };

    const platform = platformConfig[plugin.platform] || platformConfig.modrinth;
    const icon = plugin.icon || null;
    const downloads = Utils.formatNumber(plugin.downloads || 0);
    const updated = Utils.formatDate(plugin.updated);
    const description = Utils.truncate(plugin.description, 100);

    const categories = plugin.loaders?.length > 0 
      ? plugin.loaders.slice(0, 2).map(l => `<span class="badge badge-primary"><i class="fa-solid fa-cube"></i> ${l}</span>`).join('')
      : `<span class="badge badge-secondary">${plugin.category}</span>`;

    return `
      <div class="plugin-card hover-glow ${platform.class}" data-plugin-id="${plugin.id}" data-platform="${plugin.platform}" data-plugin='${JSON.stringify(plugin)}'>
        <div class="plugin-card-header">
          <div class="plugin-card-icon">
            ${icon ? `<img src="${icon}" alt="${plugin.name}" onerror="this.parentElement.innerHTML='<i class=\"fa-solid fa-puzzle-piece\"></i>'">` : '<i class="fa-solid fa-puzzle-piece"></i>'}
          </div>
          <div class="plugin-card-info">
            <h3 class="plugin-card-title" title="${plugin.name}">${Utils.truncate(plugin.name, 25)}</h3>
            <p class="plugin-card-author">
              <i class="fa-solid fa-user"></i>
              ${Utils.truncate(plugin.author, 15)}
            </p>
          </div>
        </div>

        <div class="plugin-card-body">
          <p class="plugin-card-description">${description || '暂无描述'}</p>
          <div class="plugin-card-meta">
            ${categories}
            <span class="badge badge-secondary" style="background-color: rgba(${platform.colorRgb}, 0.1); color: ${platform.color}">
              <i class="fa-solid ${platform.icon}"></i>
              ${platform.name}
            </span>
          </div>
        </div>

        <div class="plugin-card-footer">
          <div class="plugin-card-stat">
            <i class="fa-solid fa-download"></i>
            <span>${downloads}</span>
          </div>
          <div class="plugin-card-stat">
            <i class="fa-regular fa-clock"></i>
            <span>${updated}</span>
          </div>
        </div>
      </div>
    `;
  },

  // 渲染卡片列表
  renderCards: (plugins) => {
    if (!plugins || plugins.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fa-solid fa-inbox"></i>
          </div>
          <h3 class="empty-state-title">未找到插件</h3>
          <p class="empty-state-description">尝试调整搜索条件或筛选器</p>
        </div>
      `;
    }

    return plugins.map(plugin => Cards.renderPluginCard(plugin)).join('');
  },

  // 创建骨架加载器
  createSkeletonLoaders: (count = 12) => {
    const skeletons = Array(count).fill(0).map(() => `
      <div class="plugin-card">
        <div class="plugin-card-header">
          <div class="plugin-card-icon skeleton" style="width: 56px; height: 56px;"></div>
          <div class="plugin-card-info" style="flex: 1;">
            <div class="skeleton" style="height: 16px; margin-bottom: 8px; width: 70%;"></div>
            <div class="skeleton" style="height: 12px; width: 50%;"></div>
          </div>
        </div>
        <div class="plugin-card-body">
          <div class="skeleton" style="height: 12px; margin-bottom: 6px;"></div>
          <div class="skeleton" style="height: 12px; margin-bottom: 6px; width: 80%;"></div>
          <div class="skeleton" style="height: 24px; margin-top: 12px;"></div>
        </div>
        <div class="plugin-card-footer">
          <div class="skeleton" style="height: 12px; width: 30%;"></div>
        </div>
      </div>
    `).join('');

    return skeletons;
  },

  // 绑定卡片点击事件
  bindCardEvents: () => {
    const cards = document.querySelectorAll('.plugin-card:not(.skeleton)');
    cards.forEach(card => {
      card.removeEventListener('click', Cards.handleCardClick);
      card.addEventListener('click', Cards.handleCardClick);
    });
  },

  // 处理卡片点击
  handleCardClick: (e) => {
    const card = e.currentTarget;
    const plugin = JSON.parse(card.getAttribute('data-plugin'));
    Modal.open(plugin);
  },

  // 加载更多插件
  loadMore: async () => {
    const state = Router.getState();
    const nextPage = state.page + 1;

    // 显示加载状态
    const btn = document.querySelector('.load-more-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner"></span> 加载中...';
    }

    try {
      const plugins = await App.fetchPlugins(nextPage);
      
      if (plugins.length === 0) {
        if (btn) {
          btn.innerHTML = '已加载全部';
          btn.disabled = true;
        }
        return;
      }

      // 更新页码
      Router.setState({ page: nextPage });

      // 追加插件卡片
      const grid = document.querySelector('.plugin-grid');
      if (grid) {
        const html = Cards.renderCards(plugins);
        grid.insertAdjacentHTML('beforeend', html);
        Cards.bindCardEvents();
      }

      // 恢复按钮
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> 加载更多';
      }
    } catch (error) {
      console.error('加载更多插件失败:', error);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '加载失败，点击重试';
      }
    }
  }
};
