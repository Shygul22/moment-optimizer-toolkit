
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/integrations/supabase/types';
import { UserRoleManager } from './UserRoleManager';
import { Badge } from '@/components/ui/badge';

type AppRole = Database['public']['Enums']['app_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type UserWithRoles = Profile & { roles: AppRole[] };

const fetchUsers = async (): Promise<UserWithRoles[]> => {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profilesError) {
    throw new Error(profilesError.message);
  }
  if (!profiles) return [];

  const userIds = profiles.map((p) => p.id);

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', userIds);

  if (rolesError) {
    throw new Error(rolesError.message);
  }

  const rolesMap = new Map<string, AppRole[]>();
  if (roles) {
    for (const userRole of roles) {
      if(userRole.user_id && userRole.role) {
        const currentRoles = rolesMap.get(userRole.user_id) || [];
        currentRoles.push(userRole.role);
        rolesMap.set(userRole.user_id, currentRoles);
      }
    }
  }

  const users: UserWithRoles[] = profiles.map((profile) => ({
    ...profile,
    roles: rolesMap.get(profile.id) || [],
  }));

  return users;
};

export const UserList = () => {
  const queryClient = useQueryClient();
  const { data: users, isLoading, error } = useQuery<UserWithRoles[]>({
    queryKey: ['admin-users-with-roles'],
    queryFn: fetchUsers,
  });

  useEffect(() => {
    const channel = supabase
      .channel('realtime-profiles-userlist')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const updatedProfile = payload.new as Database['public']['Tables']['profiles']['Row'];
          queryClient.setQueryData<UserWithRoles[]>(['admin-users-with-roles'], (oldData) => {
            if (!oldData) return [];
            return oldData.map((user) =>
              user.id === updatedProfile.id ? { ...user, ...updatedProfile } : user
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const isOnline = (lastSeen: string | null | undefined) => {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    // If last seen was within the last 30 seconds, consider user online
    return (now.getTime() - lastSeenDate.getTime()) < 30000;
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Users</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {error && <div>Error fetching users: {error.message}</div>}
        {users && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Presence</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isOnline(user.last_seen) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="text-sm">{isOnline(user.last_seen) ? 'Online' : 'Offline'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'secondary' : 'destructive'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.business_name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => <Badge key={role} variant="secondary">{role}</Badge>)
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell className="text-right">
                    <UserRoleManager userId={user.id} currentRoles={user.roles} isActive={user.is_active} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
