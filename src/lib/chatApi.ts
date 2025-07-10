
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessage } from "@/types/chat";

export async function getChatRoomsForUser(userId: string): Promise<ChatRoom[]> {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      consultant:profiles!consultant_id (id, full_name, avatar_url),
      client:profiles!client_id (id, full_name, avatar_url),
      last_message:chat_messages (
        content,
        created_at
      )
    `)
    .or(`client_id.eq.${userId},consultant_id.eq.${userId}`)
    .order('created_at', { foreignTable: 'chat_messages', ascending: false })
    .limit(1, { foreignTable: 'chat_messages' });

  if (error) {
    console.error("Error fetching chat rooms:", error);
    throw error;
  }
  
  const rooms = data?.map(room => ({
    ...room,
    last_message: Array.isArray(room.last_message) ? room.last_message[0] : null
  })) as ChatRoom[] || [];

  return rooms;
}

export async function getChatRoom(roomId: string): Promise<ChatRoom | null> {
    const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      consultant:profiles!consultant_id (id, full_name, avatar_url),
      client:profiles!client_id (id, full_name, avatar_url)
    `)
    .eq('id', roomId)
    .single();

    if (error) {
        console.error("Error fetching chat room:", error);
        return null;
    }

    return data as ChatRoom;
}

export async function getMessagesForRoom(roomId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('chat_messages')
        .select(`
            *,
            sender:sender_id (id, full_name, avatar_url),
            attachment:chat_attachments (
                id,
                file_name,
                file_path,
                file_type,
                file_size_bytes
            )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
    return data as ChatMessage[];
}

export async function markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .neq('sender_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error("Error marking messages as read:", error);
    }
}

async function uploadFile(file: File, roomId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${roomId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    return filePath;
}

export async function sendMessage(roomId: string, senderId: string, content: string, file?: File): Promise<ChatMessage> {
    let filePath: string | null = null;
    
    // Upload file if provided
    if (file) {
        filePath = await uploadFile(file, roomId);
    }

    // Insert message
    const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
            room_id: roomId,
            sender_id: senderId,
            content: content || null,
            has_attachment: !!file
        })
        .select(`
            *,
            sender:sender_id (id, full_name, avatar_url)
        `)
        .single();
    
    if (messageError) {
        console.error("Error sending message:", messageError);
        throw messageError;
    }

    // Insert attachment if file was uploaded
    if (file && filePath) {
        const { error: attachmentError } = await supabase
            .from('chat_attachments')
            .insert({
                message_id: messageData.id,
                file_path: filePath,
                file_name: file.name,
                file_type: file.type,
                file_size_bytes: file.size
            });

        if (attachmentError) {
            console.error("Error saving attachment:", attachmentError);
            // Don't throw here, message was already sent
        }

        // Add attachment data to message
        (messageData as any).attachment = {
            id: null,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size_bytes: file.size
        };
    }

    return messageData as ChatMessage;
}

export async function createOrGetChatRoom(clientId: string, consultantId: string): Promise<ChatRoom> {
    // First, try to find an existing room
    let { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select(`
            *,
            consultant:profiles!consultant_id (id, full_name, avatar_url),
            client:profiles!client_id (id, full_name, avatar_url)
        `)
        .eq('client_id', clientId)
        .eq('consultant_id', consultantId)
        .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: "exact-single" row not found
        console.error("Error fetching chat room", fetchError);
        throw fetchError;
    }
    
    if (existingRoom) {
        return existingRoom as ChatRoom;
    }

    // If no room exists, create one
    const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
            client_id: clientId,
            consultant_id: consultantId
        })
        .select(`
            *,
            consultant:profiles!consultant_id (id, full_name, avatar_url),
            client:profiles!client_id (id, full_name, avatar_url)
        `)
        .single();
    
    if (createError) {
        console.error("Error creating chat room:", createError);
        throw createError;
    }

    return newRoom as ChatRoom;
}

export async function downloadAttachment(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
        .from('chat_attachments')
        .download(filePath);

    if (error) {
        throw error;
    }

    return data;
}
