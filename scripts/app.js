// 全局状态
const state = {
    platform: 'all', // all, modrinth, spigot
    category: 'all',
    sort: 'downloads',
    search: '',
    page: 0,
    loading: false
};

// DOM 元素
const grid = document.getElementById('plugin-grid');
const loader = document.getElementById('loading-spinner');
const loadMoreBtn = document.getElementById('load-more-btn');
const statPlugins = document.getElementById('stat-plugins');
const statDownloads = document.getElementById('stat-downloads');

// 初始化
function init() {
    renderCategories();
    bindEvents();
    fetchData(true); // Initial load
    updateStats();
}

// 渲染分类栏
function renderCategories() {
    const container = document.getElementById('category-container');
    container.innerHTML = CONFIG.CATEGORIES.map(cat => `
        <button class="cat-pill ${cat.id === 'all' ? 'active' : ''}" data-id="${cat.id}">
            <i class="fa-solid ${cat.icon}"></i> ${cat.name}
        </button>
    `).join('');

    // 分类点击事件
    container.querySelectorAll('.cat-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // UI 更新
            container.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // 状态更新
            state.category = e.currentTarget.dataset.id;
            fetchData(true);
        });
    });
}

// 绑定事件
function bindEvents() {
    // 平台切换
    document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            state.platform = e.currentTarget.dataset.platform;
            
            // 改变强调色
            const root = document.documentElement;
            if (state.platform === 'modrinth') root.style.setProperty('--primary-accent', 'var(--modrinth-green)');
            else if (state.platform === 'spigot') root.style.setProperty('--primary-accent', 'var(--spigot-orange)');
            else root.style.setProperty('--primary-accent', 'var(--modrinth-green)'); // Default

            updateStats();
            fetchData(true);
        });
    });

    // 搜索 (防抖)
    let debounceTimer;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            state.search = e.target.value;
            fetchData(true);
        }, 400);
    });

    // 键盘快捷键 /
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
    });

    // 排序
    document.getElementById('sort-select').addEventListener('change', (e) => {
        state.sort = e.target.value;
        fetchData(true);
    });

    // 加载更多
    loadMoreBtn.addEventListener('click', () => {
        state.page++;
        fetchData(false);
    });
}

// 核心数据获取逻辑
async function fetchData(reset) {
    if (state.loading) return;
    state.loading = true;
    
    if (reset) {
        state.page = 0;
        grid.innerHTML = '';
        loadMoreBtn.classList.add('hidden');
    }

    loader.classList.remove('hidden');
    document.getElementById('result-count').innerText = '正在搜索...';

    const results = [];
    
    // 并行或单一获取
    const promises = [];
    
    if (state.platform === 'all' || state.platform === 'modrinth') {
        // Modrinth offset based
        promises.push(ApiService.fetchModrinth(state.search, state.category, state.sort, state.page * 12));
    }
    
    if (state.platform === 'all' || state.platform === 'spigot') {
        // Spigot page based (1-indexed usually, but Spiget might be 1)
        promises.push(ApiService.fetchSpigot(state.search, state.category, state.sort, state.page + 1));
    }

    const responses = await Promise.all(promises);
    
    responses.forEach(res => {
        if (res.hits) {
            res.hits.forEach(item => results.push({ data: item, platform: res.platform }));
        }
    });

    // 混合排序 (如果是 ALL 模式)
    if (state.platform === 'all') {
        results.sort((a, b) => {
            const valA = a.data.downloads || 0;
            const valB = b.data.downloads || 0;
            return state.sort === 'downloads' ? valB - valA : 0;
        });
    }

    // 渲染
    loader.classList.add('hidden');
    if (results.length > 0) {
        results.forEach(item => {
            grid.appendChild(renderCard(item.data, item.platform));
        });
        loadMoreBtn.classList.remove('hidden');
        document.getElementById('result-count').innerText = `展示 ${grid.children.length} 个结果`;
    } else if (reset) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary)">未找到相关插件</div>';
        document.getElementById('result-count').innerText = '0 个结果';
    }

    state.loading = false;
}

// 模拟统计数据动画
function updateStats() {
    // 这里使用硬编码数字模拟 API 获取的宏观数据，实际需调用各自 API 的 statistics 端点
    const targetPlugins = state.platform === 'all' ? 145000 : (state.platform === 'modrinth' ? 45000 : 100000);
    const targetDownloads = state.platform === 'all' ? 850000000 : 400000000;
    
    animateValue(statPlugins, 0, targetPlugins, 1000);
    animateValue(statDownloads, 0, targetDownloads, 1500);
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = formatNumber(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);