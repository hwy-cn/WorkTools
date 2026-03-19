import React from 'react';

function App() {
  // 打开图片处理页面
  const handleOpenImageStitch = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/pages/ImageStitch/index.html')
    });
  };

  return (
    <div className="container">
      <header>
        <h1>图片处理助手</h1>
      </header>

      <main>
        <div className="section">
          <h2>功能列表</h2>
          <div className="button-group">
            <button onClick={handleOpenImageStitch} className="btn btn-primary">
              <span className="icon">🖼️</span>
              图片处理
            </button>
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