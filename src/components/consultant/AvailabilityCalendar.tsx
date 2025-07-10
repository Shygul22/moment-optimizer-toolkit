import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarDays, Clock, Terminal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';

type Availability = Database['public']['Tables']['consultant_availability']['Row'];

const fetchAvailability = async (consultantId: string): Promise<Availability[]> => {
  const { data, error } = await supabase
    .from('consultant_availability')
    .select('*')
    .eq('consultant_id', consultantId)
    .eq('is_booked', false)
    .gt('start_time', new Date().toISOString()) // Only show future slots
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching availability:', error);
    throw new Error(error.message);
  }

  return data;
};

interface AvailabilityCalendarProps {
  consultantId: string;
}

export const AvailabilityCalendar = ({ consultantId }: AvailabilityCalendarProps) => {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();

  const { data: availability, isLoading, error } = useQuery({
    queryKey: ['availability', consultantId],
    queryFn: () => fetchAvailability(consultantId),
    enabled: !!consultantId,
  });

  const { mutate: bookConsultation, isPending: isBooking } = useMutation({
    mutationFn: async (availabilityId: string) => {
      const { error } = await supabase.rpc('book_consultation', { p_availability_id: availabilityId });
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success('Your booking request has been sent! It is now pending approval.');
      queryClient.invalidateQueries({ queryKey: ['availability', consultantId] });
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['consultant-bookings'] });
    },
    onError: (error: Error) => {
      toast.error(`Booking failed: ${error.message}`);
    },
  });

  const handleBooking = (availabilityId: string) => {
    if (!roles.includes('client')) {
      toast.error('Only clients can book appointments.');
      return;
    }
    bookConsultation(availabilityId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load available slots. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  if (!availability || availability.length === 0) {
    return (
      <div className="text-center py-8 px-4 border rounded-lg bg-muted/20">
        <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">This consultant has no available slots at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availability.map((slot) => (
        <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{format(new Date(slot.start_time), 'EEEE, MMMM d')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {format(new Date(slot.start_time), 'p')} - {format(new Date(slot.end_time), 'p')}
              </span>
            </div>
          </div>
          {user ? (
            <Button
              onClick={() => handleBooking(slot.id)}
              disabled={isBooking}
            >
              {isBooking ? 'Booking...' : 'Book'}
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth" state={{ from: location }}>Book</Link>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
