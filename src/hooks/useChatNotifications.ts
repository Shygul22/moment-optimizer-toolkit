
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

export const useChatNotifications = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const location = useLocation();

    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel('chat_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                },
                async (payload) => {
                    const newMessage = payload.new;
                    
                    // Only show notification if message is not from current user
                    if (newMessage.sender_id === user.id) return;

                    // Check if this message is in a room the user is part of
                    const { data: room } = await supabase
                        .from('chat_rooms')
                        .select('id, client_id, consultant_id')
                        .eq('id', newMessage.room_id)
                        .single();
                    
                    if (room && (room.client_id === user.id || room.consultant_id === user.id)) {
                        // Don't show notification if user is currently viewing this chat room
                        const currentPath = location.pathname;
                        const isViewingThisRoom = currentPath === `/chat/${newMessage.room_id}`;
                        
                        if (!isViewingThisRoom) {
                            // Get sender info for notification
                            const { data: sender } = await supabase
                                .from('profiles')
                                .select('full_name')
                                .eq('id', newMessage.sender_id)
                                .single();
                            
                            const senderName = sender?.full_name || 'Someone';
                            const content = newMessage.content || 'Sent an attachment';
                            
                            toast.info(`New message from ${senderName}`, {
                                description: content.length > 50 ? content.substring(0, 50) + '...' : content,
                                action: {
                                    label: 'View',
                                    onClick: () => window.location.href = `/chat/${newMessage.room_id}`
                                }
                            });
                        }
                        
                        // Always invalidate queries to update unread counts
                        queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
                        queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, queryClient, location.pathname]);
};
