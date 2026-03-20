# WorkTools Chrome 扩展

一个基于 **React + Vite** 构建的现代化Chrome浏览器扩展插件，专注于图片相关的处理功能。

## 🚀 技术栈

- **React 19** - 最新的React框架
- **Vite 8** - 极速的构建工具
- **Manifest V3** - Chrome扩展最新标准
- **原生JavaScript** - Content Script和Background使用原生JS
- **CSS3** - 现代化UI设计

##  功能特性

### 当前功能
- 🖼️ **页面截图** - 快速截取当前页面可见区域
- 📁 **图片上传** - 支持本地图片上传处理
- 🔍 **图片提取** - 智能提取网页中的所有图片（包括背景图）
- 💾 **自动下载** - 可选择自动下载处理后的图片
- 🎨 **图片高亮** - 高亮显示页面中的所有图片
- 📊 **图片信息** - 查看图片详细信息（尺寸、URL等）
- ⌨️ **快捷键支持** - Ctrl/Cmd + Shift + I 高亮图片，Esc 取消
- 🎯 **右键菜单** - 图片右键快捷操作

### 计划功能
- 图片格式转换（PNG、JPG、WebP等）
- 图片压缩优化
- 图片尺寸调整
- 批量处理功能
- 图片滤镜效果
- 水印添加
- AI图片增强

## 📁 项目结构

```
photoshop/
├── src/
│   ├── manifest.json          # 扩展配置文件
│   ├── popup/                 # React弹出窗口
│   │   ├── index.html        # HTML入口
│   │   ├── main.jsx          # React入口
│   │   ├── App.jsx           # 主组件
│   │   └── popup.css         # 样式文件
│   ├── background/           # 后台服务
│   │   └── background.js     # Service Worker
│   └── content/              # 内容脚本
│       ├── content.js        # 页面注入脚本
│       └── content.css       # 注入样式
├── public/
│   └── icons/                # 图标资源
├── dist/                     # 构建输出目录
├── vite.config.js           # Vite配置
├── package.json             # 项目配置
└── README.md               # 项目文档
```

## 🛠️ 开发指南

### 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这将启动Vite开发服务器，并在 `dist` 目录生成开发版本的扩展文件。

### 构建生产版本

```bash
npm run build
```

构建后的文件将输出到 `dist` 目录。

### 在Chrome中加载扩展

1. 打开Chrome浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist` 目录
5. 扩展安装完成！

### 调试技巧

- **Popup调试**: 右键点击扩展图标 → 检查弹出内容
- **Background调试**: 扩展管理页面 → 点击"service worker"
- **Content Script调试**: 在网页上按F12打开开发者工具

## 🎯 使用方法

### 基本操作

1. **截图处理**
   - 点击扩展图标打开弹窗
   - 点击"截图处理"按钮
   - 自动截取当前页面

2. **上传图片**
   - 点击"上传图片"按钮
   - 选择本地图片文件
   - 支持多选

3. **提取页面图片**
   - 点击"提取页面图片"按钮
   - 自动识别并统计页面中的图片
   - 过滤掉小于50x50的装饰性图片

### 快捷键

- `Ctrl/Cmd + Shift + I` - 高亮显示页面所有图片
- `Esc` - 取消高亮/关闭浮层

### 右键菜单

在图片上右键点击，可以看到"图片处理"菜单：
- 处理此图片
- 下载图片

## ⚙️ 配置选项

- **自动下载处理后的图片** - 开启后自动保存处理结果
- **保留原始图片** - 处理时保留原图

## 📦 依赖说明

### 生产依赖
- `react` - React框架
- `react-dom` - React DOM渲染

### 开发依赖
- `vite` - 构建工具
- `@vitejs/plugin-react` - Vite的React插件
- `vite-plugin-web-extension` - Vite的Chrome扩展插件
- `@types/chrome` - Chrome API类型定义
- `@types/react` - React类型定义
- `@types/react-dom` - React DOM类型定义

## 🔧 Vite配置说明

项目使用 `vite-plugin-web-extension` 插件来构建Chrome扩展：

```javascript
import webExtension from 'vite-plugin-web-extension';

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: './src/manifest.json',
      additionalInputs: ['src/content/content.js'],
    }),
  ],
});
```

## 📝 权限说明

- `activeTab` - 访问当前活动标签页
- `storage` - 保存用户设置
- `downloads` - 下载处理后的图片
- `<all_urls>` - 在所有网页上运行（用于图片提取）

## 🐛 已知问题

- 需要Node.js 20+版本（当前系统为16.20.0，可能会有兼容性警告）
- 图标资源文件尚未添加（需要准备16x16、32x32、48x48、128x128四种尺寸）
- 某些网站的CSP策略可能限制content script的功能

## 🔄 更新日志

### v1.0.0 (2026-03-19)
- ✨ 初始版本发布
- ✅ 基于React + Vite的现代化架构
- ✅ Manifest V3支持
- ✅ 截图功能
- ✅ 图片上传功能
- ✅ 页面图片提取功能
- ✅ 图片高亮显示
- ✅ 右键菜单集成
- ✅ 响应式UI设计

## 📄 许可证

MIT License

## 👨‍💻 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题或建议，请通过Issue反馈。

---

**注意**: 此扩展使用最新的技术栈构建，建议使用Node.js 20+版本进行开发。