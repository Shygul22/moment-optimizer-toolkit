
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, File, Image } from "lucide-react";
import { downloadAttachment } from "@/lib/chatApi";
import { toast } from "sonner";

interface AttachmentDisplayProps {
    attachment: {
        id: string;
        file_name: string;
        file_path: string;
        file_type: string;
        file_size_bytes: number;
    };
}

export const AttachmentDisplay = ({ attachment }: AttachmentDisplayProps) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            const blob = await downloadAttachment(attachment.file_path);
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.file_name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download file");
        } finally {
            setIsDownloading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImage = attachment.file_type.startsWith('image/');

    return (
        <div className="border rounded-lg p-3 bg-muted/50 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
                {isImage ? (
                    <Image className="h-4 w-4" />
                ) : (
                    <File className="h-4 w-4" />
                )}
                <span className="text-sm font-medium truncate">{attachment.file_name}</span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
                {formatFileSize(attachment.file_size_bytes)}
            </div>
            <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full"
            >
                <Download className="h-3 w-3 mr-1" />
                {isDownloading ? "Downloading..." : "Download"}
            </Button>
        </div>
    );
};
