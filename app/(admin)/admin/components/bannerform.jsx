'use client';
import { useState, useRef, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiX, FiUpload, FiImage, FiFileText, FiToggleLeft, FiToggleRight, FiHash } from 'react-icons/fi';
import Image from 'next/image';
import { PremiumCard, Button, Input, FormGroup, Label, GradientText } from '../../../components/ui';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <FiImage className="w-5 h-5" />
              {banner?.id ? 'Edit Banner' : 'Add New Banner'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
                placeholder="Enter banner title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 placeholder:text-primarycolor/50"
                rows="3"
                placeholder="Enter banner description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Banner Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-primarycolor/20 border-dashed rounded-lg cursor-pointer hover:border-primarycolor/40 transition-colors"
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
                      <FiUpload className="mx-auto h-12 w-12 text-primarycolor/40" />
                      <p className="text-primarycolor/60">Click to upload image</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primarycolor border-primarycolor/20 rounded focus:ring-primarycolor/20"
                />
                <label className="ml-2 text-sm text-primarycolor">Active</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-primarycolor mb-2">Display Order</label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-primarycolor/10">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isLoading || updateMutation.isLoading}
                className="flex items-center gap-2"
              >
                {addMutation.isLoading || updateMutation.isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiImage className="w-4 h-4" />
                    {banner?.id ? 'Update Banner' : 'Add Banner'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
