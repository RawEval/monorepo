'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Bell, Shield, CreditCard, Globe, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@raweval/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useUiStore } from '@/stores/ui-store';

export function SettingsPage() {
  const router = useRouter();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);
  
  // Mock user data - replace with actual auth
  const [profileData, setProfileData] = useState({
    name: 'Mark Anderson',
    email: 'markanderson@gmail.com',
    avatar: undefined,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    // TODO: Implement actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = () => {
    // TODO: Open change password modal
    alert('Change password functionality coming soon');
  };

  const handleEnable2FA = () => {
    // TODO: Open 2FA setup modal
    alert('Two-factor authentication setup coming soon');
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Profile</CardTitle>
              </div>
              <CardDescription>
                Update your profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <Avatar
                    src={profileData.avatar}
                    alt={profileData.name}
                    fallback={profileData.name[0]?.toUpperCase() || 'U'}
                    className="h-16 w-16 sm:h-20 sm:w-20 shrink-0"
                  />
                  <div className="space-y-2 min-w-0 flex-1">
                    <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto" disabled={isSaving}>
                      <Camera className="h-4 w-4 shrink-0" />
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Name and Email */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3">
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Saved!
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  {saveSuccess && (
                    <p className="text-sm text-green-600">Changes saved successfully</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-foreground">Email Notifications</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Receive email updates about your account and activities
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-foreground">Push Notifications</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Receive browser push notifications
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-foreground">Marketing Emails</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Receive emails about new features and promotions
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={notifications.marketing}
                      onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Manage your security settings and authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-foreground">Password</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Last changed 30 days ago
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleChangePassword} className="w-full sm:w-auto shrink-0">
                    Change Password
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-foreground">Two-Factor Authentication</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleEnable2FA} className="w-full sm:w-auto shrink-0">
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Billing & Subscription</CardTitle>
              </div>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-foreground">Current Plan</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Free Plan</div>
                  </div>
                  <Button variant="outline" onClick={openUpgradeModal} className="w-full sm:w-auto shrink-0">
                    Upgrade Plan
                  </Button>
                </div>
                <Separator />
                <div>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/pricing')}>
                    View All Plans
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Language & Region</CardTitle>
              </div>
              <CardDescription>
                Choose your preferred language and region settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Language
                  </label>
                  <select className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Portuguese</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Time Zone
                  </label>
                  <select className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>America/New_York (EST)</option>
                    <option>America/Chicago (CST)</option>
                    <option>America/Denver (MST)</option>
                    <option>America/Los_Angeles (PST)</option>
                    <option>Europe/London (GMT)</option>
                    <option>Europe/Paris (CET)</option>
                    <option>Asia/Tokyo (JST)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
