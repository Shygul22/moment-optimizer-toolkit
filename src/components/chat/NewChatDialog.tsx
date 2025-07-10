
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createOrGetChatRoom } from "@/lib/chatApi";
import { Database } from "@/integrations/supabase/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users } from "lucide-react";
import { toast } from "sonner";

type Profile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

type UserWithRoles = Profile & {
  roles: AppRole[];
};

const fetchAllUsers = async (): Promise<UserWithRoles[]> => {
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

export const NewChatDialog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: fetchAllUsers,
    enabled: open,
  });

  const createChatMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      // Determine who is client and who is consultant
      const { data: currentUserRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      const { data: targetUserRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId);

      const currentRoles = currentUserRoles?.map(r => r.role) || [];
      const targetRoles = targetUserRoles?.map(r => r.role) || [];

      let clientId = user.id;
      let consultantId = targetUserId;

      // If current user is consultant and target is client, swap roles
      if (currentRoles.includes('consultant') && targetRoles.includes('client')) {
        clientId = targetUserId;
        consultantId = user.id;
      }
      // If both are consultants or both are clients, use alphabetical order for consistency
      else if (
        (currentRoles.includes('consultant') && targetRoles.includes('consultant')) ||
        (currentRoles.includes('client') && targetRoles.includes('client'))
      ) {
        if (user.id > targetUserId) {
          clientId = targetUserId;
          consultantId = user.id;
        }
      }

      return createOrGetChatRoom(clientId, consultantId);
    },
    onSuccess: (chatRoom) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      navigate(`/chat/${chatRoom.id}`);
      setOpen(false);
      toast.success("Chat started successfully!");
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      toast.error("Failed to start chat. Please try again.");
    },
  });

  const availableUsers = users?.filter(u => u.id !== user?.id) || [];

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'consultant':
        return 'default' as const;
      case 'client':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Start a New Conversation
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : availableUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No other users available to chat with.
            </div>
          ) : (
            <div className="space-y-2">
              {availableUsers.map((targetUser) => (
                <div
                  key={targetUser.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={targetUser.avatar_url || ''} />
                      <AvatarFallback>
                        {targetUser.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {targetUser.full_name || 'Unknown User'}
                      </p>
                      {targetUser.business_name && (
                        <p className="text-sm text-muted-foreground">
                          {targetUser.business_name}
                        </p>
                      )}
                      <div className="flex gap-1 mt-1">
                        {targetUser.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={getRoleBadgeVariant(role)}
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => createChatMutation.mutate(targetUser.id)}
                    disabled={createChatMutation.isPending}
                  >
                    {createChatMutation.isPending ? "Starting..." : "Chat"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
