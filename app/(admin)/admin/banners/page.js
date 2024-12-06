'use client';
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';
import BannerForm from '../components/bannerform';
import Image from 'next/image';

export default function BannersPage() {
  const [selectedBanner, setSelectedBanner] = useState(null);
  const { useBanners, useDeleteBanner } = useSupabase();
  const { data: banners, isLoading } = useBanners();
  const deleteBannerMutation = useDeleteBanner();

  const handleDelete = async (id) => {
    try {
      await deleteBannerMutation.mutateAsync(id);
      toast.success('Banner deleted successfully');
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Marketing Banners</h1>
        <button
          onClick={() => setSelectedBanner({})}
          className="flex items-center gap-2 bg-primarycolor text-white px-4 py-2 rounded-lg hover:bg-primarycolor/90"
        >
          <FiPlus /> Add Banner
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners?.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{banner.title}</h3>
              <p className="text-gray-600 text-sm">{banner.description}</p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedBanner(banner)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBanner && (
        <BannerForm
          banner={selectedBanner.id ? selectedBanner : null}
          onClose={() => setSelectedBanner(null)}
        />
      )}
    </div>
  );
}
