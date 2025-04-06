'use client';
import { useState, useRef, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiX, FiUpload } from 'react-icons/fi';
import Image from 'next/image';

export default function BannerForm({ banner, onClose }) {
  const { useAddBanner, useUpdateBanner, useUploadImage } = useSupabase();
  const addMutation = useAddBanner();
  const updateMutation = useUpdateBanner();
  const uploadMutation = useUploadImage();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true,
    display_order: 0
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (banner) {
      setFormData(banner);
      setImagePreview(banner.image_url);
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [banner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image_url;

      if (formData.imageFile) {
        imageUrl = await uploadMutation.mutateAsync(formData.imageFile);
      }

      const bannerData = {
        ...formData,
        image_url: imageUrl
      };
      delete bannerData.imageFile;

      if (banner?.id) {
        await updateMutation.mutateAsync({ id: banner.id, banner: bannerData });
        toast.success('Banner updated successfully');
      } else {
        await addMutation.mutateAsync(bannerData);
        toast.success('Banner added successfully');
      }
      onClose();
    } catch (error) {
      toast.error(banner ? 'Failed to update banner' : 'Failed to add banner');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 z-10"
        >
          <FiX size={20} />
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-6">
          <h2 className="text-xl font-semibold mb-6">
            {banner?.id ? 'Edit Banner' : 'Add New Banner'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Banner Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer"
              >
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={200}
                        height={100}
                        className="object-cover rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-600">Click to upload image</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primarycolor"
                />
                <label className="ml-2 text-sm text-gray-700">Active</label>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Display Order:</label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  className="w-20 p-1 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primarycolor text-white rounded-md"
                disabled={addMutation.isLoading || updateMutation.isLoading}
              >
                {addMutation.isLoading || updateMutation.isLoading
                  ? 'Saving...'
                  : banner?.id
                  ? 'Update'
                  : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
