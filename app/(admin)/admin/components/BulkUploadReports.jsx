"use client";
import { useState } from 'react';
import { 
  FiDownload, FiCheck, FiX, FiAlertTriangle, FiFileText, 
  FiBarChart3, FiTrendingUp, FiPackage 
} from 'react-icons/fi';
import { Button, PremiumCard } from '../../../components/ui';

/**
 * Comprehensive Error Report Generator
 * Creates downloadable reports for bulk upload results
 */
export class BulkUploadReporter {
  constructor() {
    this.reportData = null;
  }

  /**
   * Generate comprehensive report from bulk upload results
   */
  generateReport(results, parsedData, validationResults) {
    const timestamp = new Date().toISOString();
    
    this.reportData = {
      timestamp,
      summary: results.summary,
      validation: validationResults,
      details: {
        successful: results.results.successful,
        failed: results.results.failed,
        warnings: results.results.warnings
      },
      statistics: this.calculateStatistics(results, parsedData),
      recommendations: this.generateRecommendations(results, validationResults)
    };

    return this.reportData;
  }

  /**
   * Calculate detailed statistics
   */
  calculateStatistics(results, parsedData) {
    const { summary } = results;
    
    return {
      totalAttempted: summary.totalProducts,
      successRate: summary.successRate,
      failureRate: 100 - summary.successRate,
      averageVariantsPerProduct: summary.totalVariants / Math.max(summary.successfulProducts, 1),
      processingTime: this.calculateProcessingTime(),
      errorBreakdown: this.analyzeErrorPatterns(results.results.failed),
      categoryBreakdown: this.analyzeCategoryDistribution(parsedData?.data || [])
    };
  }

  /**
   * Analyze error patterns for insights
   */
  analyzeErrorPatterns(failedProducts) {
    const patterns = {};
    
    failedProducts.forEach(failure => {
      const errorType = this.categorizeError(failure.error);
      patterns[errorType] = (patterns[errorType] || 0) + 1;
    });

    return patterns;
  }

  /**
   * Categorize error types
   */
  categorizeError(errorMessage) {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('category')) return 'Category Issues';
    if (message.includes('price')) return 'Pricing Errors';
    if (message.includes('variant')) return 'Variant Problems';
    if (message.includes('image')) return 'Image Upload Failures';
    if (message.includes('required')) return 'Missing Required Fields';
    if (message.includes('format')) return 'Data Format Issues';
    
