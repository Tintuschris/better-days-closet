/**
 * Bulk Product Processing Pipeline
 * Handles the creation of products, variants, and image uploads in batches
 */

export class BulkProcessor {
  constructor(supabaseHooks, supabaseClient, options = {}) {
    this.supabaseHooks = supabaseHooks;
    this.supabase = supabaseClient;
    this.options = {
      batchSize: 10,
      maxConcurrentUploads: 3,
      retryAttempts: 3,
      retryDelay: 1000,
      ...options
    };
    
    this.results = {
      successful: [],
      failed: [],
      warnings: [],
      totalProcessed: 0,
      totalProducts: 0,
      totalVariants: 0,
      totalImages: 0
    };

    this.onProgress = null;
    this.onStatusUpdate = null;
    this.cancelled = false;
  }

  /**
   * Process bulk product upload
   * @param {Array} products - Validated product data from CSV parser
   * @param {Object} imageFiles - Map of image filenames to File objects
   * @param {Function} onProgress - Progress callback
   * @param {Function} onStatusUpdate - Status update callback
   */
  async processBulkUpload(products, imageFiles = {}, onProgress = null, onStatusUpdate = null) {
    this.onProgress = onProgress;
    this.onStatusUpdate = onStatusUpdate;
    this.cancelled = false;
    
    this.results = {
      successful: [],
      failed: [],
      warnings: [],
      totalProcessed: 0,
      totalProducts: products.length,
      totalVariants: 0,
      totalImages: Object.keys(imageFiles).length
    };

    try {
      this.updateStatus('Initializing bulk upload...');
      
      // Phase 1: Upload images first
      this.updateStatus('Uploading images...');
      const imageUrlMap = await this.uploadImages(imageFiles);
      
      // Phase 2: Process products in batches
      this.updateStatus('Creating products...');
      await this.processProductsBatch(products, imageUrlMap);
      
      this.updateStatus('Bulk upload completed!');
      
      return {
        success: true,
        results: this.results,
        summary: this.generateSummary()
      };
      
    } catch (error) {
      this.updateStatus(`Bulk upload failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        results: this.results,
        summary: this.generateSummary()
      };
    }
  }

  /**
   * Upload all images and create URL mapping
   */
  async uploadImages(imageFiles) {
    const imageUrlMap = {};
    const imageEntries = Object.entries(imageFiles);
    
    if (imageEntries.length === 0) {
      return imageUrlMap;
    }

    this.updateProgress(0, imageEntries.length, 'Uploading images');
    
    // Process images in batches to avoid overwhelming the server
    const batches = this.createBatches(imageEntries, this.options.maxConcurrentUploads);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      if (this.cancelled) break;
      
      const batch = batches[batchIndex];
      const uploadPromises = batch.map(async ([filename, file]) => {
        try {
          const url = await this.uploadImageWithRetry(file);
          imageUrlMap[filename] = url;
          return { filename, url, success: true };
        } catch (error) {
          this.results.warnings.push({
            type: 'image_upload_failed',
            filename,
            error: error.message
          });
          return { filename, error: error.message, success: false };
        }
      });

      await Promise.all(uploadPromises);
      
      const completed = (batchIndex + 1) * this.options.maxConcurrentUploads;
      this.updateProgress(Math.min(completed, imageEntries.length), imageEntries.length, 'Uploading images');
    }

    return imageUrlMap;
  }

  /**
   * Upload single image with retry logic
   */
  async uploadImageWithRetry(file, attempt = 1) {
    try {
      return await this.supabaseHooks.uploadProductImage(file);
    } catch (error) {
      if (attempt < this.options.retryAttempts) {
        await this.delay(this.options.retryDelay * attempt);
        return this.uploadImageWithRetry(file, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Process products in batches
   */
  async processProductsBatch(products, imageUrlMap) {
    const batches = this.createBatches(products, this.options.batchSize);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      if (this.cancelled) break;
      
      const batch = batches[batchIndex];
      this.updateProgress(batchIndex * this.options.batchSize, products.length, 'Creating products');
      
      // Process each product in the batch
      for (const product of batch) {
        if (this.cancelled) break;
        
        try {
          await this.processProduct(product, imageUrlMap);
          this.results.successful.push({
            product: product.name,
            variants: product.variants.length,
            row: product._rowIndex
          });
        } catch (error) {
          this.results.failed.push({
            product: product.name,
            row: product._rowIndex,
            error: error.message
          });
        }
        
        this.results.totalProcessed++;
      }
    }
  }

  /**
   * Process a single product with its variants
   */
  async processProduct(product, imageUrlMap) {
    // Resolve image URLs
    const resolvedImageUrls = this.resolveImageUrls(product.main_image_urls, imageUrlMap);
    
    // Prepare product data for database
    const productData = {
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      price: product.base_price, // This will be updated based on variants
      discount: product.discount,
      // Store a single primary image URL as text (DB column is text)
      image_url: resolvedImageUrls.length > 0 ? resolvedImageUrls[0] : null,
      // Promotion fields if they exist
      ...(product.promotion_type && {
        is_promoted: true,
        promotion_type: product.promotion_type,
        promotion_start_date: product.promotion_start_date,
        promotion_end_date: product.promotion_end_date
      })
    };

    // Create the product using direct Supabase call
    const { data: createdProduct, error: productError } = await this.supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (productError) throw productError;

    // Persist all product images to product_images table (supports multi-image gallery)
    if (resolvedImageUrls.length > 0) {
      const imageRows = resolvedImageUrls.map((url, idx) => ({
        product_id: createdProduct.id,
        url,
        sort_order: idx
      }));
      const { error: imagesError } = await this.supabase
        .from('product_images')
        .insert(imageRows);
      if (imagesError) {
        this.results.warnings.push({ type: 'product_images_insert_failed', filename: createdProduct.name, message: imagesError.message });
      }
    }

    // Create variants
    await this.createProductVariants(createdProduct.id, product.variants, imageUrlMap);
    
    this.results.totalVariants += product.variants.length;
  }

  /**
   * Create variants for a product
   */
  async createProductVariants(productId, variants, imageUrlMap) {
    for (const variant of variants) {
      const variantImageUrls = this.resolveImageUrls(variant.image_urls, imageUrlMap);
      
      const variantData = {
        product_id: productId,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        quantity: variant.quantity,
        image_url: variantImageUrls.length > 0 ? variantImageUrls[0] : null
      };

      const { error: variantError } = await this.supabase
        .from('product_variants')
        .insert([variantData]);

      if (variantError) throw variantError;
    }
  }

  /**
   * Resolve image filenames to uploaded URLs
   */
  resolveImageUrls(imageFilenames, imageUrlMap) {
    if (!imageFilenames || imageFilenames.length === 0) {
      return [];
    }

    return imageFilenames
      .map(filename => imageUrlMap[filename])
      .filter(url => url); // Remove undefined URLs
  }

  /**
   * Create batches from array
   */
  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Update progress
   */
  updateProgress(current, total, message) {
    if (this.onProgress) {
      this.onProgress({
        current,
        total,
        percentage: total > 0 ? Math.round((current / total) * 100) : 0,
        message
      });
    }
  }

  /**
   * Update status
   */
  updateStatus(message) {
    if (this.onStatusUpdate) {
      this.onStatusUpdate(message);
    }
  }

  /**
   * Generate processing summary
   */
  generateSummary() {
    const { successful, failed, warnings, totalProcessed, totalProducts, totalVariants } = this.results;
    
    return {
      totalProducts,
      totalProcessed,
      successfulProducts: successful.length,
      failedProducts: failed.length,
      totalVariants,
      totalWarnings: warnings.length,
      successRate: totalProducts > 0 ? Math.round((successful.length / totalProducts) * 100) : 0,
      details: {
        successful: successful.map(s => `${s.product} (${s.variants} variants)`),
        failed: failed.map(f => `Row ${f.row}: ${f.product} - ${f.error}`),
        warnings: warnings.map(w => `${w.type}: ${w.filename || w.message}`)
      }
    };
  }

  /**
   * Cancel the bulk upload process
   */
  cancel() {
    this.cancelled = true;
    this.updateStatus('Bulk upload cancelled by user');
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Image File Handler for ZIP and individual files
 */
export class ImageFileHandler {
  constructor() {
    this.supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  }

  /**
   * Process uploaded files (ZIP or individual images)
   * @param {FileList} files - Uploaded files
   * @returns {Promise<Object>} Map of filename to File object
   */
  async processFiles(files) {
    const imageFiles = {};
    
    for (const file of files) {
      if (file.name.toLowerCase().endsWith('.zip')) {
        // Handle ZIP file
        const zipImages = await this.extractZipImages(file);
        Object.assign(imageFiles, zipImages);
      } else if (this.supportedFormats.includes(file.type)) {
        // Handle individual image
        imageFiles[file.name] = file;
      }
    }

    return imageFiles;
  }

  /**
   * Extract images from ZIP file
   */
  async extractZipImages(zipFile) {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);
    const imageFiles = {};

    for (const [filename, file] of Object.entries(zipContent.files)) {
      if (!file.dir && this.isImageFile(filename)) {
        const blob = await file.async('blob');
        const imageFile = new File([blob], filename, { type: this.getMimeType(filename) });
        imageFiles[filename] = imageFile;
      }
    }

    return imageFiles;
  }

  /**
   * Check if file is an image based on extension
   */
  isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }

  /**
   * Get MIME type from filename
   */
  getMimeType(filename) {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }
}

export default BulkProcessor;
