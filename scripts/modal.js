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
                desc: renderMarkdownContent(item.description || '暂无详细描述'),
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
            try {
                const fullData = await ApiService.getHangarDetail(slug);
                
                if (fullData) {
                    // SAFE: Handle category mapping with fallback
                    const categoryKey = fullData.category || 'UNDEFINED';
                    const translatedCategory = CONFIG.HANGAR_CATEGORIES?.[categoryKey] || categoryKey;
                    
                    details = {
                        title: fullData.name,
                        desc: fullData.description || '该项目暂无详细描述',
                        downloads: fullData.stats?.downloads || item.stats?.downloads || 0,
                        stars: fullData.stats?.stars || item.stats?.stars || 0,
                        link: `https://hangar.papermc.io/${slug}`,
                        categories: [translatedCategory].filter(Boolean),
                        versions: []
                    };
                } else {
                    // 降级使用列表数据
                    const categoryKey = item.category || 'UNDEFINED';
                    const translatedCategory = CONFIG.HANGAR_CATEGORIES?.[categoryKey] || categoryKey;
                    
                    details = {
                        title: item.name || '未知项目',
                        desc: item.description || '暂无详细描述',
                        downloads: item.stats?.downloads || 0,
                        stars: item.stats?.stars || 0,
                        link: `https://hangar.papermc.io/${slug}`,
                        categories: [translatedCategory].filter(Boolean),
                        versions: []
                    };
                }
            } catch (error) {
                console.warn('Hangar detail fetch failed:', error);
                // Fallback with list data
                const categoryKey = item.category || 'UNDEFINED';
                const translatedCategory = CONFIG.HANGAR_CATEGORIES?.[categoryKey] || categoryKey;
                
                details = {
                    title: item.name || '未知项目',
                    desc: item.description || '暂无详细描述',
                    downloads: item.stats?.downloads || 0,
                    stars: item.stats?.stars || 0,
                    link: `https://hangar.papermc.io/${slug}`,
                    categories: [translatedCategory].filter(Boolean),
                    versions: []
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
                versions: []
            };
        }
    }
    else { // spigot
        details = {
            title: item.name,
            desc: item.tag + "<br><br>更多详情请点击下方链接前往 SpigotMC 查看。",
            downloads: item.downloads,
            link: `https://www.spigotmc.org/resources/${item.id}`,
            categories: [item.category?.name || 'Plugin'],
            versions: [item.version?.id]
        };
    }

    metadata = await MetadataService.getMetadata(item, platform);

    // 生成模态框内容
    let statsHtml = `<i class="fa-solid fa-download"></i> ${formatNumber(details.downloads)} 下载`;
    if (details.stars !== undefined) {
        statsHtml += ` &nbsp;|&nbsp; <i class="fa-solid fa-star"></i> ${formatNumber(details.stars)} 星标`;
    }

    const categories = TagService.translateList(details.categories || []);
    const links = metadata.links || {};

    modalContent.innerHTML = `
        <h2>${details.title}</h2>
        <div style="margin: 10px 0; display: flex; gap: 10px; flex-wrap: wrap;">
            ${categories.map(c => `<span class="badge" style="background:var(--bg-input)">${c}</span>`).join('')}
        </div>
        <p style="color:var(--text-secondary); margin-bottom: 20px;">
            ${statsHtml}
        </p>
        <div class="detail-meta">
            <div><i class="fa-solid fa-gamepad"></i> 支持版本：${formatVersionList(metadata.supportedVersions, '未知')}</div>
            <div><i class="fa-solid fa-code-branch"></i> 最新版本：${metadata.latestVersion || '未知'}</div>
        </div>
        <div class="detail-links">
            <a href="${links.github || '#'}" target="_blank" class="${links.github ? '' : 'disabled'}">
                <i class="fa-brands fa-github"></i> GitHub
            </a>
            <a href="${links.discord || '#'}" target="_blank" class="${links.discord ? '' : 'disabled'}">
                <i class="fa-brands fa-discord"></i> Discord
            </a>
            <a href="${links.wiki || '#'}" target="_blank" class="${links.wiki ? '' : 'disabled'}">
                <i class="fa-solid fa-book"></i> 文档 / Wiki
            </a>
        </div>
        <div style="background:var(--bg-input); padding:15px; border-radius:8px; margin-bottom:20px; max-height:300px; overflow-y:auto; line-height:1.6;">
            ${details.desc}
        </div>
        <a href="${details.link}" target="_blank" class="btn btn-primary" style="text-align:center; display:block; background: var(--primary-accent); color: white; border:none;">
            前往下载 <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
    `;
}
