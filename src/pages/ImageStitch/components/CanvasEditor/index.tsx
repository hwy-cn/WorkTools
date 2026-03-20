// @ts-nocheck - Fabric.js 类型定义复杂，暂时跳过类型检查
import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, FabricImage, ActiveSelection } from 'fabric';
import { CanvasEditorProps, CanvasEditorRef } from '../../types';
import ExportModal, { ExportSettings } from './ExportModal';

// 扩展 Fabric 对象类型以包含自定义属性
interface ExtendedFabricImage extends FabricImage {
  imageId?: string | number;
}

const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>(({ images, onExport, onSelectImage, onUploadImages }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const imageObjectsRef = useRef(new Map<string | number, any>()); // 存储已加载的图片对象
  const canvasContentRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasWidth, setCanvasWidth] = useState(0); // 初始为0，将在useEffect中计算
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('transparent'); // 默认透明
  const [isSizeLocked, setIsSizeLocked] = useState(false); // 画布尺寸锁定状态，初始为解锁
  const hasUploadedRef = useRef(false); // 记录是否已上传过图片
  const [isDraggingOver, setIsDraggingOver] = useState(false); // 拖拽状态
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // 画布平移偏移量
  const [showExportModal, setShowExportModal] = useState(false); // 导出弹窗状态

  // 初始化画布大小为父元素减20px
  useEffect(() => {
    if (canvasContentRef.current && canvasWidth === 0 && canvasHeight === 0) {
      const contentRect = canvasContentRef.current.getBoundingClientRect();
      const initWidth = Math.floor(Math.max(100, contentRect.width - 50));
      const initHeight = Math.floor(Math.max(100, contentRect.height - 50));
      setCanvasWidth(initWidth);
      setCanvasHeight(initHeight);
    }
  }, [canvasWidth, canvasHeight]);

  // 初始化 Fabric.js 画布
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current && canvasWidth > 0 && canvasHeight > 0) {
      const canvas = new Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: backgroundColor,
      });
      
      fabricCanvasRef.current = canvas;

      // 空格键 + 鼠标拖拽平移（使用 Fabric.js 内置功能）
      canvas.on('mouse:down', (opt) => {
        // @ts-ignore - Fabric.js 事件类型定义不完整
        if (opt.e.spaceBar || opt.e.button === 1) { // 空格键或鼠标中键
          setIsPanning(true);
          setPanStart({ x: opt.e.clientX, y: opt.e.clientY });
          canvas.selection = false;
        }
      });

      canvas.on('mouse:move', (opt) => {
        if (isPanning) {
          const vpt = canvas.viewportTransform;
          vpt[4] += opt.e.clientX - panStart.x;
          vpt[5] += opt.e.clientY - panStart.y;
          canvas.requestRenderAll();
          setPanStart({ x: opt.e.clientX, y: opt.e.clientY });
        }
      });

      canvas.on('mouse:up', () => {
        setIsPanning(false);
        canvas.selection = true;
      });

      // 监听对象选择事件
      canvas.on('selection:created', (e) => {
        const selected = e.selected || [];
        const imageIds = selected.map(obj => obj.imageId).filter(Boolean);
        if (onSelectImage) {
          onSelectImage(imageIds);
        }
      });

      canvas.on('selection:updated', (e) => {
        const selected = e.selected || [];
        const imageIds = selected.map(obj => obj.imageId).filter(Boolean);
        if (onSelectImage) {
          onSelectImage(imageIds);
        }
      });

      canvas.on('selection:cleared', () => {
        if (onSelectImage) {
          onSelectImage([]);
        }
      });
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      imageObjectsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasWidth, canvasHeight, backgroundColor]); // 依赖画布参数

  // 在 canvas 元素上添加拖拽事件监听，防止 Fabric.js 阻止事件
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const handleCanvasDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleCanvasDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    canvasElement.addEventListener('dragover', handleCanvasDragOver);
    canvasElement.addEventListener('drop', handleCanvasDrop);

    return () => {
      canvasElement.removeEventListener('dragover', handleCanvasDragOver);
      canvasElement.removeEventListener('drop', handleCanvasDrop);
    };
  }, []);

  // 容器级别的滚轮缩放和平移（使用 CSS transform）
  useEffect(() => {
    const contentElement = canvasContentRef.current;
    if (!contentElement) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      
      // Ctrl/Cmd + 滚轮：上下移动画布
      if (e.ctrlKey || e.metaKey) {
        setPanOffset(prev => ({
          x: prev.x,
          y: prev.y - delta
        }));
        return;
      }
      
      // Alt/Option + 滚轮：左右移动画布
      if (e.altKey) {
        setPanOffset(prev => ({
          x: prev.x - delta,
          y: prev.y
        }));
        return;
      }
      
      // 默认：缩放
      let newZoom = zoom;
      newZoom *= 0.999 ** delta;

      // 限制缩放范围
      if (newZoom > 5) newZoom = 5;
      if (newZoom < 0.1) newZoom = 0.1;

      setZoom(newZoom);
    };

    contentElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      contentElement.removeEventListener('wheel', handleWheel);
    };
  }, [zoom]);

  // 更新画布 - 只更新布局，不重新加载图片
  const updateCanvas = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // 获取当前画布上的所有对象及其自定义位置
    const customPositions = new Map();
    canvas.getObjects().forEach(obj => {
      if (obj.imageId) {
        // 保存用户自定义的位置（如果图片被移动过）
        customPositions.set(obj.imageId, {
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
        });
      }
    });

    // 清空画布
    canvas.clear();
    canvas.backgroundColor = backgroundColor;

    // 反向遍历：列表第一个最后添加，图层最高
    for (let i = images.length - 1; i >= 0; i--) {
      const image = images[i];
      try {
        let fabricImg;
        
        // 检查是否已经加载过这张图片
        if (imageObjectsRef.current.has(image.id)) {
          // 复用已加载的图片
          const cachedImg = imageObjectsRef.current.get(image.id);
          fabricImg = await FabricImage.fromObject(cachedImg.toObject());
        } else {
          // 首次加载图片
          fabricImg = await FabricImage.fromURL(image.src);
          if (!fabricImg) {
            continue;
          }
          
          // 缓存图片对象
          imageObjectsRef.current.set(image.id, fabricImg);
        }

        // 设置图片ID，用于追踪
        fabricImg.imageId = image.id;

        // 检查是否有用户自定义的位置
        const customPos = customPositions.get(image.id);
        
        if (customPos) {
          // 使用用户自定义的位置
          fabricImg.set({
            left: customPos.left,
            top: customPos.top,
            scaleX: customPos.scaleX,
            scaleY: customPos.scaleY,
            selectable: true,
            hasControls: true,
            hasBorders: true,
          });
        } else {
          // 所有新图片都居中放置在画布中心，保持原始像素大小
          fabricImg.set({
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            scaleX: 1,
            scaleY: 1,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
            hasBorders: true,
          });
        }

        canvas.add(fabricImg);
      } catch (error) {
        console.error('加载图片失败:', image.name, error);
      }
    }

    // 调整画布尺寸（保持用户设置的尺寸）
    canvas.setDimensions({
      width: canvasWidth,
      height: canvasHeight,
    });
    canvas.renderAll();
  }, [images, canvasWidth, canvasHeight, backgroundColor]);

  // 监听图片变化，更新画布
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    if (images.length > 0) {
      // 如果是第一次上传图片，根据图片大小初始化画布
      if (!hasUploadedRef.current) {
        // 计算所有新上传图片的最大尺寸
        const loadImageSizes = async () => {
          let maxWidth = 0;
          let maxHeight = 0;
          
          for (const image of images) {
            try {
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = image.src;
              });
              
              if (img.width * img.height > maxWidth * maxHeight) {
                maxWidth = img.width;
                maxHeight = img.height;
              }
            } catch (error) {
              console.error('加载图片尺寸失败:', image.name, error);
            }
          }
          
          // 如果找到了有效的图片尺寸，使用它初始化画布
          if (maxWidth > 0 && maxHeight > 0) {
            setCanvasWidth(maxWidth);
            setCanvasHeight(maxHeight);
            
            // 计算合适的缩放比例，使画布完全显示在视口内
            if (canvasContentRef.current) {
              const contentRect = canvasContentRef.current.getBoundingClientRect();
              const viewportWidth = contentRect.width - 100; // 留出边距
              const viewportHeight = contentRect.height - 100;
              
              // 计算宽度和高度的缩放比例
              const scaleX = viewportWidth / maxWidth;
              const scaleY = viewportHeight / maxHeight;
              
              // 取较小的缩放比例，确保画布完全显示
              const autoZoom = Math.min(scaleX, scaleY, 1); // 不超过100%
              
              // 如果画布大于视口，自动调整缩放
              if (autoZoom < 1) {
                setZoom(autoZoom);
              }
            }
          }
          
          // 标记已上传并锁定
          hasUploadedRef.current = true;
          setIsSizeLocked(true);
        };
        
        loadImageSizes();
      } else {
        updateCanvas();
      }
    } else {
      // 清空画布和缓存
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = backgroundColor;
      fabricCanvasRef.current.renderAll();
      imageObjectsRef.current.clear();
      
      // 重置上传标记
      hasUploadedRef.current = false;
    }
  }, [images, updateCanvas, backgroundColor]);

  // 缩放控制（使用 CSS transform）
  const handleZoomIn = useCallback(() => {
    let newZoom = Math.round((zoom + 0.01) * 100) / 100; // 增加1%
    if (newZoom > 5) newZoom = 5;
    setZoom(newZoom);
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    let newZoom = Math.round((zoom - 0.01) * 100) / 100; // 减少1%
    if (newZoom < 0.1) newZoom = 0.1;
    setZoom(newZoom);
  }, [zoom]);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  // 画布尺寸控制
  const handleCanvasSizeChange = useCallback((dimension, value) => {
    // 如果锁定，提示用户
    if (isSizeLocked) {
      alert('画布尺寸已锁定，请先点击解锁按钮');
      return;
    }
    
    // 允许空值，用于删除操作
    if (value === '') {
      if (dimension === 'width') {
        setCanvasWidth('');
      } else {
        setCanvasHeight('');
      }
      return;
    }
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    // 最小尺寸限制改为1
    if (numValue < 1) return;
    
    if (dimension === 'width') {
      setCanvasWidth(numValue);
    } else {
      setCanvasHeight(numValue);
    }
  }, [isSizeLocked]);

  // 处理画布尺寸输入框失焦
  const handleCanvasSizeBlur = useCallback((dimension) => {
    if (dimension === 'width' && (canvasWidth === '' || canvasWidth < 1)) {
      setCanvasWidth(1);
    } else if (dimension === 'height' && (canvasHeight === '' || canvasHeight < 1)) {
      setCanvasHeight(1);
    }
  }, [canvasWidth, canvasHeight]);

  // 切换锁定状态
  const toggleSizeLock = useCallback(() => {
    setIsSizeLocked(prev => !prev);
  }, []);

  // 更新画布尺寸
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.setDimensions({
        width: canvasWidth,
        height: canvasHeight,
      });
      canvas.renderAll();
    }
  }, [canvasWidth, canvasHeight]);

  // 更新画布背景色
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.backgroundColor = backgroundColor;
      canvas.renderAll();
    }
  }, [backgroundColor]);

  // 背景色变化处理
  const handleBackgroundColorChange = useCallback((color) => {
    setBackgroundColor(color);
  }, []);

  // 打开导出弹窗
  const handleExport = useCallback(() => {
    if (!fabricCanvasRef.current || images.length === 0) {
      alert('请先上传图片');
      return;
    }
    setShowExportModal(true);
  }, [images.length]);

  // 执行导出
  const handleConfirmExport = useCallback((settings: ExportSettings) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // 创建临时画布用于缩放
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = settings.width;
    tempCanvas.height = settings.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;

    // 获取原始画布数据
    const originalDataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });

    // 加载原始图片并缩放
    const img = new Image();
    img.onload = () => {
      // 绘制缩放后的图片
      tempCtx.drawImage(img, 0, 0, settings.width, settings.height);

      // 根据格式和质量设置导出
      let finalDataURL: string;
      
      if (settings.format === 'png') {
        finalDataURL = tempCanvas.toDataURL('image/png');
      } else if (settings.format === 'jpeg') {
        finalDataURL = tempCanvas.toDataURL('image/jpeg', settings.quality / 100);
      } else if (settings.format === 'webp') {
        finalDataURL = tempCanvas.toDataURL('image/webp', settings.quality / 100);
      } else if (settings.format === 'bmp') {
        finalDataURL = tempCanvas.toDataURL('image/bmp');
      } else if (settings.format === 'gif') {
        finalDataURL = tempCanvas.toDataURL('image/gif');
      } else {
        finalDataURL = tempCanvas.toDataURL('image/png');
      }

      // 如果启用压缩，进一步处理
      if (settings.compress && settings.compressionRatio < 100) {
        // 对于支持质量参数的格式，使用压缩比例
        const compressionQuality = settings.compressionRatio / 100;
        
        if (settings.format === 'jpeg' || settings.format === 'webp') {
          // 结合原始质量和压缩比例
          const finalQuality = (settings.quality / 100) * compressionQuality;
          finalDataURL = tempCanvas.toDataURL(`image/${settings.format}`, finalQuality);
        } else if (settings.format === 'png') {
          // PNG 使用 JPEG 压缩后再转回 PNG（模拟压缩效果）
          const compressedJpeg = tempCanvas.toDataURL('image/jpeg', compressionQuality);
          const compressImg = new Image();
          compressImg.onload = () => {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(compressImg, 0, 0);
            finalDataURL = tempCanvas.toDataURL('image/png');
            downloadImage(finalDataURL, settings.format);
          };
          compressImg.src = compressedJpeg;
          return;
        }
      }

      downloadImage(finalDataURL, settings.format);
    };
    
    img.src = originalDataURL;

    // 下载图片的辅助函数
    function downloadImage(dataURL: string, format: string) {
      const link = document.createElement('a');
      link.download = `拼接图片_${Date.now()}.${format}`;
      link.href = dataURL;
      link.click();
      
      setShowExportModal(false);
      onExport?.();
    }
  }, [onExport]);

  // 取消导出
  const handleCancelExport = useCallback(() => {
    setShowExportModal(false);
  }, []);

  // 拖拽上传处理
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 检查是否真的离开了容器（而不是进入子元素）
    const rect = canvasContentRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX;
      const y = e.clientY;
      // 如果鼠标位置在容器外，才设置为 false
      if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
        setIsDraggingOver(false);
      }
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0 && onUploadImages) {
      onUploadImages(files);
    }
  }, [onUploadImages]);

  // 根据图片ID数组选择画布中的对象
  const selectImagesByIds = useCallback((imageIds) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (!imageIds || imageIds.length === 0) {
      canvas.discardActiveObject();
      canvas.renderAll();
      return;
    }

    // 查找对应的对象
    const objects = canvas.getObjects();
    const targetObjs = objects.filter(obj => imageIds.includes(obj.imageId));
    
    if (targetObjs.length > 0) {
      if (targetObjs.length === 1) {
        // 单选
        canvas.setActiveObject(targetObjs[0]);
      } else {
        // 多选
        const selection = new ActiveSelection(targetObjs, {
          canvas: canvas,
        });
        canvas.setActiveObject(selection);
      }
      canvas.renderAll();
    }
  }, []);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    exportImage: handleExport,
    getCanvas: () => fabricCanvasRef.current,
    selectImagesByIds: selectImagesByIds,
  }), [handleExport, selectImagesByIds]);

  return (
    <main className="editor-area">
      <div className="editor-header">
        <h3>编辑区域</h3>
        <div className="editor-controls">
          <div className="canvas-size-controls">
            <label>
              宽度:
              <input
                type="number"
                value={canvasWidth}
                onChange={(e) => handleCanvasSizeChange('width', e.target.value)}
                onBlur={() => handleCanvasSizeBlur('width')}
                min="1"
                step="1"
                disabled={isSizeLocked}
                style={{ opacity: isSizeLocked ? 0.6 : 1, cursor: isSizeLocked ? 'not-allowed' : 'text' }}
              />
              px
            </label>
            <label>
              高度:
              <input
                type="number"
                value={canvasHeight}
                onChange={(e) => handleCanvasSizeChange('height', e.target.value)}
                onBlur={() => handleCanvasSizeBlur('height')}
                min="1"
                step="1"
                disabled={isSizeLocked}
                style={{ opacity: isSizeLocked ? 0.6 : 1, cursor: isSizeLocked ? 'not-allowed' : 'text' }}
              />
              px
            </label>
            <div
              className="btn-size-lock"
              onClick={toggleSizeLock}
              title={isSizeLocked ? '点击解锁画布尺寸' : '点击锁定画布尺寸'}
            >
              {isSizeLocked ? '🔒' : '🔓'}
            </div>
          </div>
          <div className="background-color-controls">
            <label>
              背景:
              <div className="color-picker-wrapper">
                <button
                  className="color-preset"
                  style={{ background: 'transparent' }}
                  onClick={() => handleBackgroundColorChange('transparent')}
                  title="透明"
                >
                  {backgroundColor === 'transparent' && '✓'}
                </button>
                <button
                  className="color-preset"
                  style={{ background: '#ffffff' }}
                  onClick={() => handleBackgroundColorChange('#ffffff')}
                  title="白色"
                >
                  {backgroundColor === '#ffffff' && '✓'}
                </button>
                <button
                  className="color-preset"
                  style={{ background: '#000000' }}
                  onClick={() => handleBackgroundColorChange('#000000')}
                  title="黑色"
                >
                  {backgroundColor === '#000000' && '✓'}
                </button>
                <button
                  className="color-preset"
                  style={{ background: '#f5f5f5' }}
                  onClick={() => handleBackgroundColorChange('#f5f5f5')}
                  title="浅灰"
                >
                  {backgroundColor === '#f5f5f5' && '✓'}
                </button>
                <input
                  type="color"
                  value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  title="自定义颜色"
                  className="color-input"
                />
              </div>
            </label>
          </div>
          <div className="zoom-controls">
            <button
              className="btn btn-zoom"
              onClick={handleZoomOut}
              title="缩小 (1%)"
            >
              🔍-
            </button>
            <span className="zoom-display">
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="btn btn-zoom"
              onClick={handleZoomIn}
              title="放大 (1%)"
            >
              🔍+
            </button>
            <button
              className="btn btn-zoom"
              onClick={handleZoomReset}
              title="重置为100%"
            >
              ↺
            </button>
          </div>
          <button
            className="btn btn-export"
            onClick={handleExport}
            disabled={images.length === 0}
          >
            <span className="icon">💾</span>
            导出图片
          </button>
        </div>
      </div>
      <div className="canvas-container">
        <div
          className={`canvas-content ${isDraggingOver ? 'dragging-over' : ''}`}
          ref={canvasContentRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className="canvas-wrapper"
            ref={canvasWrapperRef}
            style={{
              position: 'relative',
              display: 'inline-block',
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-out'
            }}
          >
            {backgroundColor === 'transparent' && (
              <div
                className="canvas-background-pattern"
                style={{
                  width: canvasWidth,
                  height: canvasHeight
                }}
              />
            )}
            <canvas ref={canvasRef} style={{ position: 'relative', zIndex: 1 }} />
          </div>
          {isPanning && (
            <div className="panning-hint">按住空格键或鼠标中键拖动画布</div>
          )}
          {isDraggingOver && (
            <div className="drag-overlay">
              <div className="drag-hint">
                <span className="drag-icon">📁</span>
                <p>释放以上传图片</p>
              </div>
            </div>
          )}
          {/* {images.length === 0 && !isDraggingOver && (
            <div className="canvas-empty">
              <p>上传图片后将在此处显示</p>
              <p className="hint">💡 提示：拖拽图片到此处上传</p>
              <p className="hint">使用鼠标滚轮缩放，空格键+拖拽平移</p>
            </div>
          )} */}
        </div>
        <div className="tools-panel">
          <h4>道具</h4>
        </div>
      </div>
      
      {/* 导出设置弹窗 */}
      <ExportModal
        isOpen={showExportModal}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onConfirm={handleConfirmExport}
        onCancel={handleCancelExport}
      />
    </main>
  );
});

CanvasEditor.displayName = 'CanvasEditor';

export default CanvasEditor;
