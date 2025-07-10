
import { ChatRoom } from "@/components/chat/ChatRoom";
import { useParams } from "react-router-dom";

const ChatRoomPage = () => {
    const { roomId } = useParams<{ roomId: string }>();

    if (!roomId) {
        return <div>Room not found.</div>;
    }

    return <ChatRoom roomId={roomId} />;
};

export default ChatRoomPage;
