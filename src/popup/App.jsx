import React, { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState({ message: '准备就绪', type: 'info' });
  const [settings, setSettings] = useState({
    autoDownload: false,
    keepOriginal: false,
  });

  // 加载保存的设置
  useEffect(() => {
    chrome.storage.sync.get(['autoDownload', 'keepOriginal'], (result) => {
      setSettings({
        autoDownload: result.autoDownload || false,
        keepOriginal: result.keepOriginal || false,
      });
    });
  }, []);

  // 更新状态显示
  const updateStatus = (message, type = 'info') => {
    setStatus({ message, type });
  };

  // 保存设置
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    chrome.storage.sync.set({ [key]: value });
    updateStatus('设置已保存', 'success');
    setTimeout(() => updateStatus('准备就绪', 'info'), 2000);
  };

  // 截图处理
  const handleCapture = async () => {
    try {
      updateStatus('正在截图...', 'info');
      chrome.runtime.sendMessage({ action: 'capture' }, (response) => {
        if (response && response.success) {
          updateStatus('截图成功！', 'success');
        } else {
          updateStatus('截图失败', 'error');
        }
      });
    } catch (error) {
      console.error('截图错误:', error);
      updateStatus('截图失败: ' + error.message, 'error');
    }
  };

  // 上传图片
  const handleUpload = () => {
    try {
      updateStatus('准备上传图片...', 'info');
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;

      input.onchange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
          updateStatus(`已选择 ${files.length} 个图片`, 'success');
          chrome.runtime.sendMessage({
            action: 'upload',
            fileCount: files.length,
          });
        }
      };

      input.click();
    } catch (error) {
      console.error('上传错误:', error);
      updateStatus('上传失败: ' + error.message, 'error');
    }
  };

  // 提取页面图片
  const handleExtractImages = async () => {
    try {
      updateStatus('正在提取页面图片...', 'info');
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      chrome.tabs.sendMessage(tab.id, { action: 'extractImages' }, (response) => {
        if (chrome.runtime.lastError) {
          updateStatus('无法访问此页面', 'error');
          return;
        }

        if (response && response.success) {
          updateStatus(`找到 ${response.count} 张图片`, 'success');
        } else {
          updateStatus('未找到图片', 'error');
        }
      });
    } catch (error) {
      console.error('提取错误:', error);
      updateStatus('提取失败: ' + error.message, 'error');
    }
  };

  // 获取状态样式
  const getStatusStyle = () => {
    const baseStyle = {
      padding: '10px',
      borderLeft: '3px solid',
      borderRadius: '4px',
      fontSize: '13px',
      fontWeight: '500',
    };

    switch (status.type) {
      case 'success':
        return { ...baseStyle, background: '#d4edda', borderLeftColor: '#28a745', color: '#155724' };
      case 'error':
        return { ...baseStyle, background: '#f8d7da', borderLeftColor: '#dc3545', color: '#721c24' };
      default:
        return { ...baseStyle, background: '#f0f4ff', borderLeftColor: '#667eea', color: '#667eea' };
    }
  };

  return (
    <div className="container">
      <header>
        <h1>图片处理助手</h1>
      </header>

      <main>
        <div className="section">
          <h2>功能区域</h2>
          <div className="button-group">
            <button onClick={handleCapture} className="btn btn-primary">
              <span className="icon">📸</span>
              截图处理
            </button>
            <button onClick={handleUpload} className="btn btn-secondary">
              <span className="icon">📁</span>
              上传图片
            </button>
            <button onClick={handleExtractImages} className="btn btn-secondary">
              <span className="icon">🖼️</span>
              提取页面图片
            </button>
          </div>
        </div>

        <div className="section">
          <h2>快速操作</h2>
          <div className="options">
            <label className="option-item">
              <input
                type="checkbox"
                checked={settings.autoDownload}
                onChange={(e) => handleSettingChange('autoDownload', e.target.checked)}
              />
              <span>自动下载处理后的图片</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={settings.keepOriginal}
                onChange={(e) => handleSettingChange('keepOriginal', e.target.checked)}
              />
              <span>保留原始图片</span>
            </label>
          </div>
        </div>

        <div className="section status-section">
          <div className="status" style={getStatusStyle()}>
            {status.message}
          </div>
        </div>
      </main>

      <footer>
        <p>版本 1.0.0 | React + Vite</p>
      </footer>
    </div>
  );
}

export default App;