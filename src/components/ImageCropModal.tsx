import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  RefreshCw,
  Check,
  X,
  Sparkles,
  Sliders,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { formatBytes } from '../utils/imageCompressor';

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName?: string;
  originalFile?: File;
  title?: string;
  aspectRatio?: number; // default 1 (1:1 square)
  outputSize?: number; // default 600px
  isUploading?: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => Promise<void> | void;
  onSkipCrop?: () => Promise<void> | void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  fileName = 'execom-avatar.jpg',
  originalFile,
  title = 'Crop & Optimize Photo',
  aspectRatio = 1,
  outputSize = 600,
  isUploading = false,
  onClose,
  onCropComplete,
  onSkipCrop
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0
  });

  const viewportRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Reset transforms when a new image is loaded
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      setFlipH(false);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imgRef.current = img;
        setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Update live preview canvas whenever transforms or image change
  const renderPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = imgRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !img || !viewport || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previewSize = 100;
    canvas.width = previewSize;
    canvas.height = previewSize;

    ctx.clearRect(0, 0, previewSize, previewSize);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const vpWidth = viewport.clientWidth || 320;
    const vpHeight = viewport.clientHeight || 320;
    const baseScale = Math.max(vpWidth / img.naturalWidth, vpHeight / img.naturalHeight);
    const canvasScale = previewSize / vpWidth;

    ctx.save();
    ctx.translate(previewSize / 2, previewSize / 2);
    ctx.translate(pan.x * canvasScale, pan.y * canvasScale);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, 1);

    const drawW = img.naturalWidth * baseScale * zoom * canvasScale;
    const drawH = img.naturalHeight * baseScale * zoom * canvasScale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [pan, zoom, rotation, flipH]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  if (!isOpen) return null;

  // Pointer/Drag Handlers for panning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.max(1, Math.min(3.5, Number((prev + delta).toFixed(2)))));
  };

  // Reset transforms
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipH(false);
  };

  // Export cropped high-resolution WebP file
  const handleApplyCrop = async () => {
    const img = imgRef.current;
    const viewport = viewportRef.current;
    if (!img || !viewport) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize 2D canvas context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const vpWidth = viewport.clientWidth || 320;
      const baseScale = Math.max(vpWidth / img.naturalWidth, vpWidth / img.naturalHeight);
      const canvasScale = outputSize / vpWidth;

      ctx.save();
      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.translate(pan.x * canvasScale, pan.y * canvasScale);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, 1);

      const drawW = img.naturalWidth * baseScale * zoom * canvasScale;
      const drawH = img.naturalHeight * baseScale * zoom * canvasScale;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to generate cropped image'));
          },
          'image/webp',
          0.88
        );
      });

      const baseName = fileName.replace(/\.[^/.]+$/, '') || 'avatar';
      const croppedFile = new File([blob], `${baseName}_cropped.webp`, {
        type: 'image/webp',
        lastModified: Date.now()
      });

      await onCropComplete(croppedFile);
    } catch (err) {
      console.error('Error during image crop export:', err);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          background: 'var(--bg-surface, #0e1118)',
          border: '2px solid var(--border-medium, #27272a)'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-subtle, #1e2029)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'rgba(0, 255, 102, 0.1)',
                border: '1px solid var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-green)'
              }}
            >
              <Crop size={16} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.05rem', margin: 0, letterSpacing: '-0.2px' }}>
                {title}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Target: {outputSize}×{outputSize}px • 1:1 Aspect Ratio (Square/Circle)
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-icon btn-sm"
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(280px, 1fr) 220px',
              gap: '20px',
              alignItems: 'start'
            }}
            className="crop-modal-layout"
          >
            {/* Left: Interactive Cropper Viewport */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                ref={viewportRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onWheel={handleWheel}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: `${aspectRatio} / 1`,
                  maxHeight: '340px',
                  background: '#07080b',
                  border: '2px solid #27272a',
                  overflow: 'hidden',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Transformed Image */}
                {imgRef.current && (
                  <img
                    src={imageSrc}
                    alt="Cropping target"
                    draggable={false}
                    style={{
                      position: 'absolute',
                      pointerEvents: 'none',
                      maxWidth: 'none',
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${
                        flipH ? -1 : 1
                      })`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.05s ease-out'
                    }}
                  />
                )}

                {/* Cropping Guide Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Circular Avatar Guide */}
                  <div
                    style={{
                      width: '88%',
                      height: '88%',
                      borderRadius: '50%',
                      border: '2px dashed var(--accent-green, #00ff66)',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55), 0 0 16px rgba(0, 255, 102, 0.25)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {/* Rule of Thirds Crosshairs */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '33.33%',
                        borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
                        borderBottom: '1px dashed rgba(255, 255, 255, 0.15)'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        height: '100%',
                        width: '33.33%',
                        borderLeft: '1px dashed rgba(255, 255, 255, 0.15)',
                        borderRight: '1px dashed rgba(255, 255, 255, 0.15)'
                      }}
                    />
                  </div>

                  {/* Corner Accent Brackets */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-green)',
                      background: 'rgba(0, 0, 0, 0.75)',
                      padding: '2px 6px',
                      border: '1px solid rgba(0, 255, 102, 0.3)'
                    }}
                  >
                    DRAG & ZOOM
                  </div>
                </div>
              </div>

              {/* Controls Toolbar */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '12px',
                  border: '1px solid var(--border-subtle, #1f222e)'
                }}
              >
                {/* Zoom Slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ZoomOut size={15} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="range"
                    min="1"
                    max="3.5"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    style={{
                      flex: 1,
                      accentColor: 'var(--accent-green)',
                      cursor: 'pointer'
                    }}
                  />
                  <ZoomIn size={15} style={{ color: 'var(--text-muted)' }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-green)',
                      minWidth: '42px',
                      textAlign: 'right'
                    }}
                  >
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* Transform Buttons */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                    title="Rotate 90° Counter-Clockwise"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <RotateCcw size={13} />
                    <span>-90°</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    title="Rotate 90° Clockwise"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <RotateCw size={13} />
                    <span>+90°</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setFlipH((prev) => !prev)}
                    title="Flip Horizontally"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <FlipHorizontal size={13} />
                    <span>Flip</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleReset}
                    title="Reset to Center"
                    style={{ marginLeft: 'auto', padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <RefreshCw size={13} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Preview & Optimization Stats */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle, #1f222e)',
                padding: '16px'
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sliders size={13} />
                <span>Live Previews</span>
              </div>

              {/* Circle Avatar Live Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--accent-green)',
                    boxShadow: '0 0 16px var(--accent-green-glow)',
                    background: '#0d0e12',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--accent-green)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600
                  }}
                >
                  Circular Avatar
                </span>
              </div>

              {/* Specs & Storage Compression Info */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle, #1f222e)',
                  paddingTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Source Dimensions:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {naturalDimensions.width > 0 ? `${naturalDimensions.width}×${naturalDimensions.height}` : '...'}
                  </span>
                </div>

                {originalFile && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Original Size:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                      {formatBytes(originalFile.size)}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Target Format:</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-green)',
                      fontWeight: 600
                    }}
                  >
                    WebP (Optimized)
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 255, 102, 0.06)',
                    border: '1px solid rgba(0, 255, 102, 0.2)',
                    padding: '8px 10px',
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    marginTop: '4px'
                  }}
                >
                  <Sparkles size={13} style={{ color: 'var(--accent-green)', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                    Auto-compresses to ~50–120 KB to optimize cloud storage and page load speeds.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle, #1e2029)',
            padding: '14px 24px'
          }}
        >
          {onSkipCrop && originalFile ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onSkipCrop}
              disabled={isUploading}
              style={{ fontSize: '0.8rem' }}
            >
              <ShieldCheck size={14} />
              <span>Use Original (Skip Crop)</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isUploading}
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApplyCrop}
              disabled={isUploading}
              style={{
                fontSize: '0.85rem',
                minWidth: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Crop & Apply</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
