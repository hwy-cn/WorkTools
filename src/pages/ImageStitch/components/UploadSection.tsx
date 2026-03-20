import React, { useRef } from 'react';
import { UploadSectionProps, ImageData } from '../types';

function UploadSection({ onUpload, onClearAll, hasImages }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 上传图片
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const newImages: ImageData[] = [];
    let loadedCount = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          newImages.push({
            id: Date.now() + Math.random(),
            src: event.target?.result as string,
            name: file.name,
            width: img.width,
            height: img.height,
          });

          loadedCount++;
          if (loadedCount === files.length) {
            onUpload(newImages);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    // 重置文件输入
    e.target.value = '';
  };

  // 清空所有图片
  const handleClearAll = () => {
    if (!hasImages) return;
    
    if (confirm('确定要清空所有图片吗？')) {
      onClearAll();
    }
  };

  return (
    <div className="upload-section">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
      <button
        className="btn btn-upload"
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="icon">📁</span>
        上传图片
      </button>
      {hasImages && (
        <button className="btn btn-clear" onClick={handleClearAll}>
          <span className="icon">🗑️</span>
          清空所有
        </button>
      )}
    </div>
  );
}

export default UploadSection;
