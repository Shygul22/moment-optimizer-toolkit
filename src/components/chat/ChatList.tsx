
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getChatRoomsForUser } from "@/lib/chatApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ChatRoom } from "@/types/chat";
import { NotificationBadge } from "./NotificationBadge";

export const ChatList = () => {
    const { user } = useAuth();
    
    const { data: rooms, isLoading, isError } = useQuery({
        queryKey: ['chatRooms', user?.id],
        queryFn: () => getChatRoomsForUser(user!.id),
        enabled: !!user,
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (isError) {
        return <p className="text-destructive">Failed to load conversations.</p>;
    }

    if (!rooms || rooms.length === 0) {
        return <p>You have no conversations yet.</p>;
    }

    return (
        <div className="border rounded-lg">
            <ul className="divide-y">
                {rooms.map((room: ChatRoom) => {
                    const otherUser = room.client_id === user?.id ? room.consultant : room.client;
                    const otherUserName = otherUser.full_name || 'User';
                    const fallback = otherUserName.charAt(0).toUpperCase();

                    return (
                        <li key={room.id}>
                            <Link to={`/chat/${room.id}`} className="flex items-center p-4 hover:bg-muted/50 transition-colors relative">
                                <Avatar className="h-12 w-12 mr-4">
                                    <AvatarImage src={otherUser.avatar_url || ''} alt={otherUserName} />
                                    <AvatarFallback>{fallback}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{otherUserName}</h3>
                                        <NotificationBadge roomId={room.id} className="ml-2" />
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate max-w-md">
                                        {room.last_message?.content || 'No messages yet.'}
                                    </p>
                                </div>
                                {room.last_message && (
                                     <time className="text-xs text-muted-foreground self-start ml-2">
                                        {formatDistanceToNow(new Date(room.last_message.created_at), { addSuffix: true })}
                                    </time>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
