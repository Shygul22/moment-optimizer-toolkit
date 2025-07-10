
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleMeetData {
  bookingId: string;
  startTime: string;
  endTime: string;
  consultantName: string;
  clientName: string;
}

export const useGoogleMeetIntegration = () => {
  const { mutate: createGoogleMeet, isPending } = useMutation({
    mutationFn: async (data: GoogleMeetData) => {
      console.log('Creating Google Meet for booking:', data.bookingId);
      
      const { data: result, error } = await supabase.functions.invoke('create-google-meet', {
        body: data
      });

      if (error) {
        console.error('Error creating Google Meet:', error);
        throw new Error(error.message);
      }

      return result;
    },
    onSuccess: (result) => {
      console.log('Google Meet created successfully:', result);
      toast.success('Google Meet link created and notifications sent!', {
        description: 'Both client and consultant have been notified with the meeting link.',
      });
    },
    onError: (error: Error) => {
      console.error('Failed to create Google Meet:', error);
      toast.error('Failed to create Google Meet', {
        description: error.message,
      });
    },
  });

  return {
    createGoogleMeet,
    isCreatingMeet: isPending,
  };
};
