
import { useQuery } from '@tanstack/react-query';
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
import { Terminal, CalendarPlus, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type EnrichedBooking = Booking & {
  consultant: Pick<Profile, 'id' | 'full_name'> | null;
};

const fetchClientBookings = async (userId: string | undefined): Promise<EnrichedBooking[]> => {
  if (!userId) return [];
  // We are using the foreign key column name to help Supabase join the tables correctly.
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      consultant:profiles!consultant_id(id, full_name)
    `)
    .eq('client_id', userId)
    .order('start_time', { ascending: false });

  if (error) {
    console.error("Error fetching client bookings:", error);
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

export function ClientBookingList() {
  const { user } = useAuth();
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['client-bookings', user?.id],
    queryFn: () => fetchClientBookings(user?.id),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">My Appointments</CardTitle>
              <CardDescription className="text-sm">Here are all your upcoming and past appointments.</CardDescription>
            </div>
            <Skeleton className="h-10 w-full sm:w-44" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px] sm:w-[250px]" />
                  <Skeleton className="h-4 w-[150px] sm:w-[200px]" />
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
          <AlertTitle>Error fetching your appointments</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl">My Appointments</CardTitle>
            <CardDescription className="text-sm">Here are all your upcoming and past appointments.</CardDescription>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/booking">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {bookings && bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="block sm:hidden space-y-4">
              {/* Mobile Card View */}
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{booking.consultant?.full_name ?? 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(booking.start_time), 'PPp')}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(booking.status)} className="text-xs">
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">{booking.type}</Badge>
                      {booking.google_meet_link ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={booking.google_meet_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            <span className="text-xs">Join</span>
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="hidden sm:block">
              {/* Desktop Table View */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Meeting Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.consultant?.full_name ?? 'N/A'}</TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <p className="text-sm sm:text-base text-muted-foreground">You have no appointments yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
