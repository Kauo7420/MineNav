// 卡片渲染逻辑
function renderCard(item, platform) {
    let title, author, desc, iconUrl, downloads, date, id, link, categories, loaders, tags;

    if (platform === 'modrinth') {
        id = item.project_id || item.slug;
        title = item.title;
        author = item.author;
        desc = item.description;
        iconUrl = item.icon_url;
        downloads = item.downloads;
        date = new Date(item.date_modified).toLocaleDateString('zh-CN');
        link = `https://modrinth.com/plugin/${item.slug}`;
        categories = item.categories || [];
        loaders = Array.isArray(item.loaders) ? item.loaders : []; // SAFE: Ensure array
        tags = [];
    } 
    else if (platform === 'hangar') {
        // Hangar 数据映射
        id = item.namespace?.slug || item.name;
        title = item.name;
        author = item.namespace?.owner || 'Hangar User';
        desc = item.description || '暂无描述';
        iconUrl = item.avatarUrl;
        downloads = item.stats?.downloads || 0;
        date = new Date(item.lastUpdated).toLocaleDateString('zh-CN');
        link = `https://hangar.papermc.io/${item.namespace?.owner}/${item.namespace?.slug}`;
        categories = [item.category].filter(Boolean);
        loaders = [];
        tags = Array.isArray(item.tags) ? item.tags : []; // SAFE: Ensure array exists
    }
    else { // spigot
        id = item.id;
        title = item.name;
        author = 'Loading...'; // 将异步加载
        desc = item.tag;
        iconUrl = item.icon.url ? `https://www.spigotmc.org/${item.icon.url}` : `https://www.spigotmc.org/data/resource_icons/${Math.floor(id/1000)}/${id}.jpg`;
        downloads = item.downloads;
        date = new Date(item.updateDate * 1000).toLocaleDateString('zh-CN');
        link = `https://www.spigotmc.org/resources/${id}`;
        categories = [item.category?.name || 'Plugin'];
        loaders = [];
        tags = [];
    }

    // 图标处理
    const imgHtml = iconUrl 
        ? `<img src="${iconUrl}" class="card-icon" onerror="this.onerror=null;this.parentElement.innerHTML='<i class=\\'fa-solid fa-puzzle-piece\\'></i>'">` 
        : `<div class="card-icon"><i class="fa-solid fa-puzzle-piece"></i></div>`;

    // 平台徽章
    let platformBadge;
    if (platform === 'modrinth') {
        platformBadge = `<span class="badge badge-modrinth"><i class="fa-solid fa-cube"></i> Modrinth</span>`;
    } else if (platform === 'hangar') {
        platformBadge = `<span class="badge badge-hangar"><i class="fa-solid fa-paper-plane"></i> Hangar</span>`;
    } else {
        platformBadge = `<span class="badge badge-spigot"><i class="fa-solid fa-faucet"></i> Spigot</span>`;
    }

    const modrinthTagGroups = platform === 'modrinth'
        ? PlatformTagService.classifyModrinthTags(categories, loaders)
        : { loaderCompatibility: [], datapackIndicator: [], normalTags: categories };
    const hangarSpecialTags = platform === 'hangar'
        ? PlatformTagService.getHangarSpecialTags(tags)
        : [];

    // 渲染特殊标签（Loaders + Datapack + Hangar Special Tags）
    let specialTagsHtml = '';
    
    // Modrinth: 加载器标签
    if (platform === 'modrinth' && modrinthTagGroups.loaderCompatibility.length > 0) {
        modrinthTagGroups.loaderCompatibility.forEach(loader => {
            const icon = CONFIG.LOADER_ICONS[loader] || 'fa-puzzle-piece';
            const name = TagService.translate(loader);
            specialTagsHtml += `<span class="loader-tag" title="${name}"><i class="fa-solid ${icon}"></i> ${name}</span>`;
        });
    }

    // Modrinth: Datapack 标签（单独显示）
    if (platform === 'modrinth' && modrinthTagGroups.datapackIndicator.length > 0) {
        const icon = CONFIG.LOADER_ICONS['datapack'] || 'fa-database';
        specialTagsHtml += `<span class="loader-tag loader-tag-datapack" title="Datapack"><i class="fa-solid ${icon}"></i> Datapack</span>`;
    }

    // Hangar: Special Tags
    if (platform === 'hangar' && hangarSpecialTags.length > 0) {
        hangarSpecialTags.forEach(tag => {
            specialTagsHtml += `<span class="${tag.className}" title="${tag.label}"><i class="fa-solid ${tag.icon}"></i> ${tag.label}</span>`;
        });
    }

    const displayCategories = platform === 'modrinth' ? modrinthTagGroups.normalTags : categories;
    const translatedCategories = TagService.translateList(displayCategories);
    const categoryTagsHtml = translatedCategories.length > 0
        ? `<div class="card-tags">${translatedCategories.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
        : '';

    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => openModal(item, platform);
    card.dataset.pluginId = `${platform}:${id}`;

    card.innerHTML = `
        <button class="favorite-btn" aria-label="收藏插件" title="收藏">
            <i class="fa-${FavoritesService.isFavorite(`${platform}:${id}`) ? 'solid' : 'regular'} fa-heart"></i>
        </button>
        <div class="card-header">
            ${imgHtml}
            <div class="card-title">
                <h3>${title}</h3>
                <div class="card-author"><i class="fa-solid fa-user"></i> <span class="author-name">${author}</span></div>
            </div>
        </div>
        <div class="card-desc">${desc || '暂无描述'}</div>
        ${specialTagsHtml ? `<div class="card-loaders">${specialTagsHtml}</div>` : ''}
        ${categoryTagsHtml}
        <div class="card-extra">
            <span title="支持版本"><i class="fa-solid fa-gamepad"></i> <span class="metadata-versions">加载中...</span></span>
            <span class="metadata-loaders" title="支持的加载器"></span>
            <span title="最新版本"><i class="fa-solid fa-code-branch"></i> <span class="metadata-latest">加载中...</span></span>
        </div>
        <div class="card-meta">
            ${platformBadge}
            <div>
                <span title="下载量"><i class="fa-solid fa-download"></i> ${formatNumber(downloads)}</span>
                <span title="更新时间" style="margin-left:8px"><i class="fa-regular fa-clock"></i> ${date}</span>
            </div>
        </div>
    `;

    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const isFavorite = FavoritesService.toggle(item, platform);
        favoriteBtn.innerHTML = `<i class="fa-${isFavorite ? 'solid' : 'regular'} fa-heart"></i>`;
    });

    // NEW: 异步加载 Spigot 作者名称
    if (platform === 'spigot' && item.author?.id) {
        updateSpigotAuthor(card, item.author.id);
    }

    updateCardMetadata(card, item, platform);
    return card;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
}

// NEW: 异步更新 Spigot 作者名称
async function updateSpigotAuthor(card, authorId) {
    const authorElement = card.querySelector('.author-name');
    if (!authorElement) return;

    try {
        const authorName = await ApiService.getSpigotAuthor(authorId);
        if (authorName) {
            authorElement.textContent = authorName;
        } else {
            authorElement.textContent = 'Unknown Author';
        }
    } catch (error) {
        console.warn('Failed to load Spigot author:', error);
        authorElement.textContent = 'Unknown Author';
    }
}

// FIXED: Add loader compatibility badge display after version info
async function updateCardMetadata(card, item, platform) {
    const versionsEl = card.querySelector('.metadata-versions');
    const latestEl = card.querySelector('.metadata-latest');
    const loadersEl = card.querySelector('.metadata-loaders');

    try {
        const metadata = await MetadataService.getMetadata(item, platform);
        versionsEl.textContent = formatVersionList(metadata.supportedVersions, '未知');
        latestEl.textContent = metadata.latestVersion || '未知';
        
        // NEW: Display loader compatibility badges after version info
        if (loadersEl && Array.isArray(metadata.loaderCompatibility) && metadata.loaderCompatibility.length > 0) {
            const loaderBadges = metadata.loaderCompatibility.map(loader => {
                const icon = CONFIG.LOADER_ICONS[loader] || 'fa-puzzle-piece';
                const name = TagService.translate(loader);
                return `<span class="loader-badge" title="${name}"><i class="fa-solid ${icon}"></i></span>`;
            }).join(' ');
            loadersEl.innerHTML = `<i class="fa-solid fa-puzzle-piece"></i> ${loaderBadges}`;
        } else {
            loadersEl.style.display = 'none';
        }
    } catch (error) {
        console.warn('Card metadata update failed:', error);
        versionsEl.textContent = '未知';
        latestEl.textContent = '未知';
        if (loadersEl) loadersEl.style.display = 'none';
    }
}
