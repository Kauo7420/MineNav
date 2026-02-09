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
    let iconUrl = '';
    let platformBadge = '';
    
    if (platform === 'modrinth') {
        try {
            const fullData = await ApiService.getModrinthDetail(item.project_id);
            details = {
                title: fullData.title,
                desc: fullData.body, // Markdown/HTML
                downloads: fullData.downloads,
                link: `https://modrinth.com/plugin/${fullData.slug}`,
                categories: fullData.categories,
                versions: fullData.game_versions
            };
            iconUrl = fullData.icon_url;
        } catch (error) {
            details = {
                title: item.title,
                desc: item.description || '暂无详细描述',
                downloads: item.downloads || 0,
                link: `https://modrinth.com/plugin/${item.slug}`,
                categories: item.categories || [],
                versions: item.versions || []
            };
            iconUrl = item.icon_url;
        }
    } 
    else if (platform === 'hangar') {
        // Hangar 详情
        const slug = `${item.namespace.owner}/${item.namespace.slug}`;
        const fullData = await ApiService.getHangarDetail(slug);
        
        if (fullData) {
            details = {
                title: fullData.name,
                desc: fullData.description || '该项目暂无详细描述',
                downloads: fullData.stats?.downloads || item.stats?.downloads || 0,
                stars: fullData.stats?.stars || item.stats?.stars || 0,
                link: `https://hangar.papermc.io/${slug}`,
                categories: [CONFIG.HANGAR_CATEGORIES[fullData.category] || fullData.category],
                versions: [] // 可选:调用 getHangarVersions 获取
            };
            iconUrl = fullData.avatarUrl || item.avatarUrl;
        } else {
            // 降级使用列表数据
            details = {
                title: item.name,
                desc: item.description || '暂无详细描述',
                downloads: item.stats?.downloads || 0,
                stars: item.stats?.stars || 0,
                link: `https://hangar.papermc.io/${slug}`,
                categories: [CONFIG.HANGAR_CATEGORIES[item.category] || item.category],
                versions: []
            };
            iconUrl = item.avatarUrl;
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
        iconUrl = item.icon?.url ? `https://www.spigotmc.org/${item.icon.url}` : `https://www.spigotmc.org/data/resource_icons/${Math.floor(item.id/1000)}/${item.id}.jpg`;
    }

    metadata = await MetadataService.getMetadata(item, platform);

    // 生成模态框内容
    let statsHtml = `<i class="fa-solid fa-download"></i> ${formatNumber(details.downloads)} 下载`;
    if (details.stars !== undefined) {
        statsHtml += ` &nbsp;|&nbsp; <i class="fa-solid fa-star"></i> ${formatNumber(details.stars)} 星标`;
    }

    const categories = TagService.translateList(details.categories || []);
    const links = metadata.links || {};

    if (platform === 'modrinth') {
        platformBadge = `<span class="badge badge-modrinth"><i class="fa-solid fa-cube"></i> Modrinth</span>`;
    } else if (platform === 'hangar') {
        platformBadge = `<span class="badge badge-hangar"><i class="fa-solid fa-paper-plane"></i> Hangar</span>`;
    } else {
        platformBadge = `<span class="badge badge-spigot"><i class="fa-solid fa-faucet"></i> Spigot</span>`;
    }

    const safeDescription = platform === 'modrinth'
        ? renderMarkdown(details.desc)
        : details.desc;
    const fallbackIcon = '<div class="modal-icon"><i class="fa-solid fa-puzzle-piece"></i></div>';
    const iconHtml = iconUrl
        ? `<img src="${iconUrl}" class="modal-icon" onerror="this.onerror=null;this.parentElement.innerHTML='${fallbackIcon}'">`
        : fallbackIcon;

    modalContent.innerHTML = `
        <div class="modal-header">
            ${iconHtml}
            <div>
                <h2>${details.title}</h2>
                ${platformBadge}
            </div>
        </div>
        <div style="margin: 10px 0; display: flex; gap: 10px; flex-wrap: wrap;">
            ${categories.map(c => `<span class="badge" style="background:var(--bg-input)">${c}</span>`).join('')}
        </div>
        <p style="color:var(--text-secondary); margin-bottom: 20px;">
            ${statsHtml}
        </p>
        <div class="detail-meta">
            <div><i class="fa-solid fa-gamepad"></i> 支持版本：${formatVersionRange(metadata.supportedVersions, '未知')}</div>
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
        <div class="markdown-body" style="background:var(--bg-input); padding:15px; border-radius:8px; margin-bottom:20px; max-height:300px; overflow-y:auto; line-height:1.6;">
            ${safeDescription}
        </div>
        <a href="${details.link}" target="_blank" class="btn btn-primary" style="text-align:center; display:block; background: var(--primary-accent); color: white; border:none;">
            前往下载 <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
    `;
}
