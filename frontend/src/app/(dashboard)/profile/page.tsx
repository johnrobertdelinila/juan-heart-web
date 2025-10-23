'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Edit, Bell, Shield, Activity } from 'lucide-react';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { NotificationPreferences } from '@/components/profile/NotificationPreferences';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { ActivityLog } from '@/components/profile/ActivityLog';
import { User as UserType } from '@/types/profile';
import { getProfile } from '@/lib/api/profile';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [activeTab, setActiveTab] = useState('view');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setUser(response.user);
      setProfileCompletion(response.profile_completion);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser: UserType) => {
    setUser(updatedUser);
    setActiveTab('view');
    fetchProfile(); // Refresh to get updated completion percentage
  };

  const handleUserPartialUpdate = (updates: Partial<UserType>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Failed to load profile</p>
          <button onClick={fetchProfile} className="text-primary mt-4 text-sm hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="view" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">View</span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2">
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <ProfileView
            user={user}
            profileCompletion={profileCompletion}
            onEdit={() => setActiveTab('edit')}
          />
        </TabsContent>

        <TabsContent value="edit">
          <ProfileEditForm
            user={user}
            onSuccess={handleProfileUpdate}
            onCancel={() => setActiveTab('view')}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationPreferences />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings user={user} onUserUpdate={handleUserPartialUpdate} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}
