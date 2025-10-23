'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationPreferences as NotificationPreferencesType } from '@/types/profile';
import { getNotificationPreferences, updateNotificationPreferences } from '@/lib/api/profile';

export function NotificationPreferences() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferencesType>({
    email: {
      assessment_assigned: true,
      referral_received: true,
      system_updates: false,
      daily_digest: false,
    },
    sms: {
      urgent_alerts: true,
      referral_received: false,
    },
    push: {
      assessment_assigned: true,
      referral_received: true,
      comments: false,
    },
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await getNotificationPreferences();
      if (response.preferences) {
        setPreferences(response.preferences);
      }
    } catch (error) {
      toast.error('Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateNotificationPreferences(preferences);
      setPreferences(response.preferences);
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (
    category: keyof NotificationPreferencesType,
    key: string,
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>Manage when you receive email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-assessment">Assessment Assigned</Label>
              <p className="text-muted-foreground text-sm">
                Receive emails when a new assessment is assigned to you
              </p>
            </div>
            <Switch
              id="email-assessment"
              checked={preferences.email?.assessment_assigned ?? false}
              onCheckedChange={(checked) =>
                updatePreference('email', 'assessment_assigned', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-referral">Referral Received</Label>
              <p className="text-muted-foreground text-sm">
                Receive emails when a new referral is received
              </p>
            </div>
            <Switch
              id="email-referral"
              checked={preferences.email?.referral_received ?? false}
              onCheckedChange={(checked) => updatePreference('email', 'referral_received', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-updates">System Updates</Label>
              <p className="text-muted-foreground text-sm">
                Receive emails about system updates and new features
              </p>
            </div>
            <Switch
              id="email-updates"
              checked={preferences.email?.system_updates ?? false}
              onCheckedChange={(checked) => updatePreference('email', 'system_updates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-digest">Daily Digest</Label>
              <p className="text-muted-foreground text-sm">Receive a daily summary of activities</p>
            </div>
            <Switch
              id="email-digest"
              checked={preferences.email?.daily_digest ?? false}
              onCheckedChange={(checked) => updatePreference('email', 'daily_digest', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <CardTitle>SMS Notifications</CardTitle>
          </div>
          <CardDescription>Manage when you receive SMS notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-urgent">Urgent Alerts</Label>
              <p className="text-muted-foreground text-sm">
                Receive SMS for urgent or high-priority alerts
              </p>
            </div>
            <Switch
              id="sms-urgent"
              checked={preferences.sms?.urgent_alerts ?? false}
              onCheckedChange={(checked) => updatePreference('sms', 'urgent_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-referral">Referral Received</Label>
              <p className="text-muted-foreground text-sm">
                Receive SMS when a new referral is received
              </p>
            </div>
            <Switch
              id="sms-referral"
              checked={preferences.sms?.referral_received ?? false}
              onCheckedChange={(checked) => updatePreference('sms', 'referral_received', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <CardDescription>Manage when you receive push notifications in the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-assessment">Assessment Assigned</Label>
              <p className="text-muted-foreground text-sm">
                Get notified when a new assessment is assigned to you
              </p>
            </div>
            <Switch
              id="push-assessment"
              checked={preferences.push?.assessment_assigned ?? false}
              onCheckedChange={(checked) =>
                updatePreference('push', 'assessment_assigned', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-referral">Referral Received</Label>
              <p className="text-muted-foreground text-sm">
                Get notified when a new referral is received
              </p>
            </div>
            <Switch
              id="push-referral"
              checked={preferences.push?.referral_received ?? false}
              onCheckedChange={(checked) => updatePreference('push', 'referral_received', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-comments">Comments & Mentions</Label>
              <p className="text-muted-foreground text-sm">
                Get notified when someone comments or mentions you
              </p>
            </div>
            <Switch
              id="push-comments"
              checked={preferences.push?.comments ?? false}
              onCheckedChange={(checked) => updatePreference('push', 'comments', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  );
}
