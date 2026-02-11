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

// TASK 4: Runtime Environment Mapping Utility
const RuntimeEnvironmentService = {
    SIDE_LABELS: {
        client: '客户端',
        server: '服务端'
    },
    SUPPORT_LABELS: {
        required: '需装',
        optional: '可选',
        unsupported: '无效'
    },
    SUPPORT_CLASSES: {
        required: 'runtime-tag-required',
        optional: 'runtime-tag-optional',
        unsupported: 'runtime-tag-unsupported'
    },
    SUPPORT_ICONS: {
        required: 'fa-check-circle',
        optional: 'fa-circle-dot',
        unsupported: 'fa-circle-xmark'
    },
    parseRuntimeEnvironment(clientSide, serverSide) {
        const tags = [];
        
        if (clientSide && this.SUPPORT_LABELS[clientSide]) {
            tags.push({
                side: 'client',
                support: clientSide,
                label: `${this.SIDE_LABELS.client}: ${this.SUPPORT_LABELS[clientSide]}`,
                className: `runtime-tag ${this.SUPPORT_CLASSES[clientSide]}`,
                icon: this.SUPPORT_ICONS[clientSide]
            });
        }
        
        if (serverSide && this.SUPPORT_LABELS[serverSide]) {
            tags.push({
                side: 'server',
                support: serverSide,
                label: `${this.SIDE_LABELS.server}: ${this.SUPPORT_LABELS[serverSide]}`,
                className: `runtime-tag ${this.SUPPORT_CLASSES[serverSide]}`,
                icon: this.SUPPORT_ICONS[serverSide]
            });
        }
        
        return tags;
    }
};

function renderSpecialTagSection(title, tags = []) {
    if (!Array.isArray(tags) || tags.length === 0) return '';
    return `
        <div class="detail-section">
            <h3>${title}</h3>
            <div class="detail-chip-list">
                ${tags.map(tag => `<span class="${tag.className}"><i class="fa-solid ${tag.icon}"></i> ${tag.label}</span>`).join('')}
            </div>
        </div>
    `;
}

function renderVersionMeta(platform, metadata) {
    if (platform === 'hangar') {
        const platformVersions = Array.isArray(metadata?.hangarPlatformVersions)
            ? metadata.hangarPlatformVersions
            : [];

        if (platformVersions.length > 0) {
            const platformBlocks = platformVersions.map(entry => `
                <div class="detail-version-platform">
                    <span class="detail-version-label">${entry.platform}</span>
                    <span class="detail-version-value">${entry.formatted}</span>
                </div>
            `).join('');

            return `
                <div class="detail-meta">
                    <div class="detail-meta-platforms">${platformBlocks}</div>
                    <div><i class="fa-solid fa-code-branch"></i> 最新版本：${metadata.latestVersion || '未知'}</div>
                </div>
            `;
        }
    }

    return `
        <div class="detail-meta">
            <div><i class="fa-solid fa-gamepad"></i> 支持版本：${formatVersionList(metadata.supportedVersions, '未知')}</div>
            <div><i class="fa-solid fa-code-branch"></i> 最新版本：${metadata.latestVersion || '未知'}</div>
        </div>
    `;
}

// NEW: Render plain text metadata fields (like supportedLanguages)
function renderTextMetadata(textMetadata = {}) {
    if (!textMetadata || Object.keys(textMetadata).length === 0) return '';
    
    const items = [];
    
    // supportedLanguages should be displayed as plain text
    if (textMetadata.supportedLanguages) {
        items.push(`
            <div>
                <i class="fa-solid fa-language"></i> 
                语言支持：${escapeHtml(textMetadata.supportedLanguages)}
            </div>
        `);
    }
    
    if (items.length === 0) return '';
    
    return `
        <div class="detail-meta" style="margin-top: 12px;">
            ${items.join('')}
        </div>
    `;
}

function renderExternalLinks(links = {}) {
    const fallbackMappings = [
        { key: 'source', label: '查看源码', icon: 'fa-brands fa-github' },
        { key: 'github', label: '查看源码', icon: 'fa-brands fa-github' },
        { key: 'discord', label: '加入 Discord 服务器', icon: 'fa-brands fa-discord' },
        { key: 'wiki', label: '前往 Wiki', icon: 'fa-solid fa-book' },
        { key: 'issues', label: '报告问题', icon: 'fa-solid fa-bug' },
        { key: 'donate', label: '赞助', icon: 'fa-solid fa-heart' }
    ];

    let renderableLinks = LinkService.toRenderableLinks(links);

    if (renderableLinks.length === 0) {
        renderableLinks = fallbackMappings
            .map(mapping => {
                const url = links?.[mapping.key];
                if (!url) return null;
                return { ...mapping, url };
            })
            .filter(Boolean);
    }

    if (renderableLinks.length === 0) return '';

    return `
        <div class="detail-links">
            ${renderableLinks.map(link => `
                <a href="${link.url}" target="_blank" rel="noopener noreferrer">
                    <i class="${link.icon}"></i> ${link.label}
                </a>
            `).join('')}
        </div>
    `;
}

