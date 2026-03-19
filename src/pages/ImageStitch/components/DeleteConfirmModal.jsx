import React from 'react';

function DeleteConfirmModal({ deleteIndex, onConfirm, onCancel }) {
  const isOpen = deleteIndex !== null;

  if (!isOpen) return null;

  // 确认删除
  const handleConfirm = () => {
    onConfirm(deleteIndex);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>确认删除</h3>
        <p>确定要删除这张图片吗？</p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onCancel}>
            取消
          </button>
          <button className="btn btn-confirm" onClick={handleConfirm}>
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
