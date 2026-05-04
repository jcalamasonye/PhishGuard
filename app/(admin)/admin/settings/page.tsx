'use client';

import React, { useState, useEffect } from 'react';
import { Save, Lock } from 'lucide-react';
import { Header } from '@/components/shared/Header';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import apiClient from '@/lib/api-client';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notifications, setNotifications] = useState({
    campaignLaunched: true,
    campaignCompleted: true,
    highRiskAlerts: true,
    weeklySummary: false,
    individualClicks: true,
    systemUpdates: true,
    browserNotifications: false
  });

  
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSavePersonalInfo = async () => {
  if (!user) return;
  setSaving(true);
  try {
    await userService.update(user.id, { name: fullName });
    // Refresh user data in context
    const updatedUser = await authService.getMe();
    setFullName(updatedUser.name || '');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  } catch (err) {
    console.error('Failed to update profile:', err);
  } finally {
    setSaving(false);
  }
};

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      alert(error.response?.data?.error?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = () => {
    
    if (typeof window !== 'undefined') { localStorage.setItem('phishguard_admin_prefs', JSON.stringify(notifications)); }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <>
      <Header
        userName={user?.name || ''}
        userRole="admin"
        notificationCount={0}
      />

      <AdminSidebar />

      <main className="ml-64 mt-[73px] p-6 min-h-screen bg-gray-50">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your personal account settings and preferences</p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-800 font-medium">Profile updated successfully</p>
          </div>
        )}

        <Card className="mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Personal Information</h3>
            <p className="text-sm text-gray-600">Update your name and email address</p>
          </div>

          <div className="space-y-4 mb-6">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />

            <div>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed. Contact your administrator for assistance.
              </p>
            </div>
          </div>

          <Button onClick={handleSavePersonalInfo} variant="primary" className="gap-2" isLoading={saving}>
            <Save className="w-4 h-4" />
            Save
          </Button>
        </Card>

        <Card className="mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h3>
            <p className="text-sm text-gray-600">Update your account password</p>
          </div>

          <div className="space-y-4 mb-6">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />

            <div>
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, numbers, and symbols
              </p>
            </div>

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <Button onClick={handleUpdatePassword} variant="primary" className="gap-2">
            <Lock className="w-4 h-4" />
            Update Password
          </Button>
        </Card>

        <Card className="mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h3>
            <p className="text-sm text-gray-600">Choose what notifications you want to receive</p>
          </div>

          <div className="space-y-6 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Email Notifications</h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Campaign Launched</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Notify me when a phishing campaign is launched
                    </p>
                  </div>
                  <Toggle
                    checked={notifications.campaignLaunched}
                    onChange={(checked) => setNotifications({ ...notifications, campaignLaunched: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Campaign Completed</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Notify me when a campaign has finished running
                    </p>
                  </div>
                  <Toggle
                    checked={notifications.campaignCompleted}
                    onChange={(checked) => setNotifications({ ...notifications, campaignCompleted: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">High-Risk User Alerts</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Alert me when users are identified as high-risk
                    </p>
                  </div>
                  <Toggle
                    checked={notifications.highRiskAlerts}
                    onChange={(checked) => setNotifications({ ...notifications, highRiskAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Weekly Summary Report</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Receive a weekly summary of all campaign activities
                    </p>
                  </div>
                  <Toggle
                    checked={notifications.weeklySummary}
                    onChange={(checked) => setNotifications({ ...notifications, weeklySummary: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Individual Click Events</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Real-time notifications when users click phishing links (may be frequent)
                    </p>
                  </div>
                  <Toggle
                    checked={notifications.individualClicks}
                    onChange={(checked) => setNotifications({ ...notifications, individualClicks: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">System Updates</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Important platform updates and new features
                    </p>
                  </div>
                  <Toggle
                    checked={notifications.systemUpdates}
                    onChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Browser Notifications</h4>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Enable Browser Notifications</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Receive push notifications in your browser for urgent alerts
                  </p>
                </div>
                <Toggle
                  checked={notifications.browserNotifications}
                  onChange={(checked) => setNotifications({ ...notifications, browserNotifications: checked })}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSavePreferences} variant="primary" className="gap-2">
            <Save className="w-4 h-4" />
            Save Preferences
          </Button>
        </Card>
      </main>
    </>
  );
}