async function openModal(item, platform) {
    modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    modalContent.innerHTML = '<div class="spinner"></div>';

    let details = {};
    let metadata = {};
    let runtimeTags = []; // TASK 4: Runtime environment tags
    
    if (platform === 'modrinth') {
        try {
            const fullData = await ApiService.getModrinthDetail(item.project_id || item.id || item.slug);
            details = {
                title: fullData.title,
                desc: fullData.description || '暂无详细描述',
                downloads: fullData.downloads,
                link: `https://modrinth.com/plugin/${fullData.slug}`,
                categories: fullData.categories,
                versions: fullData.game_versions,
                loaders: fullData.loaders || item.loaders || []
            };
            
            // TASK 4: Extract runtime environment data
            runtimeTags = RuntimeEnvironmentService.parseRuntimeEnvironment(
                fullData.client_side,
                fullData.server_side
            );
        } catch (error) {
            details = {
                title: item.title,
                desc: item.description || '暂无详细描述',
                downloads: item.downloads || 0,
                link: `https://modrinth.com/plugin/${item.slug}`,
                categories: item.categories || [],
                versions: item.versions || [],
                loaders: item.loaders || []
            };
            
            // TASK 4: Try to extract runtime from item fallback
            runtimeTags = RuntimeEnvironmentService.parseRuntimeEnvironment(
                item.client_side,
                item.server_side
            );
        }
    } 
    else if (platform === 'hangar') {
        const slug = getHangarProjectSlug(item);
        if (slug) {
            try {
                const fullData = await ApiService.getHangarDetail(slug);
                
                if (fullData) {
                    const categoryKey = fullData.category || 'UNDEFINED';
                    const translatedCategory = CONFIG.HANGAR_CATEGORIES?.[categoryKey] || categoryKey;
                    
                    details = {
                        title: fullData.name,
                        desc: fullData.description || '该项目暂无详细描述',
                        downloads: fullData.stats?.downloads || item.stats?.downloads || 0,
                        stars: fullData.stats?.stars || item.stats?.stars || 0,
                        link: `https://hangar.papermc.io/${slug}`,
                        categories: [translatedCategory].filter(Boolean),
                        versions: [],
                        tags: Array.isArray(fullData.tags) ? fullData.tags : (Array.isArray(item.tags) ? item.tags : [])
                    };
                } else {
                    const categoryKey = item.category || 'UNDEFINED';
                    const translatedCategory = CONFIG.HANGAR_CATEGORIES?.[categoryKey] || categoryKey;
                    
                    details = {
                        title: item.name || '未知项目',
                        desc: item.description || '暂无详细描述',
                        downloads: item.stats?.downloads || 0,
                        stars: item.stats?.stars || 0,
                        link: `https://hangar.papermc.io/${slug}`,
                        categories: [translatedCategory].filter(Boolean),
                        versions: [],
                        tags: Array.isArray(item.tags) ? item.tags : []
                    };
                }
            } catch (error) {
                console.warn('Hangar detail fetch failed:', error);
                const categoryKey = item.category || 'UNDEFINED';
                const translatedCategory = CONFIG.HANGAR_CATEGORIES?.[categoryKey] || categoryKey;
                
                details = {
                    title: item.name || '未知项目',
                    desc: item.description || '暂无详细描述',
                    downloads: item.stats?.downloads || 0,
                    stars: item.stats?.stars || 0,
                    link: `https://hangar.papermc.io/${slug}`,
                    categories: [translatedCategory].filter(Boolean),
                    versions: [],
                    tags: Array.isArray(item.tags) ? item.tags : []
                };
            }
        } else {
            const categoryKey = item.category || 'UNDEFINED';
            const translatedCategory = CONFIG.HANGAR_CATEGORIES?.[categoryKey] || categoryKey;
            
            details = {
                title: item.name || '未知项目',
                desc: item.description || '暂无详细描述',
                downloads: item.stats?.downloads || 0,
                stars: item.stats?.stars || 0,
                link: '#',
                categories: [translatedCategory].filter(Boolean),
                versions: [],
                tags: Array.isArray(item.tags) ? item.tags : []
            };
        }
    }
    else { // spigot
        details = {
            title: item.name,
            desc: item.tag,
            downloads: item.downloads,
            link: `https://www.spigotmc.org/resources/${item.id}`,
            categories: [item.category?.name || 'Plugin'],
            versions: [item.version?.id]
        };
    }

    metadata = await MetadataService.getMetadata(item, platform);

    // Generate stats HTML with rating for Spigot
    let statsHtml = `<i class="fa-solid fa-download"></i> ${formatNumber(details.downloads)} 下载`;
    
    if (platform === 'spigot' && metadata.rating) {
        // Add stars (count) and rating (average) for Spigot
        statsHtml += ` &nbsp;|&nbsp; <i class="fa-solid fa-star"></i> ${formatNumber(metadata.rating.count)} 星标`;
        statsHtml += ` &nbsp;|&nbsp; <i class="fa-solid fa-star-half-stroke"></i> ${metadata.rating.average.toFixed(1)} 评分`;
    } else if (details.stars !== undefined) {
        // For Hangar
        statsHtml += ` &nbsp;|&nbsp; <i class="fa-solid fa-star"></i> ${formatNumber(details.stars)} 星标`;
    }

    const modrinthTagGroups = platform === 'modrinth'
        ? PlatformTagService.classifyModrinthTags(details.categories || [], details.loaders || item.loaders || [])
        : { loaderCompatibility: [], datapackIndicator: [], normalTags: details.categories || [] };
    
    // Add loader compatibility for Hangar
    const hangarLoaderCompatibility = platform === 'hangar'
        ? (metadata.loaderCompatibility || []).map(loader => ({
            className: 'special-tag',
            icon: CONFIG.LOADER_ICONS[loader] || 'fa-puzzle-piece',
            label: TagService.translate(loader)
        }))
        : [];
    
    const hangarSpecialTags = platform === 'hangar'
        ? PlatformTagService.getHangarSpecialTags(details.tags || item.tags || [])
        : [];

    const normalTags = platform === 'modrinth'
        ? TagService.translateList(modrinthTagGroups.normalTags)
        : TagService.translateList(details.categories || []);

    // Build combined loader compatibility array for Modrinth
    const loaderCompatibilityTags = modrinthTagGroups.loaderCompatibility.map(loader => ({
        className: 'special-tag',
        icon: CONFIG.LOADER_ICONS[loader] || 'fa-puzzle-piece',
        label: TagService.translate(loader)
    }));

    // Add datapack tags to the same array with Chinese label "数据包"
    const datapackTags = modrinthTagGroups.datapackIndicator.map(() => ({
        className: 'special-tag special-tag-datapack',
        icon: CONFIG.LOADER_ICONS.datapack || 'fa-database',
        label: '数据包'
    }));

    // Combine loader compatibility and datapack tags into one array
    const combinedLoaderTags = [...loaderCompatibilityTags, ...datapackTags];

    const links = metadata.links || {};
    const normalTagHtml = normalTags.length > 0
        ? `<div class="detail-section"><h3>标签</h3><div class="detail-chip-list">${normalTags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div></div>`
        : '';

    const descriptionHtml = escapeHtml(details.desc).replace(/\n/g, '<br>');

    modalContent.innerHTML = `
        <h2>${details.title}</h2>
        <p style="color:var(--text-secondary); margin-bottom: 20px;">
            ${statsHtml}
        </p>
        ${renderVersionMeta(platform, metadata)}
        ${renderTextMetadata(metadata.textMetadata)}
        ${platform === 'hangar' ? renderSpecialTagSection('特殊标签', hangarSpecialTags) : ''}
        ${platform === 'modrinth' ? renderSpecialTagSection('支持的加载器', combinedLoaderTags) : ''}
        ${platform === 'hangar' ? renderSpecialTagSection('支持的加载器', hangarLoaderCompatibility) : ''}
        ${platform === 'modrinth' ? renderSpecialTagSection('运行环境', runtimeTags) : ''}
        ${normalTagHtml}
        ${renderExternalLinks(links)}
        <div style="background:var(--bg-input); padding:15px; border-radius:8px; margin-bottom:20px; max-height:300px; overflow-y:auto; line-height:1.6;">
            ${descriptionHtml}
        </div>
        <a href="${details.link}" target="_blank" class="btn btn-primary" style="text-align:center; display:block; background: var(--primary-accent); color: white; border:none;">
            前往下载 <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
    `;
}
