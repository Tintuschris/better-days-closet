"use client";
import { useState, useRef } from 'react';
import { 
  FiDownload, FiUpload, FiFile, FiCheck, FiX, FiAlertCircle, 
  FiLoader, FiFileText, FiDatabase, FiSettings 
} from 'react-icons/fi';
import { toast } from 'sonner';
import { PremiumCard, Button, GradientText } from '../../../components/ui';

const ExportImportSystem = ({
  dataType = 'products', // 'products', 'categories', 'orders', 'customers'
  data = [],
  onImport,
  onExport,
  isLoading = false,
  customFields = null
}) => {
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFields, setExportFields] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef(null);

  // Default field mappings for different data types
  const defaultFields = {
    products: [
      { key: 'name', label: 'Product Name', required: true },
      { key: 'description', label: 'Description', required: false },
      { key: 'category_name', label: 'Category', required: true },
      { key: 'price', label: 'Price', required: true, type: 'number' },
      { key: 'quantity', label: 'Quantity', required: true, type: 'number' },
      { key: 'discount', label: 'Discount (%)', required: false, type: 'number' },
      { key: 'is_promoted', label: 'Promoted', required: false, type: 'boolean' }
    ],
    categories: [
      { key: 'name', label: 'Category Name', required: true },
      { key: 'description', label: 'Description', required: false }
    ],
    orders: [
      { key: 'id', label: 'Order ID', required: true },
      { key: 'customer_name', label: 'Customer Name', required: true },
      { key: 'customer_email', label: 'Customer Email', required: false },
      { key: 'status', label: 'Status', required: true },
      { key: 'total_amount', label: 'Total Amount', required: true, type: 'number' },
      { key: 'created_at', label: 'Order Date', required: true, type: 'date' },
      { key: 'delivery_address', label: 'Delivery Address', required: false }
    ],
    customers: [
      { key: 'name', label: 'Customer Name', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'phone', label: 'Phone', required: false },
      { key: 'order_count', label: 'Total Orders', required: false, type: 'number' },
      { key: 'total_spent', label: 'Total Spent', required: false, type: 'number' }
    ]
  };

  const fields = customFields || defaultFields[dataType] || [];

  // Initialize export fields
  useState(() => {
    setExportFields(fields.map(f => f.key));
  }, []);

  // Handle file selection for import
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please select a CSV or Excel file');
      return;
    }

    setImportFile(file);
    parseImportFile(file);
  };

  // Parse import file and show preview
  const parseImportFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error('File must contain at least a header row and one data row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        // Validate required fields
        const errors = [];
        const requiredFields = fields.filter(f => f.required).map(f => f.key);
        
        requiredFields.forEach(field => {
          const fieldConfig = fields.find(f => f.key === field);
          const headerMatch = headers.find(h => 
            h.toLowerCase() === field.toLowerCase() || 
            h.toLowerCase() === fieldConfig.label.toLowerCase()
          );
          
          if (!headerMatch) {
            errors.push(`Missing required field: ${fieldConfig.label}`);
          }
        });

        // Validate data types
        rows.forEach((row, index) => {
          fields.forEach(field => {
            const value = row[field.key] || row[field.label];
            if (value && field.type) {
              switch (field.type) {
                case 'number':
                  if (isNaN(parseFloat(value))) {
                    errors.push(`Row ${index + 2}: ${field.label} must be a number`);
                  }
                  break;
                case 'boolean':
                  if (!['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())) {
                    errors.push(`Row ${index + 2}: ${field.label} must be true/false or yes/no`);
                  }
                  break;
                case 'date':
                  if (isNaN(Date.parse(value))) {
                    errors.push(`Row ${index + 2}: ${field.label} must be a valid date`);
                  }
                  break;
              }
            }
          });
        });

        setImportPreview({ headers, rows: rows.slice(0, 5), totalRows: rows.length });
        setImportErrors(errors);

        if (errors.length === 0) {
          toast.success(`File parsed successfully! ${rows.length} rows ready to import.`);
        } else {
          toast.warning(`File parsed with ${errors.length} validation errors. Please review.`);
        }

      } catch (error) {
        toast.error('Error parsing file. Please check the format.');
        console.error('Parse error:', error);
      }
    };

    reader.readAsText(file);
  };

  // Handle import execution
  const handleImport = async () => {
    if (!importFile || importErrors.length > 0) {
      toast.error('Please fix all errors before importing');
      return;
    }

    try {
      await onImport(importFile, importPreview);
      toast.success('Data imported successfully!');
      setImportFile(null);
      setImportPreview(null);
      setImportErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const exportData = data.map(item => {
        const exportItem = {};
        exportFields.forEach(field => {
          const fieldConfig = fields.find(f => f.key === field);
          exportItem[fieldConfig?.label || field] = item[field] || '';
        });
        return exportItem;
      });

      if (exportFormat === 'csv') {
        const headers = exportFields.map(field => {
          const fieldConfig = fields.find(f => f.key === field);
          return fieldConfig?.label || field;
        });
        
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => 
            Object.values(row).map(value => 
              typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value
            ).join(',')
          )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      if (onExport) {
        await onExport(exportData, exportFormat);
      }

      toast.success(`${dataType} exported successfully!`);
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <PremiumCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <GradientText className="text-lg font-semibold mb-1">
              Import {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
            </GradientText>
            <p className="text-primarycolor/70 text-sm">
              Import {dataType} data from CSV or Excel files
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <FiUpload className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-primarycolor/30 rounded-lg p-6 text-center hover:border-primarycolor/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {importFile ? (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto">
                  <FiFile className="w-8 h-8 text-primarycolor" />
                </div>
                <div>
                  <p className="font-medium text-primarycolor">{importFile.name}</p>
                  <p className="text-sm text-primarycolor/70">
                    {(importFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    Choose Different File
                  </Button>
                  <Button
                    onClick={() => {
                      setImportFile(null);
                      setImportPreview(null);
                      setImportErrors([]);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <FiX className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto">
                  <FiUpload className="w-8 h-8 text-primarycolor" />
                </div>
                <div>
                  <p className="font-medium text-primarycolor mb-1">
                    Upload {dataType} file
                  </p>
                  <p className="text-sm text-primarycolor/70 mb-3">
                    Drag and drop a CSV or Excel file here, or click to select
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="primary"
                    size="sm"
                  >
                    <FiFile className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Import Errors */}
          {importErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-800">Validation Errors</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {importErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Import Preview */}
          {importPreview && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-primarycolor">Preview ({importPreview.totalRows} rows)</h4>
                <div className="flex items-center gap-2">
                  {importErrors.length === 0 ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <FiCheck className="w-4 h-4" />
                      <span className="text-sm">Ready to import</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <FiX className="w-4 h-4" />
                      <span className="text-sm">{importErrors.length} errors</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {importPreview.headers.map((header, index) => (
                        <th key={index} className="text-left p-2 font-medium text-primarycolor">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.rows.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        {importPreview.headers.map((header, cellIndex) => (
                          <td key={cellIndex} className="p-2 text-primarycolor/80">
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importPreview.totalRows > 5 && (
                <p className="text-xs text-primarycolor/60 mt-2">
                  Showing first 5 rows of {importPreview.totalRows} total rows
                </p>
              )}
            </div>
          )}

          {/* Import Actions */}
          {importFile && (
            <div className="flex items-center justify-end gap-2">
              <Button
                onClick={handleImport}
                disabled={isLoading || importErrors.length > 0}
                variant="primary"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FiUpload className="w-4 h-4 mr-2" />
                    Import {importPreview?.totalRows || 0} Records
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Need a template?</h4>
                <p className="text-sm text-blue-700">
                  Download a CSV template with the correct column headers for {dataType}
                </p>
              </div>
              <Button
                onClick={() => {
                  const headers = fields.map(f => f.label);
                  const csvContent = headers.join(',');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${dataType}_template.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast.success('Template downloaded successfully!');
                }}
                variant="outline"
                size="sm"
              >
                <FiFileText className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Export Section */}
      <PremiumCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <GradientText className="text-lg font-semibold mb-1">
              Export {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
            </GradientText>
            <p className="text-primarycolor/70 text-sm">
              Export your {dataType} data to CSV or Excel format
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
            <FiDownload className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-primarycolor/70 mb-1">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-3 py-2 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 text-primarycolor bg-white"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-primarycolor/70 mb-1">
                Records to Export
              </label>
              <p className="text-primarycolor font-semibold">
                {data.length} {dataType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              size="sm"
            >
              <FiSettings className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>

            <Button
              onClick={handleExport}
              disabled={isLoading || data.length === 0}
              variant="primary"
              className="ml-auto"
            >
              {isLoading ? (
                <>
                  <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4 mr-2" />
                  Export {dataType}
                </>
              )}
            </Button>
          </div>

          {/* Advanced Export Options */}
          {showAdvanced && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primarycolor mb-3">Select Fields to Export</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {fields.map((field) => (
                  <label key={field.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={exportFields.includes(field.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExportFields([...exportFields, field.key]);
                        } else {
                          setExportFields(exportFields.filter(f => f !== field.key));
                        }
                      }}
                      className="w-4 h-4 text-primarycolor border-primarycolor/30 rounded focus:ring-primarycolor/20"
                    />
                    <span className="text-primarycolor">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  );
};

export default ExportImportSystem;
