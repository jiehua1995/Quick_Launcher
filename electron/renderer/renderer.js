document.addEventListener('DOMContentLoaded', () => {
  let allItems = [];
  let currentVersion = "0.1.1"; // 替换为你的当前版本
  let defaultTheme = "cupcake"; // 默认主题

  // 获取应用信息和设置
  window.electron.getApps();

  window.electron.onSendApps((data) => {
    allItems = data.items;
    defaultTheme = data.defaultTheme || "cupcake"; // 获取默认主题

    // 设置默认主题
    document.documentElement.setAttribute('data-theme', defaultTheme);

    const categories = [...new Set(allItems.map(item => item.category))];
    const categoryList = document.getElementById('category-list');
    const themeSelector = document.getElementById('theme-selector');

    // 设置主题选择器的初始值
    themeSelector.value = defaultTheme;

    // 创建类别列表
    categories.forEach((category) => {
      const listItem = document.createElement('li');
      listItem.classList.add('cursor-pointer', 'p-2', 'rounded-lg', 'hover:bg-secondary');
      listItem.textContent = category;
      listItem.addEventListener('click', () => {
        displayCategory(category);
        // 更新选中状态
        document.querySelectorAll('#category-list li').forEach(li => li.classList.remove('bg-primary', 'text-primary-content'));
        listItem.classList.add('bg-primary', 'text-primary-content');
      });
      categoryList.appendChild(listItem);
    });

    // 显示默认类别（或第一个类别）
    if (categories.length > 0) {
      displayCategory(categories[0]);
      // 设置默认选中的类别
      categoryList.firstChild.classList.add('bg-primary', 'text-primary-content');
    }

    // 显示当前版本
    document.getElementById('current-version').textContent = currentVersion;
  });

  // 主题选择器事件监听
  const themeSelector = document.getElementById('theme-selector');
  themeSelector.addEventListener('change', (event) => {
    document.documentElement.setAttribute('data-theme', event.target.value);
  });


  // 实现侧边栏调整功能
  const sidebar = document.getElementById('sidebar');
  const divider = document.getElementById('divider');
  const mainContent = document.getElementById('main-content');

  let isResizing = false;

  divider.addEventListener('mousedown', () => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    let newWidth = e.clientX;

    if (newWidth < 100) newWidth = 100; // 设置最小宽度
    if (newWidth > window.innerWidth * 0.5) newWidth = window.innerWidth * 0.5; // 设置最大宽度

    sidebar.style.width = `${newWidth}px`;
    mainContent.style.flex = `1 0 calc(100% - ${newWidth}px)`;
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = 'default';
    }
  });



  function displayCategory(category) {
    const appListContainer = document.getElementById('app-list-container');
    appListContainer.innerHTML = ''; // 清空之前的图标

    // 过滤并显示选定类别的图标
    const filteredItems = allItems.filter(item => item.category === category);
    filteredItems.forEach((item) => {
      const appItem = document.createElement('div');
      appItem.classList.add('app-item', 'flex', 'flex-col', 'items-center', 'p-2', 'bg-base-100', 'rounded-lg', 'shadow-md', 'cursor-pointer', 'hover:bg-base-200');
      appItem.innerHTML = `
        <img src="${item.icon}" alt="${item.name}" class="app-icon w-12 h-12 mb-2" />
        <span class="text-sm font-medium">${item.name}</span>
      `;
      appItem.addEventListener('click', () => {
        if (item.type === 'folder') {
          window.electron.openFolder(item.path);
        } else if (item.type === 'file') {
          window.electron.openFile(item.path);
        } else {
          window.electron.launchApp(item.path, item.name);
        }
      });
      appListContainer.appendChild(appItem);
    });
  }

  // 获取并显示应用数据目录
  window.electron.getUserDataPath().then((userDataPath) => {
    const userDataPathElement = document.getElementById('user-data-path');
    userDataPathElement.innerHTML = `User Data Path: <a href="#" id="user-data-link">${userDataPath}</a>`;

    // 添加点击事件以打开文件夹
    const userDataLink = document.getElementById('user-data-link');
    userDataLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.electron.openFolder(userDataPath);
    });
  }).catch((error) => {
    console.error('Failed to get user data path:', error);
  });

  // 检查GitHub上的新版本
  checkForNewRelease();
});

// 页面加载完成后，通知主进程
window.electron.notifyReady();

function checkForNewRelease() {
  const repo = "jiehua1995/Quick_Launcher"; // 替换为你的GitHub仓库
  fetch(`https://api.github.com/repos/${repo}/releases/latest`)
    .then(response => response.json())
    .then(data => {
      // 获取最新的版本号，并移除前缀 v
      const latestVersion = data.tag_name.replace(/^v/, '');
      const currentVersion = document.getElementById('current-version').textContent;

      if (currentVersion !== latestVersion) {
        // 通知用户有新版本
        showNewReleaseNotification(data.html_url);
      }
    })
    .catch(error => {
      console.error("Error fetching the latest release:", error);
    });
}

function showNewReleaseNotification(url) {
  const footer = document.getElementById('footer');
  const notification = document.createElement('p');
  notification.classList.add('mt-4', 'text-center', 'text-gray-600', 'text-sm');
  notification.innerHTML = `
    <span>New version available! </span>
    <button onclick="window.open('${url}', '_blank')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
      Click here
    </button>
  `;
  footer.appendChild(notification);
}

