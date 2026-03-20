import React, { useState, useEffect } from 'react';

export interface ExportSettings {
  width: number;
  height: number;
  format: 'png' | 'jpeg' | 'webp' | 'bmp' | 'gif';
  quality: number; // 0-100，仅用于有损格式
  compress: boolean;
  compressionRatio: number; // 0-100，压缩比例
}

export interface ExportModalProps {
  isOpen: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onConfirm: (settings: ExportSettings) => void;
  onCancel: () => void;
}

function ExportModal({ isOpen, canvasWidth, canvasHeight, onConfirm, onCancel }: ExportModalProps) {
  const [scale, setScale] = useState(100); // 缩放比例 10-300%
  const [format, setFormat] = useState<ExportSettings['format']>('png');
  const [quality, setQuality] = useState(100);
  const [compress, setCompress] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(80);

  // 计算实际导出尺寸
  const exportWidth = Math.round((canvasWidth * scale) / 100);
  const exportHeight = Math.round((canvasHeight * scale) / 100);

  // 当画布尺寸变化时，重置缩放比例
  useEffect(() => {
    setScale(100);
  }, [canvasWidth, canvasHeight]);

  // 处理缩放比例变化
  const handleScaleChange = (value: string) => {
    const newScale = parseInt(value);
    if (!isNaN(newScale)) {
      setScale(newScale);
    }
  };

  // 确认导出
  const handleConfirm = () => {
    onConfirm({
      width: exportWidth,
      height: exportHeight,
      format,
      quality,
      compress,
      compressionRatio,
    });
  };

  // 格式选项
  const formatOptions: { value: ExportSettings['format']; label: string; description: string }[] = [
    { value: 'png', label: 'PNG - 无损压缩，支持透明', description: '' },
    { value: 'jpeg', label: 'JPEG - 有损压缩，不支持透明', description: '' },
    { value: 'webp', label: 'WebP - 现代格式，体积小', description: '' },
    { value: 'bmp', label: 'BMP - 位图格式，无压缩', description: '' },
    { value: 'gif', label: 'GIF - 支持动画和透明', description: '' },
  ];

  // 是否显示质量设置（有损格式）
  const showQuality = format === 'jpeg' || format === 'webp';

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal export-modal" onClick={(e) => e.stopPropagation()}>
        <h3>导出设置</h3>
        
        {/* 导出尺寸 - 使用滑块 */}
        <div className="export-section">
          <h4>导出尺寸</h4>
          <div className="scale-control">
            <div className="scale-slider-wrapper">
              <span className="scale-label">缩小</span>
              <input
                type="range"
                min="10"
                max="300"
                value={scale}
                onChange={(e) => handleScaleChange(e.target.value)}
                className="scale-slider"
              />
              <span className="scale-label">放大</span>
            </div>
            <div className="scale-value">{scale}%</div>
          </div>
          <div className="size-info-box">
            <div className="size-info-item">
              <span className="size-label">原始尺寸:</span>
              <span className="size-value">{canvasWidth} × {canvasHeight} px</span>
            </div>
            <div className="size-info-item">
              <span className="size-label">导出尺寸:</span>
              <span className="size-value export-size">{exportWidth} × {exportHeight} px</span>
            </div>
          </div>
        </div>

        {/* 导出格式 - 下拉选择 */}
        <div className="export-section">
          <h4>导出格式</h4>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportSettings['format'])}
            className="format-select"
          >
            {formatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 图片质量（仅有损格式） */}
        {showQuality && (
          <div className="export-section">
            <h4>图片质量</h4>
            <div className="quality-control">
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="quality-slider"
              />
              <span className="quality-value">{quality}%</span>
            </div>
            <div className="quality-hint">
              质量越高，文件越大；质量越低，文件越小但可能有损失
            </div>
          </div>
        )}

        {/* 文件压缩 */}
        <div className="export-section">
          <h4>文件压缩</h4>
          <label className="compress-toggle">
            <input
              type="checkbox"
              checked={compress}
              onChange={(e) => setCompress(e.target.checked)}
            />
            <span>启用文件大小压缩</span>
          </label>
          
          {compress && (
            <div className="compression-control">
              <div className="compression-slider-wrapper">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={compressionRatio}
                  onChange={(e) => setCompressionRatio(parseInt(e.target.value))}
                  className="compression-slider"
                />
                <span className="compression-value">{compressionRatio}%</span>
              </div>
              <div className="compression-hint">
                压缩比例越高，文件越小但质量可能下降
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onCancel}>
            取消
          </button>
          <button className="btn btn-confirm btn-export" onClick={handleConfirm}>
            <span className="icon">💾</span>
            确认导出
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
