import React from 'react';

const CanvasPreview = React.forwardRef(({ title, width, height }, ref) => (
  <div className="canvas-wrapper">
    <h3>{title}</h3>
    <canvas ref={ref} width={width} height={height} className="responsive-canvas"></canvas>
  </div>
));

export default CanvasPreview;
