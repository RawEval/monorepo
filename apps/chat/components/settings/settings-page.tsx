'use client';

import { User, Bell, Shield, CreditCard, Globe } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@raweval/ui/card';

export function SettingsPage() {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Profile</CardTitle>
              </div>
              <CardDescription>
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue="User Name"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="user@example.com"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
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
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive email updates
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive push notifications
                    </div>
                  </div>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Manage your security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Two-Factor Authentication
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Billing</CardTitle>
              </div>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Current Plan</div>
                    <div className="text-sm text-muted-foreground">Free Plan</div>
                  </div>
                  <Button variant="outline">Upgrade</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Language & Region</CardTitle>
              </div>
              <CardDescription>
                Choose your preferred language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
