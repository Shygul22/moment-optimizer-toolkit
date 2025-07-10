import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase, withRetry } from "@/integrations/supabase/client";

interface NotificationBadgeProps {
    roomId?: string;
    className?: string;
}

export const NotificationBadge = ({ roomId, className = "" }: NotificationBadgeProps) => {
    const { user } = useAuth();

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['unreadMessages', roomId, user?.id],
        queryFn: async () => {
            if (!user?.id) return 0;
            
            return withRetry(async () => {
                if (roomId) {
                    // Count unread messages for specific room
                    const { count, error } = await supabase
                        .from('chat_messages')
                        .select('id', { count: 'exact' })
                        .eq('room_id', roomId)
                        .eq('is_read', false)
                        .neq('sender_id', user.id);
                    
                    if (error) {
                        console.error('Error counting unread messages for room:', error);
                        throw new Error(`Failed to count unread messages: ${error.message}`);
                    }
                    return count || 0;
                } else {
                    // Count unread messages across all rooms the user is part of
                    const { data: userRooms, error: roomsError } = await supabase
                        .from('chat_rooms')
                        .select('id')
                        .or(`client_id.eq.${user.id},consultant_id.eq.${user.id}`);
                    
                    if (roomsError) {
                        console.error('Error fetching user rooms:', roomsError);
                        throw new Error(`Failed to fetch user rooms: ${roomsError.message}`);
                    }
                    
                    if (!userRooms || userRooms.length === 0) {
                        return 0;
                    }
                    
                    const roomIds = userRooms.map(room => room.id);
                    const { count, error } = await supabase
                        .from('chat_messages')
                        .select('id', { count: 'exact' })
                        .in('room_id', roomIds)
                        .eq('is_read', false)
                        .neq('sender_id', user.id);
                    
                    if (error) {
                        console.error('Error counting total unread messages:', error);
                        throw new Error(`Failed to count total unread messages: ${error.message}`);
                    }
                    return count || 0;
                }
            });
        },
        enabled: !!user?.id,
        refetchInterval: 10000, // Refetch every 10 seconds
        retry: (failureCount, error) => {
            // Don't retry on auth errors
            if (error?.message?.includes('JWT') || error?.message?.includes('permission')) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    if (unreadCount === 0) return null;

    return (
        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
        </span>
    );
};