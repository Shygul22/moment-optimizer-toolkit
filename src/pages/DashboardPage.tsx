
import { useAuth } from '@/hooks/useAuth';
import { ClientBookingList } from '@/components/client/ClientBookingList';
import { ConsultantBookingList } from '@/components/consultant/ConsultantBookingList';
import { NotificationList } from '@/components/notifications/NotificationList';
import { TodoList } from '@/components/client/TodoList';
import { QuickActions } from '@/components/client/QuickActions';
import { ProgressTracker } from '@/components/client/ProgressTracker';
import { OnboardingModal } from '@/components/client/OnboardingModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsultantDashboard } from '@/components/consultant/ConsultantDashboard';

const DashboardPage = () => {
  const { user, roles } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email;
  const [showOnboarding, setShowOnboarding] = useState(false);

  const isConsultant = roles.includes('consultant');
  const isClient = roles.includes('client');

  // Check if client has completed the onboarding questionnaire
  const { data: questionnaire } = useQuery({
    queryKey: ['client-questionnaire', user?.id],
    queryFn: async () => {
      if (!user?.id || !isClient) return null;
      const { data, error } = await supabase
        .from('client_questionnaires')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data;
    },
    enabled: !!user && isClient,
  });

  // Show onboarding modal if client hasn't completed questionnaire
  useEffect(() => {
    if (isClient && questionnaire === null && user?.id) {
      setShowOnboarding(true);
    }
  }, [isClient, questionnaire, user?.id]);

  // Fetch todos for progress tracking
  const { data: todos = [] } = useQuery({
    queryKey: ['client-todos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('client_todos')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isClient,
  });

  // Fetch bookings for progress tracking
  const { data: bookings = [] } = useQuery({
    queryKey: ['client-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isClient,
  });

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-10">
      <header className="mb-4 sm:mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Welcome, {displayName}</h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
            {isClient && isConsultant
              ? "You can switch between your client and consultant dashboards."
              : "Here's an overview of your account and progress."}
          </p>
        </div>
      </header>

      {isClient && isConsultant ? (
        <Tabs defaultValue="client" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="client" className="text-xs sm:text-sm">Client Dashboard</TabsTrigger>
            <TabsTrigger value="consultant" className="text-xs sm:text-sm">Consultant Dashboard</TabsTrigger>
          </TabsList>
          <TabsContent value="client">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <NotificationList />
              <QuickActions />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <ClientBookingList />
                  <TodoList />
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <ProgressTracker todos={todos} bookings={bookings} />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="consultant">
            <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="bookings" className="text-xs sm:text-sm">Bookings</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard">
                <ConsultantDashboard />
              </TabsContent>
              <TabsContent value="bookings">
                <ConsultantBookingList />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <NotificationList />
          
          {isClient && (
            <>
              <QuickActions />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <ClientBookingList />
                  <TodoList />
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <ProgressTracker todos={todos} bookings={bookings} />
                </div>
              </div>
            </>
          )}
          
          {isConsultant && <ConsultantBookingList />}
          
          {/* A user with no role will see an empty dashboard. */}
        </div>
      )}

      {/* Onboarding Modal for new clients */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </div>
  );
};

export default DashboardPage;
