const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.querySelector('.modal-close');

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

function closeModal() {
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

async function openModal(item, platform) {
    modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    modalContent.innerHTML = '<div class="spinner"></div>';
    setGlobalLoading(true, I18nService.t('global.loadingDetail'));
    try {
        let details = {};
        let metadata = {};
        
        if (platform === 'modrinth') {
            try {
                const fullData = await ApiService.getModrinthDetail(item.project_id || item.id || item.slug);
                details = {
                    title: fullData.title,
                    desc: renderMarkdownContent(fullData.body),
                    downloads: fullData.downloads,
                    link: `https://modrinth.com/plugin/${fullData.slug}`,
                    categories: fullData.categories,
                    versions: fullData.game_versions
                };
            } catch (error) {
                details = {
                    title: item.title,
                    desc: renderMarkdownContent(item.description || I18nService.t('card.noDescription')),
                    downloads: item.downloads || 0,
                    link: `https://modrinth.com/plugin/${item.slug}`,
                    categories: item.categories || [],
                    versions: item.versions || []
                };
            }
        } 
        else if (platform === 'hangar') {
            // Hangar 详情
            const slug = getHangarProjectSlug(item);
            if (slug) {
                const fullData = await ApiService.getHangarDetail(slug);
                
                if (fullData) {
                    details = {
                        title: fullData.name,
                        desc: fullData.description || I18nService.t('card.noDescription'),
                        downloads: fullData.stats?.downloads || item.stats?.downloads || 0,
                        stars: fullData.stats?.stars || item.stats?.stars || 0,
                        link: `https://hangar.papermc.io/${slug}`,
                        categories: [CONFIG.HANGAR_CATEGORIES[fullData.category] || fullData.category].filter(Boolean),
                        versions: []
                    };
                } else {
                    // 降级使用列表数据
                    details = {
                        title: item.name || I18nService.t('card.unknown'),
                        desc: item.description || I18nService.t('card.noDescription'),
                        downloads: item.stats?.downloads || 0,
                        stars: item.stats?.stars || 0,
                        link: `https://hangar.papermc.io/${slug}`,
                        categories: [CONFIG.HANGAR_CATEGORIES[item.category] || item.category].filter(Boolean),
                        versions: []
                    };
                }
            } else {
                details = {
                    title: item.name || I18nService.t('card.unknown'),
                    desc: item.description || I18nService.t('card.noDescription'),
                    downloads: item.stats?.downloads || 0,
                    stars: item.stats?.stars || 0,
                    link: '#',
                    categories: [CONFIG.HANGAR_CATEGORIES[item.category] || item.category].filter(Boolean),
                    versions: []
                };
            }
        }
        else { // spigot
            details = {
                title: item.name,
                desc: `${item.tag}<br><br>${I18nService.t('modal.spigotHint')}`,
                downloads: item.downloads,
                link: `https://www.spigotmc.org/resources/${item.id}`,
                categories: [item.category?.name || 'Plugin'],
                versions: [item.version?.id]
            };
        }

        metadata = await MetadataService.getMetadata(item, platform);

        // 生成模态框内容
        let statsHtml = `<i class="fa-solid fa-download"></i> ${I18nService.t('modal.downloads', { count: formatNumber(details.downloads) })}`;
        if (details.stars !== undefined) {
            statsHtml += ` &nbsp;|&nbsp; <i class="fa-solid fa-star"></i> ${I18nService.t('modal.stars', { count: formatNumber(details.stars) })}`;
        }

        const categories = TagService.translateList(details.categories || []);
        const links = metadata.links || {};
        const loaderBadges = (metadata.loaders || []).map(loader => `
            <span class="loader-badge loader-${loader}">${formatLoaderLabel(loader)}</span>
        `).join('');
        const foliaStatus = platform === 'hangar'
            ? (metadata.supportsFolia
                ? `<span class="folia-status supported"><i class="fa-solid fa-circle-check"></i> ${I18nService.t('folia.supported')}</span>`
                : `<span class="folia-status unsupported"><i class="fa-solid fa-circle-xmark"></i> ${I18nService.t('folia.unsupported')}</span>`)
            : '';

        modalContent.innerHTML = `
            <h2>${details.title}</h2>
            <div style="margin: 10px 0; display: flex; gap: 10px; flex-wrap: wrap;">
                ${categories.map(c => `<span class="badge" style="background:var(--bg-input)">${c}</span>`).join('')}
            </div>
            <p style="color:var(--text-secondary); margin-bottom: 20px;">
                ${statsHtml}
            </p>
            <div class="detail-meta">
                <div><i class="fa-solid fa-gamepad"></i> ${I18nService.t('modal.supportedVersions')}：${formatVersionList(metadata.supportedVersions, I18nService.t('card.unknown'))}</div>
                <div><i class="fa-solid fa-code-branch"></i> ${I18nService.t('modal.latestVersion')}：${metadata.latestVersion || I18nService.t('card.unknown')}</div>
                ${platform === 'modrinth' && loaderBadges ? `<div><i class="fa-solid fa-layer-group"></i> ${I18nService.t('modal.loaders')}：${loaderBadges}</div>` : ''}
                ${platform === 'hangar' ? `<div><i class="fa-solid fa-leaf"></i> ${I18nService.t('modal.foliaSupport')}：${foliaStatus}</div>` : ''}
            </div>
            <div class="detail-links">
                <a href="${links.github || '#'}" target="_blank" class="${links.github ? '' : 'disabled'}">
                    <i class="fa-brands fa-github"></i> GitHub
                </a>
                <a href="${links.discord || '#'}" target="_blank" class="${links.discord ? '' : 'disabled'}">
                    <i class="fa-brands fa-discord"></i> Discord
                </a>
                <a href="${links.wiki || '#'}" target="_blank" class="${links.wiki ? '' : 'disabled'}">
                    <i class="fa-solid fa-book"></i> ${I18nService.t('modal.documentation')}
                </a>
            </div>
            <div style="background:var(--bg-input); padding:15px; border-radius:8px; margin-bottom:20px; max-height:300px; overflow-y:auto; line-height:1.6;">
                ${details.desc}
            </div>
            <a href="${details.link}" target="_blank" class="btn btn-primary" style="text-align:center; display:block; background: var(--primary-accent); color: white; border:none;">
                ${I18nService.t('modal.visit')} <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
        `;
    } finally {
        setGlobalLoading(false);
    }
}
