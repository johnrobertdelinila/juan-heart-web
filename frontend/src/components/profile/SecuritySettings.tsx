'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Shield, Key, Smartphone, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { changePassword, toggleMfa } from '@/lib/api/profile';
import { User } from '@/types/profile';

const passwordFormSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    new_password_confirmation: z.string(),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Passwords don't match",
    path: ['new_password_confirmation'],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

interface SecuritySettingsProps {
  user: User;
  onUserUpdate?: (user: Partial<User>) => void;
}

export function SecuritySettings({ user, onUserUpdate }: SecuritySettingsProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isTogglingMfa, setIsTogglingMfa] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(user.mfa_enabled);
  const [mfaMethod, setMfaMethod] = useState<string>(user.mfa_method || 'sms');

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      await changePassword(data);
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleMfaToggle = async (enabled: boolean) => {
    setIsTogglingMfa(true);
    try {
      const response = await toggleMfa({
        enabled,
        method: enabled ? (mfaMethod as 'sms' | 'email' | 'authenticator') : undefined,
      });
      setMfaEnabled(response.mfa_enabled);
      toast.success(response.message);
      onUserUpdate?.({ mfa_enabled: response.mfa_enabled, mfa_method: response.mfa_method });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update MFA settings');
      setMfaEnabled(!enabled); // Revert on error
    } finally {
      setIsTogglingMfa(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormDescription>Must be at least 8 characters long</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="new_password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Multi-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Multi-Factor Authentication (MFA)</CardTitle>
          </div>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mfa-toggle">Enable MFA</Label>
              <p className="text-muted-foreground text-sm">
                Require a second verification step when signing in
              </p>
            </div>
            <Switch
              id="mfa-toggle"
              checked={mfaEnabled}
              onCheckedChange={handleMfaToggle}
              disabled={isTogglingMfa}
            />
          </div>

          {mfaEnabled && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="mfa-method">MFA Method</Label>
                <Select
                  value={mfaMethod}
                  onValueChange={(value) => {
                    setMfaMethod(value);
                    // Auto-update when method changes
                    if (mfaEnabled) {
                      handleMfaToggle(true);
                    }
                  }}
                  disabled={isTogglingMfa}
                >
                  <SelectTrigger id="mfa-method" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>SMS</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="authenticator">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Authenticator App</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground mt-2 text-sm">
                  {mfaMethod === 'sms' &&
                    'Receive verification codes via SMS to your registered phone number'}
                  {mfaMethod === 'email' &&
                    'Receive verification codes via email to your registered email address'}
                  {mfaMethod === 'authenticator' &&
                    'Use an authenticator app like Google Authenticator or Authy'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Requirements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Password Requirements</CardTitle>
          </div>
          <CardDescription>Follow these guidelines to create a strong password</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>At least 8 characters long</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Include uppercase and lowercase letters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Include at least one number</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Include at least one special character (!@#$%^&*)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Avoid common words or patterns</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Session Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Session Security</CardTitle>
          </div>
          <CardDescription>Your current session information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session Timeout:</span>
            <span className="font-medium">{user.session_timeout_minutes} minutes</span>
          </div>
          {user.last_login_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login:</span>
              <span className="font-medium">{new Date(user.last_login_at).toLocaleString()}</span>
            </div>
          )}
          {user.last_login_ip && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last IP Address:</span>
              <span className="font-mono text-xs font-medium">{user.last_login_ip}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
