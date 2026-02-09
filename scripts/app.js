// 全局状态
const state = {
    platform: 'all', // all, modrinth, spigot
    category: 'all',
    sort: 'downloads',
    search: '',
    page: 0,
    loading: false,
    view: 'main'
};

// DOM 元素
const grid = document.getElementById('plugin-grid');
const loader = document.getElementById('loading-spinner');
const loadMoreBtn = document.getElementById('load-more-btn');
const statPlugins = document.getElementById('stat-plugins');
const statDownloads = document.getElementById('stat-downloads');
const favoritesGrid = document.getElementById('favorites-grid');
const mainView = document.getElementById('main-view');
const favoritesView = document.getElementById('favorites-view');
const pageLoader = document.getElementById('page-loader');

// 初始化
function init() {
    TagService.setLocale(CONFIG.DEFAULT_LOCALE);
    renderCategories();
    bindEvents();
    updateFavoriteView();
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
            switch(state.platform) {
                case 'modrinth':
                    root.style.setProperty('--primary-accent', 'var(--modrinth-green)');
                    break;
                case 'spigot':
                    root.style.setProperty('--primary-accent', 'var(--spigot-orange)');
                    break;
                case 'hangar':
                    root.style.setProperty('--primary-accent', 'var(--hangar-blue)');
                    break;
                default:
                    root.style.setProperty('--primary-accent', 'var(--modrinth-green)');
            }

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

    // 收藏夹页面
    document.getElementById('favorites-toggle').addEventListener('click', () => {
        switchView(state.view === 'favorites' ? 'main' : 'favorites');
    });
    document.getElementById('favorites-back').addEventListener('click', () => {
        switchView('main');
    });

    FavoritesService.subscribe(() => {
        updateFavoriteView();
        updateFavoriteButtons();
    });
}

// 核心数据获取逻辑
async function fetchData(reset) {
    if (state.loading) return;
    state.loading = true;
    togglePageLoading(true);
    
    try {
        if (reset) {
            state.page = 0;
            grid.innerHTML = '';
            loadMoreBtn.classList.add('hidden');
        }

        loader.classList.remove('hidden');
        document.getElementById('result-count').innerText = '正在搜索...';

        const results = [];
        const promises = [];
        
        // Modrinth
        if (state.platform === 'all' || state.platform === 'modrinth') {
            promises.push(ApiService.fetchModrinth(state.search, state.category, state.sort, state.page * 12));
        }
        
        // Spigot
        if (state.platform === 'all' || state.platform === 'spigot') {
            promises.push(ApiService.fetchSpigot(state.search, state.category, state.sort, state.page + 1));
        }

        // Hangar (新增)
        if (state.platform === 'all' || state.platform === 'hangar') {
            promises.push(ApiService.fetchHangar(state.search, state.category, state.sort, state.page * 12));
        }

        const responses = await Promise.all(promises);
        
        responses.forEach(res => {
            if (res.hits) {
                res.hits.forEach(item => {
                    const entry = { data: item, platform: res.platform };
                    results.push(entry);
                });
            }
        });

        // 统一排序逻辑
        results.sort((a, b) => sortPlugins(a, b, state.sort));

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
    } finally {
        state.loading = false;
        togglePageLoading(false);
    }
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

function sortPlugins(a, b, sort) {
    if (sort === 'downloads') {
        const valA = a.platform === 'hangar' ? a.data.stats?.downloads || 0 : a.data.downloads || 0;
        const valB = b.platform === 'hangar' ? b.data.stats?.downloads || 0 : b.data.downloads || 0;
        return valB - valA;
    }

    if (sort === 'newest') {
        const dateA = getPluginDate(a, 'release');
        const dateB = getPluginDate(b, 'release');
        return dateB - dateA;
    }

    if (sort === 'updated') {
        const dateA = getPluginDate(a, 'updated');
        const dateB = getPluginDate(b, 'updated');
        return dateB - dateA;
    }

    if (sort === 'name-asc') {
        return getPluginName(a).localeCompare(getPluginName(b), 'zh-CN');
    }

    if (sort === 'name-desc') {
        return getPluginName(b).localeCompare(getPluginName(a), 'zh-CN');
    }

    return 0;
}

function getPluginDate(item, type) {
    if (item.platform === 'modrinth') {
        const date = type === 'release' ? item.data.date_created : item.data.date_modified;
        return new Date(date).getTime();
    }
    if (item.platform === 'hangar') {
        const date = type === 'release' ? item.data.createdAt : item.data.lastUpdated;
        return new Date(date).getTime();
    }
    const date = type === 'release' ? item.data.releaseDate : item.data.updateDate;
    return new Date(date * 1000).getTime();
}

function getPluginName(item) {
    if (item.platform === 'hangar') return item.data.name || '';
    if (item.platform === 'modrinth') return item.data.title || '';
    return item.data.name || '';
}

function switchView(view) {
    state.view = view;
    mainView.classList.toggle('hidden', view !== 'main');
    favoritesView.classList.toggle('hidden', view !== 'favorites');
    document.body.style.overflow = view === 'favorites' ? '' : '';
    if (view === 'favorites') {
        updateFavoriteView();
    }
}

function updateFavoriteView() {
    const favorites = FavoritesService.getAll();
    favoritesGrid.innerHTML = '';

    if (favorites.length === 0) {
        favoritesGrid.innerHTML = '<div class="empty-state">暂无收藏，点击心形按钮收藏插件。</div>';
        return;
    }

    favorites.forEach(item => {
        favoritesGrid.appendChild(renderCard(item.data, item.platform));
    });
}

function updateFavoriteButtons() {
    document.querySelectorAll('.card').forEach(card => {
        const btn = card.querySelector('.favorite-btn i');
        if (!btn) return;
        const id = card.dataset.pluginId;
        const isFavorite = FavoritesService.isFavorite(id);
        btn.className = `fa-${isFavorite ? 'solid' : 'regular'} fa-heart`;
    });
}

function togglePageLoading(isLoading) {
    if (!pageLoader) return;
    pageLoader.classList.toggle('hidden', !isLoading);
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);
