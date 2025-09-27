"use client";
import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiImage, FiSettings, FiCheck, FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';
import { PremiumCard, Button } from '../../../components/ui';

const ImageUploadOptimizer = ({
  onImagesUploaded,
  maxImages = 10,
  existingImages = [],
  uploadFunction,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  optimizationSettings = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    format: 'webp'
  }
}) => {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(optimizationSettings);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [inflight, setInflight] = useState([]); // {id, name, progress, status, url, file}
  const [enableCrop, setEnableCrop] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropState, setCropState] = useState({ url: null, image: null, scale: 1, offsetX: 0, offsetY: 0, resolve: null, reject: null, filename: '' });

  // Compress and optimize image
  const optimizeImage = useCallback((file, customSettings = settings) => {
    return new Promise(async (resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Try createImageBitmap with EXIF orientation handling (best-effort)
      let bitmap = null;
      try {
        if ('createImageBitmap' in window) {
          bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        }
      } catch (e) {
        bitmap = null;
      }

      const drawSource = async () => {
        return new Promise((res) => {
          if (bitmap) {
            res({ width: bitmap.width, height: bitmap.height, draw: () => ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height) });
            return;
          }
          const img = new window.Image();
          img.onload = () => res({ width: img.width, height: img.height, draw: () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height) });
          img.src = URL.createObjectURL(file);
        });
      };

      const src = await drawSource();

      // Calculate new dimensions with limits
      let { width, height } = src;
      const maxWidth = customSettings.maxWidth;
      const maxHeight = customSettings.maxHeight;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      src.draw();

      canvas.toBlob(
        (blob) => {
          const optimizedFile = new File([blob], file.name, {
            type: `image/${customSettings.format}`,
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        `image/${customSettings.format}`,
        customSettings.quality
      );
    });
  }, [settings]);

  // Handle file selection
  const handleFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);

    // Validate files
    const validFiles = fileArray.filter(file => {
      const isHeic = /\.heic$|\.heif$/i.test(file.name) || /heic|heif/i.test(file.type || '');
      if (isHeic) {
        toast.error(`${file.name} is HEIC/HEIF and not supported by the browser. Please set iPhone camera to Most Compatible (JPEG) or use PNG/JPEG/WebP.`);
        return false;
      }
      if (!acceptedFormats.includes(file.type)) {
        toast.error(`${file.name} is not a supported format`);
        return false;
      }
      if (file.size > maxFileSize) {
        toast.error(`${file.name} is too large (max ${maxFileSize / 1024 / 1024}MB)`);
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    // Add inflight entries
    const inflightItems = validFiles.map(f => ({ id: `${Date.now()}-${Math.random()}`, name: f.name, progress: 0, status: 'pending', url: null, file: f }));
    setInflight(prev => [...prev, ...inflightItems]);

    const concurrency = 2; // mobile-friendly limit
    let index = 0;
    const results = [];

    const runNext = async () => {
      if (index >= validFiles.length) return null;
      const file = validFiles[index];
      const itemId = inflightItems[index].id;
      index++;
      try {
        // Optional crop step
        let toProcess = file;
        if (enableCrop) {
          toProcess = await requestCrop(file);
        }
        setInflight(prev => prev.map(it => it.id === itemId ? { ...it, status: 'optimizing', progress: 10 } : it));
        const optimized = await optimizeImage(toProcess);
        setInflight(prev => prev.map(it => it.id === itemId ? { ...it, status: 'uploading', progress: 60 } : it));
        const url = await uploadFunction(optimized);
        const uploaded = {
          id: Date.now() + Math.random(),
          url,
          originalName: optimized.name,
          size: optimized.size,
          optimized: true
        };
        results.push(uploaded);
        setInflight(prev => prev.map(it => it.id === itemId ? { ...it, status: 'done', progress: 100, url } : it));
      } catch (e) {
        console.error('Upload error:', e);
        setInflight(prev => prev.map(it => it.id === itemId ? { ...it, status: 'error' } : it));
      }
      return runNext();
    };

    const workers = Array.from({ length: Math.min(concurrency, validFiles.length) }, () => runNext());
    await Promise.all(workers);

    const uploadedImages = results;
    const newImages = [...images, ...uploadedImages];
    setImages(newImages);
    onImagesUploaded(newImages.map(img => img.url));
    toast.success(`${uploadedImages.length} image(s) uploaded and optimized`);
    setUploading(false);
  }, [images, maxImages, acceptedFormats, maxFileSize, optimizeImage, uploadFunction, onImagesUploaded]);

  // Crop modal flow
  const requestCrop = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new window.Image();
      image.onload = () => {
        setCropState({ url, image, scale: 1, offsetX: 0, offsetY: 0, resolve, reject, filename: file.name });
        setShowCropper(true);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      image.src = url;
    });
  }, []);

  const applyCrop = useCallback(() => {
    const { image, scale, offsetX, offsetY, resolve, url, filename } = cropState;
    if (!image || !resolve) return;
    try {
      const viewport = 1024; // square crop
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport; canvas.height = viewport;
      // Compute scaled image dimensions
      const scaledW = image.width * scale;
      const scaledH = image.height * scale;
      // Center baseline, then apply offsets
      const baseX = (viewport - scaledW) / 2 + offsetX;
      const baseY = (viewport - scaledH) / 2 + offsetY;
      ctx.drawImage(image, baseX, baseY, scaledW, scaledH);
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(new File([image], filename));
        } else {
          const cropped = new File([blob], filename, { type: 'image/jpeg', lastModified: Date.now() });
          resolve(cropped);
        }
        URL.revokeObjectURL(url);
        setShowCropper(false);
        setCropState({ url: null, image: null, scale: 1, offsetX: 0, offsetY: 0, resolve: null, reject: null, filename: '' });
      }, 'image/jpeg', 0.92);
    } catch (e) {
      console.error('Crop failed', e);
      resolve(new File([image], cropState.filename));
      setShowCropper(false);
    }
  }, [cropState]);

  const cancelCrop = useCallback(() => {
    const { resolve, url } = cropState;
    if (resolve) resolve();
    if (url) URL.revokeObjectURL(url);
    setShowCropper(false);
    setCropState({ url: null, image: null, scale: 1, offsetX: 0, offsetY: 0, resolve: null, reject: null, filename: '' });
  }, [cropState]);

  // Retry a failed item
  const retryUpload = useCallback(async (itemId) => {
    const item = inflight.find(i => i.id === itemId);
    if (!item || !item.file) return;
    try {
      setInflight(prev => prev.map(it => it.id === itemId ? { ...it, status: 'optimizing', progress: 10 } : it));
      let toProcess = item.file;
      if (enableCrop) {
        toProcess = await requestCrop(item.file);
      }
      const optimized = await optimizeImage(toProcess);
      setInflight(prev => prev.map(it => it.id === itemId ? { ...it, status: 'uploading', progress: 60 } : it));
      const url = await uploadFunction(optimized);
      setInflight(prev => prev.map(it => it.id === itemId ? { ...it, status: 'done', progress: 100, url } : it));
      const uploaded = {
        id: Date.now() + Math.random(),
        url,
        originalName: optimized.name,
        size: optimized.size,
        optimized: true
      };
      setImages(prev => [...prev, uploaded]);
      onImagesUploaded([...images, uploaded].map(img => img.url));
      toast.success('Upload retried successfully');
    } catch (e) {
      console.error('Retry failed', e);
      setInflight(prev => prev.map(it => it.id === itemId ? { ...it, status: 'error' } : it));
      toast.error('Retry failed');
    }
  }, [inflight, enableCrop, requestCrop, optimizeImage, uploadFunction, onImagesUploaded, images]);

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Remove image
  const removeImage = useCallback((indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    onImagesUploaded(newImages.map(img => img.url));
  }, [images, onImagesUploaded]);

  return (
    <div className="space-y-4">
      {/* Settings Panel */}
      {showSettings && (
        <PremiumCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-primarycolor">Optimization Settings</h4>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSettings(false);
              }}
              className="text-primarycolor/60 hover:text-primarycolor"
              type="button"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primarycolor/70 mb-1">
                Max Width (px)
              </label>
              <input
                type="number"
                value={settings.maxWidth}
                onChange={(e) => setSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primarycolor/70 mb-1">
                Max Height (px)
              </label>
              <input
                type="number"
                value={settings.maxHeight}
                onChange={(e) => setSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primarycolor/70 mb-1">
                Quality (0.1 - 1.0)
              </label>
              <input
                type="number"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.quality}
                onChange={(e) => setSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primarycolor/70 mb-1">
                Output Format
              </label>
              <select
                value={settings.format}
                onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value }))}
                className="w-full px-3 py-2 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20"
              >
                <option value="webp">WebP</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Failed uploads list with Retry */}
      {inflight.some(it => it.status === 'error') && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-red-600">Failed uploads</h4>
          <div className="space-y-1">
            {inflight.filter(it => it.status === 'error').map(it => (
              <div key={it.id} className="flex items-center justify-between text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
                <span className="truncate">{it.name}</span>
                <button onClick={() => retryUpload(it.id)} className="px-2 py-1 bg-red-600 text-white rounded">Retry</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-4 space-y-3">
            <h3 className="text-md font-semibold text-primarycolor">Crop Image</h3>
            <div className="w-full h-72 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
              {/* Viewport 300x300 square */}
              <div className="relative w-72 h-72 overflow-hidden bg-black">
                {cropState.url && (
                  <img
                    src={cropState.url}
                    alt="Crop"
                    className="select-none pointer-events-none"
                    style={{
                      position: 'absolute',
                      left: '50%', top: '50%',
                      transform: `translate(-50%, -50%) translate(${cropState.offsetX}px, ${cropState.offsetY}px) scale(${cropState.scale})`,
                      transformOrigin: 'center center'
                    }}
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-primarycolor/70">Zoom</label>
              <input type="range" min="1" max="3" step="0.01" value={cropState.scale} onChange={(e) => setCropState(s => ({ ...s, scale: parseFloat(e.target.value) }))} />
              <label className="text-xs text-primarycolor/70">Horizontal</label>
              <input type="range" min="-200" max="200" step="1" value={cropState.offsetX} onChange={(e) => setCropState(s => ({ ...s, offsetX: parseInt(e.target.value) }))} />
              <label className="text-xs text-primarycolor/70">Vertical</label>
              <input type="range" min="-200" max="200" step="1" value={cropState.offsetY} onChange={(e) => setCropState(s => ({ ...s, offsetY: parseInt(e.target.value) }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={cancelCrop} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={applyCrop} className="px-3 py-2 bg-primarycolor text-white rounded">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <PremiumCard 
        className={`relative border-2 border-dashed transition-all duration-300 ${
          dragActive 
            ? 'border-primarycolor bg-primarycolor/5' 
            : 'border-primarycolor/30 hover:border-primarycolor/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {uploading ? (
              <FiLoader className="w-8 h-8 text-primarycolor animate-spin" />
            ) : (
              <FiUpload className="w-8 h-8 text-primarycolor" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-primarycolor mb-2">
            {uploading ? 'Optimizing and uploading...' : 'Upload Product Images'}
          </h3>
          
          <p className="text-primarycolor/70 mb-4">
            Drag and drop images here, or click to select files
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="primary"
              size="md"
            >
              <FiImage className="w-4 h-4 mr-2" />
              Select Images
            </Button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className="flex items-center gap-2 px-4 py-3 text-primarycolor/70 hover:text-primarycolor transition-colors"
              type="button"
            >
              <FiSettings className="w-4 h-4" />
              Settings
            </button>
            <Button
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              variant="secondary"
              size="md"
            >
              <FiImage className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <label className="flex items-center gap-2 text-sm text-primarycolor/80 select-none">
              <input type="checkbox" checked={enableCrop} onChange={(e) => setEnableCrop(e.target.checked)} />
              Crop before upload
            </label>
          </div>
          
          <p className="text-xs text-primarycolor/60 mt-4">
            Supports JPEG, PNG, WebP • Max {maxFileSize / 1024 / 1024}MB per file • Up to {maxImages} images
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        {/* Camera capture for mobile */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </PremiumCard>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id || index} className="relative group">
              <PremiumCard className="p-2 overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={image.url}
                    alt={image.originalName || `Image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  {/* Per-file progress overlay if matching inflight */}
                  {inflight.some(it => it.url === image.url && it.status !== 'done' && it.status !== 'error') && (
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-xs">
                      <FiLoader className="w-5 h-5 animate-spin mb-1" />
                      <span>Uploading…</span>
                    </div>
                  )}
                  {inflight.some(it => it.url === image.url && it.status === 'error') && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-xs gap-2">
                      <span>Upload failed</span>
                      <button onClick={() => {
                        const failed = inflight.find(it => it.url === image.url && it.status === 'error');
                        if (failed) retryUpload(failed.id);
                      }} className="px-3 py-1 bg-white text-primarycolor rounded">Retry</button>
                    </div>
                  )}
                  {/* If there is an inflight item without url yet (newly added), show generic overlay on latest card */}
                  {index === images.length - 1 && uploading && inflight.some(it => it.status !== 'done') && (
                    <div className="absolute inset-0 bg-black/20 flex items-end">
                      <div className="w-full h-1 bg-white/30">
                        <div className="h-1 bg-white/80" style={{ width: `${Math.round((inflight.filter(it => it.status === 'done').length / (inflight.length || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Optimized Badge */}
                  {image.optimized && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <FiCheck className="w-3 h-3" />
                      Optimized
                    </div>
                  )}
                 
                  {/* Remove Button */}
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
                
                {/* Image Info */}
                <div className="mt-2 text-xs text-primarycolor/70">
                  <p className="truncate">{image.originalName}</p>
                  {image.size && (
                    <p>{(image.size / 1024).toFixed(1)} KB</p>
                  )}
                </div>
              </PremiumCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploadOptimizer;
