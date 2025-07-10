
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
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Terminal } from 'lucide-react';
import { toast } from 'sonner';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type EnrichedBooking = Booking & {
  client: Pick<Profile, 'id' | 'full_name'> | null;
  consultant: Pick<Profile, 'id' | 'full_name'> | null;
};

const fetchBookings = async (): Promise<EnrichedBooking[]> => {
  // We are using the foreign key names from the database schema to help Supabase join the tables correctly.
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client:profiles!bookings_client_id_fkey(id, full_name),
      consultant:profiles!bookings_consultant_id_fkey(id, full_name)
    `)
    .order('start_time', { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error(error.message);
  }
  // The type assertion is needed here because the dynamic select string makes it hard for TS to infer the type.
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

export function BookingList() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: fetchBookings,
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
    },
    onSuccess: (_, variables) => {
      toast.success(`Booking has been ${variables.newStatus}.`);
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['consultant-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update booking: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View and manage all bookings on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-8" />
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
          <AlertTitle>Error fetching bookings</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
        <CardDescription>View and manage all bookings on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {bookings && bookings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Consultant</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.client?.full_name ?? 'N/A'}</TableCell>
                  <TableCell>{booking.consultant?.full_name ?? 'N/A'}</TableCell>
                  <TableCell>
                    {format(new Date(booking.start_time), 'PPp')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdatingStatus}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {booking.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => updateBookingStatus({ bookingId: booking.id, newStatus: 'confirmed' })}>
                              Approve Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateBookingStatus({ bookingId: booking.id, newStatus: 'cancelled' })}>
                              Reject Booking
                            </DropdownMenuItem>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <>
                            <DropdownMenuItem onClick={() => updateBookingStatus({ bookingId: booking.id, newStatus: 'completed' })}>
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateBookingStatus({ bookingId: booking.id, newStatus: 'cancelled' })}>
                              Cancel Booking
                            </DropdownMenuItem>
                          </>
                        )}
                        {(booking.status === 'completed' || booking.status === 'cancelled') && (
                           <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No bookings found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
