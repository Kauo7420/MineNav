/* ============================================
   API 集成 - Modrinth 和 SpigotMC
   ============================================ */

const API = {
  // 获取Modrinth搜索结果
  searchModrinth: async (query, page = 0, sort = 'downloads', loader = null) => {
    const cacheKey = `modrinth_search_${query}_${page}_${sort}_${loader}`;
    const cached = Cache.get(cacheKey);
    if (cached) return cached;

    try {
      let facets = '[["project_type:plugin"]]';
      if (loader) {
        facets = `[["project_type:plugin"],["loaders:${loader}"]]`;
      }

      const url = new URL(`${CONFIG.APIS.MODRINTH.BASE_URL}${CONFIG.APIS.MODRINTH.SEARCH}`);
      url.searchParams.append('query', query || '*');
      url.searchParams.append('facets', facets);
      url.searchParams.append('index', sort);
      url.searchParams.append('offset', page * CONFIG.ITEMS_PER_PAGE);
      url.searchParams.append('limit', CONFIG.ITEMS_PER_PAGE);

      const response = await fetch(url.toString(), { timeout: CONFIG.FETCH_TIMEOUT });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const formatted = data.hits.map(hit => API.formatModrinthProject(hit));

      Cache.set(cacheKey, {
        projects: formatted,
        total: data.total_hits,
        page
      });

      return {
        projects: formatted,
        total: data.total_hits,
        page
      };
    } catch (error) {
      console.error('Modrinth搜索失败:', error);
      throw error;
    }
  },

  // 获取Modrinth项目详情
  getModrinthProject: async (id) => {
    try {
      const url = `${CONFIG.APIS.MODRINTH.BASE_URL}${CONFIG.APIS.MODRINTH.PROJECT}/${id}`;
      const response = await fetch(url, { timeout: CONFIG.FETCH_TIMEOUT });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error('获取Modrinth项目详情失败:', error);
      throw error;
    }
  },

  // 格式化Modrinth项目
  formatModrinthProject: (project) => {
    return {
      id: project.project_id || project.slug,
      slug: project.slug,
      name: project.title,
      description: project.description,
      author: project.author,
      icon: project.icon_url,
      downloads: project.downloads,
      follows: project.follows,
      category: project.categories?.[0] || '杂项',
      updated: project.date_modified,
      created: project.date_created,
      featured: project.featured,
      versions: project.versions || [],
      platform: 'modrinth',
      url: `https://modrinth.com/plugin/${project.slug}`,
      loaders: project.loaders || []
    };
  },

  // 获取SpigotMC资源列表
  searchSpigot: async (query, page = 1, sort = 'downloads') => {
    const cacheKey = `spigot_search_${query}_${page}_${sort}`;
    const cached = Cache.get(cacheKey);
    if (cached) return cached;

    try {
      let url;
      if (query && query.trim()) {
        url = `${CONFIG.APIS.SPIGOT.BASE_URL}${CONFIG.APIS.SPIGOT.SEARCH}/${encodeURIComponent(query)}`;
      } else {
        url = `${CONFIG.APIS.SPIGOT.BASE_URL}${CONFIG.APIS.SPIGOT.RESOURCES}`;
      }

      url += `?size=${CONFIG.ITEMS_PER_PAGE}&page=${page}&sort=${sort}`;

      const response = await fetch(url, { timeout: CONFIG.FETCH_TIMEOUT });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      // SpigotMC返回数组或对象，需要处理
      let projects = Array.isArray(data) ? data : data.data || [];
      
      const formatted = projects.map(resource => API.formatSpigotResource(resource));

      Cache.set(cacheKey, {
        projects: formatted,
        total: projects.length,
        page
      });

      return {
        projects: formatted,
        total: projects.length,
        page
      };
    } catch (error) {
      console.error('SpigotMC搜索失败:', error);
      throw error;
    }
  },

  // 获取SpigotMC资源详情
  getSpigotResource: async (id) => {
    try {
      const url = `${CONFIG.APIS.SPIGOT.BASE_URL}${CONFIG.APIS.SPIGOT.RESOURCE}/${id}`;
      const response = await fetch(url, { timeout: CONFIG.FETCH_TIMEOUT });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error('获取SpigotMC资源详情失败:', error);
      throw error;
    }
  },

  // 获取SpigotMC资源版本
  getSpigotVersions: async (id) => {
    try {
      const url = `${CONFIG.APIS.SPIGOT.BASE_URL}${CONFIG.APIS.SPIGOT.RESOURCE}/${id}/versions`;
      const response = await fetch(url, { timeout: CONFIG.FETCH_TIMEOUT });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error('获取SpigotMC版本失败:', error);
      throw error;
    }
  },

  // 格式化SpigotMC资源
  formatSpigotResource: (resource) => {
    return {
      id: resource.id,
      name: resource.name,
      description: resource.tag || '暂无描述',
      author: resource.author || '未知',
      icon: resource.icon?.url ? `https://www.spigotmc.org${resource.icon.url}` : null,
      downloads: resource.downloads || 0,
      follows: resource.rating?.average || 0,
      category: resource.category?.name || '杂项',
      updated: resource.updateDate || resource.releaseDate,
      created: resource.releaseDate,
      featured: false,
      versions: [],
      platform: 'spigot',
      url: `https://www.spigotmc.org/resources/${resource.id}/`,
      rating: resource.rating?.average || 0,
      reviews: resource.rating?.count || 0
    };
  },

  // 获取Hangar搜索结果
  searchHangar: async (query, page = 0, sort = 'downloads') => {
    const cacheKey = `hangar_search_${query}_${page}_${sort}`;
    const cached = Cache.get(cacheKey);
    if (cached) return cached;

    try {
      const url = new URL(`${CONFIG.APIS.HANGAR.BASE_URL}${CONFIG.APIS.HANGAR.PROJECTS}`);
      url.searchParams.append('q', query || '');
      url.searchParams.append('limit', CONFIG.ITEMS_PER_PAGE);
      url.searchParams.append('offset', page * CONFIG.ITEMS_PER_PAGE);
      url.searchParams.append('sort', sort);

      const response = await fetch(url.toString(), { timeout: CONFIG.FETCH_TIMEOUT });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const formatted = data.result.map(project => API.formatHangarProject(project));

      Cache.set(cacheKey, {
        projects: formatted,
        total: data.pagination.count,
        page
      });

      return {
        projects: formatted,
        total: data.pagination.count,
        page
      };
    } catch (error) {
      console.error('Hangar搜索失败:', error);
      throw error;
    }
  },

  // 获取Hangar项目详情
  getHangarProject: async (slug) => {
    try {
      const url = `${CONFIG.APIS.HANGAR.BASE_URL}${CONFIG.APIS.HANGAR.PROJECTS}/${slug}`;
      const response = await fetch(url, { timeout: CONFIG.FETCH_TIMEOUT });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error('获取Hangar项目详情失败:', error);
      throw error;
    }
  },

  // 格式化Hangar项目
  formatHangarProject: (project) => {
    return {
      id: project.namespace.slug,
      slug: project.namespace.slug,
      name: project.name,
      description: project.description,
      author: project.namespace.owner,
      icon: project.avatarUrl || null,
      downloads: project.stats.downloads,
      follows: project.stats.stars,
      category: project.category || 'MISC',
      updated: project.lastUpdated,
      created: project.createdAt,
      featured: false,
      versions: [],
      platform: 'hangar',
      url: `https://hangar.papermc.io/${project.namespace.owner}/${project.namespace.slug}`,
      loaders: []
    };
  },

  // 获取平台统计
  getStats: async (platform) => {
    try {
      if (platform === CONFIG.PLATFORMS.MODRINTH || platform === CONFIG.PLATFORMS.ALL) {
        // 获取Modrinth统计
        const modrinthSearch = await API.searchModrinth('*', 0, 'downloads');
        const modrinthStats = {
          plugins: modrinthSearch.total || 0,
          downloads: 0
        };

        if (platform === CONFIG.PLATFORMS.MODRINTH) return modrinthStats;

        if (platform === CONFIG.PLATFORMS.ALL) {
          // 如果是ALL，也获取Spigot和Hangar
          try {
            const spigotSearch = await API.searchSpigot('', 1, '-downloads');
            const hangarSearch = await API.searchHangar('', 0, '-downloads')
              .catch(e => {
                console.warn('Hangar搜索失败，跳过:', e);
                return { projects: [], total: 0 };
              });

            return {
              modrinth: modrinthStats,
              spigot: {
                plugins: spigotSearch.total || 0,
                downloads: 0
              },
              hangar: {
                plugins: hangarSearch.total || 0,
                downloads: 0
              }
            };
          } catch (e) {
            return { 
              modrinth: modrinthStats, 
              spigot: { plugins: 0, downloads: 0 },
              hangar: { plugins: 0, downloads: 0 }
            };
          }
        }
      }

      if (platform === CONFIG.PLATFORMS.SPIGOT) {
        const spigotSearch = await API.searchSpigot('', 1, '-downloads');
        return {
          plugins: spigotSearch.total || 0,
          downloads: 0
        };
      }

      if (platform === CONFIG.PLATFORMS.HANGAR) {
        const hangarSearch = await API.searchHangar('', 0, '-downloads');
        return {
          plugins: hangarSearch.total || 0,
          downloads: 0
        };
      }
    } catch (error) {
      console.error('获取统计失败:', error);
      return { plugins: 0, downloads: 0 };
    }
  },

  // 搜索所有平台
  searchAll: async (query, page = 0, sort = 'downloads') => {
    try {
      const [modrinth, spigot, hangar] = await Promise.all([
        API.searchModrinth(query, page, CONFIG.SORT_OPTIONS[sort]?.modrinth || 'downloads'),
        API.searchSpigot(query, page + 1, CONFIG.SORT_OPTIONS[sort]?.spigot || '-downloads')
          .catch(e => {
            console.warn('SpigotMC搜索失败，跳过:', e);
            return { projects: [], total: 0, page: page + 1 };
          }),
        API.searchHangar(query, page, CONFIG.SORT_OPTIONS[sort]?.hangar || '-downloads')
          .catch(e => {
            console.warn('Hangar搜索失败，跳过:', e);
            return { projects: [], total: 0, page };
          })
      ]);

      return {
        modrinth: modrinth.projects || [],
        spigot: spigot.projects || [],
        hangar: hangar.projects || [],
        total: (modrinth.total || 0) + (spigot.total || 0) + (hangar.total || 0)
      };
    } catch (error) {
      console.error('搜索所有平台失败:', error);
      return { modrinth: [], spigot: [], hangar: [], total: 0 };
    }
  }
};
