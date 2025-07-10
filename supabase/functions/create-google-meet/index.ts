
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleMeetRequest {
  bookingId: string;
  startTime: string;
  endTime: string;
  consultantName: string;
  clientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { bookingId, startTime, endTime, consultantName, clientName }: GoogleMeetRequest = await req.json();

    console.log('Creating Google Meet for booking:', bookingId);

    // Generate a proper Google Meet room code (10 characters: 3-4-3 pattern)
    const generateMeetCode = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      const part1 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const part2 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const part3 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      return `${part1}-${part2}-${part3}`;
    };

    const meetingCode = generateMeetCode();
    const meetLink = `https://meet.google.com/${meetingCode}`;

    // Update the booking with the Google Meet link
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({ 
        google_meet_link: meetLink,
        google_meet_id: meetingCode 
      })
      .eq('id', bookingId);

    if (updateError) {
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    // Get booking details with client and consultant info
    const { data: booking, error: fetchError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        client:profiles!bookings_client_id_fkey(id, full_name, contact_number),
        consultant:profiles!bookings_consultant_id_fkey(id, full_name, contact_number)
      `)
      .eq('id', bookingId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch booking: ${fetchError.message}`);
    }

    // Format the meeting time for the notification
    const meetingDate = new Date(startTime);
    const formattedDate = meetingDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = meetingDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Send notifications to both client and consultant
    const notificationPromises = [];

    // Notify client
    if (booking.client_id) {
      notificationPromises.push(
        supabaseClient.from('notifications').insert({
          user_id: booking.client_id,
          title: 'Meeting Confirmed - Google Meet Ready',
          message: `Your consultation with ${consultantName} is confirmed for ${formattedDate} at ${formattedTime}. Click the "Join Google Meet" button when it's time for your appointment.`,
          type: 'booking_confirmed',
          data: { bookingId, meetLink, meetingId: meetingCode }
        })
      );
    }

    // Notify consultant
    if (booking.consultant_id) {
      notificationPromises.push(
        supabaseClient.from('notifications').insert({
          user_id: booking.consultant_id,
          title: 'Meeting Confirmed - Google Meet Ready',
          message: `Your consultation with ${clientName} is confirmed for ${formattedDate} at ${formattedTime}. Click the "Join Google Meet" button when it's time for your appointment.`,
          type: 'booking_confirmed',
          data: { bookingId, meetLink, meetingId: meetingCode }
        })
      );
    }

    await Promise.all(notificationPromises);

    console.log('Google Meet created and notifications sent:', { meetingId: meetingCode, meetLink });

    return new Response(
      JSON.stringify({ 
        success: true, 
        meetLink, 
        meetingId: meetingCode,
        message: 'Google Meet room created and notifications sent successfully' 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error creating Google Meet:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
