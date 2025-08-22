"use client";
import { useState, useMemo } from 'react';
import {
  FiPlus, FiSearch, FiFilter, FiDownload, FiUpload, FiList,
  FiEdit, FiTrash2, FiEye, FiPackage, FiGrid, FiMove, FiSettings
} from 'react-icons/fi';
import { toast } from 'sonner';
import CategoryForm from '../components/categoryform';
import CategoryAttributesManager from '../components/CategoryAttributesManager';
import BulkOperations, { BulkSelectCheckbox, categoryBulkOperations } from '../components/BulkOperations';
import { useSupabase } from '../hooks/useSupabase';
import { PremiumCard, Button, GradientText } from '../../../components/ui';

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-primarycolor/20 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-primarycolor/10 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 bg-primarycolor/15 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ category, isSelected, onSelect, onEdit, onDelete, onManageAttributes }) {
  return (
    <PremiumCard className="p-4 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <BulkSelectCheckbox
            itemId={category.id}
            isSelected={isSelected}
            onSelectionChange={onSelect}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primarycolor/20 to-secondarycolor/20 rounded-lg flex items-center justify-center">
                <FiList className="w-4 h-4 text-primarycolor" />
              </div>
              <h3 className="font-semibold text-primarycolor truncate">{category.name}</h3>
            </div>

            <div className="flex items-center gap-4 text-sm text-primarycolor/70">
              <span className="flex items-center gap-1">
                <FiPackage className="w-3 h-3" />
                {category.actual_product_count || 0} products
              </span>
              {category.attributes && (category.attributes.has_sizes || category.attributes.has_colors) && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                  {category.attributes.has_sizes && category.attributes.has_colors ? 'Sizes & Colors' :
                   category.attributes.has_sizes ? 'Sizes' : 'Colors'}
                </span>
              )}
            </div>

            {category.description && (
              <p className="text-sm text-primarycolor/60 mt-2 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onManageAttributes(category)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Manage attributes"
          >
            <FiSettings className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-primarycolor hover:bg-primarycolor/10 rounded-lg transition-colors"
            title="Edit category"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete category"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </PremiumCard>
  );
}
export default function CategoryManagement() {
  const { useCategories, useDeleteCategory } = useSupabase();
  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showAttributesManager, setShowAttributesManager] = useState(false);
  const [selectedCategoryForAttributes, setSelectedCategoryForAttributes] = useState(null);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    return categories.filter(category =>
      category.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Category statistics
  const categoryStats = useMemo(() => {
    if (!categories) return { total: 0, withProducts: 0, empty: 0, totalProducts: 0, withAttributes: 0 };

    return {
      total: categories.length,
      withProducts: categories.filter(c => (c.actual_product_count || 0) > 0).length,
      empty: categories.filter(c => (c.actual_product_count || 0) === 0).length,
      totalProducts: categories.reduce((sum, c) => sum + (c.actual_product_count || 0), 0),
      withAttributes: categories.filter(c => c.attributes && (c.attributes.has_sizes || c.attributes.has_colors)).length
    };
  }, [categories]);

  // Handle bulk operations
  const handleBulkAction = async (actionId, selectedIds) => {
    switch (actionId) {
      case 'delete':
        await Promise.all(selectedIds.map(id => deleteCategory.mutateAsync(id)));
        toast.success(`${selectedIds.length} categories deleted`);
        break;
      case 'export':
        // Export functionality
        const selectedCategoriesData = categories.filter(c => selectedIds.includes(c.id));
        const csvContent = "data:text/csv;charset=utf-8," +
          "Name,Product Count,Has Sizes,Has Colors,Description\n" +
          selectedCategoriesData.map(c =>
            `"${c.name}",${c.actual_product_count || 0},${c.attributes?.has_sizes || false},${c.attributes?.has_colors || false},"${c.description || ''}"`
          ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "categories.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Categories exported successfully');
        break;
      default:
        toast.info(`${actionId} action not implemented yet`);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && (category.actual_product_count || 0) > 0) {
      toast.error('Cannot delete category with products. Move products to another category first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory.mutateAsync(categoryId);
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleManageAttributes = (category) => {
    setSelectedCategoryForAttributes(category);
    setShowAttributesManager(true);
  };

  const handleAttributesSuccess = () => {
    setShowAttributesManager(false);
    setSelectedCategoryForAttributes(null);
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <GradientText className="text-2xl font-bold mb-2">
            Category Management
          </GradientText>
          <p className="text-primarycolor/70">
            Organize your products with categories and manage their structure
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Total Categories</p>
              <p className="text-2xl font-bold text-primarycolor">{categoryStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <FiList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">With Products</p>
              <p className="text-2xl font-bold text-green-600">{categoryStats.withProducts}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Empty Categories</p>
              <p className="text-2xl font-bold text-yellow-600">{categoryStats.empty}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
              <FiTrash2 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Total Products</p>
              <p className="text-2xl font-bold text-primarycolor">{categoryStats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 rounded-lg flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-primarycolor" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        items={filteredCategories}
        selectedItems={selectedCategories}
        onSelectionChange={setSelectedCategories}
        operations={categoryBulkOperations}
        onBulkAction={handleBulkAction}
        isLoading={deleteCategory.isLoading}
        itemType="categories"
      />

      {/* Filters and View Controls */}
      <PremiumCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/60 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor placeholder-primarycolor/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primarycolor/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primarycolor text-white'
                    : 'text-primarycolor hover:bg-primarycolor/20'
                }`}
                title="Grid view"
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primarycolor text-white'
                    : 'text-primarycolor hover:bg-primarycolor/20'
                }`}
                title="List view"
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Category Grid/List */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiList className="w-8 h-8 text-primarycolor/60" />
            </div>
            <p className="text-primarycolor/70">
              {searchTerm
                ? 'No categories found matching your search.'
                : 'No categories found. Add your first category to get started.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowForm(true)}
                variant="primary"
                className="mt-4"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Your First Category
              </Button>
            )}
          </PremiumCard>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategories.includes(category.id)}
                onSelect={(categoryId) => {
                  if (selectedCategories.includes(categoryId)) {
                    setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
                  } else {
                    setSelectedCategories([...selectedCategories, categoryId]);
                  }
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageAttributes={handleManageAttributes}
              />
            ))}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CategoryForm
              category={editingCategory}
              onClose={() => {
                setShowForm(false);
                setEditingCategory(null);
              }}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}

      {/* Category Attributes Manager Modal */}
      {showAttributesManager && selectedCategoryForAttributes && (
        <CategoryAttributesManager
          category={selectedCategoryForAttributes}
          onClose={() => setShowAttributesManager(false)}
          onSuccess={handleAttributesSuccess}
        />
      )}
    </div>
  );
}
