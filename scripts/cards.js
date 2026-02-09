// 卡片渲染逻辑
function renderCard(item, platform) {
    let title, author, desc, iconUrl, downloads, date, id, link, categories;

    if (platform === 'modrinth') {
        id = item.project_id || item.slug;
        title = item.title;
        author = item.author;
        desc = item.description;
        iconUrl = item.icon_url;
        downloads = item.downloads;
        date = new Date(item.date_modified).toLocaleDateString(I18nService.locale);
        link = `https://modrinth.com/plugin/${item.slug}`;
        categories = item.categories || [];
    } 
    else if (platform === 'hangar') {
        // Hangar 数据映射
        id = item.namespace?.slug || item.name;
        title = item.name;
        author = item.namespace?.owner || I18nService.t('card.hangarUser');
        desc = item.description || I18nService.t('card.noDescription');
        iconUrl = item.avatarUrl;
        downloads = item.stats?.downloads || 0;
        date = new Date(item.lastUpdated).toLocaleDateString(I18nService.locale);
        link = `https://hangar.papermc.io/${item.namespace?.owner}/${item.namespace?.slug}`;
        categories = [item.category].filter(Boolean);
    }
    else { // spigot
        id = item.id;
        title = item.name;
        author = I18nService.t('card.spigotUser');
        desc = item.tag;
        iconUrl = item.icon.url ? `https://www.spigotmc.org/${item.icon.url}` : `https://www.spigotmc.org/data/resource_icons/${Math.floor(id/1000)}/${id}.jpg`;
        downloads = item.downloads;
        date = new Date(item.updateDate * 1000).toLocaleDateString(I18nService.locale);
        link = `https://www.spigotmc.org/resources/${id}`;
        categories = [item.category?.name || 'Plugin'];
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

    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => openModal(item, platform);
    card.dataset.pluginId = `${platform}:${id}`;

    card.innerHTML = `
        <button class="favorite-btn" aria-label="${I18nService.t('card.favorite')}" title="${I18nService.t('card.favorite')}">
            <i class="fa-${FavoritesService.isFavorite(`${platform}:${id}`) ? 'solid' : 'regular'} fa-heart"></i>
        </button>
        <div class="card-header">
            ${imgHtml}
            <div class="card-title">
                <h3>${title}</h3>
                <div class="card-author"><i class="fa-solid fa-user"></i> ${I18nService.t('card.author')}: ${author}</div>
            </div>
        </div>
        <div class="card-desc">${desc || I18nService.t('card.noDescription')}</div>
        <div class="card-tags">
            ${TagService.translateList(categories).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="card-flags"></div>
        <div class="card-extra">
            <span title="${I18nService.t('card.supportedVersions')}"><i class="fa-solid fa-gamepad"></i> <span class="metadata-versions">${I18nService.t('card.loading')}</span></span>
            <span title="${I18nService.t('card.latestVersion')}"><i class="fa-solid fa-code-branch"></i> <span class="metadata-latest">${I18nService.t('card.loading')}</span></span>
        </div>
        <div class="card-meta">
            ${platformBadge}
            <div>
                <span title="${I18nService.t('card.downloads')}"><i class="fa-solid fa-download"></i> ${formatNumber(downloads)}</span>
                <span title="${I18nService.t('card.updated')}" style="margin-left:8px"><i class="fa-regular fa-clock"></i> ${date}</span>
            </div>
        </div>
    `;

    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const isFavorite = FavoritesService.toggle(item, platform);
        favoriteBtn.innerHTML = `<i class="fa-${isFavorite ? 'solid' : 'regular'} fa-heart"></i>`;
    });

    updateCardMetadata(card, item, platform);
    return card;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
}

async function updateCardMetadata(card, item, platform) {
    const versionsEl = card.querySelector('.metadata-versions');
    const latestEl = card.querySelector('.metadata-latest');
    const flagsEl = card.querySelector('.card-flags');

    try {
        const metadata = await MetadataService.getMetadata(item, platform);
        versionsEl.textContent = formatVersionList(metadata.supportedVersions, I18nService.t('card.unknown'));
        latestEl.textContent = metadata.latestVersion || I18nService.t('card.unknown');
        if (flagsEl) {
            flagsEl.innerHTML = '';
            if (platform === 'modrinth') {
                const loaders = metadata.loaders || [];
                const loaderBadges = loaders.map(loader => `
                    <span class="loader-badge loader-${loader}">${formatLoaderLabel(loader)}</span>
                `).join('');
                flagsEl.innerHTML = loaderBadges;
                flagsEl.classList.toggle('hidden', loaderBadges.length === 0);
            }
            if (platform === 'hangar') {
                const supported = metadata.supportsFolia;
                if (supported !== undefined) {
                    const label = supported ? I18nService.t('folia.supported') : I18nService.t('folia.unsupported');
                    const icon = supported ? 'fa-circle-check' : 'fa-circle-xmark';
                    flagsEl.innerHTML = `
                        <span class="folia-status ${supported ? 'supported' : 'unsupported'}">
                            <i class="fa-solid ${icon}"></i> ${label}
                        </span>
                    `;
                    flagsEl.classList.remove('hidden');
                }
            }
            if (platform !== 'modrinth' && platform !== 'hangar') {
                flagsEl.classList.add('hidden');
            }
        }
    } catch (error) {
        console.warn('Card metadata update failed:', error);
        versionsEl.textContent = I18nService.t('card.unknown');
        latestEl.textContent = I18nService.t('card.unknown');
    }
}