    return 'Other Errors';
  }

  /**
   * Analyze category distribution
   */
  analyzeCategoryDistribution(products) {
    const distribution = {};
    
    products.forEach(product => {
      const category = product.category_name;
      if (!distribution[category]) {
        distribution[category] = { total: 0, variants: 0 };
      }
      distribution[category].total++;
      distribution[category].variants += product.variants.length;
    });

    return distribution;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(results, validationResults) {
    const recommendations = [];
    
    // Success rate recommendations
    if (results.summary.successRate < 80) {
      recommendations.push({
        type: 'critical',
        title: 'Low Success Rate',
        message: 'Consider reviewing your CSV template and data validation before the next upload.',
        action: 'Download error report and fix common issues'
      });
    }

    // Validation recommendations
    if (validationResults.totalErrors > 0) {
      recommendations.push({
        type: 'error',
        title: 'Data Validation Issues',
        message: 'Multiple validation errors were found in your data.',
        action: 'Review the validation report and update your CSV file'
      });
    }

    // Category recommendations
    const errorPatterns = this.analyzeErrorPatterns(results.results.failed);
    Object.entries(errorPatterns).forEach(([pattern, count]) => {
      if (count > 2) {
        recommendations.push({
          type: 'warning',
          title: `Recurring ${pattern}`,
          message: `${count} products failed due to ${pattern.toLowerCase()}.`,
          action: `Review and fix ${pattern.toLowerCase()} in your data`
        });
      }
    });

    return recommendations;
  }

  /**
   * Calculate processing time (placeholder)
   */
  calculateProcessingTime() {
    // This would be calculated during actual processing
    return 'N/A';
  }

  /**
   * Export report as CSV
   */
  exportCSV() {
    if (!this.reportData) return;

    const csvData = [
      ['Bulk Upload Report', this.reportData.timestamp],
      [''],
      ['SUMMARY'],
      ['Total Products', this.reportData.summary.totalProducts],
      ['Successful', this.reportData.summary.successfulProducts],
      ['Failed', this.reportData.summary.failedProducts],
      ['Success Rate', `${this.reportData.summary.successRate}%`],
      ['Total Variants', this.reportData.summary.totalVariants],
      [''],
      ['FAILED PRODUCTS'],
      ['Row', 'Product Name', 'Error'],
      ...this.reportData.details.failed.map(failure => [
        failure.row,
        failure.product,
        failure.error
      ]),
      [''],
      ['WARNINGS'],
      ['Type', 'Message'],
      ...this.reportData.details.warnings.map(warning => [
        warning.type,
        warning.message || warning.filename
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    this.downloadFile(csvContent, 'bulk-upload-report.csv', 'text/csv');
  }

  /**
   * Export detailed report as JSON
   */
  exportJSON() {
    if (!this.reportData) return;

    const jsonContent = JSON.stringify(this.reportData, null, 2);
    this.downloadFile(jsonContent, 'bulk-upload-report.json', 'application/json');
  }

  /**
   * Download file helper
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Progress Tracking Component
 */
export function ProgressTracker({ progress, status, onCancel }) {
  return (
    <div className="space-y-4">
      {/* Status Message */}
      <div className="text-center">
        <h4 className="text-lg font-semibold text-primarycolor mb-2">{status}</h4>
        <p className="text-gray-600">
          {progress.message || 'Processing your bulk upload...'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-primarycolor">{progress.percentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primarycolor to-primarycolor/80 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{progress.current} of {progress.total}</span>
          <span>
            {progress.percentage === 100 ? 'Complete' : 'Processing...'}
          </span>
        </div>
      </div>

      {/* Cancel Button */}
      {onCancel && progress.percentage < 100 && (
        <div className="text-center">
          <Button onClick={onCancel} variant="outline" size="sm">
            Cancel Upload
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Results Summary Component
 */
export function ResultsSummary({ results, onDownloadReport }) {
  const [reporter] = useState(() => new BulkUploadReporter());
  
  if (!results) return null;

  const { summary } = results;
  const isSuccess = summary.successRate >= 80;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PremiumCard className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
            <FiCheck className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{summary.successfulProducts}</div>
          <div className="text-sm text-gray-600">Successful</div>
        </PremiumCard>

        <PremiumCard className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-3">
            <FiX className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{summary.failedProducts}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </PremiumCard>

        <PremiumCard className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
            <FiPackage className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{summary.totalVariants}</div>
          <div className="text-sm text-gray-600">Variants</div>
        </PremiumCard>

        <PremiumCard className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
            <FiTrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{summary.successRate}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </PremiumCard>
      </div>

      {/* Status Message */}
      <div className={`p-4 rounded-lg border ${
        isSuccess 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
      }`}>
        <div className="flex items-center gap-2">
          {isSuccess ? (
            <FiCheck className="w-5 h-5 text-green-600" />
          ) : (
            <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
          <span className="font-medium">
            {isSuccess 
              ? 'Bulk upload completed successfully!' 
              : 'Bulk upload completed with some issues.'
            }
          </span>
        </div>
        <p className="mt-1 text-sm">
          {isSuccess 
            ? 'All products have been processed and added to your inventory.'
            : 'Some products could not be processed. Please review the errors below.'
          }
        </p>
      </div>

      {/* Download Reports */}
      <div className="flex items-center justify-center gap-4">
        <Button 
          onClick={() => reporter.exportCSV()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FiDownload className="w-4 h-4" />
          Download CSV Report
        </Button>
        
        <Button 
          onClick={() => reporter.exportJSON()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FiFileText className="w-4 h-4" />
          Download Detailed Report
        </Button>
      </div>
    </div>
  );
}

export default BulkUploadReporter;
