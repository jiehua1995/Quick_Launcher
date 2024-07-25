document.addEventListener('DOMContentLoaded', () => {
  window.electron.getApps();
  
  window.electron.onSendApps((data) => {
    const appList = document.getElementById('app-list');
    appList.innerHTML = '';
    data.items.forEach((item) => {
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
});
