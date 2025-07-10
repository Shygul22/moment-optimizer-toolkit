
import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getMessagesForRoom, sendMessage, getChatRoom, markMessagesAsRead } from "@/lib/chatApi";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ChatMessage, ChatRoom as ChatRoomType } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const ChatRoom = ({ roomId }: { roomId: string }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: room, isLoading: isLoadingRoom } = useQuery<ChatRoomType | null>({
        queryKey: ["chatRoom", roomId],
        queryFn: () => getChatRoom(roomId),
    });

    const { data: messages, isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
        queryKey: ["messages", roomId],
        queryFn: () => getMessagesForRoom(roomId),
        enabled: !!roomId,
    });

    const sendMessageMutation = useMutation({
        mutationFn: ({ content, file }: { content: string; file?: File }) => 
            sendMessage(roomId, user!.id, content, file),
        onSuccess: (newMessage) => {
             queryClient.setQueryData(["messages", roomId], (oldMessages: ChatMessage[] | undefined) =>
                oldMessages ? [...oldMessages, newMessage] : [newMessage]
            );
        },
    });

    // Mark messages as read when room is opened and when messages change
    useEffect(() => {
        if (user?.id && roomId && messages && messages.length > 0) {
            const unreadMessages = messages.filter(msg => !msg.is_read && msg.sender_id !== user.id);
            if (unreadMessages.length > 0) {
                markMessagesAsRead(roomId, user.id).then(() => {
                    // Invalidate queries after marking as read
                    queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
                    queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
                });
            }
        }
    }, [roomId, user?.id, messages, queryClient]);

    useEffect(() => {
        const channel = supabase
            .channel(`chat_room_${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    // We need to fetch the full message with sender info
                    supabase.from('chat_messages').select(`
                        *, 
                        sender:sender_id(id, full_name, avatar_url),
                        attachment:chat_attachments (
                            id,
                            file_name,
                            file_path,
                            file_type,
                            file_size_bytes
                        )
                    `).eq('id', payload.new.id).single().then(({data}) => {
                         if(data) {
                            queryClient.setQueryData(["messages", roomId], (oldMessages: ChatMessage[] | undefined) =>
                                oldMessages ? [...oldMessages, data as ChatMessage] : [data as ChatMessage]
                            );
                            
                            // Mark new message as read immediately if user is viewing this room and it's not their message
                            if (user?.id && data.sender_id !== user.id) {
                                setTimeout(() => {
                                    markMessagesAsRead(roomId, user.id).then(() => {
                                        queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
                                        queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
                                    });
                                }, 500); // Small delay to ensure message is processed
                            }
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, queryClient, user?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    if (isLoadingRoom || isLoadingMessages) {
        return (
             <div className="flex flex-col h-[calc(100vh-80px)]">
                <div className="p-3 sm:p-4 border-b flex items-center space-x-3 sm:space-x-4">
                    <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                    <Skeleton className="h-4 sm:h-6 w-32 sm:w-40" />
                </div>
                <div className="flex-grow p-3 sm:p-4 space-y-3 sm:space-y-4">
                    <Skeleton className="h-12 sm:h-16 w-3/4" />
                    <Skeleton className="h-12 sm:h-16 w-3/4 self-end ml-auto" />
                    <Skeleton className="h-12 sm:h-16 w-1/2" />
                </div>
                <div className="p-3 sm:p-4 border-t">
                    <Skeleton className="h-8 sm:h-10 w-full" />
                </div>
            </div>
        );
    }
    
    if (!room) {
        return <div className="p-4 text-center">Chat room not found.</div>;
    }
    
    const otherUser = room.client_id === user?.id ? room.consultant : room.client;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto border-x">
            <header className="p-3 sm:p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <Link to="/chat" className="p-1.5 sm:p-2 rounded-full hover:bg-muted shrink-0">
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                        <AvatarImage src={otherUser.avatar_url || ''} />
                        <AvatarFallback>{otherUser.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h2 className="font-semibold text-base sm:text-lg truncate">{otherUser.full_name}</h2>
                </div>
            </header>
            <div className="flex-grow p-3 sm:p-4 overflow-y-auto">
                <div className="space-y-3 sm:space-y-4">
                    {messages?.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-3 sm:p-4 border-t">
                <MessageInput
                    isSending={sendMessageMutation.isPending}
                    onSendMessage={(content, file) => sendMessageMutation.mutate({ content, file })}
                />
            </div>
        </div>
    );
};
