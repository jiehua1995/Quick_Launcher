document.addEventListener('DOMContentLoaded', () => {
  window.electron.getApps();
  
  window.electron.onSendApps((data) => {
    const appListContainer = document.getElementById('app-list-container');
    appListContainer.innerHTML = '';
    
    // 按类别分组
    const categories = {};
    data.items.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    // 创建每个类别的HTML
    for (const category in categories) {
      const categorySection = document.createElement('div');
      categorySection.classList.add('mb-6');
      
      // 类别标题
      const categoryTitle = document.createElement('h2');
      categoryTitle.classList.add('text-lg', 'font-bold', 'mb-2', 'text-gray-700');
      categoryTitle.textContent = category;
      categorySection.appendChild(categoryTitle);
      
      // 图标列表
      const appList = document.createElement('div');
      appList.classList.add('grid', 'grid-cols-4', 'md:grid-cols-6', 'lg:grid-cols-8', 'xl:grid-cols-10', 'gap-4');
      
      categories[category].forEach((item) => {
        const appItem = document.createElement('div');
        appItem.classList.add('app-item', 'flex', 'flex-col', 'items-center', 'p-4', 'bg-white', 'rounded-lg', 'shadow-md', 'cursor-pointer', 'hover:bg-gray-100');
        appItem.innerHTML = `
          <img src="${item.icon}" alt="${item.name}" class="app-icon w-16 h-16 mb-2" />
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
        appList.appendChild(appItem);
      });
      
      categorySection.appendChild(appList);
      appListContainer.appendChild(categorySection);
    }
  });

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

function checkForNewRelease() {
  const repo = "jiehua1995/Quick_Launcher"; // 替换为你的GitHub仓库
  fetch(`https://api.github.com/repos/${repo}/releases/latest`)
    .then(response => response.json())
    .then(data => {
      // 获取最新的版本号，并移除前缀 v
      const latestVersion = data.tag_name.replace(/^v/, '');
      const currentVersion = "0.0.2"; // 替换为package.json中的当前版本

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
    <button onclick="window.open('${url}', '_blank')" class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded">
      Click here
    </button>
  `;
  footer.appendChild(notification);
}
