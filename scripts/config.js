const CONFIG = {
    MODRINTH_API: 'https://api.modrinth.com/v2',
    // 注意：在纯前端环境直接访问 Spiget 可能会有 CORS 问题。
    // 在生产环境中，建议使用反向代理。此处使用 CORS 代理进行演示。
    SPIGET_API: 'https://api.spiget.org/v2', 
    
    // 类别映射 (中文显示)
    CATEGORIES: [
        { id: 'all', name: '全部', icon: 'fa-border-all', modrinth: null, spigot: null },
        { id: 'admin', name: '管理工具', icon: 'fa-shield-halved', modrinth: 'administration', spigot: 25 }, // Spigot 25=Admin
        { id: 'gameplay', name: '游戏机制', icon: 'fa-bolt', modrinth: 'gameplay', spigot: 22 }, // Spigot 22=Mechanics
        { id: 'world', name: '世界管理', icon: 'fa-globe', modrinth: 'world-management', spigot: 24 }, // Spigot 24=World
        { id: 'economy', name: '经济系统', icon: 'fa-coins', modrinth: 'economy', spigot: 21 }, // Spigot 21=Economy
        { id: 'chat', name: '聊天社交', icon: 'fa-comments', modrinth: 'chat', spigot: 19 }, // Spigot 19=Chat
        { id: 'utility', name: '实用工具', icon: 'fa-wrench', modrinth: 'utility', spigot: 20 }, // Spigot 20=Tools
        { id: 'dev', name: '开发工具', icon: 'fa-code', modrinth: 'library', spigot: 26 } // Spigot 26=Misc (approx)
    ]
};