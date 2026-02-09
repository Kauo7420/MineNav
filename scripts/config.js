const CONFIG = {
    MODRINTH_API: 'https://api.modrinth.com/v2',
    SPIGET_API: 'https://api.spiget.org/v2',
    HANGAR_API: 'https://hangar.papermc.io/api/v1', // 新增
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
            name: '世界', 
            icon: 'fa-globe', 
            modrinth: 'worldgen', 
            spigot: 24,
            hangar: 'WORLD_MANAGEMENT'
        },
        { 
            id: 'economy', 
            name: '经济', 
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
            modrinth: 'protection', 
            spigot: 23,
            hangar: 'PROTECTION'
        },
        { 
            id: 'minigames', 
            name: '库', 
            icon: 'fa-code', 
            modrinth: 'library', 
            spigot: 26,
            hangar: 'DEV_TOOLS'
        },
    ],

    // Hangar 分类映射
    HANGAR_CATEGORIES: 
    {
        'ADMIN_TOOLS': '管理工具',
        'CHAT': '聊天',
        'DEV_TOOLS': '开发工具',
        'ECONOMY': '经济',
        'GAMEPLAY': '游戏机制',
        'GAMES': '游戏',
        'PROTECTION': '保护',
        'ROLE_PLAYING': '角色扮演',
        'WORLD_MANAGEMENT': '世界管理',
        'MISC': '其他',
        'UNDEFINED': '未分类'
    },

    TAG_TRANSLATIONS: {
        zh: {
            'management': '管理工具',
            'game-mechanics': '游戏机制',
            'worldgen': '世界',
            'economy': '经济',
            'social': '聊天社交',
            'utility': '实用工具',
            'protection': '保护系统',
            'library': '库',
            'plugin': '插件',
            'ADMIN_TOOLS': '管理工具',
            'CHAT': '聊天',
            'DEV_TOOLS': '开发工具',
            'ECONOMY': '经济',
            'GAMEPLAY': '游戏机制',
            'GAMES': '游戏',
            'PROTECTION': '保护',
            'ROLE_PLAYING': '角色扮演',
            'WORLD_MANAGEMENT': '世界管理',
            'MISC': '其他',
            'UNDEFINED': '未分类'
        }
    }
};
