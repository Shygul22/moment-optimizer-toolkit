
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/types/chat";
import { format } from "date-fns";
import { AttachmentDisplay } from "./AttachmentDisplay";

interface MessageBubbleProps {
    message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
    const { user } = useAuth();
    const isOwnMessage = message.sender_id === user?.id;

    return (
        <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
            <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender?.avatar_url || ''} />
                <AvatarFallback>
                    {message.sender?.full_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
            </Avatar>
            <div className={`flex flex-col gap-1 max-w-sm ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg px-3 py-2 ${
                    isOwnMessage 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                }`}>
                    {message.content && (
                        <p className="text-sm">{message.content}</p>
                    )}
                    {message.attachment && (
                        <div className={message.content ? "mt-2" : ""}>
                            <AttachmentDisplay attachment={message.attachment} />
                        </div>
                    )}
                </div>
                <span className="text-xs text-muted-foreground">
                    {format(new Date(message.created_at), 'HH:mm')}
                </span>
            </div>
        </div>
    );
};
