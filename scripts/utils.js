const StorageService = {
    get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            console.warn('Storage read failed:', error);
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Storage write failed:', error);
        }
    }
};

const TagService = {
    locale: CONFIG.DEFAULT_LOCALE || 'zh',
    setLocale(locale) {
        this.locale = locale;
    },
    translate(tag) {
        if (!tag) return '';
        const translations = CONFIG.TAG_TRANSLATIONS?.[this.locale] || {};
        return translations[tag] || translations[tag?.toLowerCase?.()] || tag;
    },
    translateList(tags = []) {
        return tags.map(tag => this.translate(tag)).filter(Boolean);
    }
};

const PlatformTagService = {
    MODRINTH_SPECIAL_LOADERS: new Set([
        'bukkit', 'bungeecord', 'fabric', 'folia', 'forge',
        'neoforge', 'paper', 'purpur', 'quilt', 'spigot',
        'velocity', 'waterfall'
    ]),
    MODRINTH_DATAPACK: 'datapack',
    HANGAR_SPECIAL_TAGS: {
        SUPPORTS_FOLIA: {
            key: 'folia',
            label: 'Supports Folia',
            icon: 'fa-leaf',
            className: 'special-tag special-tag-folia'
        },
        ADDON: {
            key: 'addon',
            label: 'Addon',
            icon: 'fa-puzzle-piece',
            className: 'special-tag special-tag-addon'
        },
        LIBRARY: {
            key: 'library',
            label: 'Library',
            icon: 'fa-book-open',
            className: 'special-tag special-tag-library'
        }
    },
    classifyModrinthTags(categories = [], loaders = []) {
        const normalizedLoaders = Array.isArray(loaders)
            ? loaders.map(loader => `${loader}`.toLowerCase().trim()).filter(Boolean)
            : [];
        const normalizedCategories = Array.isArray(categories)
            ? categories.map(category => `${category}`.toLowerCase().trim()).filter(Boolean)
            : [];

        const loaderCompatibility = [];
        const datapackIndicator = [];
        const consumed = new Set();

        normalizedLoaders.forEach(loader => {
            if (loader === this.MODRINTH_DATAPACK) {
                datapackIndicator.push(loader);
                consumed.add(loader);
                return;
            }

            if (this.MODRINTH_SPECIAL_LOADERS.has(loader)) {
                loaderCompatibility.push(loader);
                consumed.add(loader);
            }
        });

        const normalTags = normalizedCategories.filter(tag => !consumed.has(tag));

        return {
            loaderCompatibility: Array.from(new Set(loaderCompatibility)),
            datapackIndicator: Array.from(new Set(datapackIndicator)),
            normalTags: Array.from(new Set(normalTags))
        };
    },
    getHangarSpecialTags(tags = []) {
        if (!Array.isArray(tags) || tags.length === 0) return [];
        return tags
            .map(tag => this.HANGAR_SPECIAL_TAGS[tag])
            .filter(Boolean);
    },
    // NEW: 从 supportedPlatforms 中提取 Hangar 加载器的兼容性
    getHangarLoaderCompatibility(detail) {
        const loaders = [];
        const supportedPlatforms = detail?.supportedPlatforms;
        
        if (!supportedPlatforms || typeof supportedPlatforms !== 'object') {
            return loaders;
        }

        // Map Hangar platform keys to loader names
        const platformMap = {
            'PAPER': 'paper',
            'VELOCITY': 'velocity',
            'WATERFALL': 'waterfall'
        };

        Object.keys(supportedPlatforms).forEach(platform => {
            if (platformMap[platform] && Array.isArray(supportedPlatforms[platform]) && supportedPlatforms[platform].length > 0) {
                loaders.push(platformMap[platform]);
            }
        });

        return loaders;
    }
};

const LinkService = {
    HANGAR_LINK_MAPPINGS: {
        support: { key: 'discord', label: '加入 Discord 服务器', icon: 'fa-brands fa-discord' },
        wiki: { key: 'wiki', label: '前往 Wiki', icon: 'fa-solid fa-book' },
        source: { key: 'source', label: '查看源码', icon: 'fa-brands fa-github' },
        issues: { key: 'issues', label: '报告问题', icon: 'fa-solid fa-bug' },
        donate: { key: 'donate', label: '赞助', icon: 'fa-solid fa-heart' }
    },
    parseHangarLinks(detail) {
        const mappedLinks = {};
        const linkGroups = detail?.settings?.links;
        if (!Array.isArray(linkGroups) || linkGroups.length === 0) {
            return mappedLinks;
        }

        linkGroups.forEach(group => {
            const groupLinks = group?.links;
            if (!Array.isArray(groupLinks)) return;

            groupLinks.forEach(linkItem => {
                const name = `${linkItem?.name || ''}`.trim().toLowerCase();
                const url = `${linkItem?.url || ''}`.trim();
                const mapping = this.HANGAR_LINK_MAPPINGS[name];
                if (!mapping || !url || mappedLinks[mapping.key]) return;

                mappedLinks[mapping.key] = {
                    key: mapping.key,
                    label: mapping.label,
                    icon: mapping.icon,
                    url
                };
            });
        });

        return mappedLinks;
    },
    toRenderableLinks(links = {}) {
        return Object.values(links).filter(link => link?.url);
    }
};

