import React, { useState, useEffect, useCallback, useRef } from 'react';

const DragDropFile: React.FC<React.PropsWithChildren<{
  handleFiles: (files: FileList) => void,
}>> = ({ children, handleFiles }) => {
  const [drag, setDrag] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDrag(true);
    }
  }, [dragCounterRef]);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setDrag(false);
    }
  }, [dragCounterRef]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
      dragCounterRef.current = 0;
    }
  }, [handleFiles]);

  useEffect(() => {
    const el = document.body;
    el.addEventListener('dragenter', handleDragIn);
    el.addEventListener('dragleave', handleDragOut);
    el.addEventListener('dragover', handleDrag);
    el.addEventListener('drop', handleDrop);

    return () => {
      el.removeEventListener('dragenter', handleDragIn);
      el.removeEventListener('dragleave', handleDragOut);
      el.removeEventListener('dragover', handleDrag);
      el.removeEventListener('drop', handleDrop);
    };
  }, [handleDrag, handleDragIn, handleDragOut, handleDrop]);

  return (
    <div className="file-area">
      {drag && (<>
        <div className="file-area-shadow" />
        <div className="file-area-inner">
          <h1>
            Drop your .zip or .html here
          </h1>
        </div>
      </>)}
      {children}
    </div>
  );
};

export default DragDropFile;