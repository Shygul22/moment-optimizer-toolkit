
import { ConsultantDashboard } from '@/components/consultant/ConsultantDashboard';
import { ConsultantBookingList } from '@/components/consultant/ConsultantBookingList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ConsultantDashboardPage = () => {
  return (
    <div className="container py-8">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <ConsultantDashboard />
        </TabsContent>
        
        <TabsContent value="bookings">
          <ConsultantBookingList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsultantDashboardPage;
