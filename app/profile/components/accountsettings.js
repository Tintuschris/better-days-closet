"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  User,
  Check,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function AccountSettings() {
  const { user, userDetails } = useAuth();
  const [activeSection, setActiveSection] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: userDetails?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  const Toggle = ({ checked, onChange }) => {
    return (
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
          checked ? "bg-primarycolor" : "bg-gray-200"
        }`}
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    );
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("profiles").getPublicUrl(fileName);

        setProfileImage(publicUrl);
        toast.success("Profile image updated");
      } catch (error) {
        toast.error("Error uploading image");
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const passwordsMatch =
    formData.newPassword && formData.newPassword === formData.confirmPassword;

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      if (formData.newPassword) {
        if (!passwordsMatch) {
          toast.error("Passwords don't match");
          return;
        }
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });
        if (passwordError) throw passwordError;
      }

      const { error: profileError } = await supabase
        .from("users")
        .update({
          name: formData.name,
          email_preferences: { emailNotifications },
        })
        .eq("id", user.id);

      if (profileError) throw profileError;
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Matching Orders component style */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b flex items-center">
        <button onClick={() => router.push('/profile')} className="text-primarycolor">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-primarycolor mx-auto">ACCOUNT SETTINGS</h1>
        <div className="w-5"></div> {/* Empty div for alignment */}
      </div>

      <div className="p-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-2">
            <div className="w-20 h-20 rounded-full bg-primarycolor flex items-center justify-center">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <User size={40} className="text-white" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-primarycolor/10 border border-white rounded-full cursor-pointer hover:bg-primarycolor/20 transition-all duration-200">
              <Pencil size={14} className="text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          <h2 className="font-medium text-primarycolor">{formData.name}</h2>
          <p className="text-primarycolor/80">{formData.email}</p>
        </div>

        <div className="border-t border-secondarycolor mb-6" />

        <form onSubmit={updateProfile} className="space-y-4">
          <AnimatePresence>
            {/* Edit Profile Section */}
            <div key="profile-section" className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("profile")}
                className={`w-full flex justify-between items-center p-4 rounded-2xl transition-all duration-200 ${
                  activeSection === "profile"
                    ? "bg-primarycolor"
                    : "text-primarycolor hover:bg-primarycolor/5"
                }`}
              >
                <span className="font-medium">Edit Profile</span>
                {activeSection === "profile" ? (
                  <ChevronUp className="text-secondarycolor" />
                ) : (
                  <ChevronDown className="text-primarycolor" />
                )}
              </button>

              {activeSection === "profile" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primarycolor">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-primarycolor/20 rounded-xl focus:outline-none focus:border-primarycolor/50 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primarycolor">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full p-3 border-2 border-primarycolor/20 rounded-xl bg-gray-50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Password & Security Section */}
            <div key="password-section" className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("password")}
                className={`w-full flex justify-between items-center p-4 rounded-2xl transition-all duration-200 ${
                  activeSection === "password"
                    ? "bg-primarycolor"
                    : "text-primarycolor hover:bg-primarycolor/5"
                }`}
              >
                <span className="font-medium">Password & Security</span>
                {activeSection === "password" ? (
                  <ChevronUp className="text-secondarycolor" />
                ) : (
                  <ChevronDown className="text-primarycolor" />
                )}
              </button>
              {activeSection === "password" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primarycolor">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        placeholder="Enter current password"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-primarycolor/20 rounded-xl focus:outline-none focus:border-primarycolor/50 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primarycolor">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-primarycolor/20 rounded-xl focus:outline-none focus:border-primarycolor/50 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primarycolor">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-primarycolor/20 rounded-xl focus:outline-none focus:border-primarycolor/50 transition-all duration-200"
                      />
                    </div>
                    {formData.newPassword && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Check
                          className={`${
                            passwordsMatch ? "text-green-500" : "text-gray-300"
                          }`}
                          size={20}
                        />
                        <span
                          className={`text-sm ${
                            passwordsMatch ? "text-green-500" : "text-gray-500"
                          }`}
                        >
                          Passwords match
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Notifications & Preferences Section */}
            <div key="notifications-section" className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("notifications")}
                className={`w-full flex justify-between items-center p-4 rounded-2xl transition-all duration-200 ${
                  activeSection === "notifications"
                    ? "bg-primarycolor"
                    : "text-primarycolor hover:bg-primarycolor/5"
                }`}
              >
                <span className="font-medium">Notifications & Preferences</span>
                {activeSection === "notifications" ? (
                  <ChevronUp className="text-secondarycolor" />
                ) : (
                  <ChevronDown className="text-primarycolor" />
                )}
              </button>
              {activeSection === "notifications" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-primarycolor">
                        Email Notifications
                      </span>
                      <Toggle
                        checked={emailNotifications}
                        onChange={setEmailNotifications}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
          <button
            type="submit"
            className="w-full bg-primarycolor text-white py-3 px-4 rounded-full mt-6 hover:bg-primarycolor/90 transition-all duration-200"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
