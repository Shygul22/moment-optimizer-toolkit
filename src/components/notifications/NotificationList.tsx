import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, withRetry } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  return withRetry(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .neq('type', 'call_invitation') // Exclude call notifications
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        // If the table doesn't exist yet, return empty array instead of throwing
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log('Notifications table does not exist yet, returning empty array');
          return [];
        }
        throw new Error(`Failed to fetch notifications: ${error.message}`);
      }

      // Handle the data properly - ensure it matches our Notification interface
      if (!data) {
        return [];
      }

      // Map the data to ensure it matches our interface
      const notifications: Notification[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type,
        data: item.data,
        is_read: item.is_read,
        created_at: item.created_at
      }));

      return notifications;
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      throw error;
    }
  });
};

export const NotificationList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user!.id),
    enabled: !!user,
    retry: (failureCount, error: any) => {
      // Don't retry if the table doesn't exist
      if (error?.message?.includes('does not exist') || error?.code === '42P01') {
        return false;
      }
      // Don't retry on auth errors
      if (error?.message?.includes('JWT') || error?.message?.includes('permission')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (notificationId: string) => {
      return withRetry(async () => {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);

        if (error) {
          throw new Error(`Failed to mark notification as read: ${error.message}`);
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
    onError: (error: Error) => {
      toast.error('Failed to mark notification as read');
      console.error('Mark as read error:', error);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  // Handle network errors
  if (error && error.message?.includes('Failed to fetch')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Notifications</CardTitle>
          <CardDescription className="text-sm">Recent updates and meeting confirmations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Unable to load notifications. Please check your connection and try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle the case where notifications table doesn't exist yet
  if (error && (error.message?.includes('does not exist') || error.code === '42P01')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Notifications</CardTitle>
          <CardDescription className="text-sm">Recent updates and meeting confirmations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Notifications system is being set up...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Notifications</CardTitle>
        <CardDescription className="text-sm">Recent updates and meeting confirmations</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications && notifications.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 sm:p-4 border rounded-lg ${
                  notification.is_read ? 'bg-background' : 'bg-muted/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{notification.title}</h3>
                      {!notification.is_read && (
                        <Badge variant="default" className="text-xs shrink-0">New</Badge>
                      )}
                      <Badge variant="outline" className="text-xs shrink-0">
                        {notification.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-words">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.created_at), 'PPp')}
                    </p>
                    
                    {/* Meeting link for regular meeting notifications */}
                    {notification.data?.meetLink && (
                      <div className="mt-3">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
                          <a href={notification.data.meetLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Join Google Meet
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 self-start sm:self-center"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        )}
      </CardContent>
    </Card>
  );
};