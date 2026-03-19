import React, { useState } from 'react';

function ImageList({ images, onReorder, onDelete, selectedImageIds, onSelectImage }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // 拖拽开始
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 拖拽经过
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 放置
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setIsDragging(false);
      return;
    }

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    onReorder(newImages);
    setDraggedIndex(null);
    setIsDragging(false);
  };

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setIsDragging(false);
  };

  // 处理图片点击选择（支持多选）
  const handleItemClick = (e, imageId) => {
    // 如果正在拖拽，不触发选择
    if (isDragging) {
      return;
    }
    // 如果点击的是删除按钮或拖拽手柄，不触发选择
    if (e.target.closest('.item-delete') || e.target.closest('.item-drag-handle')) {
      return;
    }
    
    // 检测是否按住 Ctrl (Windows/Linux) 或 Cmd (Mac)
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelectImage(imageId, isMultiSelect);
  };

  return (
    <div className="image-list">
      <h3>图片列表 ({images.length})</h3>
      {images.length === 0 ? (
        <div className="empty-state">
          <p>暂无图片</p>
          <p className="hint">点击上方按钮上传图片</p>
        </div>
      ) : (
        <div className="list-items">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`list-item ${draggedIndex === index ? 'dragging' : ''} ${selectedImageIds.includes(image.id) ? 'selected' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={(e) => handleItemClick(e, image.id)}
            >
              <div className="item-drag-handle">
                <span>☰</span>
              </div>
              <div className="item-preview">
                <img src={image.src} alt={image.name} />
              </div>
              <div className="item-info">
                <div className="item-name" title={image.name}>
                  {image.name}
                </div>
                <div className="item-size">
                  {image.width} × {image.height}
                </div>
              </div>
              <button
                className="item-delete"
                onClick={() => onDelete(index)}
                title="删除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageList;
