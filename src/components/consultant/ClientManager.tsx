
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Mail, Phone, MessageCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const ClientManager = () => {
  const { user } = useAuth();

  const { data: clients, isLoading } = useQuery({
    queryKey: ['consultant-clients', user?.id],
    queryFn: async () => {
      // Get all clients who have booked with this consultant
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          client_id,
          status,
          start_time,
          client:profiles!client_id(
            id,
            full_name,
            avatar_url,
            contact_number
          )
        `)
        .eq('consultant_id', user?.id)
        .order('start_time', { ascending: false });

      if (error) throw error;

      // Group by client and get their booking stats
      const clientMap = new Map();
      bookings?.forEach((booking) => {
        if (booking.client) {
          const clientId = booking.client.id;
          if (!clientMap.has(clientId)) {
            clientMap.set(clientId, {
              ...booking.client,
              totalBookings: 0,
              confirmedBookings: 0,
              lastBooking: null
            });
          }
          
          const client = clientMap.get(clientId);
          client.totalBookings++;
          if (booking.status === 'confirmed' || booking.status === 'completed') {
            client.confirmedBookings++;
          }
          if (!client.lastBooking || new Date(booking.start_time) > new Date(client.lastBooking)) {
            client.lastBooking = booking.start_time;
          }
        }
      });

      return Array.from(clientMap.values());
    },
    enabled: !!user?.id
  });

  const startChat = async (clientId: string) => {
    // Create or find existing chat room
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('consultant_id', user?.id)
      .eq('client_id', clientId)
      .single();

    if (existingRoom) {
      window.open(`/chat/${existingRoom.id}`, '_blank');
    } else {
      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert({
          consultant_id: user?.id,
          client_id: clientId
        })
        .select('id')
        .single();

      if (newRoom && !error) {
        window.open(`/chat/${newRoom.id}`, '_blank');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          My Clients ({clients?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : clients?.length ? (
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={client.avatar_url} />
                    <AvatarFallback>{client.full_name?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{client.full_name || 'Unknown Client'}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{client.totalBookings} bookings</span>
                      </div>
                      {client.lastBooking && (
                        <span>Last: {format(new Date(client.lastBooking), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {client.confirmedBookings} confirmed
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startChat(client.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  {client.contact_number && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`tel:${client.contact_number}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">No clients yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Clients will appear here once they book sessions with you.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
