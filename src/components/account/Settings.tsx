
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface UserSettings {
  id?: string;
  user_id?: string;
  email_notifications: boolean;
  transaction_notifications: boolean;
  kyc_notifications: boolean;
  marketing_emails: boolean;
  language: string;
  timezone: string;
  currency_preference: string;
  updated_at?: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    transaction_notifications: true,
    kyc_notifications: true,
    marketing_emails: false,
    language: 'en',
    timezone: 'UTC',
    currency_preference: 'USD',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      const settingsData = {
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData);

      if (error) throw error;

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Manage your preferences and notification settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Email Notifications</label>
              <p className="text-sm text-gray-500">Receive general email notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.email_notifications}
              onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Transaction Notifications</label>
              <p className="text-sm text-gray-500">Get notified about transaction updates</p>
            </div>
            <input
              type="checkbox"
              checked={settings.transaction_notifications}
              onChange={(e) => setSettings({ ...settings, transaction_notifications: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">KYC Notifications</label>
              <p className="text-sm text-gray-500">Receive updates on verification status</p>
            </div>
            <input
              type="checkbox"
              checked={settings.kyc_notifications}
              onChange={(e) => setSettings({ ...settings, kyc_notifications: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Marketing Emails</label>
              <p className="text-sm text-gray-500">Receive promotional content and updates</p>
            </div>
            <input
              type="checkbox"
              checked={settings.marketing_emails}
              onChange={(e) => setSettings({ ...settings, marketing_emails: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
              <option value="Asia/Singapore">Singapore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Currency</label>
            <select
              value={settings.currency_preference}
              onChange={(e) => setSettings({ ...settings, currency_preference: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="THB">THB - Thai Baht</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="BRL">BRL - Brazilian Real</option>
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="IDR">IDR - Indonesian Rupiah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900">Data Processing</h4>
            <p className="text-sm text-gray-600 mt-1">
              We process your data in accordance with our Privacy Policy to provide our services. 
              This includes transaction processing, KYC verification, and customer support.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900">Data Retention</h4>
            <p className="text-sm text-gray-600 mt-1">
              Your account data is retained as required by law and our compliance obligations. 
              You can request data deletion by contacting our support team.
            </p>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Export Account Data</p>
              <p className="text-sm text-gray-500">Download a copy of your account data</p>
            </div>
            <button
              onClick={() => toast.info('Data export feature coming soon')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Export Data
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-500">Permanently delete your account and data</p>
            </div>
            <button
              onClick={() => toast.error('Please contact support to delete your account')}
              className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
