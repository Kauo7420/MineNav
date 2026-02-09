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
    
    if (platform === 'modrinth') {
        const fullData = await ApiService.getModrinthDetail(item.project_id);
        details = {
            title: fullData.title,
            desc: fullData.body, // Markdown/HTML
            downloads: fullData.downloads,
            link: `https://modrinth.com/plugin/${fullData.slug}`,
            categories: fullData.categories,
            versions: fullData.game_versions
        };
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

    // 生成模态框内容
    let statsHtml = `<i class="fa-solid fa-download"></i> ${formatNumber(details.downloads)} 下载`;
    if (details.stars !== undefined) {
        statsHtml += ` &nbsp;|&nbsp; <i class="fa-solid fa-star"></i> ${formatNumber(details.stars)} 星标`;
    }

    modalContent.innerHTML = `
        <h2>${details.title}</h2>
        <div style="margin: 10px 0; display: flex; gap: 10px; flex-wrap: wrap;">
            ${(details.categories || []).map(c => `<span class="badge" style="background:var(--bg-input)">${c}</span>`).join('')}
        </div>
        <p style="color:var(--text-secondary); margin-bottom: 20px;">
            ${statsHtml}
        </p>
        <div style="background:var(--bg-input); padding:15px; border-radius:8px; margin-bottom:20px; max-height:300px; overflow-y:auto; line-height:1.6;">
            ${details.desc}
        </div>
        <a href="${details.link}" target="_blank" class="btn btn-primary" style="text-align:center; display:block; background: var(--primary-accent); color: white; border:none;">
            前往下载 <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
    `;
}