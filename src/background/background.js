// Background Service Worker
console.log('图片处理助手 Background Service Worker 已启动');

// 插件安装或更新时触发
chrome.runtime.onInstalled.addListener((details) => {
  console.log('图片处理助手已安装/更新', details);

  // 设置默认配置
  chrome.storage.sync.set({
    autoDownload: false,
    keepOriginal: true,
    imageQuality: 0.9,
  });

  // 创建右键菜单
  chrome.contextMenus.create({
    id: 'imageProcessor',
    title: '图片处理',
    contexts: ['image'],
  });

  chrome.contextMenus.create({
    id: 'processImage',
    parentId: 'imageProcessor',
    title: '处理此图片',
    contexts: ['image'],
  });

  chrome.contextMenus.create({
    id: 'downloadImage',
    parentId: 'imageProcessor',
    title: '下载图片',
    contexts: ['image'],
  });
});

// 监听来自popup和content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);

  switch (request.action) {
    case 'capture':
      handleCapture(sendResponse);
      return true; // 保持消息通道开启以进行异步响应

    case 'upload':
      handleUpload(request, sendResponse);
      return true;

    case 'extractImages':
      handleExtractImages(request, sendResponse);
      return true;

    case 'downloadImage':
      handleDownloadImage(request, sendResponse);
      return true;

    default:
      sendResponse({ success: false, error: '未知操作' });
  }
});

// 处理截图
async function handleCapture(sendResponse) {
  try {
    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 截取可见区域
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
    });

    console.log('截图成功');

    // 可以在这里添加图片处理逻辑
    // 例如：保存到storage、下载等

    sendResponse({ success: true, dataUrl: dataUrl });
  } catch (error) {
    console.error('截图失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 处理上传
function handleUpload(request, sendResponse) {
  try {
    console.log(`处理 ${request.fileCount} 个上传的文件`);

    // 这里可以添加图片处理逻辑

    sendResponse({ success: true, message: '上传成功' });
  } catch (error) {
    console.error('上传处理失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 处理图片提取
function handleExtractImages(request, sendResponse) {
  try {
    console.log('处理图片提取请求');

    // 这里可以添加额外的处理逻辑

    sendResponse({ success: true });
  } catch (error) {
    console.error('图片提取处理失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 处理图片下载
function handleDownloadImage(request, sendResponse) {
  try {
    chrome.downloads.download({
      url: request.url,
      filename: `image_${Date.now()}.png`,
    });
    sendResponse({ success: true });
  } catch (error) {
    console.error('下载失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'processImage') {
    console.log('处理图片:', info.srcUrl);
    // 这里可以添加图片处理逻辑
  } else if (info.menuItemId === 'downloadImage') {
    chrome.downloads.download({
      url: info.srcUrl,
      filename: `image_${Date.now()}.png`,
    });
  }
});