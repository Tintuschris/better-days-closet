"use client";
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  FiUpload, FiDownload, FiCheck, FiX, FiAlertTriangle, 
  FiFileText, FiImage, FiSettings, FiPlay, FiPause 
} from 'react-icons/fi';
import { Button, PremiumCard, GradientText } from '../../../components/ui';
import { useSupabase } from '../hooks/useSupabase';
import { CSVTemplateGenerator } from '../utils/csvTemplateGenerator';
import { CSVParser } from '../utils/csvParser';
import { BulkProcessor, ImageFileHandler } from '../utils/bulkProcessor';

const STEPS = [
  { id: 1, title: 'Template & Files', description: 'Download template and upload files' },
  { id: 2, title: 'Preview & Validate', description: 'Review data and fix errors' },
  { id: 3, title: 'Process Upload', description: 'Create products and variants' },
  { id: 4, title: 'Results', description: 'View upload results and errors' }
];

export default function BulkProductUpload({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [imageFiles, setImageFiles] = useState({});
  const [parsedData, setParsedData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0, message: '' });
  
  const csvFileRef = useRef();
  const imageFileRef = useRef();
  
  const { useCategories, useCategoryAttributes, supabase } = useSupabase();
  const { data: categories = [] } = useCategories();
  const { data: categoryAttributes = [] } = useCategoryAttributes();
  const supabaseHooks = useSupabase();

  // Initialize utilities
  const templateGenerator = new CSVTemplateGenerator(categories, categoryAttributes);
  const csvParser = new CSVParser(categories, categoryAttributes);
  const imageHandler = new ImageFileHandler();

  const handleCategorySelection = useCallback((categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const downloadTemplate = useCallback(() => {
    try {
      const result = templateGenerator.downloadTemplate(selectedCategories, {
        includeVariants: true,
        includeExamples: true,
        variantFormat: 'json'
      });
      toast.success(`Template downloaded: ${result.filename}`);
    } catch (error) {
      toast.error(`Failed to download template: ${error.message}`);
    }
  }, [selectedCategories, templateGenerator]);

  const handleCsvUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setCsvFile(file);
    toast.success('CSV file selected');
  }, []);

  const handleImageUpload = useCallback(async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const processedImages = await imageHandler.processFiles(files);
      setImageFiles(processedImages);
      toast.success(`${Object.keys(processedImages).length} images processed`);
    } catch (error) {
      toast.error(`Failed to process images: ${error.message}`);
    }
  }, [imageHandler]);

  const parseAndValidate = useCallback(async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    try {
      setProcessing(true);
      const results = await csvParser.parseFile(csvFile);
      setParsedData(results);
      setValidationResults(csvParser.getValidationSummary());
      
      if (results.errors.length === 0) {
        toast.success(`${results.data.length} products parsed successfully`);
        setCurrentStep(2);
      } else {
        toast.error(`${results.errors.length} errors found. Please review and fix.`);
        setCurrentStep(2);
      }
    } catch (error) {
      toast.error(`Failed to parse CSV: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  }, [csvFile, csvParser]);

  const startBulkUpload = useCallback(async () => {
    if (!parsedData || validationResults.hasErrors) {
      toast.error('Please fix all errors before proceeding');
      return;
    }

    try {
      setProcessing(true);
      setCurrentStep(3);
      
      const bulkProcessor = new BulkProcessor(supabaseHooks, supabase);
      
      const results = await bulkProcessor.processBulkUpload(
        parsedData.data,
        imageFiles,
        setProgress,
        (status) => toast.info(status)
      );
      
      setProcessingResults(results);
      setCurrentStep(4);
      
      if (results.success) {
        toast.success('Bulk upload completed successfully!');
        if (onSuccess) onSuccess();
      } else {
        toast.error('Bulk upload completed with errors');
      }
    } catch (error) {
      toast.error(`Bulk upload failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  }, [parsedData, validationResults, imageFiles, supabaseHooks, onSuccess]);

  const resetUpload = useCallback(() => {
    setCurrentStep(1);
    setSelectedCategories([]);
    setCsvFile(null);
    setImageFiles({});
    setParsedData(null);
    setValidationResults(null);
    setProcessing(false);
    setProcessingResults(null);
    setProgress({ current: 0, total: 0, percentage: 0, message: '' });
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <PremiumCard className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <GradientText className="text-xl font-bold text-white flex items-center gap-2">
                <FiUpload className="w-5 h-5" />
                Bulk Product Upload
              </GradientText>
              <p className="text-white/80 text-sm mt-1">
                Upload multiple products with variants using CSV and images
              </p>
            </div>
            {onClose && (
              <Button onClick={onClose} variant="outline" className="text-white border-white/20">
                <FiX className="w-4 h-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep > step.id 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.id 
                      ? 'bg-primarycolor text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? <FiCheck className="w-4 h-4" /> : step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-primarycolor' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`mx-4 h-px w-12 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <Step1TemplateAndFiles
              categories={categories}
              selectedCategories={selectedCategories}
              onCategorySelection={handleCategorySelection}
              onDownloadTemplate={downloadTemplate}
              csvFile={csvFile}
              onCsvUpload={handleCsvUpload}
              csvFileRef={csvFileRef}
              imageFiles={imageFiles}
              onImageUpload={handleImageUpload}
              imageFileRef={imageFileRef}
              onNext={parseAndValidate}
              processing={processing}
            />
          )}

          {currentStep === 2 && (
            <Step2PreviewAndValidate
              parsedData={parsedData}
              validationResults={validationResults}
              onBack={() => setCurrentStep(1)}
              onNext={startBulkUpload}
              processing={processing}
            />
          )}

          {currentStep === 3 && (
            <Step3ProcessUpload
              progress={progress}
              processing={processing}
              onCancel={() => setProcessing(false)}
            />
          )}

          {currentStep === 4 && (
            <Step4Results
              results={processingResults}
              onStartOver={resetUpload}
              onClose={onClose}
            />
          )}
        </div>
      </PremiumCard>
    </div>
  );
}

// Step 1: Template and Files
function Step1TemplateAndFiles({ 
  categories, selectedCategories, onCategorySelection, onDownloadTemplate,
  csvFile, onCsvUpload, csvFileRef, imageFiles, onImageUpload, imageFileRef,
  onNext, processing 
}) {
  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-semibold text-primarycolor mb-4">1. Select Categories (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select specific categories to generate a customized template, or leave empty for all categories.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(category => (
            <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => onCategorySelection(category.id)}
                className="rounded border-gray-300 text-primarycolor focus:ring-primarycolor"
              />
              <span className="text-sm text-primarycolor">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Template Download */}
      <div>
        <h3 className="text-lg font-semibold text-primarycolor mb-4">2. Download CSV Template</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-800 mb-1">CSV Template</h4>
              <p className="text-sm text-blue-700">
                Download a pre-formatted CSV template with sample data and instructions.
              </p>
            </div>
            <Button onClick={onDownloadTemplate} className="flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Download Template
            </Button>
          </div>
        </div>
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Upload */}
        <div>
          <h3 className="text-lg font-semibold text-primarycolor mb-4">3. Upload CSV File</h3>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primarycolor transition-colors"
            onClick={() => csvFileRef.current?.click()}
          >
            <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {csvFile ? (
              <div>
                <p className="text-sm font-medium text-primarycolor">{csvFile.name}</p>
                <p className="text-xs text-gray-500">Click to change file</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700">Click to upload CSV file</p>
                <p className="text-xs text-gray-500">Supports .csv files</p>
              </div>
            )}
          </div>
          <input
            ref={csvFileRef}
            type="file"
            accept=".csv"
            onChange={onCsvUpload}
            className="hidden"
          />
        </div>

        {/* Images Upload */}
        <div>
          <h3 className="text-lg font-semibold text-primarycolor mb-4">4. Upload Images (Optional)</h3>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primarycolor transition-colors"
            onClick={() => imageFileRef.current?.click()}
          >
            <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {Object.keys(imageFiles).length > 0 ? (
              <div>
                <p className="text-sm font-medium text-primarycolor">
                  {Object.keys(imageFiles).length} images selected
                </p>
                <p className="text-xs text-gray-500">Click to add more images</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700">Click to upload images</p>
                <p className="text-xs text-gray-500">Supports JPG, PNG, WebP, ZIP files</p>
              </div>
            )}
          </div>
          <input
            ref={imageFileRef}
            type="file"
            accept="image/*,.zip"
            multiple
            onChange={onImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!csvFile || processing}
          className="flex items-center gap-2"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Parsing CSV...
            </>
          ) : (
            <>
              <FiPlay className="w-4 h-4" />
              Parse & Validate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Step 2: Preview and Validate
function Step2PreviewAndValidate({ parsedData, validationResults, onBack, onNext, processing }) {
  if (!parsedData || !validationResults) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primarycolor">Preview & Validation Results</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-green-600 font-medium">{parsedData.data.length} valid products</span>
            {validationResults.totalErrors > 0 && (
              <span className="text-red-600 font-medium ml-4">{validationResults.totalErrors} errors</span>
            )}
            {validationResults.totalWarnings > 0 && (
              <span className="text-yellow-600 font-medium ml-4">{validationResults.totalWarnings} warnings</span>
            )}
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {(validationResults.hasErrors || validationResults.hasWarnings) && (
        <div className="space-y-4">
          {validationResults.hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiX className="w-5 h-5 text-red-500" />
                <h4 className="font-medium text-red-800">Errors Found</h4>
              </div>
              <div className="space-y-2">
                {Object.entries(validationResults.errorsByField).map(([field, errors]) => (
                  <div key={field}>
                    <p className="text-sm font-medium text-red-700 capitalize">{field.replace('_', ' ')}:</p>
                    <ul className="text-sm text-red-600 ml-4">
                      {errors.slice(0, 5).map((error, index) => (
                        <li key={index}>Row {error.row}: {error.message}</li>
                      ))}
                      {errors.length > 5 && (
                        <li className="text-red-500">... and {errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validationResults.hasWarnings && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiAlertTriangle className="w-5 h-5 text-yellow-500" />
                <h4 className="font-medium text-yellow-800">Warnings</h4>
              </div>
              <div className="space-y-2">
                {Object.entries(validationResults.warningsByField).map(([field, warnings]) => (
                  <div key={field}>
                    <p className="text-sm font-medium text-yellow-700 capitalize">{field.replace('_', ' ')}:</p>
                    <ul className="text-sm text-yellow-600 ml-4">
                      {warnings.slice(0, 3).map((warning, index) => (
                        <li key={index}>Row {warning.row}: {warning.message}</li>
                      ))}
                      {warnings.length > 3 && (
                        <li className="text-yellow-500">... and {warnings.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Preview */}
      <div>
        <h4 className="font-medium text-primarycolor mb-3">Product Preview</h4>
        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
          <div className="space-y-3">
            {parsedData.data.slice(0, 10).map((product, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-primarycolor">{product.name}</h5>
                  <span className="text-sm text-gray-500">Row {product._rowIndex}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-1 text-primarycolor">{product.category_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-1 text-primarycolor">KSh {product.base_price}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Variants:</span>
                    <span className="ml-1 text-primarycolor">{product.variants.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Images:</span>
                    <span className="ml-1 text-primarycolor">{product.main_image_urls.length}</span>
                  </div>
                </div>
              </div>
            ))}
            {parsedData.data.length > 10 && (
              <div className="text-center text-gray-500 text-sm">
                ... and {parsedData.data.length - 10} more products
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back to Files
        </Button>
        <Button
          onClick={onNext}
          disabled={validationResults.hasErrors || processing}
          className="flex items-center gap-2"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FiPlay className="w-4 h-4" />
              Start Upload
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Step 3: Process Upload
function Step3ProcessUpload({ progress, processing, onCancel }) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-lg font-semibold text-primarycolor mb-4">Processing Bulk Upload</h3>
        <p className="text-gray-600">
          Please wait while we create your products and variants. This may take a few minutes.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{progress.message}</span>
          <span className="text-sm font-medium text-primarycolor">{progress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primarycolor h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{progress.current} of {progress.total}</span>
          <span>Processing...</span>
        </div>
      </div>

      {/* Cancel Button */}
      {processing && (
        <Button onClick={onCancel} variant="outline" className="flex items-center gap-2">
          <FiPause className="w-4 h-4" />
          Cancel Upload
        </Button>
      )}
    </div>
  );
}

// Step 4: Results
function Step4Results({ results, onStartOver, onClose }) {
  if (!results) {
    return <div>Loading results...</div>;
  }

  const { success, summary } = results;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          success ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {success ? (
            <FiCheck className="w-8 h-8 text-green-600" />
          ) : (
            <FiX className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-primarycolor mb-2">
          {success ? 'Upload Completed!' : 'Upload Completed with Errors'}
        </h3>
        <p className="text-gray-600">
          {success
            ? 'Your products have been successfully uploaded to the system.'
            : 'Some products could not be uploaded. Please review the errors below.'
          }
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{summary.successfulProducts}</div>
          <div className="text-sm text-green-700">Successful Products</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{summary.failedProducts}</div>
          <div className="text-sm text-red-700">Failed Products</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.totalVariants}</div>
          <div className="text-sm text-blue-700">Total Variants</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{summary.successRate}%</div>
          <div className="text-sm text-purple-700">Success Rate</div>
        </div>
      </div>

      {/* Detailed Results */}
      {(summary.details.failed.length > 0 || summary.details.warnings.length > 0) && (
        <div className="space-y-4">
          {summary.details.failed.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-3">Failed Products</h4>
              <div className="space-y-1 max-h-32 overflow-auto">
                {summary.details.failed.map((error, index) => (
                  <div key={index} className="text-sm text-red-600">{error}</div>
                ))}
              </div>
            </div>
          )}

          {summary.details.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-3">Warnings</h4>
              <div className="space-y-1 max-h-32 overflow-auto">
                {summary.details.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-600">{warning}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={onStartOver} variant="outline">
          Upload More Products
        </Button>
        {onClose && (
          <Button onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
