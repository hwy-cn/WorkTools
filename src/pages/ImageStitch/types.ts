// 图片数据类型
export interface ImageData {
  id: string | number;
  src: string;
  name: string;
  width?: number;
  height?: number;
  file?: File;
}

// DeleteConfirmModal 组件 Props
export interface DeleteConfirmModalProps {
  deleteIndex: number | null;
  onConfirm: (index: number) => void;
  onCancel: () => void;
}

// ImageList 组件 Props
export interface ImageListProps {
  images: ImageData[];
  onReorder: (newImages: ImageData[]) => void;
  onDelete: (index: number) => void;
  selectedImageIds: (string | number)[];
  onSelectImage: (imageId: string | number, isMultiSelect: boolean) => void;
}

// UploadSection 组件 Props
export interface UploadSectionProps {
  onUpload: (newImages: ImageData[]) => void;
  onClearAll: () => void;
  hasImages: boolean;
}

// CanvasEditor 组件 Props
export interface CanvasEditorProps {
  images: ImageData[];
  onExport?: () => void;
  onSelectImage?: (imageIds: (string | number)[]) => void;
  onUploadImages?: (files: File[]) => void;
}

// CanvasEditor 暴露的方法
export interface CanvasEditorRef {
  exportImage: () => void;
  getCanvas: () => any;
  selectImagesByIds: (imageIds: (string | number)[]) => void;
}
