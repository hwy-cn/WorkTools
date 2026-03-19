# 图标占位文件

此文件夹应包含以下尺寸的图标：

- icon16.png (16x16 像素)
- icon32.png (32x32 像素)
- icon48.png (48x48 像素)
- icon128.png (128x128 像素)

## 图标设计建议

1. **风格**: 简洁、现代、易识别
2. **颜色**: 建议使用紫色渐变主题（#667eea 到 #764ba2）
3. **内容**: 可以使用图片、相机、画笔等相关图标元素
4. **格式**: PNG格式，透明背景

## 临时解决方案

在正式图标准备好之前，你可以：
1. 使用在线图标生成工具创建临时图标
2. 从 [Flaticon](https://www.flaticon.com/) 或 [Icons8](https://icons8.com/) 下载免费图标
3. 使用设计工具（如Figma、Photoshop）自行设计

## 快速生成图标

你可以使用以下工具快速生成不同尺寸的图标：
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)
- ImageMagick 命令行工具

示例 ImageMagick 命令：
```bash
convert source.png -resize 16x16 icon16.png
convert source.png -resize 32x32 icon32.png
convert source.png -resize 48x48 icon48.png
convert source.png -resize 128x128 icon128.png
```

## 注意事项

- 图标文件应放在 `public/icons/` 目录下
- Vite构建时会自动将public目录的内容复制到dist目录
- 在图标准备好之前，扩展仍可正常工作，只是会显示默认图标