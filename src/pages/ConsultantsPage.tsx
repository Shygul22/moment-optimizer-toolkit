
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, Users, Calendar, MessageCircle, ArrowRight, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

type Profile = Database['public']['Tables']['profiles']['Row'];

const fetchAllConsultants = async (): Promise<Profile[]> => {
  const { data, error } = await supabase.rpc('get_all_consultants');
  
  if (error) {
    console.error('Error fetching consultants:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

const ConsultantsPage = () => {
  const { data: consultants, isLoading, error } = useQuery({
    queryKey: ['consultants'],
    queryFn: fetchAllConsultants,
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="text-center">
                <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
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
            Failed to load consultants. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Meet Our Expert Consultants
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with experienced professionals who can help you achieve your business goals
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Expert Network</h3>
            <p className="text-sm text-muted-foreground">
              Access to verified consultants across various industries
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Easy Booking</h3>
            <p className="text-sm text-muted-foreground">
              Schedule consultations at your convenience
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Direct Communication</h3>
            <p className="text-sm text-muted-foreground">
              Chat directly with consultants before booking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Consultants Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Available Consultants</h2>
        
        {consultants && consultants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultants.map((consultant) => (
              <Card key={consultant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4 border">
                    <AvatarImage 
                      src={consultant.avatar_url ?? undefined} 
                      alt={consultant.full_name ?? ''} 
                    />
                    <AvatarFallback className="text-lg">
                      {consultant.full_name?.charAt(0) ?? 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{consultant.full_name}</CardTitle>
                  <p className="text-primary font-medium">{consultant.business_name}</p>
                  
                  {/* Rating Badge */}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-xs text-muted-foreground">(24 reviews)</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {consultant.business_details || 'Experienced professional ready to help you achieve your goals.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Business Strategy</Badge>
                    <Badge variant="secondary">Marketing</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/booking" state={{ consultant }}>
                        Book Consultation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/consultants/${consultant.id}`} state={{ consultant }}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Consultants Available</h3>
              <p className="text-muted-foreground">
                We're working on adding more expert consultants to our platform.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsultantsPage;