const FavoritesService = {
    key: 'plugin-favorites',
    listeners: new Set(),
    getAll() {
        return StorageService.get(this.key, []);
    },
    getIds() {
        return this.getAll().map(item => item.id);
    },
    isFavorite(id) {
        return this.getAll().some(item => item.id === id);
    },
    toggle(item, platform) {
        const id = `${platform}:${getPluginId(item, platform)}`;
        const favorites = this.getAll();
        const index = favorites.findIndex(entry => entry.id === id);
        const exists = index > -1;
        const updated = exists
            ? favorites.filter(entry => entry.id !== id)
            : [...favorites, { id, platform, data: item }];
        StorageService.set(this.key, updated);
        this.notify(updated);
        return !exists;
    },
    notify(favorites) {
        this.listeners.forEach(listener => listener(favorites));
    },
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
};

const PreferenceService = {
    layoutKey: 'layout-mode',
    getLayout() {
        return StorageService.get(this.layoutKey, 'grid');
    },
    setLayout(mode) {
        StorageService.set(this.layoutKey, mode);
    }
};

const MetadataService = {
    cache: new Map(),
    async getMetadata(item, platform) {
        const id = getPluginId(item, platform);
        const cacheKey = `${platform}:${id}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const fallback = {
            supportedVersions: [],
            latestVersion: '未知',
            links: {},
            hangarPlatformVersions: [],
            loaderCompatibility: []
        };

        let metadata = fallback;
        try {
            if (platform === 'modrinth') {
                const [detail, versions] = await Promise.all([
                    ApiService.getModrinthDetail(id),
                    ApiService.getModrinthVersions(id)
                ]);
                const versionItems = Array.isArray(versions) ? versions : [];
                const latestEntry = getLatestByDate(versionItems, 'date_published');
                const supportedVersions = collectModrinthVersions(detail, versionItems, item);

                metadata = {
                    supportedVersions: supportedVersions,
                    latestVersion: latestEntry?.version_number || detail?.version || detail?.latest_version || item.version_number || '未知',
                    links: {
                        github: detail?.source_url,
                        discord: detail?.discord_url,
                        wiki: detail?.wiki_url,
                        issues: detail?.issues_url  // NEW: Add issues link
                    },
                    hangarPlatformVersions: [],
                    loaderCompatibility: detail?.loaders || item?.loaders || []
                };
            } else if (platform === 'hangar') {
                const slug = getHangarProjectSlug(item);
                if (!slug) {
                    return fallback;
                }
                const [detail, versions] = await Promise.all([
                    ApiService.getHangarDetail(slug),
                    ApiService.getHangarVersions(slug)
                ]);

                const versionItems = versions?.result || [];
                const latestEntry = getLatestByDate(versionItems, 'createdAt') || {};
                // FIXED: Only use PAPER platform for card version display
                const supportedVersions = extractHangarMinecraftVersionsFromDetail(detail, 'PAPER');
                const parsedLinks = LinkService.parseHangarLinks(detail);

                metadata = {
                    supportedVersions: supportedVersions,
                    latestVersion: latestEntry.version || latestEntry.name || latestEntry.versionString || '未知',
                    links: parsedLinks,
                    hangarPlatformVersions: getHangarVersionDisplayEntries(detail),
                    loaderCompatibility: PlatformTagService.getHangarLoaderCompatibility(detail)  // NEW: Add loader compatibility
                };
            } else {
                const [detail, versions, minecraftVersions] = await Promise.all([
                    ApiService.getSpigotDetail(id),
                    ApiService.getSpigotVersions(id),
                    ApiService.getSpigotMinecraftVersions()
                ]);
                const versionItems = Array.isArray(versions) ? versions : [];
                const latestEntry = getLatestByDate(versionItems, 'releaseDate');
                const testedVersions = resolveSpigotVersions(detail, minecraftVersions);
                metadata = {
                    supportedVersions: testedVersions,
                    latestVersion: latestEntry?.name || latestEntry?.version || detail?.version?.name || detail?.version || '未知',
                    links: {
                        github: detail?.links?.github || detail?.sourceCodeLink || detail?.githubUrl,
                        discord: detail?.links?.discord || detail?.discordUrl,
                        wiki: detail?.documentation || detail?.wikiUrl
                    },
                    hangarPlatformVersions: [],
                    loaderCompatibility: []
                };
            }
        } catch (error) {
            console.warn('Metadata load failed:', error);
        }

        this.cache.set(cacheKey, metadata);
        return metadata;
    }
};

function getPluginId(item, platform) {
    if (platform === 'modrinth') return item.project_id || item.id || item.slug;
    if (platform === 'hangar') return item.namespace?.slug || item.slug || item.name;
    return item.id;
}

function getHangarProjectSlug(item) {
    const owner = item?.namespace?.owner || item?.owner?.name || item?.owner;
    const slug = item?.namespace?.slug || item?.slug || item?.name;
    if (!owner || !slug) return '';
    return `${owner}/${slug}`;
}

function collectModrinthVersions(detail, versionItems, item) {
    const versions = new Set();
    (detail?.game_versions || []).forEach(version => versions.add(version));
    (item?.versions || []).forEach(version => versions.add(version));
    versionItems.forEach(version => {
        (version?.game_versions || []).forEach(gameVersion => versions.add(gameVersion));
    });
    return Array.from(versions);
}


function extractHangarPlatformVersionMap(detail) {
    const targets = ['PAPER', 'VELOCITY', 'WATERFALL'];
    const versionMap = {};
    const supportedPlatforms = detail?.supportedPlatforms;

    if (!supportedPlatforms || typeof supportedPlatforms !== 'object') {
        return versionMap;
    }

    targets.forEach(target => {
        const platformVersions = supportedPlatforms[target];
        if (!Array.isArray(platformVersions) || platformVersions.length === 0) return;
        versionMap[target] = Array.from(new Set(platformVersions.filter(Boolean)));
    });

    return versionMap;
}

function getHangarVersionDisplayEntries(detail) {
    const versionMap = extractHangarPlatformVersionMap(detail);
    return Object.entries(versionMap).map(([platform, versions]) => ({
        platform,
        versions,
        formatted: formatVersionList(versions, '未知')
    }));
}

// FIXED: Add platformFilter parameter to support PAPER-only filtering for cards
function extractHangarMinecraftVersionsFromDetail(detail, platformFilter = null) {
    try {
        const versionMap = extractHangarPlatformVersionMap(detail);
        
        // If platformFilter is specified (e.g., 'PAPER'), return only that platform's versions
        if (platformFilter && versionMap[platformFilter]) {
            return versionMap[platformFilter];
        }
        
        // For detail view, return all platforms
        return Object.values(versionMap).flat();
    } catch (e) {
        console.warn('Invalid Hangar supportedPlatforms structure:', e);
        return [];
    }
}

function formatVersionList(list = [], fallback = '未知') {
    if (!list) return fallback;
    const normalized = Array.isArray(list) ? list : [list];
    const unique = Array.from(new Set(normalized.filter(Boolean)));
    if (unique.length === 0) return fallback;
    const sorted = unique.sort(compareMinecraftVersions);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) return fallback;
    if (first === last) return first;
    return `${first} - ${last}`;
}

function compareMinecraftVersions(a, b) {
    const aParts = parseVersionParts(a);
    const bParts = parseVersionParts(b);
    const maxLength = Math.max(aParts.length, bParts.length);
    for (let i = 0; i < maxLength; i += 1) {
        const aVal = aParts[i] ?? 0;
        const bVal = bParts[i] ?? 0;
        if (aVal !== bVal) return aVal - bVal;
    }
    return `${a}`.localeCompare(`${b}`);
}

function parseVersionParts(version) {
    if (!version) return [];
    const match = `${version}`.match(/\d+(?:\.\d+)*/);
    if (!match) return [];
    return match[0].split('.').map(part => Number.parseInt(part, 10));
}

function getLatestByDate(items = [], key) {
    if (!Array.isArray(items) || items.length === 0) return null;
    return items.reduce((latest, current) => {
        const currentDate = new Date(current?.[key] || 0).getTime();
        const latestDate = new Date(latest?.[key] || 0).getTime();
        return currentDate > latestDate ? current : latest;
    }, items[0]);
}

function resolveSpigotVersions(detail, minecraftVersions) {
    const versions = detail?.testedVersions || detail?.versions || [];
    const normalized = Array.isArray(versions) ? versions : [versions];
    if (!Array.isArray(minecraftVersions) || minecraftVersions.length === 0) {
        return normalized.map(String);
    }
    const versionMap = new Map(minecraftVersions.map(version => [version.id, version.name]));
    return normalized.map(version => {
        if (typeof version === 'number') return versionMap.get(version) || `${version}`;
        if (typeof version === 'object' && version?.id) return versionMap.get(version.id) || `${version.name || version.id}`;
        return `${version}`;
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return `${text}`.replace(/[&<>"']/g, match => map[match]);
}

// FIXED: Remove markdown rendering, display as plain text
function renderMarkdownContent(markdown) {
    if (!markdown) return '';
    // Simply escape HTML and preserve line breaks
    return escapeHtml(markdown).replace(/\n/g, '<br>');
}

// Backend favorites storage can be wired here later if needed.
