
import { ChatList } from "@/components/chat/ChatList";
import { NewChatDialog } from "@/components/chat/NewChatDialog";

const ChatListPage = () => {
    return (
        <div className="container mx-auto py-10">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Conversations</h1>
                    <p className="text-muted-foreground">Select a conversation to start chatting or start a new one.</p>
                </div>
                <NewChatDialog />
            </header>
            <ChatList />
        </div>
    );
};

export default ChatListPage;
