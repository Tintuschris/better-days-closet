import Papa from 'papaparse';

/**
 * CSV Parser and Validator for Bulk Product Upload
 * Handles parsing, validation, and data transformation
 */

export class CSVParser {
  constructor(categories = [], categoryAttributes = []) {
    this.categories = categories;
    this.categoryAttributes = categoryAttributes;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Parse CSV file and validate data
   * @param {File} file - CSV file to parse
   * @param {Object} options - Parsing options
   * @returns {Promise} Parsed and validated data
   */
  async parseFile(file, options = {}) {
    const {
      skipEmptyLines = true,
      header = true,
      trimHeaders = true,
      transformHeader = (header) => header.toLowerCase().trim()
    } = options;

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header,
        skipEmptyLines,
        trimHeaders,
        transformHeader,
        complete: (results) => {
          try {
            const validatedData = this.validateAndTransform(results.data, results.meta);
            resolve({
              data: validatedData.products,
              errors: this.errors,
              warnings: this.warnings,
              meta: {
                ...results.meta,
                totalRows: results.data.length,
                validRows: validatedData.products.length,
                errorCount: this.errors.length,
                warningCount: this.warnings.length
              }
            });
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * Validate and transform parsed CSV data
   */
  validateAndTransform(rawData, meta) {
    this.errors = [];
    this.warnings = [];
    
    if (!rawData || rawData.length === 0) {
      throw new Error('CSV file is empty or contains no valid data');
    }

    // Validate headers
    this.validateHeaders(meta.fields || Object.keys(rawData[0]));

    // Process each row
    const products = [];
    const productGroups = this.groupProductRows(rawData);

    Object.entries(productGroups).forEach(([productName, rows], productIndex) => {
      try {
        const product = this.processProductGroup(productName, rows, productIndex);
        if (product) {
          products.push(product);
        }
      } catch (error) {
        this.addError(productIndex + 1, 'product', error.message);
      }
    });

    return { products };
  }

  /**
   * Validate CSV headers
   */
  validateHeaders(headers) {
    const requiredHeaders = ['product_name', 'category_name', 'base_price'];
    const missingHeaders = requiredHeaders.filter(header => 
      !headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    // Check for variant format
    const hasVariantsJson = headers.some(h => h.toLowerCase().includes('variants_json'));
    const hasVariantColumns = headers.some(h => h.toLowerCase().includes('variant_size') || h.toLowerCase().includes('variant_color'));

    if (hasVariantsJson && hasVariantColumns) {
      this.addWarning(0, 'headers', 'Both JSON and column variant formats detected. JSON format will take precedence.');
    }
  }

  /**
   * Group rows by product name (for handling multiple variant rows)
   */
  groupProductRows(rawData) {
    const groups = {};
    
    rawData.forEach((row, index) => {
      const productName = row.product_name?.trim();
      
      if (!productName) {
        // This might be a variant row for the previous product
        const keys = Object.keys(groups);
        if (keys.length > 0) {
          const lastProduct = keys[keys.length - 1];
          groups[lastProduct].push({ ...row, _rowIndex: index + 1 });
        } else {
          this.addError(index + 1, 'product_name', 'Product name is required');
        }
      } else {
        if (!groups[productName]) {
          groups[productName] = [];
        }
        groups[productName].push({ ...row, _rowIndex: index + 1 });
      }
    });

    return groups;
  }

  /**
   * Process a group of rows for a single product
   */
  processProductGroup(productName, rows, productIndex) {
    const mainRow = rows[0];
    const rowIndex = mainRow._rowIndex;

    // Validate basic product data
    const product = this.validateBasicProduct(mainRow, rowIndex);
    if (!product) return null;

    // Process variants
    if (mainRow.variants_json) {
      // JSON format variants
      product.variants = this.parseVariantsJSON(mainRow.variants_json, rowIndex);
    } else {
      // Column format variants or single variant
      product.variants = this.parseVariantsFromRows(rows);
    }

    // Validate variants
    this.validateVariants(product, rowIndex);

    return product;
  }

  /**
   * Validate basic product information
   */
  validateBasicProduct(row, rowIndex) {
    const product = {
      name: row.product_name?.trim(),
      description: row.description?.trim() || '',
      category_name: row.category_name?.trim(),
      base_price: this.parsePrice(row.base_price),
      discount: this.parseDiscount(row.discount),
      promotion_type: row.promotion_type?.trim() || '',
      promotion_start_date: this.parseDate(row.promotion_start_date),
      promotion_end_date: this.parseDate(row.promotion_end_date),
      main_image_urls: this.parseImageUrls(row.main_image_urls),
      _rowIndex: rowIndex
    };

    // Validate required fields
    if (!product.name) {
      this.addError(rowIndex, 'product_name', 'Product name is required');
      return null;
    }

    if (!product.category_name) {
      this.addError(rowIndex, 'category_name', 'Category name is required');
      return null;
    }

    if (!product.base_price || product.base_price <= 0) {
      this.addError(rowIndex, 'base_price', 'Valid base price is required');
      return null;
    }

    // Validate category exists
    const category = this.categories.find(c => 
      c.name.toLowerCase() === product.category_name.toLowerCase()
    );
    
    if (!category) {
      this.addError(rowIndex, 'category_name', `Category "${product.category_name}" not found`);
      return null;
    }

    product.category_id = category.id;
    product.category = category;

    // Validate promotion dates
    if (product.promotion_start_date && product.promotion_end_date) {
      if (product.promotion_start_date >= product.promotion_end_date) {
        this.addError(rowIndex, 'promotion_dates', 'Promotion start date must be before end date');
      }
    }

    return product;
  }

  /**
   * Parse variants from JSON string
   */
  parseVariantsJSON(variantsJson, rowIndex) {
    try {
      const variants = JSON.parse(variantsJson);
      if (!Array.isArray(variants)) {
        this.addError(rowIndex, 'variants_json', 'Variants JSON must be an array');
        return [];
      }
      return variants.map((variant, index) => ({
        size: variant.size || null,
        color: variant.color || null,
        price: this.parsePrice(variant.price),
        quantity: this.parseQuantity(variant.quantity),
        image_urls: this.parseImageUrls(variant.image_urls),
        _variantIndex: index
      }));
    } catch (error) {
      this.addError(rowIndex, 'variants_json', `Invalid JSON format: ${error.message}`);
      return [];
    }
  }

  /**
   * Parse variants from column format rows
   */
  parseVariantsFromRows(rows) {
    return rows.map((row, index) => ({
      size: row.variant_size?.trim() || null,
      color: row.variant_color?.trim() || null,
      price: this.parsePrice(row.variant_price) || this.parsePrice(rows[0].base_price),
      quantity: this.parseQuantity(row.variant_quantity) || 0,
      image_urls: this.parseImageUrls(row.variant_image_urls),
      _variantIndex: index,
      _rowIndex: row._rowIndex
    })).filter(variant => variant.price > 0 && variant.quantity > 0);
  }

  /**
   * Validate product variants against category attributes
   */
  validateVariants(product, rowIndex) {
    const categoryAttrs = this.categoryAttributes.find(attr => 
      attr.category_id === product.category_id
    );

    if (!categoryAttrs) {
      this.addWarning(rowIndex, 'variants', 'No category attributes found. Variants will be created as-is.');
      return;
    }

    product.variants.forEach((variant, index) => {
      // Validate sizes
      if (variant.size && categoryAttrs.has_sizes) {
        if (!categoryAttrs.available_sizes?.includes(variant.size)) {
          this.addWarning(rowIndex, 'variant_size', 
            `Size "${variant.size}" not in category's available sizes: ${categoryAttrs.available_sizes?.join(', ')}`
          );
        }
      }

      // Validate colors
      if (variant.color && categoryAttrs.has_colors) {
        if (!categoryAttrs.available_colors?.includes(variant.color)) {
          this.addWarning(rowIndex, 'variant_color', 
            `Color "${variant.color}" not in category's available colors: ${categoryAttrs.available_colors?.join(', ')}`
          );
        }
      }

      // Validate required variant data
      if (!variant.price || variant.price <= 0) {
        this.addError(rowIndex, 'variant_price', `Variant ${index + 1}: Valid price is required`);
      }

      if (!variant.quantity || variant.quantity < 0) {
        this.addError(rowIndex, 'variant_quantity', `Variant ${index + 1}: Valid quantity is required`);
      }
    });

    // Ensure at least one variant
    if (product.variants.length === 0) {
      // Create default variant
      product.variants.push({
        size: null,
        color: null,
        price: product.base_price,
        quantity: 1,
        image_urls: [],
        _variantIndex: 0
      });
    }
  }

  /**
   * Parse price value
   */
  parsePrice(value) {
    if (!value) return 0;
    const price = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(price) ? 0 : Math.max(0, price);
  }

  /**
   * Parse discount value
   */
  parseDiscount(value) {
    if (!value) return 0;
    const discount = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(discount) ? 0 : Math.min(100, Math.max(0, discount));
  }

  /**
   * Parse quantity value
   */
  parseQuantity(value) {
    if (!value) return 0;
    const quantity = parseInt(String(value).replace(/[^\d]/g, ''));
    return isNaN(quantity) ? 0 : Math.max(0, quantity);
  }

  /**
   * Parse date value
   */
  parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  /**
   * Parse image URLs
   */
  parseImageUrls(value) {
    if (!value) return [];
    return String(value).split(',').map(url => url.trim()).filter(url => url.length > 0);
  }

  /**
   * Add error to the errors array
   */
  addError(row, field, message) {
    this.errors.push({
      row,
      field,
      message,
      type: 'error'
    });
  }

  /**
   * Add warning to the warnings array
   */
  addWarning(row, field, message) {
    this.warnings.push({
      row,
      field,
      message,
      type: 'warning'
    });
  }

  /**
   * Get validation summary
   */
  getValidationSummary() {
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      errorsByField: this.groupIssuesByField(this.errors),
      warningsByField: this.groupIssuesByField(this.warnings),
      hasErrors: this.errors.length > 0,
      hasWarnings: this.warnings.length > 0
    };
  }

  /**
   * Group issues by field for summary
   */
  groupIssuesByField(issues) {
    return issues.reduce((acc, issue) => {
      if (!acc[issue.field]) {
        acc[issue.field] = [];
      }
      acc[issue.field].push(issue);
      return acc;
    }, {});
  }
}

export default CSVParser;
