
-- 1. Create a table for chat rooms between a client and a consultant
CREATE TABLE public.chat_rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(client_id, consultant_id)
);
COMMENT ON TABLE public.chat_rooms IS 'Represents a conversation channel between a client and a consultant.';

-- 2. Create a table for chat messages
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_read BOOLEAN NOT NULL DEFAULT false,
    has_attachment BOOLEAN NOT NULL DEFAULT false
);
COMMENT ON TABLE public.chat_messages IS 'Stores individual messages within a chat room.';

-- 3. Create a table for message attachments
CREATE TABLE public.chat_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(message_id) -- One attachment per message for simplicity
);
COMMENT ON TABLE public.chat_attachments IS 'Stores file attachments for chat messages.';


-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_attachments ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for chat_rooms
CREATE POLICY "Users can access their own chat rooms"
ON public.chat_rooms FOR ALL
USING (auth.uid() = client_id OR auth.uid() = consultant_id);

-- 6. Create RLS policies for chat_messages
CREATE POLICY "Users can access messages in their chat rooms"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE id = room_id AND (auth.uid() = client_id OR auth.uid() = consultant_id)
  )
);

CREATE POLICY "Users can send messages in their chat rooms"
ON public.chat_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE id = room_id AND (auth.uid() = client_id OR auth.uid() = consultant_id)
  )
);

CREATE POLICY "Users can update their own messages"
ON public.chat_messages FOR UPDATE
USING (sender_id = auth.uid());

-- 7. Create RLS policies for chat_attachments
CREATE POLICY "Users can access attachments in their chat rooms"
ON public.chat_attachments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chat_messages msg
        JOIN public.chat_rooms room ON msg.room_id = room.id
        WHERE msg.id = chat_attachments.message_id
        AND (auth.uid() = room.client_id OR auth.uid() = room.consultant_id)
    )
);

CREATE POLICY "Users can insert attachments for their messages"
ON public.chat_attachments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chat_messages
        WHERE id = message_id AND sender_id = auth.uid()
    )
);

-- 8. Create a storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_attachments', 'chat_attachments', false);

-- 9. Create RLS policies for the storage bucket (path is assumed to be `{room_id}/{file_name}`)
CREATE POLICY "Chat members can view files in their room"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat_attachments' AND
  EXISTS (
    SELECT 1
    FROM public.chat_rooms
    WHERE id = ((string_to_array(name, '/'))[1])::uuid
    AND (auth.uid() = client_id OR auth.uid() = consultant_id)
  )
);

CREATE POLICY "Chat members can upload files to their room"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat_attachments' AND
  EXISTS (
    SELECT 1
    FROM public.chat_rooms
    WHERE id = ((string_to_array(name, '/'))[1])::uuid
    AND (auth.uid() = client_id OR auth.uid() = consultant_id)
  )
);


-- 10. Enable realtime updates on chat messages table
ALTER TABLE public.chat_messages
REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime
ADD TABLE public.chat_messages;
