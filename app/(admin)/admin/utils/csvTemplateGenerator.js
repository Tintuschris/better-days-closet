/**
 * CSV Template Generator for Bulk Product Upload
 * Generates dynamic CSV templates based on selected categories and their attributes
 */

export class CSVTemplateGenerator {
  constructor(categories = [], categoryAttributes = []) {
    this.categories = categories;
    this.categoryAttributes = categoryAttributes;
  }

  /**
   * Generate CSV template based on selected categories
   * @param {Array} selectedCategoryIds - Array of category IDs to include in template
   * @param {Object} options - Template generation options
   * @returns {Object} Template data with headers and sample rows
   */
  generateTemplate(selectedCategoryIds = [], options = {}) {
    const {
      includeVariants = true,
      includeExamples = true,
      variantFormat = 'json', // 'json' or 'columns'
      maxExamples = 3
    } = options;

    // Get selected categories and their attributes
    const selectedCategories = this.categories.filter(cat => 
      selectedCategoryIds.length === 0 || selectedCategoryIds.includes(cat.id)
    );

    const categoryAttrs = this.categoryAttributes.filter(attr =>
      selectedCategories.some(cat => cat.id === attr.category_id)
    );

    // Determine if any category has sizes or colors
    const hasAnySizes = categoryAttrs.some(attr => attr.has_sizes);
    const hasAnyColors = categoryAttrs.some(attr => attr.has_colors);

    // Build base headers
    const baseHeaders = [
      'product_name',
      'description', 
      'category_name',
      'base_price',
      'discount',
      'promotion_type',
      'promotion_start_date',
      'promotion_end_date',
      'main_image_urls'
    ];

    // Add variant headers based on format
    let headers = [...baseHeaders];
    
    if (includeVariants) {
      if (variantFormat === 'json') {
        headers.push('variants_json');
      } else {
        // Column format - add individual variant columns
        headers.push('variant_size', 'variant_color', 'variant_price', 'variant_quantity', 'variant_image_urls');
      }
    }

    // Generate sample data if requested
    const sampleRows = includeExamples ? this.generateSampleData(
      selectedCategories, 
      categoryAttrs, 
      headers, 
      maxExamples,
      variantFormat
    ) : [];

    return {
      headers,
      sampleRows,
      categories: selectedCategories,
      hasVariants: includeVariants,
      hasSizes: hasAnySizes,
      hasColors: hasAnyColors,
      variantFormat,
      instructions: this.generateInstructions(headers, variantFormat, hasAnySizes, hasAnyColors)
    };
  }

  /**
   * Generate sample data rows for the template
   */
  generateSampleData(categories, categoryAttrs, headers, maxExamples, variantFormat) {
    const samples = [];
    
    for (let i = 0; i < Math.min(maxExamples, categories.length); i++) {
      const category = categories[i];
      const attrs = categoryAttrs.find(attr => attr.category_id === category.id);
      
      const baseRow = {
        product_name: `Sample ${category.name} Product ${i + 1}`,
        description: `High-quality ${category.name.toLowerCase()} item with excellent features and comfortable fit.`,
        category_name: category.name,
        base_price: this.getSamplePrice(category.name),
        discount: i === 0 ? '10' : '0',
        promotion_type: i === 0 ? 'percentage' : '',
        promotion_start_date: i === 0 ? '2024-12-01' : '',
        promotion_end_date: i === 0 ? '2024-12-31' : '',
        main_image_urls: 'image1.jpg,image2.jpg,image3.jpg'
      };

      if (variantFormat === 'json' && attrs) {
        baseRow.variants_json = this.generateSampleVariantsJSON(attrs);
      } else if (variantFormat === 'columns' && attrs) {
        // For column format, create multiple rows for variants
        const variants = this.generateSampleVariants(attrs);
        variants.forEach((variant, index) => {
          const variantRow = { ...baseRow };
          if (index > 0) {
            // Clear base product info for additional variant rows
            variantRow.product_name = '';
            variantRow.description = '';
            variantRow.main_image_urls = '';
          }
          variantRow.variant_size = variant.size || '';
          variantRow.variant_color = variant.color || '';
          variantRow.variant_price = variant.price;
          variantRow.variant_quantity = variant.quantity;
          variantRow.variant_image_urls = variant.image_urls || '';
          samples.push(variantRow);
        });
        continue;
      }

      samples.push(baseRow);
    }

    return samples;
  }

  /**
   * Generate sample variants in JSON format
   */
  generateSampleVariantsJSON(attrs) {
    const variants = this.generateSampleVariants(attrs);
    return JSON.stringify(variants);
  }

