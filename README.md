# PluginMarket - Minecraft 插件导航平台

一个现代化、功能完整的 Minecraft 插件导航网站，聚合来自 **Modrinth** 和 **SpigotMC** 的插件资源。

## ✨ 功能特性

### 核心功能
- 🔍 **跨平台搜索** - 同时搜索 Modrinth 和 SpigotMC 的插件
- 🎯 **智能分类** - 按管理、游戏、世界、经济等多个维度分类
- 📊 **实时统计** - 显示平台统计数据和下载量
- 🔄 **灵活排序** - 按下载量、最新、更新时间等排序
- 📱 **响应式设计** - 完美适配桌面、平板和手机

### UI/UX
- 🌓 **深色/浅色主题** - 自动检测系统偏好并支持手动切换
- ⌨️ **键盘快捷键** - 按 `/` 快速打开搜索
- ✨ **流畅动画** - 页面加载、卡片悬停、主题切换等动画效果
- ♿ **无障碍支持** - 完整的 ARIA 标签和键盘导航
- 📐 **现代设计系统** - 采用 8px 网格、CSS 自定义属性等现代实践

### 技术亮点
- 💯 **零框架** - 纯 HTML5 + CSS3 + 原生 JavaScript
- 🚀 **高性能** - 缓存策略、防抖搜索、懒加载图片
- 🛡️ **API 集成** - 完整的 Modrinth 和 SpigotMC API 支持
- 💾 **状态持久化** - localStorage 存储主题和用户偏好
- 📍 **URL 路由** - 支持分享和书签化的页面状态

## 📁 项目结构

```
index.html                 # 主 HTML 文件
styles/
  ├── variables.css       # CSS 变量和设计系统
  ├── base.css            # 基础样式和排版
  ├── layout.css          # 布局系统和网格
  ├── components.css      # UI 组件样式
  ├── sections.css        # 页面section样式
  └── animations.css      # 动画和过渡效果
scripts/
  ├── config.js           # 配置和常量
  ├── api.js              # API 集成
  ├── theme.js            # 主题管理
  ├── router.js           # 路由和状态管理
  ├── cards.js            # 卡片渲染
  ├── modal.js            # 模态框管理
  └── app.js              # 主应用程序
LICENSE                    # 许可证
README.md                  # 本文件
```

## 🚀 使用方法

### 快速开始

1. **克隆或下载项目**
   ```bash
   git clone <repository-url>
   cd MineNav
   ```

2. **打开网站**
   - 直接在浏览器中打开 `index.html`
   - 或使用本地服务器

3. **访问网站**
   享受浏览和搜索插件的体验！

## 🎨 功能使用

- **搜索**: 在顶部搜索框输入关键字或按 `/` 快速打开
- **平台选择**: 选择全部/Modrinth/SpigotMC
- **分类浏览**: 使用分类导航条筛选插件
- **排序**: 按下载量、最新发布、最近更新排序
- **主题切换**: 点击右上角的主题按钮切换深色/浅色模式
- **查看详情**: 点击插件卡片查看完整信息

## 💻 技术栈

- HTML5 - 结构
- CSS3 - 样式（采用 CSS 变量的设计系统）
- Vanilla JavaScript - 功能和交互
- Modrinth API - 插件数据源
- SpigotMC API - 插件数据源
- FontAwesome - 图标库
- Google Fonts - 字体库

## 🌐 浏览器支持

- Chrome/Chromium (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)

## ♿ 无障碍

- 完整的 ARIA 标签支持
- 键盘导航
- 高对比度模式
- 屏幕阅读器友好

## 🔒 隐私政策

- 不收集个人数据
- 所有数据请求都走官方 API
- 用户偏好存储在本地浏览器

## 📄 许可证

此项目遵循 LICENSE 文件中的许可证。

## 🙏 致谢

- Modrinth - 提供插件 API
- SpigotMC - 提供插件信息
- FontAwesome - 提供图标
- Google Fonts - 提供字体

---

**PluginMarket** - 让 Minecraft 插件发现变得简单 ✨

_最后更新: 2026年2月_
