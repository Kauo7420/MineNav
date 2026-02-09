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
            links: {}
        };

        let metadata = fallback;
        try {
            if (platform === 'modrinth') {
                const detail = await ApiService.getModrinthDetail(id);
                const versions = await ApiService.getModrinthVersions(id);
                const latest = [...versions].sort((a, b) => {
                    return new Date(b.date_published).getTime() - new Date(a.date_published).getTime();
                })[0];
                metadata = {
                    supportedVersions: detail?.game_versions || latest?.game_versions || item.versions || [],
                    latestVersion: latest?.version_number || detail?.version || detail?.latest_version || item.version_number || '未知',
                    links: {
                        github: detail?.source_url,
                        discord: detail?.discord_url,
                        wiki: detail?.wiki_url
                    }
                };
            } else if (platform === 'hangar') {
                const slug = `${item.namespace?.owner}/${item.namespace?.slug}`;
                const [detail, versions] = await Promise.all([
                    ApiService.getHangarDetail(slug),
                    ApiService.getHangarVersions(slug)
                ]);

                const versionItems = versions?.result || [];
                const latestEntry = versionItems[0] || {};
                const supportedVersions = extractHangarMinecraftVersions(versionItems);

                metadata = {
                    supportedVersions: supportedVersions,
                    latestVersion: latestEntry.version || latestEntry.name || latestEntry.versionString || '未知',
                    links: {
                        github: detail?.links?.github || detail?.links?.source || detail?.settings?.source,
                        discord: detail?.links?.discord,
                        wiki: detail?.links?.homepage || detail?.links?.documentation
                    }
                };
            } else {
                const detail = await ApiService.getSpigotDetail(id);
                const versionMap = await ApiService.getSpigotMinecraftVersions();
                const mappedVersions = normalizeSpigotVersions(detail?.testedVersions || detail?.versions, versionMap);
                metadata = {
                    supportedVersions: mappedVersions,
                    latestVersion: detail?.version?.name || detail?.version?.id || detail?.version || '未知',
                    links: {
                        github: detail?.links?.github || detail?.sourceCodeLink || detail?.githubUrl,
                        discord: detail?.links?.discord || detail?.discordUrl,
                        wiki: detail?.documentation || detail?.wikiUrl
                    }
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
    if (platform === 'hangar') return item.namespace?.slug || item.name;
    return item.id;
}

function extractHangarMinecraftVersions(versionItems = []) {
    const versions = new Set();
    versionItems.forEach(version => {
        const platforms = version?.platformDependencies || {};
        Object.values(platforms).forEach(entries => {
            (entries || []).forEach(entry => {
                if (entry?.version) versions.add(entry.version);
            });
        });
    });
    return Array.from(versions);
}

function formatVersionRange(list = [], fallback = '未知') {
    if (!list) return fallback;
    const normalized = Array.isArray(list) ? list : [list];
    if (normalized.length === 0) return fallback;
    const versions = normalized
        .map((entry) => normalizeVersionString(entry))
        .filter(Boolean);
    if (versions.length === 0) return fallback;
    versions.sort(compareVersions);
    const minVersion = versions[0];
    const maxVersion = versions[versions.length - 1];
    if (minVersion === maxVersion) return minVersion;
    return `${minVersion} - ${maxVersion}`;
}

// Backend favorites storage can be wired here later if needed.

function normalizeSpigotVersions(list, versionMap) {
    if (!list) return [];
    const items = Array.isArray(list) ? list : [list];
    return items
        .map((item) => {
            if (typeof item === 'number' || /^[0-9]+$/.test(item)) {
                return versionMap[String(item)] || item;
            }
            if (typeof item === 'object' && item?.id) {
                return versionMap[String(item.id)] || item.name || item.id;
            }
            return item?.name || item;
        })
        .filter(Boolean);
}

function normalizeVersionString(value) {
    if (!value) return null;
    const text = String(value).trim();
    const match = text.match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
    if (!match) return null;
    const parts = [match[1], match[2], match[3]].filter(Boolean).map(Number);
    if (parts.length === 1) return `${parts[0]}.0`;
    if (parts.length === 2) return `${parts[0]}.${parts[1]}`;
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

function compareVersions(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i += 1) {
        const diff = (aParts[i] || 0) - (bParts[i] || 0);
        if (diff !== 0) return diff;
    }
    return 0;
}

function renderMarkdown(markdown = '') {
    // Render Markdown safely and sanitize output to prevent XSS.
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
        return markdown;
    }

    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false
    });

    const rawHtml = marked.parse(markdown);
    return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
}
