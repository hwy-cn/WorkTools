# 快速开始

## 🚀 5分钟上手指南

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发模式

```bash
npm run dev
```

这会在 `dist` 目录生成开发版本的扩展文件。

### 3. 加载到Chrome

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录
6. 完成！扩展已安装

### 4. 开始使用

- 点击浏览器工具栏的扩展图标
- 尝试各项功能：
  - 📸 截图处理
  - 📁 上传图片
  - 🖼️ 提取页面图片

### 5. 开发调试

- **修改Popup**: 编辑 `src/popup/App.jsx`
- **修改样式**: 编辑 `src/popup/popup.css`
- **修改后台逻辑**: 编辑 `src/background/background.js`
- **修改页面交互**: 编辑 `src/content/content.js`

修改后，Vite会自动重新构建，在Chrome扩展管理页面刷新扩展即可。

## 📦 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist` 目录，可以直接打包上传到Chrome Web Store。

## 📖 更多文档

- [README.md](README.md) - 完整功能介绍
- [DEVELOPMENT.md](DEVELOPMENT.md) - 详细开发指南

## ⚠️ 注意事项

1. **Node.js版本**: 建议使用 Node.js 20+ 版本
2. **图标文件**: 需要在 `public/icons/` 目录添加图标文件（参考 `public/icons/README.md`）
3. **热更新**: 修改代码后需要在Chrome中手动刷新扩展

## 🐛 遇到问题？

### 扩展无法加载
- 检查 `dist` 目录是否存在
- 确保运行了 `npm run dev` 或 `npm run build`

### 功能不工作
- 打开Chrome DevTools查看错误信息
- 检查扩展是否有必要的权限

### 构建失败
- 删除 `node_modules` 和 `dist` 目录
- 重新运行 `npm install`

## 💡 快捷键

- `Ctrl/Cmd + Shift + I` - 高亮页面所有图片
- `Esc` - 取消高亮/关闭浮层

## 🎯 下一步

1. 阅读 [DEVELOPMENT.md](DEVELOPMENT.md) 了解详细开发流程
2. 准备图标文件（参考 `public/icons/README.md`）
3. 开始添加你的图片处理功能！

---

祝你开发愉快！🎉