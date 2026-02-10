const CONFIG = {
    MODRINTH_API: 'https://api.modrinth.com/v2',
    SPIGET_API: 'https://api.spiget.org/v2',
    HANGAR_API: 'https://hangar.papermc.io/api/v1',
    DEFAULT_LOCALE: 'zh',
    
    // 类别映射扩展
    CATEGORIES: [
        { 
            id: 'all', 
            name: '全部', 
            icon: 'fa-border-all', 
            modrinth: null, 
            spigot: null, 
            hangar: null 
        },
        { 
            id: 'admin', 
            name: '管理工具', 
            icon: 'fa-shield-halved', 
            modrinth: 'management', 
            spigot: 25,
            hangar: 'ADMIN_TOOLS'
        },
        { 
            id: 'gameplay', 
            name: '游戏机制', 
            icon: 'fa-bolt', 
            modrinth: 'game-mechanics',
            spigot: 22,
            hangar: 'GAMEPLAY'
        },
        { 
            id: 'world', 
            name: '世界生成', 
            icon: 'fa-globe', 
            modrinth: 'worldgen', 
            spigot: 24,
            hangar: 'WORLD_MANAGEMENT'
        },
        { 
            id: 'economy', 
            name: '经济系统', 
            icon: 'fa-coins', 
            modrinth: 'economy', 
            spigot: 21,
            hangar: 'ECONOMY'
        },
        { 
            id: 'chat', 
            name: '聊天社交', 
            icon: 'fa-comments', 
            modrinth: 'social', 
            spigot: 19,
            hangar: 'CHAT'
        },
        { 
            id: 'utility', 
            name: '实用工具', 
            icon: 'fa-wrench', 
            modrinth: 'utility', 
            spigot: 20,
            hangar: 'MISC'
        },
        { 
            id: 'protection', 
            name: '保护系统', 
            icon: 'fa-shield', 
            modrinth: 'management', 
            spigot: 23,
            hangar: 'PROTECTION'
        },
        { 
            id: 'minigames', 
            name: '库/API', 
            icon: 'fa-code', 
            modrinth: 'library', 
            spigot: 26,
            hangar: 'DEV_TOOLS'
        },
    ],

    // Hangar 分类映射
    HANGAR_CATEGORIES: {
        'ADMIN_TOOLS': '管理工具',
        'CHAT': '聊天',
        'DEV_TOOLS': '开发工具',
        'ECONOMY': '经济',
        'GAMEPLAY': '游戏机制',
        'GAMES': '游戏',
        'PROTECTION': '保护',
        'ROLE_PLAYING': '角色扮演',
        'WORLD_MANAGEMENT': '世界生成',
        'MISC': '其他',
        'UNDEFINED': '未分类'
    },

    // NEW: Loader 图标映射
    LOADER_ICONS: {
        'bukkit': 'fa-bucket',
        'bungeecord': 'fa-network-wired',
        'fabric': 'fa-shirt',
        'folia': 'fa-leaf',
        'forge': 'fa-hammer',
        'neoforge': 'fa-fire',
        'paper': 'fa-paper-plane',
        'purpur': 'fa-seedling',
        'quilt': 'fa-layer-group',
        'spigot': 'fa-faucet',
        'velocity': 'fa-bolt-lightning',
        'waterfall': 'fa-water',
        'datapack': 'fa-database'
    },

    TAG_TRANSLATIONS: {
        zh: {
            'management': '管理',
            'game-mechanics': '游戏机制',
            'worldgen': '世界',
            'economy': '经济',
            'social': '社交',
            'utility': '实用工具',
            'protection': '保护系统',
            'library': '库',
            'plugin': '插件',
            'admin_tools': '管理工具',
            'chat': '聊天',
            'dev_tools': '开发工具',
            'economy': '经济',
            'gameplay': '游戏机制',
            'games': '游戏',
            'protection': '保护',
            'role_playing': '角色扮演',
            'world_management': '世界生成',
            'misc': '其他',
            'undefined': '未分类',
            'storage': '存储',
            'cursed': '怪诞',
            'transportation': '交通',
            'technology': '科技',
            'adventure': '冒险',
            'magic': '魔法',
            'mobs': '生物',
            'food': '食物',
            'minigame': '小游戏',
            'optimization': '优化',
            'equipment': '装备',
            'decoration': '装饰',
            'bukkit': 'Bukkit',
            'bungeecord': 'BungeeCord',
            'fabric': 'Fabric',
            'folia': 'Folia',
            'forge': 'Forge',
            'neoforge': 'NeoForge',
            'paper': 'Paper',
            'purpur': 'Purpur',
            'quilt': 'Quilt',
            'spigot': 'Spigot',
            'velocity': 'Velocity',
            'waterfall': 'Waterfall',
            'datapack': '数据包'
        }
    }
};
