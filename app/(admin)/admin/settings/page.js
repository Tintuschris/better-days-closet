"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useSupabase } from '../hooks/useSupabase';
import { 
  FiSettings, FiMail, FiGlobe, FiShield, FiDatabase, 
  FiSave, FiRefreshCw, FiEye, FiEyeOff, FiCheck, FiX 
} from 'react-icons/fi';
import { PremiumCard, Button, GradientText } from '../../../components/ui';

function AdminSettingsContent() {
  const searchParams = useSearchParams();
  const { useAdminSettings, useUpdateAdminSetting } = useSupabase();
  const { data: settingsData, isLoading: settingsLoading } = useAdminSettings();
  const updateSetting = useUpdateAdminSetting();

  const [settings, setSettings] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from Supabase
    if (settingsData) {
      const settingsObj = {};
      settingsData.forEach(setting => {
        let value = setting.setting_value;
        // Convert boolean strings to actual booleans
        if (setting.setting_type === 'boolean') {
          value = value === 'true';
        }
        // Convert number strings to numbers
        if (setting.setting_type === 'number') {
          value = parseFloat(value);
        }
        settingsObj[setting.setting_key] = value;
      });
      setSettings(settingsObj);
    }
  }, [settingsData]);

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

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save each changed setting to Supabase
      const promises = Object.entries(settings).map(([key, value]) => {
        return updateSetting.mutateAsync({
          key,
          value: value.toString()
        });
      });

      await Promise.all(promises);

      toast.success('Settings saved successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      const defaultSettings = {
        siteName: 'Better Days Closet',
        siteDescription: 'Premium fashion and lifestyle store',
        siteUrl: 'https://www.betterdayscloset.com',
        contactEmail: 'info@betterdayscloset.com',
        supportEmail: 'support@betterdayscloset.com',
        currency: 'KSh',
        taxRate: '16',
        shippingFee: '200',
        freeShippingThreshold: '5000',
        emailProvider: 'resend',
        smtpHost: 'smtp.resend.com',
        smtpPort: '587',
        smtpUser: 'resend',
        smtpPassword: '',
        enableTwoFactor: false,
        sessionTimeout: '24',
        maxLoginAttempts: '5',
        enableReviews: true,
        enableWishlist: true,
        enableNotifications: true,
        enableAnalytics: true,
        maintenanceMode: false,
      };
      setSettings(defaultSettings);
      setHasChanges(true);
      toast.info('Settings reset to default values');
    }
  };

  const SettingCard = ({ title, icon: Icon, children, id }) => (
    <PremiumCard
      className="p-6"
      data-id={id}
      data-highlight={id}
      id={`item-${id}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primarycolor/10 rounded-lg">
          <Icon className="w-5 h-5 text-primarycolor" />
        </div>
        <h3 className="text-lg font-semibold text-primarycolor">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </PremiumCard>
  );

  const InputField = ({ label, value, onChange, type = "text", placeholder, required = false }) => (
    <div>
      <label className="block text-sm font-medium text-primarycolor mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 transition-all duration-200 placeholder:text-primarycolor/50"
      />
    </div>
  );

  const ToggleField = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-primarycolor/5 rounded-lg">
      <div>
        <div className="font-medium text-primarycolor">{label}</div>
        {description && <div className="text-sm text-primarycolor/70">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primarycolor' : 'bg-primarycolor/20'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <GradientText className="text-2xl font-bold mb-2">
            Admin Settings
          </GradientText>
          <p className="text-primarycolor/70">
            Configure your store settings and preferences
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isLoading}
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="shadow-lg shadow-primarycolor/30"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Changes Indicator */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <FiX className="w-4 h-4" />
            <span className="font-medium">You have unsaved changes</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Settings */}
        <SettingCard title="Site Settings" icon={FiGlobe} id="site-settings">
          <InputField
            label="Site Name"
            value={settings.siteName}
            onChange={(value) => handleInputChange('siteName', value)}
            required
          />
          <InputField
            label="Site Description"
            value={settings.siteDescription}
            onChange={(value) => handleInputChange('siteDescription', value)}
          />
          <InputField
            label="Site URL"
            value={settings.siteUrl}
            onChange={(value) => handleInputChange('siteUrl', value)}
            type="url"
            required
          />
          <InputField
            label="Contact Email"
            value={settings.contactEmail}
            onChange={(value) => handleInputChange('contactEmail', value)}
            type="email"
            required
          />
        </SettingCard>

        {/* Business Settings */}
        <SettingCard title="Business Settings" icon={FiDatabase} id="business-settings">
          <InputField
            label="Currency"
            value={settings.currency}
            onChange={(value) => handleInputChange('currency', value)}
            placeholder="KSh"
          />
          <InputField
            label="Tax Rate (%)"
            value={settings.taxRate}
            onChange={(value) => handleInputChange('taxRate', value)}
            type="number"
            placeholder="16"
          />
          <InputField
            label="Shipping Fee"
            value={settings.shippingFee}
            onChange={(value) => handleInputChange('shippingFee', value)}
            type="number"
            placeholder="200"
          />
          <InputField
            label="Free Shipping Threshold"
            value={settings.freeShippingThreshold}
            onChange={(value) => handleInputChange('freeShippingThreshold', value)}
            type="number"
            placeholder="5000"
          />
        </SettingCard>

        {/* Email Settings */}
        <SettingCard title="Email Settings" icon={FiMail} id="email-settings">
          <InputField
            label="SMTP Host"
            value={settings.smtpHost}
            onChange={(value) => handleInputChange('smtpHost', value)}
            placeholder="smtp.resend.com"
          />
          <InputField
            label="SMTP Port"
            value={settings.smtpPort}
            onChange={(value) => handleInputChange('smtpPort', value)}
            type="number"
            placeholder="587"
          />
          <InputField
            label="SMTP Username"
            value={settings.smtpUser}
            onChange={(value) => handleInputChange('smtpUser', value)}
            placeholder="resend"
          />
          <div className="relative">
            <InputField
              label="SMTP Password"
              value={settings.smtpPassword}
              onChange={(value) => handleInputChange('smtpPassword', value)}
              type={showPasswords ? "text" : "password"}
              placeholder="Enter SMTP password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-9 text-primarycolor/60 hover:text-primarycolor"
            >
              {showPasswords ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </SettingCard>

        {/* Security Settings */}
        <SettingCard title="Security Settings" icon={FiShield} id="security-settings">
          <ToggleField
            label="Two-Factor Authentication"
            description="Require 2FA for admin accounts"
            checked={settings.enableTwoFactor}
            onChange={(value) => handleInputChange('enableTwoFactor', value)}
          />
          <InputField
            label="Session Timeout (hours)"
            value={settings.sessionTimeout}
            onChange={(value) => handleInputChange('sessionTimeout', value)}
            type="number"
            placeholder="24"
          />
          <InputField
            label="Max Login Attempts"
            value={settings.maxLoginAttempts}
            onChange={(value) => handleInputChange('maxLoginAttempts', value)}
            type="number"
            placeholder="5"
          />
        </SettingCard>
      </div>

      {/* Feature Flags */}
      <SettingCard title="Feature Settings" icon={FiSettings} id="feature-settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleField
            label="Product Reviews"
            description="Allow customers to leave reviews"
            checked={settings.enableReviews}
            onChange={(value) => handleInputChange('enableReviews', value)}
          />
          <ToggleField
            label="Wishlist"
            description="Enable wishlist functionality"
            checked={settings.enableWishlist}
            onChange={(value) => handleInputChange('enableWishlist', value)}
          />
          <ToggleField
            label="Push Notifications"
            description="Send push notifications to users"
            checked={settings.enableNotifications}
            onChange={(value) => handleInputChange('enableNotifications', value)}
          />
          <ToggleField
            label="Analytics"
            description="Track user behavior and sales"
            checked={settings.enableAnalytics}
            onChange={(value) => handleInputChange('enableAnalytics', value)}
          />
          <ToggleField
            label="Maintenance Mode"
            description="Put site in maintenance mode"
            checked={settings.maintenanceMode}
            onChange={(value) => handleInputChange('maintenanceMode', value)}
          />
        </div>
      </SettingCard>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <AdminSettingsContent />
    </Suspense>
  );
}
