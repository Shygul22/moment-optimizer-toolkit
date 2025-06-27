import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Video, CheckCircle, X, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CoachingBooking } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";

interface BookingUpdateForm {
  status: string;
  adminNotes: string;
  meetingLink: string;
}

export const AdminBookingPanel = () => {
  const [selectedBooking, setSelectedBooking] = useState<CoachingBooking | null>(null);
  const [updateForm, setUpdateForm] = useState<BookingUpdateForm>({
    status: "",
    adminNotes: "",
    meetingLink: "",
  });
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = (user as any)?.role === 'admin';

  // Fetch all bookings (admin only)
  const { data: bookings = [], isLoading } = useQuery<CoachingBooking[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: isAdmin,
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<BookingUpdateForm> }) => {
      return await apiRequest(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      setIsUpdateDialogOpen(false);
      setSelectedBooking(null);
      toast({
        title: "Booking Updated",
        description: "The booking has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Admin access required.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleOpenUpdateDialog = (booking: CoachingBooking) => {
    setSelectedBooking(booking);
    setUpdateForm({
      status: booking.status,
      adminNotes: booking.adminNotes || "",
      meetingLink: booking.meetingLink || "",
    });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateBooking = () => {
    if (!selectedBooking) return;

    updateBookingMutation.mutate({
      id: selectedBooking.id,
      updates: updateForm,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (date: string | Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleString();
  };

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Admin Access Required</h3>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Booking Panel</h1>
          <p className="text-gray-600 mt-1">Manage all coaching session requests</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Admin Dashboard
        </Badge>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'approved').length}
            </div>
            <p className="text-sm text-gray-600">Approved Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <p className="text-sm text-gray-600">Completed Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {bookings.length}
            </div>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">All Booking Requests</h2>
        
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings yet</h3>
              <p className="text-gray-600">Booking requests will appear here when users submit them</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{booking.title}</h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      {booking.description && (
                        <p className="text-gray-600 mb-3">{booking.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>User ID: {booking.userId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDateTime(booking.preferredDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{booking.duration} minutes</span>
                        </div>
                      </div>
                      
                      {booking.meetingLink && (
                        <div className="flex items-center gap-2 text-sm mb-3">
                          <Video className="h-4 w-4 text-gray-400" />
                          <a 
                            href={booking.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {booking.meetingLink}
                          </a>
                        </div>
                      )}
                      
                      {booking.adminNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Admin Notes:</strong> {booking.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenUpdateDialog(booking)}
                          >
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Manage Booking Request</DialogTitle>
                          </DialogHeader>
                          
                          {selectedBooking && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">{selectedBooking.title}</h4>
                                <p className="text-sm text-gray-600">
                                  Requested for {formatDateTime(selectedBooking.preferredDate)}
                                </p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Status
                                </label>
                                <Select
                                  value={updateForm.status}
                                  onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Meeting Link
                                </label>
                                <Input
                                  value={updateForm.meetingLink}
                                  onChange={(e) => setUpdateForm({ ...updateForm, meetingLink: e.target.value })}
                                  placeholder="https://meet.google.com/..."
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Admin Notes
                                </label>
                                <Textarea
                                  value={updateForm.adminNotes}
                                  onChange={(e) => setUpdateForm({ ...updateForm, adminNotes: e.target.value })}
                                  placeholder="Add notes for the user..."
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex justify-end gap-3">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsUpdateDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleUpdateBooking}
                                  disabled={updateBookingMutation.isPending}
                                >
                                  {updateBookingMutation.isPending ? "Updating..." : "Update Booking"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => {
                              updateBookingMutation.mutate({
                                id: booking.id,
                                updates: { status: 'approved' }
                              });
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => {
                              updateBookingMutation.mutate({
                                id: booking.id,
                                updates: { status: 'rejected' }
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Created: {formatDateTime(booking.createdAt)}
                    {booking.updatedAt !== booking.createdAt && (
                      <span className="ml-4">Updated: {formatDateTime(booking.updatedAt)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};