"use client";
import { useState, useMemo } from 'react';
import {
  FiPlus, FiSearch, FiFilter, FiDownload, FiUpload, FiPackage,
  FiEdit, FiTrash2, FiEye, FiStar, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'sonner';
import ProductForm from '../components/productform';
import BulkOperations, { BulkSelectCheckbox, productBulkOperations } from '../components/BulkOperations';
import { useSupabase } from '../hooks/useSupabase';
import { PremiumCard, Button, GradientText } from '../../../components/ui';
import Image from 'next/image';

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-primarycolor/20 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-primarycolor/10 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-primarycolor/15 rounded-lg animate-pulse" />
    </div>
  );
}

function ProductCard({ product, isSelected, onSelect, onEdit, onDelete }) {
  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <PremiumCard className="p-4 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start gap-3">
        <BulkSelectCheckbox
          itemId={product.id}
          isSelected={isSelected}
          onSelectionChange={onSelect}
          className="mt-1"
        />

        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {product.image_url && Array.isArray(product.image_url) && product.image_url[0] ? (
            <Image
              src={product.image_url[0]}
              alt={product.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : product.image_url && typeof product.image_url === 'string' ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-primarycolor/40" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primarycolor truncate flex items-center gap-2">
                {product.name}
                {product.is_promoted && (
                  <FiStar className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
              </h3>
              <p className="text-sm text-primarycolor/70 truncate">{product.category_name}</p>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold text-primarycolor">
                  KES {discountedPrice.toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-sm text-primarycolor/60 line-through">
                      KES {product.price.toLocaleString()}
                    </span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      -{product.discount}%
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-primarycolor/60">
                <span className={`flex items-center gap-1 ${
                  product.quantity < 10 ? 'text-red-600' : 'text-green-600'
                }`}>
                  <FiPackage className="w-3 h-3" />
                  {product.quantity} in stock
                  {product.quantity < 10 && <FiAlertCircle className="w-3 h-3" />}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(product)}
                className="p-1.5 text-primarycolor hover:bg-primarycolor/10 rounded-lg transition-colors"
                title="Edit product"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete product"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}

export default function ProductManagement() {
  const { useProducts, useCategories, useDeleteProduct } = useSupabase();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || product.category_id === filterCategory;

      const matchesStock = filterStock === 'all' ||
                          (filterStock === 'low' && product.quantity < 10) ||
                          (filterStock === 'out' && product.quantity === 0) ||
                          (filterStock === 'in' && product.quantity > 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, filterCategory, filterStock]);

  // Product statistics
  const productStats = useMemo(() => {
    if (!products) return { total: 0, lowStock: 0, outOfStock: 0, promoted: 0 };

    return {
      total: products.length,
      lowStock: products.filter(p => p.quantity < 10 && p.quantity > 0).length,
      outOfStock: products.filter(p => p.quantity === 0).length,
      promoted: products.filter(p => p.is_promoted).length
    };
  }, [products]);

  // Handle bulk operations
  const handleBulkAction = async (actionId, selectedIds) => {
    switch (actionId) {
      case 'delete':
        await Promise.all(selectedIds.map(id => deleteProduct.mutateAsync(id)));
        toast.success(`${selectedIds.length} products deleted`);
        break;
      case 'export':
        // Export functionality
        const selectedProductsData = products.filter(p => selectedIds.includes(p.id));
        const csvContent = "data:text/csv;charset=utf-8," +
          "Name,Category,Price,Quantity,Discount\n" +
          selectedProductsData.map(p =>
            `"${p.name}","${p.category_name}",${p.price},${p.quantity},${p.discount}`
          ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "products.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Products exported successfully');
        break;
      default:
        toast.info(`${actionId} action not implemented yet`);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(productId);
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (productsLoading || categoriesLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <GradientText className="text-2xl font-bold mb-2">
            Product Management
          </GradientText>
          <p className="text-primarycolor/70">
            Manage your product inventory, pricing, and promotions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Total Products</p>
              <p className="text-2xl font-bold text-primarycolor">{productStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{productStats.lowStock}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{productStats.outOfStock}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
              <FiTrash2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Promoted</p>
              <p className="text-2xl font-bold text-primarycolor">{productStats.promoted}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 rounded-lg flex items-center justify-center">
              <FiStar className="w-6 h-6 text-primarycolor" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        items={filteredProducts}
        selectedItems={selectedProducts}
        onSelectionChange={setSelectedProducts}
        operations={productBulkOperations}
        onBulkAction={handleBulkAction}
        isLoading={deleteProduct.isLoading}
        itemType="products"
      />

      {/* Filters */}
      <PremiumCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/60 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor placeholder-primarycolor/60"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-primarycolor/60" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor"
              >
                <option value="all">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor"
            >
              <option value="all">All Stock Levels</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {/* Product Grid */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="w-8 h-8 text-primarycolor/60" />
            </div>
            <p className="text-primarycolor/70">
              {searchTerm || filterCategory !== 'all' || filterStock !== 'all'
                ? 'No products found matching your filters.'
                : 'No products found. Add your first product to get started.'}
            </p>
            {!searchTerm && filterCategory === 'all' && filterStock === 'all' && (
              <Button
                onClick={() => setShowForm(true)}
                variant="primary"
                className="mt-4"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </PremiumCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProducts.includes(product.id)}
                onSelect={(productId) => {
                  if (selectedProducts.includes(productId)) {
                    setSelectedProducts(selectedProducts.filter(id => id !== productId));
                  } else {
                    setSelectedProducts([...selectedProducts, productId]);
                  }
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProductForm
              product={editingProduct}
              onClose={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
              onSuccess={handleFormSuccess}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
}
