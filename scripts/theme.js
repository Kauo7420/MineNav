// 主题管理
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// 初始化
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
} else if (prefersDark) {
    html.setAttribute('data-theme', 'dark');
}

updateIcon();

// 切换逻辑
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon();
});

function updateIcon() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}