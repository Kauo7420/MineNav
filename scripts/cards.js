// 卡片渲染逻辑
function renderCard(item, platform) {
    let title, author, desc, iconUrl, downloads, date, id, link;

    if (platform === 'modrinth') {
        id = item.project_id || item.slug;
        title = item.title;
        author = item.author;
        desc = item.description;
        iconUrl = item.icon_url;
        downloads = item.downloads;
        date = new Date(item.date_modified).toLocaleDateString('zh-CN');
        link = `https://modrinth.com/plugin/${item.slug}`;
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
    }
    else { // spigot
        id = item.id;
        title = item.name;
        author = 'SpigotUser';
        desc = item.tag;
        iconUrl = item.icon.url ? `https://www.spigotmc.org/${item.icon.url}` : `https://www.spigotmc.org/data/resource_icons/${Math.floor(id/1000)}/${id}.jpg`;
        downloads = item.downloads;
        date = new Date(item.updateDate * 1000).toLocaleDateString('zh-CN');
        link = `https://www.spigotmc.org/resources/${id}`;
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

    card.innerHTML = `
        <div class="card-header">
            ${imgHtml}
            <div class="card-title">
                <h3>${title}</h3>
                <div class="card-author"><i class="fa-solid fa-user"></i> ${author}</div>
            </div>
        </div>
        <div class="card-desc">${desc || '暂无描述'}</div>
        <div class="card-meta">
            ${platformBadge}
            <div>
                <span title="下载量"><i class="fa-solid fa-download"></i> ${formatNumber(downloads)}</span>
                <span title="更新时间" style="margin-left:8px"><i class="fa-regular fa-clock"></i> ${date}</span>
            </div>
        </div>
    `;
    return card;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
}