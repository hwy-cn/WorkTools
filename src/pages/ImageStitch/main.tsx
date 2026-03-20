import React from 'react';
import { createRoot } from 'react-dom/client';
import ImageStitch from './ImageStitch';
import './style.less';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ImageStitch />
  </React.StrictMode>
);
