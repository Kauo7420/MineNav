/* ============================================
   模态框 - 插件详情弹窗
   ============================================ */

const Modal = {
  currentPlugin: null,

  // 初始化模态框
  init: () => {
    const backdrop = document.querySelector('.modal-backdrop');
    const closeBtn = document.querySelector('.modal-close');

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) Modal.close();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', Modal.close);
    }

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') Modal.close();
    });
  },

  // 打开模态框
  open: async (plugin) => {
    Modal.currentPlugin = plugin;

    try {
      // 获取详细信息
      let details = plugin;
      
      if (plugin.platform === 'modrinth' && !plugin.body) {
        details = await API.getModrinthProject(plugin.id);
      } else if (plugin.platform === 'spigot' && !plugin.description) {
        details = await API.getSpigotResource(plugin.id);
      } else if (plugin.platform === 'hangar') {
        details = await API.getHangarProject(plugin.slug);
      }

      Modal.render(details);
      Modal.show();
    } catch (error) {
      console.error('打开模态框失败:', error);
      Modal.renderError();
      Modal.show();
    }
  },

  // 渲染模态框内容
  render: (plugin) => {
    const content = document.querySelector('.modal-content');
    if (!content) return;

    // 平台配置查找表
    const platformConfig = {
      modrinth: {
        class: 'modrinth',
        name: 'Modrinth',
        icon: 'fa-leaf',
        color: CONFIG.APIS.MODRINTH.COLOR
      },
      spigot: {
        class: 'spigot',
        name: 'SpigotMC',
        icon: 'fa-cube',
        color: CONFIG.APIS.SPIGOT.COLOR
      },
      hangar: {
        class: 'hangar',
        name: 'Hangar',
        icon: 'fa-paper-plane',
        color: CONFIG.APIS.HANGAR.COLOR
      }
    };

    const platform = platformConfig[plugin.platform] || platformConfig.modrinth;
    const icon = plugin.icon || '<i class="fa-solid fa-puzzle-piece"></i>';
    const downloads = Utils.formatNumber(plugin.downloads || 0);
    const follows = Utils.formatNumber(plugin.follows || 0);
    const updated = Utils.formatDate(plugin.updated);

    // 处理加载器
    const loadersHTML = plugin.loaders && plugin.loaders.length > 0
      ? plugin.loaders.map(l => `<span class="badge badge-primary"><i class="fa-solid fa-cube"></i> ${l}</span>`).join('')
      : `<span class="badge badge-secondary">${plugin.category}</span>`;

    const html = `
      <div class="modal-header">
        <div class="modal-icon-wrapper">
          ${typeof icon === 'string' && icon.includes('img')
            ? icon
            : `<div class="modal-icon ${platform.class}">${icon}</div>`}
        </div>
        <div class="modal-header-info">
          <h2 class="modal-title">${plugin.name}</h2>
          <p class="modal-author">
            <i class="fa-solid fa-user"></i>
            ${plugin.author}
          </p>
          <p class="modal-platform">
            <i class="fa-solid ${platform.icon}"></i>
            ${platform.name}
          </p>
        </div>
        <button class="modal-close" aria-label="关闭">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="modal-description">
          ${plugin.body || plugin.description || '暂无描述'}
        </div>

        <div class="modal-stats">
          <div class="modal-stat">
            <span class="modal-stat-label">下载</span>
            <span class="modal-stat-value">${downloads}</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-label">关注</span>
            <span class="modal-stat-value">${follows}</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-label">更新</span>
            <span class="modal-stat-value">${updated}</span>
          </div>
        </div>

        <div class="modal-categories">
          <h4 class="modal-section-title">分类和加载器</h4>
          <div class="modal-badges">
            ${loadersHTML}
          </div>
        </div>

        <div class="modal-versions">
          <h4 class="modal-section-title">版本信息</h4>
          <p class="modal-version-info">
            ${plugin.versions?.length || 0} 个版本
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <a href="${plugin.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
          访问官方网站
        </a>
        <button class="btn btn-secondary" onclick="Modal.close()">
          关闭
        </button>
      </div>
    `;

    content.innerHTML = html;

    // 重新绑定关闭按钮
    const closeBtn = content.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', Modal.close);
    }
  },

  // 渲染错误信息
  renderError: () => {
    const content = document.querySelector('.modal-content');
    if (!content) return;

    content.innerHTML = `
      <div class="modal-body">
        <div style="text-align: center; padding: 60px 20px;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 48px; color: var(--color-error); margin-bottom: 16px;"></i>
          <h3 style="margin-bottom: 8px;">加载失败</h3>
          <p style="color: var(--color-text-secondary);">无法加载插件详情，请稍后重试</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="Modal.close()">关闭</button>
      </div>
    `;
  },

  // 显示模态框
  show: () => {
    const modal = document.querySelector('.modal');
    const backdrop = document.querySelector('.modal-backdrop');

    if (!modal || !backdrop) return;

    modal.style.display = 'flex';
    backdrop.style.display = 'block';

    // 禁止背景滚动
    document.body.style.overflow = 'hidden';

    // 添加动画类
    backdrop.classList.remove('closing');
    backdrop.classList.add('showing');
    const content = modal.querySelector('.modal-content');
    if (content) {
      content.classList.remove('closing');
      content.classList.add('showing');
    }
  },

  // 关闭模态框
  close: () => {
    const modal = document.querySelector('.modal');
    const backdrop = document.querySelector('.modal-backdrop');
    const content = modal?.querySelector('.modal-content');

    if (!modal || !backdrop) return;

    // 添加关闭动画
    if (backdrop) backdrop.classList.add('closing');
    if (content) content.classList.add('closing');

    // 延迟隐藏
    setTimeout(() => {
      modal.style.display = 'none';
      backdrop.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }
};
