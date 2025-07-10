
import { Database } from "@/integrations/supabase/types";

// Represents a chat room with details about its participants and the last message.
export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'] & {
  consultant: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  client: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: ChatMessage | null;
};

// Represents a single chat message, including sender details and optional attachment.
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'] & {
  sender: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  attachment?: {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size_bytes: number;
  } | null;
};
