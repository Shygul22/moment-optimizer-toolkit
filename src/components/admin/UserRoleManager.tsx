
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

type AppRole = Database['public']['Enums']['app_role'];
const ALL_ROLES: AppRole[] = ['admin', 'consultant', 'client'];

interface UserRoleManagerProps {
  userId: string;
  currentRoles: AppRole[];
  isActive: boolean;
}

const updateUserRole = async ({ userId, role, add }: { userId: string; role: AppRole; add: boolean }) => {
  if (add) {
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
    if (error) {
        toast.error(`Failed to add role: ${role}.`, { description: error.message });
        throw error;
    }
  } else {
    // Prevent removing the last role from a user.
    const { data: userRoles, error: fetchError } = await supabase.from('user_roles').select('role').eq('user_id', userId);
    if (fetchError) {
        toast.error('Failed to verify user roles.', { description: fetchError.message });
        throw fetchError;
    }
    if (userRoles && userRoles.length <= 1) {
        const err = new Error('A user must have at least one role.');
        toast.error('Action blocked.', { description: err.message });
        throw err;
    }
    const { error } = await supabase.from('user_roles').delete().match({ user_id: userId, role });
    if (error) {
        toast.error(`Failed to remove role: ${role}.`, { description: error.message });
        throw error;
    }
  }
};

const updateUserStatus = async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
    const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

    if (error) {
        toast.error(`Failed to update user status.`, { description: error.message });
        throw error;
    }
};

export function UserRoleManager({ userId, currentRoles, isActive }: UserRoleManagerProps) {
  const queryClient = useQueryClient();

  const { mutate: mutateRole, isPending: isRolePending } = useMutation({
    mutationFn: updateUserRole,
    onSuccess: (_, variables) => {
      toast.success(`Role '${variables.role}' was ${variables.add ? 'added' : 'removed'}.`);
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-roles'] });
    },
  });

  const { mutate: mutateStatus, isPending: isStatusPending } = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: (_, variables) => {
      toast.success(`User account has been ${variables.isActive ? 'activated' : 'deactivated'}.`);
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-roles'] });
    },
  });

  const handleRoleChange = (role: AppRole) => (checked: boolean) => {
    mutateRole({ userId, role, add: checked });
  };
  
  const handleStatusChange = () => {
    mutateStatus({ userId, isActive: !isActive });
  };

  const isPending = isRolePending || isStatusPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Manage Roles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ALL_ROLES.map((role) => (
          <DropdownMenuCheckboxItem
            key={role}
            checked={currentRoles.includes(role)}
            onCheckedChange={handleRoleChange(role)}
            disabled={isPending}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Account Status</DropdownMenuLabel>
        <DropdownMenuItem onSelect={handleStatusChange} disabled={isPending}>
          {isActive ? 'Deactivate' : 'Activate'} Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
