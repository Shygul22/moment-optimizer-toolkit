import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, UserPlus, UserMinus, Shield, AlertTriangle } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: AppRole[];
  is_active: boolean;
}

const fetchUsersWithRoles = async (): Promise<UserWithRoles[]> => {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, is_active');

  if (profilesError) throw profilesError;
  if (!profiles || profiles.length === 0) return [];

  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) throw rolesError;

  // Get user emails from auth metadata
  const { data: authResponse, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) throw authError;

  const usersWithRoles: UserWithRoles[] = profiles.map(profile => {
    // Properly type the auth user to fix TypeScript error
    const authUser = authResponse?.users?.find((user: any) => user.id === profile.id);
    const roles = userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || [];
    
    return {
      id: profile.id,
      email: authUser?.email || 'Unknown',
      full_name: profile.full_name,
      roles,
      is_active: profile.is_active,
    };
  });

  return usersWithRoles;
};

const grantAdminAccess = async (userId: string) => {
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role: 'admin' });

  if (error) throw error;
};

const revokeAdminAccess = async (userId: string) => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .match({ user_id: userId, role: 'admin' });

  if (error) throw error;
};

export const DynamicAdminAccess = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: fetchUsersWithRoles,
  });

  const { mutate: grantAdmin, isPending: isGranting } = useMutation({
    mutationFn: grantAdminAccess,
    onSuccess: () => {
      toast.success('Admin access granted successfully');
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    },
    onError: (error: any) => {
      toast.error('Failed to grant admin access', { description: error.message });
    },
  });

  const { mutate: revokeAdmin, isPending: isRevoking } = useMutation({
    mutationFn: revokeAdminAccess,
    onSuccess: () => {
      toast.success('Admin access revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    },
    onError: (error: any) => {
      toast.error('Failed to revoke admin access', { description: error.message });
    },
  });

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGrantAdmin = (userId: string) => {
    grantAdmin(userId);
  };

  const handleRevokeAdmin = (userId: string) => {
    revokeAdmin(userId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dynamic Admin Access
          </CardTitle>
          <CardDescription>
            Grant or revoke admin privileges for users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Error Loading Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            Failed to load users. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Dynamic Admin Access
        </CardTitle>
        <CardDescription>
          Grant or revoke admin privileges for users dynamically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search">Search Users</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Found {filteredUsers.length} users
          </div>
          
          {filteredUsers.map((user) => {
            const isAdmin = user.roles.includes('admin');
            const isPending = isGranting || isRevoking;
            
            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{user.full_name || 'Unknown'}</div>
                    {!user.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="flex gap-1 mt-2">
                    {user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant={role === 'admin' ? 'default' : 'secondary'}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevokeAdmin(user.id)}
                      disabled={isPending || !user.is_active}
                    >
                      <UserMinus className="h-4 w-4 mr-1" />
                      Revoke Admin
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleGrantAdmin(user.id)}
                      disabled={isPending || !user.is_active}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Grant Admin
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your search.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