  /**
   * Generate sample variants array
   */
  generateSampleVariants(attrs) {
    const variants = [];
    const sizes = attrs.available_sizes || [];
    const colors = attrs.available_colors || [];
    
    if (sizes.length > 0 && colors.length > 0) {
      // Generate combinations of sizes and colors
      sizes.slice(0, 2).forEach(size => {
        colors.slice(0, 2).forEach(color => {
          variants.push({
            size,
            color,
            price: this.getSampleVariantPrice(size),
            quantity: Math.floor(Math.random() * 20) + 5,
            image_urls: `${size.toLowerCase()}_${color.toLowerCase()}.jpg`
          });
        });
      });
    } else if (sizes.length > 0) {
      // Only sizes
      sizes.slice(0, 3).forEach(size => {
        variants.push({
          size,
          color: null,
          price: this.getSampleVariantPrice(size),
          quantity: Math.floor(Math.random() * 20) + 5,
          image_urls: `${size.toLowerCase()}.jpg`
        });
      });
    } else if (colors.length > 0) {
      // Only colors
      colors.slice(0, 3).forEach(color => {
        variants.push({
          size: null,
          color,
          price: 1500,
          quantity: Math.floor(Math.random() * 20) + 5,
          image_urls: `${color.toLowerCase()}.jpg`
        });
      });
    } else {
      // No variants, just basic inventory
      variants.push({
        size: null,
        color: null,
        price: 1500,
        quantity: 50,
        image_urls: ''
      });
    }

    return variants;
  }

  /**
   * Get sample price based on category
   */
  getSamplePrice(categoryName) {
    const priceMap = {
      'Women': 2000,
      'Men': 1800,
      'Kids': 1200,
      'Shoes': 3000,
      'Handbags': 2500,
      'Electronics': 5000,
      'Kitchenware': 800
    };
    return priceMap[categoryName] || 1500;
  }

  /**
   * Get sample variant price based on size
   */
  getSampleVariantPrice(size) {
    const sizeMultiplier = {
      'XS': 0.9,
      'S': 0.95,
      'M': 1.0,
      'L': 1.05,
      'XL': 1.1,
      'XXL': 1.15
    };
    return Math.round(1500 * (sizeMultiplier[size] || 1.0));
  }

  /**
   * Generate instructions for the CSV template
   */
  generateInstructions(headers, variantFormat, hasSizes, hasColors) {
    const instructions = [
      "CSV BULK UPLOAD INSTRUCTIONS",
      "================================",
      "",
      "REQUIRED FIELDS:",
      "- product_name: Unique product name",
      "- category_name: Must match existing category exactly",
      "- base_price: Product price in KSh (numbers only)",
      "",
      "OPTIONAL FIELDS:",
      "- description: Product description",
      "- discount: Discount percentage (0-100)",
      "- promotion_type: 'percentage' or 'fixed'",
      "- promotion_start_date: YYYY-MM-DD format",
      "- promotion_end_date: YYYY-MM-DD format",
      "- main_image_urls: Comma-separated image filenames",
      ""
    ];

    if (variantFormat === 'json') {
      instructions.push(
        "VARIANTS (JSON FORMAT):",
        "- variants_json: JSON array of variant objects",
        "- Example: [{\"size\":\"M\",\"color\":\"Red\",\"price\":1500,\"quantity\":10,\"image_urls\":\"red_m.jpg\"}]",
        ""
      );
    } else {
      instructions.push(
        "VARIANTS (COLUMN FORMAT):",
        "- Use multiple rows for the same product with different variants",
        "- Only fill product details in the first row",
        "- variant_size: Size value (if category supports sizes)",
        "- variant_color: Color value (if category supports colors)",
        "- variant_price: Variant-specific price",
        "- variant_quantity: Stock quantity for this variant",
        "- variant_image_urls: Comma-separated variant images",
        ""
      );
    }

    instructions.push(
      "IMAGE HANDLING:",
      "- Upload images separately or provide URLs",
      "- Supported formats: JPG, PNG, WebP",
      "- Multiple images: separate with commas",
      "",
      "NOTES:",
      "- All prices should be in Kenyan Shillings (KSh)",
      "- Dates must be in YYYY-MM-DD format",
      "- Category names are case-sensitive",
      "- Empty cells will use default values"
    );

    return instructions.join('\n');
  }

  /**
   * Convert template data to CSV string
   */
  toCSV(templateData) {
    const { headers, sampleRows } = templateData;
    
    const csvRows = [headers];
    csvRows.push(...sampleRows.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
    ));

    return csvRows.map(row => row.join(',')).join('\n');
  }

  /**
   * Generate and download CSV template file
   */
  downloadTemplate(selectedCategoryIds, options = {}) {
    const templateData = this.generateTemplate(selectedCategoryIds, options);
    const csvContent = this.toCSV(templateData);
    
    // Create filename
    const categoryNames = templateData.categories.map(c => c.name).join('_');
    const filename = `bulk_upload_template_${categoryNames || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return {
      filename,
      templateData,
      csvContent
    };
  }
}

export default CSVTemplateGenerator;
