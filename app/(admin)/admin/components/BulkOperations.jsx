"use client";
import { useState, useCallback } from 'react';
import { 
  FiCheck, FiX, FiTrash2, FiEdit, FiDownload, FiUpload, 
  FiMoreHorizontal, FiCheckSquare, FiSquare, FiLoader 
} from 'react-icons/fi';
import { toast } from 'sonner';
import { Button, PremiumCard } from '../../../components/ui';

const BulkOperations = ({
  items = [],
  selectedItems = [],
  onSelectionChange,
  operations = [],
  onBulkAction,
  isLoading = false,
  itemType = 'items'
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Select all items
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  }, [items, selectedItems, onSelectionChange]);

  // Handle individual item selection
  const handleItemSelect = useCallback((itemId) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  }, [selectedItems, onSelectionChange]);

  // Handle bulk action with confirmation
  const handleBulkAction = useCallback(async (action) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    if (action.requiresConfirmation) {
      setPendingAction(action);
      setShowConfirmDialog(true);
      return;
    }

    try {
      await onBulkAction(action.id, selectedItems);
      toast.success(`${action.label} completed successfully`);
      onSelectionChange([]);
    } catch (error) {
      toast.error(`Failed to ${action.label.toLowerCase()}`);
    }
  }, [selectedItems, onBulkAction, onSelectionChange]);

  // Confirm and execute action
  const confirmAction = useCallback(async () => {
    if (!pendingAction) return;

    try {
      await onBulkAction(pendingAction.id, selectedItems);
      toast.success(`${pendingAction.label} completed successfully`);
      onSelectionChange([]);
    } catch (error) {
      toast.error(`Failed to ${pendingAction.label.toLowerCase()}`);
    } finally {
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  }, [pendingAction, selectedItems, onBulkAction, onSelectionChange]);

  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < items.length;

  return (
    <>
      {/* Bulk Operations Bar */}
      {(selectedItems.length > 0 || items.length > 0) && (
        <PremiumCard className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Select All Checkbox */}
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-primarycolor hover:text-primarycolor/80 transition-colors"
              >
                {isAllSelected ? (
                  <FiCheckSquare className="w-5 h-5" />
                ) : isPartiallySelected ? (
                  <div className="w-5 h-5 border-2 border-primarycolor rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-primarycolor rounded-sm" />
                  </div>
                ) : (
                  <FiSquare className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {selectedItems.length > 0 
                    ? `${selectedItems.length} of ${items.length} selected`
                    : `Select all ${items.length} ${itemType}`
                  }
                </span>
              </button>

              {/* Clear Selection */}
              {selectedItems.length > 0 && (
                <button
                  onClick={() => onSelectionChange([])}
                  className="text-sm text-primarycolor/60 hover:text-primarycolor transition-colors"
                >
                  Clear selection
                </button>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                {operations.map((operation) => (
                  <Button
                    key={operation.id}
                    onClick={() => handleBulkAction(operation)}
                    disabled={isLoading}
                    variant={operation.variant || 'outline'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <operation.icon className="w-4 h-4" />
                    )}
                    {operation.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </PremiumCard>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <PremiumCard className="p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <pendingAction.icon className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-primarycolor mb-2">
                Confirm {pendingAction.label}
              </h3>
              
              <p className="text-primarycolor/70 mb-6">
                {pendingAction.confirmMessage || 
                  `Are you sure you want to ${pendingAction.label.toLowerCase()} ${selectedItems.length} ${itemType}? This action cannot be undone.`
                }
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setPendingAction(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmAction}
                  variant="danger"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <pendingAction.icon className="w-4 h-4 mr-2" />
                      {pendingAction.label}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}
    </>
  );
};

// Individual item checkbox component
export const BulkSelectCheckbox = ({ 
  itemId, 
  isSelected, 
  onSelectionChange,
  className = "" 
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelectionChange(itemId);
      }}
      className={`text-primarycolor hover:text-primarycolor/80 transition-colors ${className}`}
    >
      {isSelected ? (
        <FiCheckSquare className="w-4 h-4" />
      ) : (
        <FiSquare className="w-4 h-4" />
      )}
    </button>
  );
};

// Predefined bulk operations
export const commonBulkOperations = {
  delete: {
    id: 'delete',
    label: 'Delete',
    icon: FiTrash2,
    variant: 'danger',
    requiresConfirmation: true,
    confirmMessage: 'This will permanently delete the selected items. This action cannot be undone.'
  },
  
  export: {
    id: 'export',
    label: 'Export',
    icon: FiDownload,
    variant: 'outline',
    requiresConfirmation: false
  },
  
  bulkEdit: {
    id: 'bulk-edit',
    label: 'Bulk Edit',
    icon: FiEdit,
    variant: 'outline',
    requiresConfirmation: false
  },
  
  activate: {
    id: 'activate',
    label: 'Activate',
    icon: FiCheck,
    variant: 'outline',
    requiresConfirmation: false
  },
  
  deactivate: {
    id: 'deactivate',
    label: 'Deactivate',
    icon: FiX,
    variant: 'outline',
    requiresConfirmation: true
  }
};

// Product-specific operations
export const productBulkOperations = [
  commonBulkOperations.export,
  commonBulkOperations.bulkEdit,
  {
    id: 'update-stock',
    label: 'Update Stock',
    icon: FiEdit,
    variant: 'outline',
    requiresConfirmation: false
  },
  {
    id: 'apply-discount',
    label: 'Apply Discount',
    icon: FiEdit,
    variant: 'outline',
    requiresConfirmation: false
  },
  commonBulkOperations.delete
];

// Order-specific operations
export const orderBulkOperations = [
  commonBulkOperations.export,
  {
    id: 'update-status',
    label: 'Update Status',
    icon: FiEdit,
    variant: 'outline',
    requiresConfirmation: false
  },
  {
    id: 'print-labels',
    label: 'Print Labels',
    icon: FiDownload,
    variant: 'outline',
    requiresConfirmation: false
  },
  {
    id: 'send-notifications',
    label: 'Send Notifications',
    icon: FiCheck,
    variant: 'outline',
    requiresConfirmation: false
  }
];

// Category-specific operations
export const categoryBulkOperations = [
  commonBulkOperations.export,
  commonBulkOperations.bulkEdit,
  {
    id: 'reorder',
    label: 'Reorder',
    icon: FiMoreHorizontal,
    variant: 'outline',
    requiresConfirmation: false
  },
  commonBulkOperations.delete
];

// Customer-specific operations
export const customerBulkOperations = [
  commonBulkOperations.export,
  {
    id: 'send-email',
    label: 'Send Email',
    icon: FiCheck,
    variant: 'outline',
    requiresConfirmation: false
  },
  {
    id: 'add-to-segment',
    label: 'Add to Segment',
    icon: FiEdit,
    variant: 'outline',
    requiresConfirmation: false
  }
];

export default BulkOperations;
