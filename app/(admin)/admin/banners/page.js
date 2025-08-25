'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSupabase } from '../hooks/useSupabase';
import { FiEdit2, FiTrash2, FiPlus, FiImage, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'sonner';
import BannerForm from '../components/bannerform';
import { PremiumCard, Button, GradientText } from '../../../components/ui';
import Image from 'next/image';

export default function BannersPage() {
  const [selectedBanner, setSelectedBanner] = useState(null);
  const { useBanners, useDeleteBanner } = useSupabase();
  const { data: banners, isLoading } = useBanners();
  const deleteBannerMutation = useDeleteBanner();
  const searchParams = useSearchParams();

  // Handle search highlighting from URL params
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    const shouldScroll = searchParams.get('scroll');

    if (highlightId && shouldScroll) {
      setTimeout(() => {
        const element = document.querySelector(`[data-id="${highlightId}"]`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          element.classList.add('highlight-search-result');
          setTimeout(() => {
            element.classList.remove('highlight-search-result');
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams]);

  const handleDelete = async (id) => {
    try {
      await deleteBannerMutation.mutateAsync(id);
      toast.success('Banner deleted successfully');
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <GradientText className="text-2xl lg:text-3xl font-bold mb-2">
            Marketing Banners
          </GradientText>
          <p className="text-primarycolor/70">
            Manage promotional banners and marketing content for your store
          </p>
        </div>
        <Button
          onClick={() => setSelectedBanner({})}
          variant="primary"
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Banner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Total Banners</p>
              <p className="text-2xl font-bold text-primarycolor">{banners?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <FiImage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Active Banners</p>
              <p className="text-2xl font-bold text-green-600">
                {banners?.filter(b => b.is_active).length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <FiEye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primarycolor/70">Inactive Banners</p>
              <p className="text-2xl font-bold text-gray-600">
                {banners?.filter(b => !b.is_active).length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <FiEyeOff className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners?.map((banner) => (
          <PremiumCard
            key={banner.id}
            className="overflow-hidden hover:shadow-xl transition-all duration-300"
            data-id={banner.id}
            data-highlight={banner.id}
            id={`item-${banner.id}`}
          >
            <div className="relative h-48">
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  banner.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {banner.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-primarycolor mb-2">{banner.title}</h3>
              <p className="text-primarycolor/70 text-sm mb-4 line-clamp-2">{banner.description}</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedBanner(banner)}
                  className="p-2 text-primarycolor hover:bg-primarycolor/10 rounded-lg transition-colors"
                  title="Edit banner"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete banner"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </PremiumCard>
        ))}
      </div>

      {banners?.length === 0 && (
        <PremiumCard className="p-8 text-center">
          <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiImage className="w-8 h-8 text-primarycolor/60" />
          </div>
          <p className="text-primarycolor/70 mb-4">No banners found. Create your first marketing banner to get started.</p>
          <Button
            onClick={() => setSelectedBanner({})}
            variant="primary"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Create First Banner
          </Button>
        </PremiumCard>
      )}

      {selectedBanner && (
        <BannerForm
          banner={selectedBanner.id ? selectedBanner : null}
          onClose={() => setSelectedBanner(null)}
        />
      )}
    </div>
  );
}
