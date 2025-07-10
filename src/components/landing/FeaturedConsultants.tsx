
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Award, Users, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Profile = Database['public']['Tables']['profiles']['Row'];

const fetchFeaturedConsultants = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_featured', true)
    .limit(6);
  
  if (error) {
    console.error('Error fetching featured consultants:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

export function FeaturedConsultants() {
  const { data: consultants, isLoading, error } = useQuery({
    queryKey: ['featured-consultants'],
    queryFn: fetchFeaturedConsultants,
  });

  if (isLoading) {
    return (
      <section id="consultants" className="bg-warm-sage/10 py-20 sm:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-calming-green" />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-trust-navy font-serif">
                Meet Our Compassionate Guides
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our team of certified wellness professionals and therapists are dedicated to supporting 
              your journey with expertise, empathy, and genuine care for your well-being.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden text-center">
                <CardContent className="p-6">
                  <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !consultants || consultants.length === 0) {
    return (
      <section id="consultants" className="bg-warm-sage/10 py-20 sm:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-calming-green" />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-trust-navy font-serif">
                Meet Our Compassionate Guides
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our team of certified wellness professionals and therapists are dedicated to supporting 
              your journey with expertise, empathy, and genuine care for your well-being.
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Our featured consultants will be available soon. Please check back later.
            </p>
            <Button size="lg" className="bg-therapy-gradient hover:opacity-90 shadow-calming">
              Contact Us for More Information
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="consultants" className="bg-warm-sage/10 py-20 sm:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-calming-green" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-trust-navy font-serif">
              Meet Our Compassionate Guides
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our team of certified wellness professionals and therapists are dedicated to supporting 
            your journey with expertise, empathy, and genuine care for your well-being.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {consultants.map((consultant) => (
            <Card key={consultant.id} className="overflow-hidden text-center transition-all duration-300 hover:shadow-therapy group bg-gradient-to-br from-card to-warm-sage/5">
              <CardContent className="p-6">
                <div className="relative mb-4">
                  <img
                    src={consultant.avatar_url || `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
                    alt={consultant.full_name || 'Consultant'}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-calming-green/20 shadow-trust"
                  />
                  <Badge className="absolute -top-2 -right-2 bg-therapy-gradient text-white shadow-calming">
                    <Award className="w-3 h-3 mr-1" />
                    Certified
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-trust-navy font-serif">
                  {consultant.full_name || 'Professional Consultant'}
                </h3>
                <p className="text-calming-green font-medium mb-3">
                  {consultant.business_name || 'Wellness & Career Specialist'}
                </p>
                
                <div className="flex justify-center items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">4.9</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Users className="w-3 h-3" />
                    <span>100+ helped</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <Badge variant="outline" className="text-xs mr-1 border-calming-green/30 text-calming-green">
                    Career Guidance
                  </Badge>
                  <Badge variant="outline" className="text-xs mr-1 border-calming-green/30 text-calming-green">
                    Stress Management
                  </Badge>
                  <Badge variant="outline" className="text-xs mr-1 border-calming-green/30 text-calming-green">
                    Goal Setting
                  </Badge>
                </div>
                
                <Button className="w-full bg-therapy-gradient hover:opacity-90" variant="outline">
                  Connect with {consultant.full_name?.split(' ')[0] || 'Consultant'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Join hundreds of individuals who have found peace and transformation through our compassionate care
          </p>
          <Button size="lg" className="bg-therapy-gradient hover:opacity-90 shadow-calming">
            Meet All Our Guides
          </Button>
        </div>
      </div>
    </section>
  );
}
