
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Terminal, Search, Filter, ExternalLink, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useGoogleMeetIntegration } from '@/hooks/useGoogleMeetIntegration';
import { RescheduleBookingModal } from '@/components/shared/RescheduleBookingModal';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type EnrichedBooking = Booking & {
  client: Pick<Profile, 'id' | 'full_name'> | null;
  consultant: Pick<Profile, 'id' | 'full_name'> | null;
};

const fetchAllBookings = async (): Promise<EnrichedBooking[]> => {
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
};

export function BookingManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const { createGoogleMeet } = useGoogleMeetIntegration();
  
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: fetchAllBookings,
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
        const booking = filteredBookings?.find(b => b.id === variables.bookingId);
        if (booking) {
          createGoogleMeet({
            bookingId: booking.id,
            startTime: booking.start_time,
            endTime: booking.end_time,
            consultantName: booking.consultant?.full_name || 'Consultant',
            clientName: booking.client?.full_name || 'Client',
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['consultant-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update booking: ${error.message}`);
    },
  });

  const handleReschedule = (booking: Booking) => {
    setRescheduleBooking(booking);
  };

  // Filter bookings based on search term and status
  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.consultant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
          <CardDescription>View and manage all client bookings across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
          <CardDescription>View and manage all client bookings across the platform.</CardDescription>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client or consultant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings && filteredBookings.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredBookings.length} of {bookings?.length || 0} bookings
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Meeting Link</TableHead>
                    <TableHead>Booked On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.client?.full_name ?? 'N/A'}
                      </TableCell>
                      <TableCell>
                        {booking.consultant?.full_name ?? 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {format(new Date(booking.start_time), 'PPP')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(booking.start_time), 'p')} - {format(new Date(booking.end_time), 'p')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60))} min
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {booking.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(booking.status)} className="capitalize">
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {booking.google_meet_link ? (
                          <Button variant="outline" size="sm" asChild>
                            <a href={booking.google_meet_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Join Meeting
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">No link</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(booking.created_at), 'PP')}
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
                            <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
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
                            {(booking.status === 'confirmed' || booking.status === 'pending') && (
                              <DropdownMenuItem onClick={() => handleReschedule(booking)}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Reschedule Booking
                              </DropdownMenuItem>
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
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No bookings match your search criteria.' 
                  : 'No bookings found.'}
              </p>
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
