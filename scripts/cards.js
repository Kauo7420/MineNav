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
    } else {
        id = item.id;
        title = item.name;
        author = 'SpigotUser'; // Spigot 列表接口不直接返回作者名
        desc = item.tag;
        // Spigot 图标构造
        iconUrl = item.icon.url ? `https://www.spigotmc.org/${item.icon.url}` : `https://www.spigotmc.org/data/resource_icons/${Math.floor(id/1000)}/${id}.jpg`;
        downloads = item.downloads;
        date = new Date(item.updateDate * 1000).toLocaleDateString('zh-CN');
        link = `https://www.spigotmc.org/resources/${id}`;
    }

    // 默认图标处理
    const imgHtml = iconUrl 
        ? `<img src="${iconUrl}" class="card-icon" onerror="this.onerror=null;this.parentElement.innerHTML='<i class=\'fa-solid fa-puzzle-piece\'></i>'">` 
        : `<div class="card-icon"><i class="fa-solid fa-puzzle-piece"></i></div>`;

    const platformBadge = platform === 'modrinth' 
        ? `<span class="badge badge-modrinth"><i class="fa-solid fa-cube"></i> Modrinth</span>`
        : `<span class="badge badge-spigot"><i class="fa-solid fa-faucet"></i> Spigot</span>`;

    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => openModal(item, platform); // 调用 modal.js

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