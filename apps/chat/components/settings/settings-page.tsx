'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/helpers/formatters';
import {
  User,
  Shield,
  Camera,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Key,
  Copy,
  Trash2,
  Plus,
  ExternalLink,
  Wallet,
} from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@raweval/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { authService } from '@/services/auth-service';
import { usersService } from '@/services/users-service';
import { subscriptionsService } from '@/services/subscriptions-service';
import type {
  UserResponse,
  UserModelSubscription,
  UserUsageStats,
  ApiKey,
} from '@raweval/types';

export function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserResponse | null>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: undefined as string | undefined,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<UserModelSubscription[]>(
    []
  );
  const [usage, setUsage] = useState<UserUsageStats | null>(null);
  const [subsLoading, setSubsLoading] = useState(true);

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyInput, setShowNewKeyInput] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);

  // Password
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new_password: '',
    confirm: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setProfileData({
          name: userData.full_name,
          email: userData.email,
          avatar: undefined,
        });
      } catch {
        router.push('/login');
      }
    };
    loadUser();
  }, [router]);

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const [subs, stats] = await Promise.all([
          subscriptionsService.getMySubscriptions(),
          subscriptionsService.getMyUsage(),
        ]);
        console.log('Subs', subs);

        setSubscriptions(
          Array.isArray(subs) ? subs : (subs as any)?.subscriptions || []
        );
        setUsage(stats);
      } catch (err) {
        console.error('Failed to load subscriptions', err);
      } finally {
        setSubsLoading(false);
      }
    };
    loadSubscriptions();
  }, []);

  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const keys = await subscriptionsService.getApiKeys();
        setApiKeys(keys);
      } catch (err) {
        console.error('Failed to load API keys', err);
      } finally {
        setApiKeysLoading(false);
      }
    };
    loadApiKeys();
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (profileData.name && profileData.name !== user.full_name) {
        await usersService.updateFullName({ full_name: profileData.name });
      }
      if (profileData.email && profileData.email !== user.email) {
        await usersService.updateEmail({
          email: profileData.email,
          password: '',
        });
      }
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setIsSaving(false);
      setErrorMsg('Failed to save profile. Please try again.');
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const res = await usersService.uploadAvatar(file);
      setProfileData({ ...profileData, avatar: res.avatarUrl as string });
      setIsSaving(false);
    } catch {
      setErrorMsg('Failed to upload avatar. Please try a smaller image.');
      setTimeout(() => setErrorMsg(null), 5000);
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm) {
      setErrorMsg('Passwords do not match');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    if (passwordData.new_password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setChangingPassword(true);
    try {
      await usersService.changePassword({
        current_password: passwordData.current,
        new_password: passwordData.new_password,
      });
      setSuccessMsg('Password changed successfully');
      setChangePasswordMode(false);
      setPasswordData({ current: '', new_password: '', confirm: '' });
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to change password. Check your current password.');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const key = await subscriptionsService.createApiKey({
        name: newKeyName.trim(),
      });
      setApiKeys((prev) => [key, ...prev]);
      setNewKeyName('');
      setShowNewKeyInput(false);
      setSuccessMsg(
        key.full_key
          ? `API key created! Copy it now — it won't be shown again.`
          : 'API key created!'
      );
      setTimeout(() => setSuccessMsg(null), 10000);
    } catch {
      setErrorMsg('Failed to create API key');
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteApiKey = async (keyId: number) => {
    try {
      await subscriptionsService.deleteApiKey(keyId);
      setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    } catch {
      setErrorMsg('Failed to delete API key');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleCopyKey = (key: ApiKey) => {
    const text = key.full_key || key.key_prefix;
    navigator.clipboard.writeText(text);
    setCopiedKeyId(key.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    try {
      await subscriptionsService.cancel({ subscription_id: subscriptionId });
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === subscriptionId ? { ...s, status: 'cancelled' } : s
        )
      );
      setSuccessMsg('Subscription cancelled');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to cancel subscription');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  return (
    <div className="bg-background flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 space-y-4 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:text-foreground text-muted-foreground w-fit gap-2 pl-0 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-foreground mb-2 text-2xl font-bold sm:text-3xl">
              Settings
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your account, subscriptions, and API keys
            </p>
          </div>
        </div>

        {/* Status banners */}
        {errorMsg && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}

        <div className="space-y-6">
          {/* ----------------------------------------------------------------- */}
          {/* Profile */}
          {/* ----------------------------------------------------------------- */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-5 w-5" />
                <CardTitle>Profile</CardTitle>
              </div>
              <CardDescription>
                Update your profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <Avatar
                    src={profileData.avatar}
                    alt={profileData.name}
                    fallback={profileData.name[0]?.toUpperCase() || 'U'}
                    className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/gif"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleAvatarSelect}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 sm:w-auto"
                      disabled={isSaving}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4 shrink-0" />
                      Change Avatar
                    </Button>
                    <p className="text-muted-foreground text-xs">
                      JPG, PNG or GIF. Max size 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="gap-2"
                  >
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
                    <p className="text-sm text-green-600">
                      Changes saved successfully
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* Security */}
          {/* ----------------------------------------------------------------- */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="text-muted-foreground h-5 w-5" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Manage your password and authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              {changePasswordMode ? (
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current: e.target.value,
                        })
                      }
                      className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new_password: e.target.value,
                        })
                      }
                      className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm: e.target.value,
                        })
                      }
                      className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="gap-2"
                    >
                      {changingPassword ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setChangePasswordMode(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-border flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground text-sm font-medium sm:text-base">
                      Password
                    </div>
                    <div className="text-muted-foreground text-xs sm:text-sm">
                      Change your account password
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChangePasswordMode(true)}
                    className="w-full shrink-0 sm:w-auto"
                  >
                    Change Password
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* Subscription & Usage */}
          {/* ----------------------------------------------------------------- */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-muted-foreground h-5 w-5" />
                  <CardTitle>Subscriptions</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/wallet')}
                    className="gap-2"
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    Wallet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/pricing')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Plans
                  </Button>
                </div>
              </div>
              <CardDescription>
                Manage your active subscriptions and view usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="py-8 text-center">
                  <CreditCard className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
                  <p className="text-muted-foreground mb-3 text-sm">
                    No active subscriptions
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => router.push('/pricing')}
                  >
                    Browse Plans
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscriptions?.map((sub) => (
                    <div
                      key={sub.id}
                      className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">
                            {sub.plan.plan_name}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              sub.status === 'active'
                                ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
                                : sub.status === 'cancelled'
                                  ? 'border-red-500/20 bg-red-500/10 text-red-700'
                                  : ''
                            }
                          >
                            {sub.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {sub.billing_cycle} • Started{' '}
                          {formatDate(sub.start_date)}
                          {sub.end_date &&
                            ` • Ends ${formatDate(sub.end_date)}`}
                        </p>
                      </div>
                      {sub.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive shrink-0"
                          onClick={() => handleCancelSubscription(sub.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Usage summary */}
                  {usage && (
                    <div className="bg-muted/50 mt-4 rounded-lg p-4">
                      <p className="text-foreground mb-2 text-sm font-medium">
                        Usage This Month
                      </p>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground text-xs">Tier</p>
                          <p className="text-foreground text-sm font-medium capitalize">
                            {usage.subscription_tier}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Requests Today
                          </p>
                          <p className="text-foreground text-sm font-medium">
                            {usage.total_requests_today}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Requests This Month
                          </p>
                          <p className="text-foreground text-sm font-medium">
                            {usage.total_requests_month}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Models Used
                          </p>
                          <p className="text-foreground text-sm font-medium">
                            {usage.models.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* API Keys */}
          {/* ----------------------------------------------------------------- */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="text-muted-foreground h-5 w-5" />
                  <CardTitle>API Keys</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewKeyInput(true)}
                  className="gap-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Key
                </Button>
              </div>
              <CardDescription>
                Manage API keys for programmatic access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Create key input */}
              {showNewKeyInput && (
                <div className="border-border mb-4 flex items-center gap-2 rounded-lg border p-3">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Key name (e.g. Production, Dev)"
                    className="border-input bg-background focus:ring-ring flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateApiKey();
                      if (e.key === 'Escape') setShowNewKeyInput(false);
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateApiKey}
                    disabled={creatingKey || !newKeyName.trim()}
                    className="gap-2"
                  >
                    {creatingKey ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Create
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewKeyInput(false);
                      setNewKeyName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {apiKeysLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="py-8 text-center">
                  <Key className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
                  <p className="text-muted-foreground text-sm">
                    No API keys yet. Create one to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="border-border flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-sm font-medium">
                            {key.name || 'Unnamed Key'}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              key.is_active
                                ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
                                : 'border-red-500/20 bg-red-500/10 text-red-700'
                            }
                          >
                            {key.is_active ? 'Active' : 'Revoked'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">
                          {key.full_key || `${key.key_prefix}...`}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          Created {formatDate(key.created_at)}
                          {key.last_used_at &&
                            ` • Last used ${formatDate(key.last_used_at)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCopyKey(key)}
                          title="Copy key"
                        >
                          {copiedKeyId === key.id ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="text-muted-foreground h-3.5 w-3.5" />
                          )}
                        </Button>
                        {key.is_active && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-8 w-8"
                            onClick={() => handleDeleteApiKey(key.id)}
                            title="Revoke key"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
