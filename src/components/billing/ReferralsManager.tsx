
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Copy, Share2, Users, Gift } from 'lucide-react';
import { format } from 'date-fns';

const referralSchema = z.object({
  email: z.string().email('Valid email is required'),
  referrer_reward_type: z.enum(['percentage', 'fixed_amount', 'credits']).optional(),
  referrer_reward_value: z.number().positive().optional(),
  referred_reward_type: z.enum(['percentage', 'fixed_amount', 'credits']).optional(),
  referred_reward_value: z.number().positive().optional(),
});

type ReferralFormData = z.infer<typeof referralSchema>;

export const ReferralsManager = () => {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAdmin = roles.includes('admin');

  const form = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      email: '',
      referrer_reward_type: 'percentage',
      referrer_reward_value: 10,
      referred_reward_type: 'percentage',
      referred_reward_value: 10,
    },
  });

  const { data: referrals, isLoading } = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrer_id(full_name),
          referred:profiles!referred_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { mutate: createReferral, isPending: isCreating } = useMutation({
    mutationFn: async (data: ReferralFormData) => {
      // Generate referral code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_referral_code');
      if (codeError) throw codeError;

      const referralData = {
        ...data,
        referrer_id: user?.id,
        referral_code: codeData,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };

      const { error } = await supabase.from('referrals').insert([referralData]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Referral created successfully');
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create referral: ${error.message}`);
    },
  });

  const onSubmit = (data: ReferralFormData) => {
    createReferral(data);
  };

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Referral code copied to clipboard');
  };

  const shareReferral = (code: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Join our platform',
        text: `Use my referral code: ${code}`,
        url: `${window.location.origin}?ref=${code}`,
      });
    } else {
      copyReferralCode(`${window.location.origin}?ref=${code}`);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'outline';
      case 'expired': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Referral Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                My Referrals
              </CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Friend
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite a Friend</DialogTitle>
                  <DialogDescription>
                    Send a referral invitation and earn rewards
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Friend's Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="friend@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="text-sm text-muted-foreground">
                      Both you and your friend will receive 10% discount on your next purchase!
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={isCreating}>
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : referrals && referrals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals
                  .filter(ref => ref.referrer_id === user?.id)
                  .map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {referral.referral_code}
                        </code>
                      </TableCell>
                      <TableCell>{referral.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(referral.status)}>
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(referral.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {referral.expires_at
                          ? format(new Date(referral.expires_at), 'MMM d, yyyy')
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyReferralCode(referral.referral_code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareReferral(referral.referral_code)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Gift className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">No referrals yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Invite friends to earn rewards together.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Referrals Overview */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Referrals (Admin)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referrals && referrals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Referred</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rewards</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        {referral.referrer?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {referral.referral_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {referral.referred?.full_name || referral.email || 'Pending'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(referral.status)}>
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {referral.referrer_reward_value && (
                            <div>
                              Referrer: {referral.referrer_reward_value}
                              {referral.referrer_reward_type === 'percentage' ? '%' : ''}
                            </div>
                          )}
                          {referral.referred_reward_value && (
                            <div>
                              Referred: {referral.referred_reward_value}
                              {referral.referred_reward_type === 'percentage' ? '%' : ''}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(referral.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium">No referrals yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Referrals will appear here when users start inviting friends.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
