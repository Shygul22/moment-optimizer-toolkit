
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ExternalLink, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useGoogleMeetIntegration } from '@/hooks/useGoogleMeetIntegration';
import { RescheduleBookingModal } from '@/components/shared/RescheduleBookingModal';
import { useState } from 'react';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type EnrichedBooking = Booking & {
  client: Pick<Profile, 'id' | 'full_name'> | null;
};

const fetchConsultantBookings = async (userId: string | undefined): Promise<EnrichedBooking[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client:profiles!client_id(id, full_name)
    `)
    .eq('consultant_id', userId)
    .order('start_time', { ascending: false });

  if (error) {
    console.error("Error fetching consultant bookings:", error);
    throw new Error(error.message);
  }
  return data as EnrichedBooking[];
};

const getStatusVariant = (status: Booking['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'pending':
      return 'outline';
    case 'confirmed':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'rescheduled':
      return 'outline';
    default:
      return 'default';
  }
}

export function ConsultantBookingList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { createGoogleMeet } = useGoogleMeetIntegration();
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['consultant-bookings', user?.id],
    queryFn: () => fetchConsultantBookings(user?.id),
    enabled: !!user,
  });

  const { mutate: updateBookingStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async ({ bookingId, newStatus }: { bookingId: string; newStatus: Booking['status'] }) => {
      const { error } = await supabase.rpc('update_booking_status', {
        p_booking_id: bookingId,
        p_new_status: newStatus,
      });
      if (error) {
        throw new Error(error.message);
      }
      return { bookingId, newStatus };
    },
    onSuccess: (_, variables) => {
      toast.success(`Booking has been ${variables.newStatus}.`);
      
      // If booking was confirmed, create Google Meet
      if (variables.newStatus === 'confirmed') {
        const booking = bookings?.find(b => b.id === variables.bookingId);
        if (booking) {
          createGoogleMeet({
            bookingId: booking.id,
            startTime: booking.start_time,
            endTime: booking.end_time,
            consultantName: user?.user_metadata?.full_name || 'Consultant',
            clientName: booking.client?.full_name || 'Client',
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['consultant-bookings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update booking: ${error.message}`);
    },
  });

  const handleUpdateStatus = (bookingId: string, newStatus: Booking['status']) => {
    updateBookingStatus({ bookingId, newStatus });
  };

  const handleReschedule = (booking: Booking) => {
    setRescheduleBooking(booking);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Here are all your upcoming and past bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
       <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error fetching your bookings</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Client Bookings</CardTitle>
          <CardDescription>Here are all bookings from your clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings && bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Meeting Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.client?.full_name ?? 'N/A'}</TableCell>
                    <TableCell>
                      {format(new Date(booking.start_time), 'PPp')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {booking.google_meet_link ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={booking.google_meet_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Join
                          </a>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              disabled={isUpdatingStatus}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              disabled={isUpdatingStatus}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {(booking.status === 'confirmed' || booking.status === 'pending') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReschedule(booking)}
                            disabled={isUpdatingStatus}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You have no bookings yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {rescheduleBooking && (
        <RescheduleBookingModal
          booking={rescheduleBooking}
          isOpen={!!rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
        />
      )}
    </>
  );
}
