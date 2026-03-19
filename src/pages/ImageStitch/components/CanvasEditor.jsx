import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, FabricImage, ActiveSelection } from 'fabric';

const CanvasEditor = forwardRef(({ images, onExport, onSelectImage }, ref) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const imageObjectsRef = useRef(new Map()); // 存储已加载的图片对象
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // 初始化 Fabric.js 画布
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#f5f5f5',
      });
      
      fabricCanvasRef.current = canvas;

      // 启用画布缩放和平移
      canvas.on('mouse:wheel', (opt) => {
        const delta = opt.e.deltaY;
        let newZoom = canvas.getZoom();
        newZoom *= 0.999 ** delta;
        
        // 限制缩放范围
        if (newZoom > 5) newZoom = 5;
        if (newZoom < 0.1) newZoom = 0.1;
        
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
        setZoom(newZoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      // 空格键 + 鼠标拖拽平移
      canvas.on('mouse:down', (opt) => {
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
  }, []); // 只在组件挂载时初始化一次

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
    canvas.backgroundColor = '#f5f5f5';

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
  }, [images, canvasWidth, canvasHeight]);

  // 监听图片变化，更新画布
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    if (images.length > 0) {
      updateCanvas();
    } else {
      // 清空画布和缓存
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = '#f5f5f5';
      fabricCanvasRef.current.renderAll();
      imageObjectsRef.current.clear();
    }
  }, [images, updateCanvas]);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    let newZoom = canvas.getZoom() * 1.1;
    if (newZoom > 5) newZoom = 5;
    
    canvas.setZoom(newZoom);
    setZoom(newZoom);
    canvas.renderAll();
  }, []);

  const handleZoomOut = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    let newZoom = canvas.getZoom() / 1.1;
    if (newZoom < 0.1) newZoom = 0.1;
    
    canvas.setZoom(newZoom);
    setZoom(newZoom);
    canvas.renderAll();
  }, []);

  const handleZoomReset = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    canvas.setZoom(1);
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    setZoom(1);
    canvas.renderAll();
  }, []);

  // 画布尺寸控制
  const handleCanvasSizeChange = useCallback((dimension, value) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 100) return; // 最小尺寸限制
    
    if (dimension === 'width') {
      setCanvasWidth(numValue);
    } else {
      setCanvasHeight(numValue);
    }
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

  // 拖动调整画布大小
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: canvasWidth,
      height: canvasHeight,
    });
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(100, resizeStart.width + deltaX);
      const newHeight = Math.max(100, resizeStart.height + deltaY);
      
      setCanvasWidth(newWidth);
      setCanvasHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart]);

  // 导出图片
  const handleExport = useCallback(() => {
    if (!fabricCanvasRef.current || images.length === 0) {
      alert('请先上传图片');
      return;
    }

    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });

    const link = document.createElement('a');
    link.download = `拼接图片_${Date.now()}.png`;
    link.href = dataURL;
    link.click();

    onExport?.();
  }, [images.length, onExport]);

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
                min="100"
                step="10"
              />
              px
            </label>
            <label>
              高度:
              <input
                type="number"
                value={canvasHeight}
                onChange={(e) => handleCanvasSizeChange('height', e.target.value)}
                min="100"
                step="10"
              />
              px
            </label>
          </div>
          <div className="zoom-controls">
            <button
              className="btn btn-zoom"
              onClick={handleZoomOut}
              title="缩小"
            >
              🔍-
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button
              className="btn btn-zoom"
              onClick={handleZoomIn}
              title="放大"
            >
              🔍+
            </button>
            <button
              className="btn btn-zoom"
              onClick={handleZoomReset}
              title="重置"
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
      <div className="canvas-container" ref={containerRef}>
        <div className="canvas-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
          <canvas ref={canvasRef} />
          <div
            className="canvas-resize-handle"
            onMouseDown={handleResizeStart}
            title="拖动调整画布大小"
          />
        </div>
        {isPanning && (
          <div className="panning-hint">按住空格键或鼠标中键拖动画布</div>
        )}
      </div>
      {images.length === 0 && (
        <div className="canvas-empty">
          <p>上传图片后将在此处显示</p>
          <p className="hint">💡 提示：使用鼠标滚轮缩放，空格键+拖拽平移</p>
        </div>
      )}
    </main>
  );
});

CanvasEditor.displayName = 'CanvasEditor';

export default CanvasEditor;
