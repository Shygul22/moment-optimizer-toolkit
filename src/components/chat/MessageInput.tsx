
import * as React from 'react';
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, X } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
    onSendMessage: (content: string, file?: File) => void;
    isSending: boolean;
}

export const MessageInput = ({ onSendMessage, isSending }: MessageInputProps) => {
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (message.trim() || selectedFile) {
            onSendMessage(message.trim(), selectedFile || undefined);
            setMessage("");
            setSelectedFile(null);
        }
    };
    
    const handleAttach = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB");
                return;
            }
            setSelectedFile(file);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" onClick={handleAttach}>
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSending}
                />
                <Button type="submit" disabled={isSending || (!message.trim() && !selectedFile)}>
                    <Send className="h-5 w-5" />
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                />
            </form>
        </div>
    );
};
