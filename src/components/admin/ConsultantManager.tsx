
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];

const fetchConsultants = async (): Promise<Profile[]> => {
  const { data, error } = await supabase.rpc('get_all_consultants');
  
  if (error) {
    console.error('Error fetching consultants:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

const updateConsultantFeatured = async ({ consultantId, featured }: { consultantId: string; featured: boolean }) => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_featured: featured })
    .eq('id', consultantId);

  if (error) {
    throw new Error(error.message);
  }
};

export const ConsultantManager = () => {
  const queryClient = useQueryClient();
  
  const { data: consultants, isLoading, error } = useQuery({
    queryKey: ['admin-consultants'],
    queryFn: fetchConsultants,
  });

  const { mutate: updateFeatured, isPending } = useMutation({
    mutationFn: updateConsultantFeatured,
    onSuccess: () => {
      toast.success('Consultant featured status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-consultants'] });
      queryClient.invalidateQueries({ queryKey: ['featured-consultants'] });
    },
    onError: (error) => {
      toast.error('Failed to update consultant', { description: error.message });
    },
  });

  const handleFeaturedToggle = (consultantId: string, featured: boolean) => {
    updateFeatured({ consultantId, featured });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Featured Consultants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Featured Consultants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load consultants</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Featured Consultants</CardTitle>
        <p className="text-sm text-muted-foreground">
          Control which consultants appear on the landing page
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {consultants && consultants.length > 0 ? (
            consultants.map((consultant) => (
              <div key={consultant.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={consultant.avatar_url ?? undefined} 
                    alt={consultant.full_name ?? ''} 
                  />
                  <AvatarFallback>
                    {consultant.full_name?.charAt(0) ?? 'C'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{consultant.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{consultant.business_name}</p>
                  {consultant.business_details && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {consultant.business_details}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={consultant.is_featured ? "default" : "secondary"}>
                    {consultant.is_featured ? "Featured" : "Not Featured"}
                  </Badge>
                  <Switch
                    checked={consultant.is_featured || false}
                    onCheckedChange={(checked) => handleFeaturedToggle(consultant.id, checked)}
                    disabled={isPending}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No consultants found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
