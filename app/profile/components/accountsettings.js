"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  User,
  Check,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Button, Input, FormGroup, Label, ErrorMessage, GlassContainer, PremiumCard, GradientText } from "../../components/ui";

// Simple Toggle component
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-primarycolor' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default function AccountSettings() {
  const { user, userDetails } = useAuth();
  const router = useRouter();
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
          .from("user-avatars")
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("user-avatars").getPublicUrl(fileName);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      {/* Premium Header */}
      <div className="sticky top-0 backdrop-blur-xl bg-white/80 border-b border-white/20 z-10 shadow-lg shadow-primarycolor/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.push('/profile')}
            className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>

          <GradientText className="text-lg font-semibold">
            Account Settings
          </GradientText>

          <div className="w-10 h-10"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="p-4">
        {/* Premium Profile Card */}
        <PremiumCard className="p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primarycolor to-primarycolor/80 flex items-center justify-center shadow-lg shadow-primarycolor/30">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-white border-2 border-primarycolor/20 rounded-full cursor-pointer hover:bg-primarycolor/5 transition-all duration-200 shadow-lg">
                <Pencil size={16} className="text-primarycolor" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <GradientText className="text-xl font-bold mb-2">
              {formData.name}
            </GradientText>
            <p className="text-primarycolor/70 text-sm">{formData.email}</p>
          </div>
        </PremiumCard>

        <form onSubmit={updateProfile} className="space-y-4">
          <div className="space-y-4">
            {/* Edit Profile Section */}
            <GlassContainer className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("profile")}
                className={`w-full flex justify-between items-center p-4 transition-all duration-200 ${
                  activeSection === "profile"
                    ? "bg-gradient-to-r from-primarycolor to-primarycolor/90 text-white rounded-t-2xl"
                    : "text-primarycolor hover:bg-primarycolor/5 rounded-2xl"
                }`}
              >
                <span className="font-medium">Edit Profile</span>
                {activeSection === "profile" ? (
                  <ChevronUp className="text-white" />
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
                  className="overflow-hidden bg-white/50 rounded-b-2xl"
                >
                  <div className="p-6 space-y-4">
                    <FormGroup>
                      <Label>Full Name</Label>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        variant="premium"
                        radius="lg"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        variant="ghost"
                        radius="lg"
                        className="bg-gray-50/80"
                      />
                    </FormGroup>
                  </div>
                </motion.div>
              )}
            </GlassContainer>

            {/* Password & Security Section */}
            <GlassContainer className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("password")}
                className={`w-full flex justify-between items-center p-4 transition-all duration-200 ${
                  activeSection === "password"
                    ? "bg-gradient-to-r from-primarycolor to-primarycolor/90 text-white rounded-t-2xl"
                    : "text-primarycolor hover:bg-primarycolor/5 rounded-2xl"
                }`}
              >
                <span className="font-medium">Password & Security</span>
                {activeSection === "password" ? (
                  <ChevronUp className="text-white" />
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
                  className="overflow-hidden bg-white/50 rounded-b-2xl"
                >
                  <div className="p-6 space-y-4">
                    <FormGroup>
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        name="currentPassword"
                        placeholder="Enter current password"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        variant="premium"
                        radius="lg"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        name="newPassword"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        variant="premium"
                        radius="lg"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        variant="premium"
                        radius="lg"
                      />
                      {!passwordsMatch && formData.confirmPassword && (
                        <ErrorMessage>Passwords do not match</ErrorMessage>
                      )}
                    </FormGroup>
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
            </GlassContainer>

            {/* Notifications & Preferences Section */}
            <GlassContainer className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("notifications")}
                className={`w-full flex justify-between items-center p-4 transition-all duration-200 ${
                  activeSection === "notifications"
                    ? "bg-gradient-to-r from-primarycolor to-primarycolor/90 text-white rounded-t-2xl"
                    : "text-primarycolor hover:bg-primarycolor/5 rounded-2xl"
                }`}
              >
                <span className="font-medium">Notifications & Preferences</span>
                {activeSection === "notifications" ? (
                  <ChevronUp className="text-white" />
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
                  className="overflow-hidden bg-white/50 rounded-b-2xl"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-primarycolor font-medium">
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
            </GlassContainer>
          </div>

          {/* Premium Save Button */}
          <div className="mt-8">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              radius="full"
              fullWidth
              className="shadow-lg shadow-primarycolor/30"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
