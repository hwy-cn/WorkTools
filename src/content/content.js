// Content Script - 在网页中运行的脚本
console.log('图片处理助手 Content Script 已加载');

// 监听来自popup和background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content Script 收到消息:', request);

  switch (request.action) {
    case 'extractImages':
      extractImagesFromPage(sendResponse);
      return true; // 保持消息通道开启

    case 'highlightImages':
      highlightAllImages();
      sendResponse({ success: true });
      break;

    case 'removeHighlight':
      removeImageHighlight();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: '未知操作' });
  }
});

// 提取页面中的所有图片
function extractImagesFromPage(sendResponse) {
  try {
    // 获取所有img标签
    const images = document.querySelectorAll('img');
    const imageData = [];

    images.forEach((img, index) => {
      // 过滤掉太小的图片（可能是图标或装饰性图片）
      if (img.naturalWidth > 50 && img.naturalHeight > 50) {
        imageData.push({
          index: index,
          src: img.src,
          alt: img.alt || '',
          width: img.naturalWidth,
          height: img.naturalHeight,
          displayWidth: img.width,
          displayHeight: img.height,
        });
      }
    });

    // 也获取背景图片
    const elementsWithBg = document.querySelectorAll('*');
    elementsWithBg.forEach((element) => {
      const bgImage = window.getComputedStyle(element).backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
          imageData.push({
            src: urlMatch[1],
            type: 'background',
            alt: '背景图片',
          });
        }
      }
    });

    console.log(`找到 ${imageData.length} 张图片`);

    sendResponse({
      success: true,
      count: imageData.length,
      images: imageData,
    });
  } catch (error) {
    console.error('提取图片失败:', error);
    sendResponse({
      success: false,
      error: error.message,
    });
  }
}

// 高亮显示所有图片
function highlightAllImages() {
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    if (img.naturalWidth > 50 && img.naturalHeight > 50) {
      // 添加高亮边框
      img.style.outline = '3px solid #667eea';
      img.style.outlineOffset = '2px';
      img.classList.add('image-processor-highlight');

      // 添加悬停效果
      img.style.cursor = 'pointer';

      // 添加点击事件
      img.addEventListener('click', handleImageClick);
    }
  });
}

// 移除图片高亮
function removeImageHighlight() {
  const images = document.querySelectorAll('img.image-processor-highlight');

  images.forEach((img) => {
    img.style.outline = '';
    img.style.outlineOffset = '';
    img.style.cursor = '';
    img.classList.remove('image-processor-highlight');
    img.removeEventListener('click', handleImageClick);
  });
}

// 处理图片点击
function handleImageClick(event) {
  event.preventDefault();
  event.stopPropagation();

  const img = event.target;

  // 创建浮层显示图片信息
  showImageInfo(img);
}

// 显示图片信息浮层
function showImageInfo(img) {
  // 移除已存在的浮层
  const existingPanel = document.getElementById('image-processor-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  // 创建浮层
  const panel = document.createElement('div');
  panel.id = 'image-processor-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    max-width: 400px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  panel.innerHTML = `
    <div style="margin-bottom: 15px;">
      <h3 style="margin: 0 0 10px 0; color: #333;">图片信息</h3>
      <button id="close-panel" style="position: absolute; top: 10px; right: 10px; border: none; background: none; font-size: 24px; cursor: pointer; color: #999;">×</button>
    </div>
    <div style="margin-bottom: 10px;">
      <img src="${img.src}" style="max-width: 100%; border-radius: 8px;" />
    </div>
    <div style="font-size: 13px; color: #666;">
      <p><strong>尺寸:</strong> ${img.naturalWidth} × ${img.naturalHeight}</p>
      <p><strong>URL:</strong> <a href="${img.src}" target="_blank" style="color: #667eea; word-break: break-all;">${img.src.substring(0, 50)}...</a></p>
    </div>
    <div style="margin-top: 15px; display: flex; gap: 10px;">
      <button id="download-img" style="flex: 1; padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">下载</button>
      <button id="copy-url" style="flex: 1; padding: 10px; background: white; color: #667eea; border: 2px solid #667eea; border-radius: 6px; cursor: pointer; font-weight: 500;">复制链接</button>
    </div>
  `;

  document.body.appendChild(panel);

  // 关闭按钮
  document.getElementById('close-panel').addEventListener('click', () => {
    panel.remove();
  });

  // 下载按钮
  document.getElementById('download-img').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: 'downloadImage',
      url: img.src,
    });
  });

  // 复制链接按钮
  document.getElementById('copy-url').addEventListener('click', () => {
    navigator.clipboard.writeText(img.src).then(() => {
      alert('链接已复制到剪贴板');
    });
  });

  // 点击外部关闭
  setTimeout(() => {
    document.addEventListener('click', function closePanel(e) {
      if (!panel.contains(e.target)) {
        panel.remove();
        document.removeEventListener('click', closePanel);
      }
    });
  }, 100);
}

// 添加键盘快捷键支持
document.addEventListener('keydown', (event) => {
  // Ctrl/Cmd + Shift + I: 高亮所有图片
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I') {
    event.preventDefault();
    highlightAllImages();
  }

  // Esc: 移除高亮
  if (event.key === 'Escape') {
    removeImageHighlight();
    const panel = document.getElementById('image-processor-panel');
    if (panel) {
      panel.remove();
    }
  }
});