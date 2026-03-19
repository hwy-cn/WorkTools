# 开发指南

## 项目架构

这是一个基于 **React + Vite** 的Chrome扩展项目，采用Manifest V3标准。

### 核心组件

1. **Popup (React)** - 用户界面
   - 使用React构建的现代化UI
   - 状态管理使用React Hooks
   - 与Background和Content Script通信

2. **Background Service Worker** - 后台服务
   - 处理截图、下载等功能
   - 管理右键菜单
   - 消息中转站

3. **Content Script** - 页面注入脚本
   - 提取页面图片
   - 图片高亮显示
   - 键盘快捷键支持

## 开发流程

### 1. 启动开发环境

```bash
npm run dev
```

Vite会监听文件变化并自动重新构建。

### 2. 加载扩展到Chrome

1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist` 目录

### 3. 修改代码

- **修改Popup**: 编辑 `src/popup/App.jsx` 或 `src/popup/popup.css`
- **修改Background**: 编辑 `src/background/background.js`
- **修改Content Script**: 编辑 `src/content/content.js`

### 4. 重新加载扩展

修改代码后：
1. Vite会自动重新构建
2. 在Chrome扩展管理页面点击刷新图标
3. 或者使用快捷键 `Ctrl+R` 刷新扩展

## 消息通信

### Popup → Background

```javascript
chrome.runtime.sendMessage({ action: 'capture' }, (response) => {
  console.log(response);
});
```

### Popup → Content Script

```javascript
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
chrome.tabs.sendMessage(tab.id, { action: 'extractImages' }, (response) => {
  console.log(response);
});
```

### Content Script → Background

```javascript
chrome.runtime.sendMessage({ action: 'downloadImage', url: imageUrl });
```

## 调试技巧

### Popup调试

1. 右键点击扩展图标
2. 选择"检查弹出内容"
3. 打开DevTools

### Background调试

1. 在扩展管理页面找到你的扩展
2. 点击"service worker"链接
3. 打开DevTools

### Content Script调试

1. 在任意网页按F12打开DevTools
2. Content Script的日志会显示在Console中
3. 可以在Sources面板中找到content.js文件

## 常见问题

### Q: 修改代码后没有生效？

A: 确保：
1. Vite开发服务器正在运行
2. 在Chrome中刷新了扩展
3. 刷新了测试页面（对于Content Script）

### Q: 如何添加新的React组件？

A: 
1. 在 `src/popup/` 目录下创建新组件
2. 在 `App.jsx` 中导入并使用
3. Vite会自动处理热更新

### Q: 如何添加新的依赖？

A:
```bash
npm install package-name
```

然后在代码中导入使用。

### Q: 构建生产版本？

A:
```bash
npm run build
```

生产版本会输出到 `dist` 目录，文件会被压缩优化。

## 代码规范

### React组件

- 使用函数组件和Hooks
- 组件名使用PascalCase
- 文件名使用PascalCase（如 `App.jsx`）

### 样式

- 使用CSS文件，不使用内联样式（除非必要）
- 类名使用kebab-case
- 使用CSS变量管理主题色

### JavaScript

- 使用ES6+语法
- 使用async/await处理异步操作
- 添加适当的错误处理

## 性能优化

1. **代码分割**: Vite自动处理
2. **懒加载**: 对大型组件使用React.lazy
3. **缓存**: 使用chrome.storage缓存数据
4. **防抖节流**: 对频繁操作使用防抖/节流

## 发布准备

### 1. 准备图标

在 `public/icons/` 目录下放置所需尺寸的图标。

### 2. 更新版本号

修改 `src/manifest.json` 和 `package.json` 中的版本号。

### 3. 构建生产版本

```bash
npm run build
```

### 4. 测试

在Chrome中加载 `dist` 目录，全面测试所有功能。

### 5. 打包

将 `dist` 目录压缩为zip文件，准备上传到Chrome Web Store。

## 扩展功能

### 添加新的图片处理功能

1. 在 `src/popup/App.jsx` 中添加UI按钮
2. 在 `src/background/background.js` 中添加处理逻辑
3. 如需页面交互，在 `src/content/content.js` 中添加功能

### 添加新的存储选项

```javascript
// 保存
chrome.storage.sync.set({ key: value });

// 读取
chrome.storage.sync.get(['key'], (result) => {
  console.log(result.key);
});
```

## 资源链接

- [Chrome扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [React文档](https://react.dev/)
- [Vite文档](https://vitejs.dev/)
- [vite-plugin-web-extension](https://github.com/aklinker1/vite-plugin-web-extension)