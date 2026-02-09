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
            links: {}
        };

        let metadata = fallback;
        try {
            if (platform === 'modrinth') {
                const detail = await ApiService.getModrinthDetail(id);
                metadata = {
                    supportedVersions: detail?.game_versions || item.versions || [],
                    latestVersion: detail?.version || detail?.latest_version || item.version_number || '未知',
                    links: {
                        github: detail?.source_url,
                        discord: detail?.discord_url,
                        wiki: detail?.wiki_url
                    }
                };

                if (metadata.latestVersion === detail?.latest_version && detail?.latest_version) {
                    const versionInfo = await ApiService.getModrinthVersion(detail.latest_version);
                    metadata.latestVersion = versionInfo?.version_number || metadata.latestVersion;
                }
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
                metadata = {
                    supportedVersions: detail?.testedVersions || detail?.versions || [],
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

function formatVersionList(list = [], fallback = '未知') {
    if (!list) return fallback;
    const normalized = Array.isArray(list) ? list : [list];
    if (normalized.length === 0) return fallback;
    const limited = normalized.slice(0, 3).join(', ');
    return normalized.length > 3 ? `${limited} +${normalized.length - 3}` : limited;
}

// Backend favorites storage can be wired here later if needed.
