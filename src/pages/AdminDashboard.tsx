
import { UserList } from '@/components/admin/UserList';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { BookingManagement } from '@/components/admin/BookingManagement';
import { DatabaseManager } from '@/components/admin/DatabaseManager';
import { ReportsAnalytics } from '@/components/admin/ReportsAnalytics';
import { ClientQuestionnaires } from '@/components/admin/ClientQuestionnaires';
import { DynamicAdminDashboard } from '@/components/admin/DynamicAdminDashboard';
import { ConsultantManager } from '@/components/admin/ConsultantManager';
import { LandingPageManager } from '@/components/admin/LandingPageManager';
import { BlogManager } from '@/components/admin/BlogManager';
import { DynamicAdminAccess } from '@/components/admin/DynamicAdminAccess';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboardPage = () => {
  return (
    <div className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, consultants, bookings, content and platform settings.</p>
      </header>
      
      <Tabs defaultValue="dynamic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-11">
          <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consultants">Consultants</TabsTrigger>
          <TabsTrigger value="landing">Landing</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="admin-access">Admin Access</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dynamic">
          <DynamicAdminDashboard />
        </TabsContent>
        
        <TabsContent value="overview">
          <DashboardStats />
        </TabsContent>
        
        <TabsContent value="consultants">
          <ConsultantManager />
        </TabsContent>
        
        <TabsContent value="landing">
          <LandingPageManager />
        </TabsContent>
        
        <TabsContent value="blog">
          <BlogManager />
        </TabsContent>
        
        <TabsContent value="questionnaires">
          <ClientQuestionnaires />
        </TabsContent>
        
        <TabsContent value="reports">
          <ReportsAnalytics />
        </TabsContent>
        
        <TabsContent value="bookings">
          <BookingManagement />
        </TabsContent>
        
        <TabsContent value="users">
          <UserList />
        </TabsContent>
        
        <TabsContent value="admin-access">
          <DynamicAdminAccess />
        </TabsContent>
        
        <TabsContent value="database">
          <DatabaseManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;
