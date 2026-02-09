// API 处理层
class ApiService {
    // 获取 Modrinth 插件
    static async fetchModrinth(query, category, sort, offset) {
        let url = `${CONFIG.MODRINTH_API}/search?query=${query || ''}&limit=12&offset=${offset}`;
        
        // 构建 Facets 筛选
        const facets = [['project_type:plugin']];
        if (category && category !== 'all') {
            const catMap = CONFIG.CATEGORIES.find(c => c.id === category);
            if (catMap && catMap.modrinth) {
                facets.push([`categories:${catMap.modrinth}`]);
            }
        }
        url += `&facets=${JSON.stringify(facets)}`;

        // 排序映射
        const sortMap = { 'downloads': 'downloads', 'newest': 'newest', 'updated': 'updated' };
        url += `&index=${sortMap[sort] || 'downloads'}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            return {
                platform: 'modrinth',
                hits: data.hits,
                total: data.total_hits
            };
        } catch (e) {
            console.error('Modrinth fetch error:', e);
            return { platform: 'modrinth', hits: [], total: 0 };
        }
    }

    // 获取 Spigot 插件
    static async fetchSpigot(query, category, sort, page) {
        // 注意：Spigot API 搜索和列表是分开的，且搜索不支持分类筛选，这里做简化处理
        let url = '';
        const sortParam = sort === 'newest' ? '-releaseDate' : (sort === 'updated' ? '-updateDate' : '-downloads');
        
        if (query) {
            url = `${CONFIG.SPIGET_API}/search/resources/${query}?size=12&page=${page}&sort=${sortParam}`;
        } else {
            url = `${CONFIG.SPIGET_API}/resources?size=12&page=${page}&sort=${sortParam}`;
            
            if (category && category !== 'all') {
                const catMap = CONFIG.CATEGORIES.find(c => c.id === category);
                if (catMap && catMap.spigot) {
                    // Spigot 按分类获取 URL 不同
                    url = `${CONFIG.SPIGET_API}/categories/${catMap.spigot}/resources?size=12&page=${page}&sort=${sortParam}`;
                }
            }
        }

        try {
            const res = await fetch(url);
            // Spigot 出错时可能返回 Cloudflare 页面或 CORS 错误，需捕获
            if (!res.ok) throw new Error('Spigot API Error');
            const data = await res.json();
            return {
                platform: 'spigot',
                hits: Array.isArray(data) ? data : [], // Spigot 返回数组
                total: 9999 // Spigot API headers 不容易获取总数，暂时模拟
            };
        } catch (e) {
            console.warn('Spigot fetch error (可能为 CORS 限制):', e);
            return { platform: 'spigot', hits: [], total: 0, error: true };
        }
    }

    // 获取详情 (Modrinth)
    static async getModrinthDetail(id) {
        const res = await fetch(`${CONFIG.MODRINTH_API}/project/${id}`);
        return await res.json();
    }
}