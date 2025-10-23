'use client';

import { User } from '@/types/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Shield,
  Calendar,
  Building,
  Edit,
  User as UserIcon,
} from 'lucide-react';
import { format } from 'date-fns';

interface ProfileViewProps {
  user: User;
  profileCompletion: number;
  onEdit?: () => void;
}

export function ProfileView({ user, profileCompletion, onEdit }: ProfileViewProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user.profile_picture ? `/storage/${user.profile_picture}` : undefined}
                alt={`${user.first_name} ${user.last_name}`}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {user.first_name} {user.middle_name} {user.last_name}
                </h2>
                <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                {user.mfa_enabled && (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    MFA Enabled
                  </Badge>
                )}
              </div>

              {user.position && <p className="text-muted-foreground">{user.position}</p>}

              {user.specialization && (
                <p className="text-muted-foreground text-sm">
                  Specialization: {user.specialization}
                </p>
              )}

              {/* Profile Completion */}
              <div className="pt-2">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Profile Completion</span>
                  <span className="text-sm font-medium">{profileCompletion}%</span>
                </div>
                <div className="bg-secondary h-2 w-full rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {onEdit && (
              <Button onClick={onEdit} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Your contact details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center gap-3">
              <Phone className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-muted-foreground text-sm">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <UserIcon className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Language Preference</p>
              <p className="text-muted-foreground text-sm">
                {user.language_preference === 'en' ? 'English' : 'Filipino'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Your role and facility details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {user.facility && (
            <div className="flex items-center gap-3">
              <Building className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Facility</p>
                <p className="text-muted-foreground text-sm">{user.facility.name}</p>
                <p className="text-muted-foreground text-xs">{user.facility.code}</p>
              </div>
            </div>
          )}

          {user.department && (
            <div className="flex items-center gap-3">
              <Briefcase className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Department</p>
                <p className="text-muted-foreground text-sm">{user.department}</p>
              </div>
            </div>
          )}

          {user.license_no && (
            <div className="flex items-center gap-3">
              <Shield className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">License Number</p>
                <p className="text-muted-foreground text-sm">{user.license_no}</p>
              </div>
            </div>
          )}

          {user.roles && user.roles.length > 0 && (
            <div className="flex items-start gap-3">
              <Shield className="text-muted-foreground mt-0.5 h-5 w-5" />
              <div>
                <p className="mb-2 text-sm font-medium">Roles</p>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role.id} variant="outline">
                      {role.display_name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your personal details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {user.date_of_birth && (
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(user.date_of_birth), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
          )}

          {user.sex && (
            <div className="flex items-center gap-3">
              <UserIcon className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Sex</p>
                <p className="text-muted-foreground text-sm">{user.sex}</p>
              </div>
            </div>
          )}

          {user.bio && (
            <div className="flex items-start gap-3">
              <UserIcon className="text-muted-foreground mt-0.5 h-5 w-5" />
              <div>
                <p className="mb-1 text-sm font-medium">Bio</p>
                <p className="text-muted-foreground text-sm">{user.bio}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>Recent account information</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {user.last_login_at && (
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Last Login</p>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(user.last_login_at), 'PPpp')}
                </p>
                {user.last_login_ip && (
                  <p className="text-muted-foreground text-xs">IP: {user.last_login_ip}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-muted-foreground text-sm">
                {format(new Date(user.created_at), 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
