'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, Monitor, Smartphone, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { UserActivityLog } from '@/types/profile';
import { getActivityLogs } from '@/lib/api/profile';
import { format } from 'date-fns';

const getActionBadgeVariant = (action: string) => {
  if (action.includes('login')) return 'default';
  if (action.includes('password')) return 'secondary';
  if (action.includes('mfa')) return 'outline';
  if (action.includes('profile')) return 'secondary';
  return 'outline';
};

const getActionIcon = (deviceType?: string) => {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Smartphone className="h-4 w-4" />;
    case 'desktop':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
};

const formatAction = (action: string): string => {
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function ActivityLog() {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<UserActivityLog[]>([]);
  const [limit] = useState(50);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const response = await getActivityLogs(limit);
      setLogs(response.logs);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <CardTitle>Activity Log</CardTitle>
        </div>
        <CardDescription>Your recent account activity and security events</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <Activity className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No activity logs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-card hover:bg-accent/50 flex items-start gap-4 rounded-lg border p-4 transition-colors"
              >
                {/* Icon */}
                <div className="mt-1">{getActionIcon(log.device_type)}</div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {formatAction(log.action)}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          {format(new Date(log.created_at), 'PPpp')}
                        </span>
                      </div>
                      {log.description && (
                        <p className="text-muted-foreground mt-1 text-sm">{log.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs">
                    {log.ip_address && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span className="font-mono">{log.ip_address}</span>
                      </span>
                    )}
                    {log.browser && (
                      <span className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {log.browser}
                      </span>
                    )}
                    {log.platform && (
                      <span className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        {log.platform}
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs">
                        View details
                      </summary>
                      <pre className="bg-muted mt-2 overflow-auto rounded p-2 text-xs">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
