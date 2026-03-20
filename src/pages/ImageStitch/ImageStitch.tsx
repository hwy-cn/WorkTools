import React, { useState, useRef, useEffect } from "react";
import CanvasEditor from "./components/CanvasEditor";
import ImageList from "./components/ImageList";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import UploadSection from "./components/UploadSection";
import { ImageData, CanvasEditorRef } from "./types";

function ImageStitch() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<(string | number)[]>([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // 默认使用暗色主题
  const canvasEditorRef = useRef<CanvasEditorRef>(null);

  // 应用主题到 body
  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkTheme]);

  // 切换主题
  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  // 处理上传的图片
  const handleUpload = (newImages) => {
    setImages((prev) => [...prev, ...newImages]);
  };

  // 处理拖拽上传的文件
  const handleUploadFiles = (files) => {
    const newImages = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      src: URL.createObjectURL(file),
      file: file,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  // 处理图片重新排序
  const handleReorder = (newImages) => {
    setImages(newImages);
  };

  // 显示删除确认对话框
  const handleDeleteClick = (index) => {
    setDeleteConfirm(index);
  };

  // 确认删除
  const handleConfirmDelete = (index) => {
    const deletedImageId = images[index]?.id;
    setImages((prev) => prev.filter((_, i) => i !== index));
    setDeleteConfirm(null);
    // 如果删除的是选中的图片，从选中列表中移除
    if (deletedImageId && selectedImageIds.includes(deletedImageId)) {
      setSelectedImageIds((prev) => prev.filter((id) => id !== deletedImageId));
    }
  };

  // 取消删除
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // 清空所有图片
  const handleClearAll = () => {
    setImages([]);
    setSelectedImageIds([]);
  };

  // 处理图片选择（支持多选）
  const handleSelectImage = (imageId, isMultiSelect) => {
    setSelectedImageIds((prevIds) => {
      let newSelectedIds;

      if (isMultiSelect) {
        // Ctrl/Cmd + 点击：添加到选中列表（不取消已选中的）
        if (!prevIds.includes(imageId)) {
          newSelectedIds = [...prevIds, imageId];
        } else {
          // 如果已经选中，保持选中状态
          newSelectedIds = prevIds;
        }
      } else {
        // 单击：只选中当前项
        newSelectedIds = [imageId];
      }

      // 通知画布选中对应的对象
      if (canvasEditorRef.current) {
        canvasEditorRef.current.selectImagesByIds(newSelectedIds);
      }

      return newSelectedIds;
    });
  };

  // 处理画布对象选择
  const handleCanvasSelect = (imageIds) => {
    setSelectedImageIds(imageIds || []);
  };

  return (
    <div className="image-stitch-container">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>🖼️ 图片处理工具</h1>
            <p>上传图片，拖动调整顺序</p>
          </div>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDarkTheme ? "切换到亮色主题" : "切换到暗色主题"}
          >
            {isDarkTheme ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* 左侧：图片列表 */}
        <aside className="sidebar">
          <UploadSection
            onUpload={handleUpload}
            onClearAll={handleClearAll}
            hasImages={images.length > 0}
          />

          <ImageList
            images={images}
            onReorder={handleReorder}
            onDelete={handleDeleteClick}
            selectedImageIds={selectedImageIds}
            onSelectImage={handleSelectImage}
          />
        </aside>

        {/* 右侧：编辑区域 */}
        <CanvasEditor
          ref={canvasEditorRef}
          images={images}
          onSelectImage={handleCanvasSelect}
          onUploadImages={handleUploadFiles}
        />
      </div>

      {/* 删除确认对话框 */}
      <DeleteConfirmModal
        deleteIndex={deleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default ImageStitch;
