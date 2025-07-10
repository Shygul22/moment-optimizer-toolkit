
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { format, addDays, startOfDay } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CalendarDays, Clock } from 'lucide-react';

type Booking = Database['public']['Tables']['bookings']['Row'];
type AvailabilitySlot = Database['public']['Tables']['consultant_availability']['Row'];

interface RescheduleBookingModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export const RescheduleBookingModal = ({ booking, isOpen, onClose }: RescheduleBookingModalProps) => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [customTime, setCustomTime] = useState({ startTime: '', endTime: '' });
  const [useCustomTime, setUseCustomTime] = useState(false);

  // Fetch available slots for the consultant
  const { data: availableSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['available-slots', booking.consultant_id, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      const startOfSelectedDate = format(selectedDate, 'yyyy-MM-dd');
      const endOfSelectedDate = format(addDays(selectedDate, 1), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('consultant_availability')
        .select('*')
        .eq('consultant_id', booking.consultant_id)
        .eq('is_booked', false)
        .gte('start_time', `${startOfSelectedDate}T00:00:00Z`)
        .lt('start_time', `${endOfSelectedDate}T00:00:00Z`)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedDate && isOpen
  });

  const { mutate: rescheduleBooking, isPending: isRescheduling } = useMutation({
    mutationFn: async () => {
      if (!selectedDate) {
        throw new Error('Please select a date');
      }

      let newStartTime: string;
      let newEndTime: string;
      let newAvailabilityId: string | null = null;

      if (useCustomTime) {
        if (!customTime.startTime || !customTime.endTime) {
          throw new Error('Please fill in both start and end times');
        }
        
        const startDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${customTime.startTime}`);
        const endDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${customTime.endTime}`);
        
        if (endDateTime <= startDateTime) {
          throw new Error('End time must be after start time');
        }
        
        newStartTime = startDateTime.toISOString();
        newEndTime = endDateTime.toISOString();
      } else {
        if (!selectedSlot) {
          throw new Error('Please select an available time slot');
        }
        
        newStartTime = selectedSlot.start_time;
        newEndTime = selectedSlot.end_time;
        newAvailabilityId = selectedSlot.id;
      }

      // Update the booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          start_time: newStartTime,
          end_time: newEndTime,
          availability_id: newAvailabilityId,
          status: 'rescheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (bookingError) throw bookingError;

      // If using an existing slot, mark it as booked
      if (selectedSlot && newAvailabilityId) {
        const { error: slotError } = await supabase
          .from('consultant_availability')
          .update({ is_booked: true })
          .eq('id', selectedSlot.id);

        if (slotError) throw slotError;
      }

      // If the original booking had an availability slot, free it up
      if (booking.availability_id) {
        const { error: freeSlotError } = await supabase
          .from('consultant_availability')
          .update({ is_booked: false })
          .eq('id', booking.availability_id);

        if (freeSlotError) throw freeSlotError;
      }
    },
    onSuccess: () => {
      toast.success('Booking rescheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['consultant-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['consultant-availability'] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Failed to reschedule booking: ${error.message}`);
    }
  });

  const handleReschedule = () => {
    rescheduleBooking();
  };

  const resetForm = () => {
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setCustomTime({ startTime: '', endTime: '' });
    setUseCustomTime(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Reschedule Booking
          </DialogTitle>
          <DialogDescription>
            Select a new date and time for this booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current booking info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Booking</h4>
            <p className="text-sm text-gray-600">
              {format(new Date(booking.start_time), 'PPP')} at {format(new Date(booking.start_time), 'p')} - {format(new Date(booking.end_time), 'p')}
            </p>
            <Badge variant="outline" className="mt-1">{booking.status}</Badge>
          </div>

          {/* Date selection */}
          <div>
            <Label className="text-base font-medium">Select New Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < startOfDay(new Date())}
              className="rounded-md border mt-2"
            />
          </div>

          {/* Time selection method */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={!useCustomTime ? "default" : "outline"}
                onClick={() => setUseCustomTime(false)}
                className="flex-1"
              >
                Use Available Slots
              </Button>
              <Button
                variant={useCustomTime ? "default" : "outline"}
                onClick={() => setUseCustomTime(true)}
                className="flex-1"
              >
                Set Custom Time
              </Button>
            </div>

            {!useCustomTime ? (
              <div>
                <Label className="text-base font-medium">Available Time Slots</Label>
                {slotsLoading ? (
                  <div className="text-sm text-gray-500 mt-2">Loading available slots...</div>
                ) : availableSlots && availableSlots.length > 0 ? (
                  <div className="grid gap-2 mt-2 max-h-48 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSlot?.id === slot.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {format(new Date(slot.start_time), 'p')} - {format(new Date(slot.end_time), 'p')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-2">
                    No available slots for this date. Try selecting a different date or use custom time.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newStartTime">Start Time</Label>
                  <Input
                    id="newStartTime"
                    type="time"
                    value={customTime.startTime}
                    onChange={(e) => setCustomTime(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="newEndTime">End Time</Label>
                  <Input
                    id="newEndTime"
                    type="time"
                    value={customTime.endTime}
                    onChange={(e) => setCustomTime(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={isRescheduling || (!selectedSlot && !useCustomTime) || (useCustomTime && (!customTime.startTime || !customTime.endTime))}
          >
            {isRescheduling ? 'Rescheduling...' : 'Reschedule Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
