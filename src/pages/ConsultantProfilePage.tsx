
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Shield } from 'lucide-react';
import { AvailabilityCalendar } from '@/components/consultant/AvailabilityCalendar';
import { useAuth } from '@/hooks/useAuth';

type Profile = Database['public']['Tables']['profiles']['Row'];

const fetchConsultantProfile = async (id: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching consultant profile:', error);
    throw new Error(error.message);
  }

  return data;
};

const ConsultantProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { roles } = useAuth();
  const preloadedConsultant = location.state?.consultant as Profile | undefined;

  const { data: consultant, isLoading, error } = useQuery({
    queryKey: ['consultant-profile', id],
    queryFn: () => fetchConsultantProfile(id!),
    enabled: !!id,
    initialData: preloadedConsultant,
  });

  if (isLoading && !preloadedConsultant) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-4">
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load consultant profile. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!consultant) {
    return (
        <div className="container py-8 text-center">
            <h1 className="text-2xl font-bold">Consultant Not Found</h1>
            <p className="text-muted-foreground">The consultant you are looking for does not exist.</p>
        </div>
    );
  }

  return (
    <div className="container py-8">
        <div className="mb-4">
            <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Admin Access</AlertTitle>
                <AlertDescription>
                    You are viewing this consultant profile with administrator privileges.
                </AlertDescription>
            </Alert>
        </div>
        
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="h-24 w-24 border">
                    <AvatarImage src={consultant.avatar_url ?? undefined} alt={consultant.full_name ?? ''} />
                    <AvatarFallback>{consultant.full_name?.charAt(0) ?? 'C'}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <CardTitle className="text-3xl">{consultant.full_name}</CardTitle>
                    <CardDescription className="text-lg">{consultant.business_name}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <h3 className="text-xl font-semibold mb-2">About</h3>
                <p className="text-muted-foreground mb-8">{consultant.business_details || 'No details provided.'}</p>
                
                <h3 className="text-xl font-semibold mb-4">Availability (Admin View)</h3>
                <AvailabilityCalendar consultantId={consultant.id} />
            </CardContent>
        </Card>
    </div>
  );
};

export default ConsultantProfilePage;
