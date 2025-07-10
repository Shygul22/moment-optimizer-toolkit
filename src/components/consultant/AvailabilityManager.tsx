
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, addDays, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { Trash2, Plus, Clock } from 'lucide-react';

export const AvailabilityManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState({ startTime: '', endTime: '' });

  // Fetch availability slots
  const { data: availabilitySlots, isLoading } = useQuery({
    queryKey: ['consultant-availability', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultant_availability')
        .select('*')
        .eq('consultant_id', user?.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Create availability slot
  const { mutate: createSlot, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !timeSlots.startTime || !timeSlots.endTime) {
        throw new Error('Please fill in all fields');
      }

      const startDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${timeSlots.startTime}`);
      const endDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${timeSlots.endTime}`);

      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        throw new Error('End time must be after start time');
      }

      const { error } = await supabase.from('consultant_availability').insert({
        consultant_id: user?.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString()
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Availability slot created successfully');
      queryClient.invalidateQueries({ queryKey: ['consultant-availability'] });
      setTimeSlots({ startTime: '', endTime: '' });
    },
    onError: (error) => {
      toast.error(`Failed to create slot: ${error.message}`);
    }
  });

  // Create bulk availability slots
  const { mutate: createBulkSlots, isPending: isCreatingBulk } = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !timeSlots.startTime || !timeSlots.endTime) {
        throw new Error('Please fill in all fields');
      }

      const startTime = timeSlots.startTime;
      const endTime = timeSlots.endTime;

      // Validate that end time is after start time
      const testStart = new Date(`2000-01-01T${startTime}`);
      const testEnd = new Date(`2000-01-01T${endTime}`);
      if (testEnd <= testStart) {
        throw new Error('End time must be after start time');
      }

      const slotsToCreate = [];
      
      // Create slots for the next 7 days
      for (let i = 0; i < 7; i++) {
        const date = addDays(selectedDate, i);
        const startDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}`);
        const endDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${endTime}`);

        slotsToCreate.push({
          consultant_id: user?.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString()
        });
      }

      const { error } = await supabase
        .from('consultant_availability')
        .insert(slotsToCreate);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Bulk slots created for the next 7 days');
      queryClient.invalidateQueries({ queryKey: ['consultant-availability'] });
      setTimeSlots({ startTime: '', endTime: '' });
    },
    onError: (error) => {
      toast.error(`Failed to create bulk slots: ${error.message}`);
    }
  });

  // Delete availability slot
  const { mutate: deleteSlot } = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase
        .from('consultant_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Availability slot deleted');
      queryClient.invalidateQueries({ queryKey: ['consultant-availability'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete slot: ${error.message}`);
    }
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < startOfDay(new Date())}
              className="rounded-md border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={timeSlots.startTime}
                onChange={(e) => setTimeSlots(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={timeSlots.endTime}
                onChange={(e) => setTimeSlots(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => createSlot()} 
              disabled={isCreating || isCreatingBulk}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Add Single Slot'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => createBulkSlots()}
              disabled={isCreating || isCreatingBulk}
              className="flex-1"
            >
              {isCreatingBulk ? 'Creating...' : 'Add 7 Days'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Availability ({availabilitySlots?.length || 0} slots)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : availabilitySlots?.length ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availabilitySlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{format(new Date(slot.start_time), 'PPP')}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(slot.start_time), 'p')} - {format(new Date(slot.end_time), 'p')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={slot.is_booked ? 'default' : 'outline'}>
                      {slot.is_booked ? 'Booked' : 'Available'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSlot(slot.id)}
                      disabled={slot.is_booked}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No availability slots created yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
