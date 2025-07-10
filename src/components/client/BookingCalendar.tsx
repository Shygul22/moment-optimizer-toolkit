
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BookingCalendarProps {
  consultants: Array<{
    id: string;
    full_name: string;
    business_name: string;
  }>;
  onBooking: (consultantId: string, date: Date, time: string) => void;
}

export const BookingCalendar = ({ consultants, onBooking }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedConsultant, setSelectedConsultant] = useState<string>('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Mock available time slots (in a real app, this would come from the availability API)
  const availableSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: async ({ consultantId, date, time }: { consultantId: string; date: Date; time: string }) => {
      if (!user) throw new Error('User not authenticated');

      // First, ensure the user has a profile record
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating profile for user:', user.id);
        const { error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
            avatar_url: user.user_metadata?.avatar_url || null,
          });

        if (profileCreateError) {
          console.error('Error creating profile:', profileCreateError);
          throw new Error(`Failed to create user profile: ${profileCreateError.message}`);
        }
      } else if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
        throw new Error(`Profile check failed: ${profileCheckError.message}`);
      }

      const selectedDate = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      selectedDate.setHours(hours, minutes, 0, 0);

      const startTime = selectedDate.toISOString();
      const endTime = new Date(selectedDate.getTime() + 60 * 60000).toISOString(); // 1 hour duration

      console.log('Creating booking with data:', {
        client_id: user.id,
        consultant_id: consultantId,
        start_time: startTime,
        end_time: endTime,
        type: 'online',
        status: 'pending'
      });

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          client_id: user.id,
          consultant_id: consultantId,
          start_time: startTime,
          end_time: endTime,
          type: 'online',
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw new Error(error.message);
      }

      return booking;
    },
    onSuccess: (booking) => {
      console.log('Booking created successfully:', booking);
      toast.success('Booking request submitted successfully!', {
        description: 'You will receive a confirmation once approved.',
      });
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      onBooking(booking.consultant_id, new Date(booking.start_time), format(new Date(booking.start_time), 'HH:mm'));
    },
    onError: (error: Error) => {
      console.error('Booking failed:', error);
      toast.error(`Booking failed: ${error.message}`);
    },
  });

  const handleBooking = (time: string) => {
    if (!selectedDate || !selectedConsultant) {
      toast.error('Please select both a consultant and date first');
      return;
    }

    if (!user) {
      toast.error('Please sign in to book an appointment');
      return;
    }

    createBooking({
      consultantId: selectedConsultant,
      date: selectedDate,
      time: time
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="h-4 sm:h-5 w-4 sm:w-5" />
            Select Consultant & Date
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Consultant</label>
            <div className="space-y-2">
              {consultants.map((consultant) => (
                <Button
                  key={consultant.id}
                  variant={selectedConsultant === consultant.id ? 'default' : 'outline'}
                  className="w-full justify-start h-auto py-3 px-3"
                  onClick={() => setSelectedConsultant(consultant.id)}
                >
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate">{consultant.full_name}</div>
                    {consultant.business_name && (
                      <div className="text-xs text-muted-foreground truncate">{consultant.business_name}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pick a Date</label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                className="rounded-md border w-full max-w-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Clock className="h-4 sm:h-5 w-4 sm:w-5" />
            Available Time Slots
          </CardTitle>
          {selectedDate && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {!selectedDate || !selectedConsultant ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
              Please select a consultant and date first
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {availableSlots.map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  className="h-16 sm:h-12 flex flex-col justify-center"
                  onClick={() => handleBooking(time)}
                  disabled={isPending}
                >
                  <span className="font-medium text-sm sm:text-base">{time}</span>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {isPending ? 'Booking...' : 'Available'}
                  </Badge>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
