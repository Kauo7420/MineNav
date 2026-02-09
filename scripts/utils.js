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

const I18nService = {
    key: 'locale',
    locale: CONFIG.DEFAULT_LOCALE || 'en',
    init() {
        const stored = StorageService.get(this.key, this.locale);
        this.setLocale(stored, { persist: false });
    },
    setLocale(locale, options = {}) {
        const { persist = true } = options;
        const nextLocale = I18N_PACKS[locale] ? locale : (CONFIG.DEFAULT_LOCALE || 'en');
        this.locale = nextLocale;
        if (persist) {
            StorageService.set(this.key, nextLocale);
        }
        document.documentElement.lang = nextLocale;
        TagService.setLocale(nextLocale);
        this.apply();
        window.dispatchEvent(new CustomEvent('i18n:change', { detail: { locale: nextLocale } }));
    },
    t(key, params = {}) {
        const pack = I18N_PACKS[this.locale] || {};
        const fallbackPack = I18N_PACKS[CONFIG.DEFAULT_LOCALE || 'en'] || {};
        const template = pack[key] || fallbackPack[key] || key;
        return template.replace(/\{(\w+)\}/g, (match, token) => {
            const value = params[token];
            return value === undefined ? match : String(value);
        });
    },
    apply(root = document) {
        root.querySelectorAll('[data-i18n]').forEach(node => {
            node.textContent = this.t(node.dataset.i18n);
        });
        root.querySelectorAll('[data-i18n-html]').forEach(node => {
            node.innerHTML = this.t(node.dataset.i18nHtml);
        });
        root.querySelectorAll('[data-i18n-placeholder]').forEach(node => {
            node.setAttribute('placeholder', this.t(node.dataset.i18nPlaceholder));
        });
        root.querySelectorAll('[data-i18n-title]').forEach(node => {
            node.setAttribute('title', this.t(node.dataset.i18nTitle));
        });
        root.querySelectorAll('[data-i18n-aria-label]').forEach(node => {
            node.setAttribute('aria-label', this.t(node.dataset.i18nAriaLabel));
        });
        document.title = this.t('page.title');
    }
};

const TagService = {
    locale: CONFIG.DEFAULT_LOCALE || 'zh-CN',
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
            latestVersion: I18nService.t('card.unknown'),
            links: {}
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
                    latestVersion: latestEntry?.version_number || detail?.version || detail?.latest_version || item.version_number || I18nService.t('card.unknown'),
                    loaders: collectModrinthLoaders(detail, versionItems, item),
                    links: {
                        github: detail?.source_url,
                        discord: detail?.discord_url,
                        wiki: detail?.wiki_url
                    }
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
                const supportedVersions = extractHangarSupportedVersions(detail, versionItems);
                const supportsFolia = (detail?.tags || []).includes('SUPPORTS_FOLIA');

                metadata = {
                    supportedVersions: supportedVersions,
                    latestVersion: latestEntry.version || latestEntry.name || latestEntry.versionString || I18nService.t('card.unknown'),
                    supportsFolia,
                    links: {
                        github: detail?.links?.github || detail?.links?.source || detail?.settings?.source,
                        discord: detail?.links?.discord,
                        wiki: detail?.links?.homepage || detail?.links?.documentation
                    }
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
                    latestVersion: latestEntry?.name || latestEntry?.version || detail?.version?.name || detail?.version || I18nService.t('card.unknown'),
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

function collectModrinthLoaders(detail, versionItems, item) {
    const loaders = new Set();
    (detail?.loaders || []).forEach(loader => loaders.add(loader));
    (item?.loaders || []).forEach(loader => loaders.add(loader));
    versionItems.forEach(version => {
        (version?.loaders || []).forEach(loader => loaders.add(loader));
    });
    const allowed = new Set([
        'bukkit',
        'bungeecord',
        'fabric',
        'folia',
        'forge',
        'neoforge',
        'paper',
        'purpur',
        'quilt',
        'spigot',
        'velocity',
        'waterfall'
    ]);
    return Array.from(loaders).filter(loader => allowed.has(loader));
}

function extractHangarSupportedVersions(detail, versionItems = []) {
    const supported = detail?.supportedPlatforms?.PAPER;
    if (Array.isArray(supported) && supported.length > 0) {
        return supported;
    }
    return extractHangarMinecraftVersions(versionItems);
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

function formatVersionList(list = [], fallback = I18nService.t('card.unknown')) {
    if (!list) return fallback;
    const normalized = Array.isArray(list) ? list : [list];
    const unique = Array.from(new Set(normalized.filter(Boolean)));
    if (unique.length === 0) return fallback;
    const sorted = unique.sort(compareMinecraftVersions);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) return fallback;
    if (first === last) return first;
    return `${first} – ${last}`;
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

function formatLoaderLabel(loader) {
    if (!loader) return '';
    const labels = {
        bukkit: 'Bukkit',
        bungeecord: 'BungeeCord',
        fabric: 'Fabric',
        folia: 'Folia',
        forge: 'Forge',
        neoforge: 'NeoForge',
        paper: 'Paper',
        purpur: 'Purpur',
        quilt: 'Quilt',
        spigot: 'Spigot',
        velocity: 'Velocity',
        waterfall: 'Waterfall'
    };
    return labels[loader] || loader;
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

function renderMarkdownContent(markdown) {
    if (!markdown) return '';
    if (window.marked && window.DOMPurify) {
        const html = window.marked.parse(markdown, { breaks: true, gfm: true });
        return window.DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    }
    return escapeHtml(markdown).replace(/\n/g, '<br>');
}

// Backend favorites storage can be wired here later if needed.
