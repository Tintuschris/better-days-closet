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

  // Compress and optimize image
  const optimizeImage = useCallback((file, customSettings = settings) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
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

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
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
      };

      img.src = URL.createObjectURL(file);
    });
  }, [settings]);

  // Handle file selection
  const handleFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
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

    try {
      const optimizedFiles = await Promise.all(
        validFiles.map(file => optimizeImage(file))
      );

      // Upload optimized files
      const uploadPromises = optimizedFiles.map(async (file) => {
        const url = await uploadFunction(file);
        return {
          id: Date.now() + Math.random(),
          url,
          originalName: file.name,
          size: file.size,
          optimized: true
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedImages];
      
      setImages(newImages);
      onImagesUploaded(newImages.map(img => img.url));
      
      toast.success(`${uploadedImages.length} image(s) uploaded and optimized`);
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, acceptedFormats, maxFileSize, optimizeImage, uploadFunction, onImagesUploaded]);

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
          
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="primary"
              size="sm"
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
              className="flex items-center gap-2 px-3 py-2 text-primarycolor/70 hover:text-primarycolor transition-colors"
              type="button"
            >
              <FiSettings className="w-4 h-4" />
              Settings
            </button>
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
