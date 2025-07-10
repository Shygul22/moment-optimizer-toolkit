
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const offerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.number().positive('Discount value must be positive'),
  min_order_amount: z.number().min(0).optional(),
  max_discount_amount: z.number().positive().optional(),
  start_date: z.string(),
  end_date: z.string(),
  usage_limit: z.number().positive().optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

export const OffersManager = () => {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);

  const isAdmin = roles.includes('admin');

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      start_date: '',
      end_date: '',
    },
  });

  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { mutate: createOffer, isPending: isCreating } = useMutation({
    mutationFn: async (data: OfferFormData) => {
      const { error } = await supabase.from('offers').insert([{
        title: data.title,
        description: data.description || null,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_amount: data.min_order_amount || 0,
        max_discount_amount: data.max_discount_amount || null,
        start_date: data.start_date,
        end_date: data.end_date,
        usage_limit: data.usage_limit || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Offer created successfully');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create offer: ${error.message}`);
    },
  });

  const { mutate: updateOffer, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OfferFormData }) => {
      const { error } = await supabase
        .from('offers')
        .update({
          title: data.title,
          description: data.description || null,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          min_order_amount: data.min_order_amount || 0,
          max_discount_amount: data.max_discount_amount || null,
          start_date: data.start_date,
          end_date: data.end_date,
          usage_limit: data.usage_limit || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Offer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      setIsDialogOpen(false);
      setEditingOffer(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update offer: ${error.message}`);
    },
  });

  const { mutate: deleteOffer } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Offer deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete offer: ${error.message}`);
    },
  });

  const onSubmit = (data: OfferFormData) => {
    if (editingOffer) {
      updateOffer({ id: editingOffer.id, data });
    } else {
      createOffer(data);
    }
  };

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    form.reset({
      title: offer.title,
      description: offer.description || '',
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      min_order_amount: offer.min_order_amount || 0,
      max_discount_amount: offer.max_discount_amount || undefined,
      start_date: format(new Date(offer.start_date), 'yyyy-MM-dd'),
      end_date: format(new Date(offer.end_date), 'yyyy-MM-dd'),
      usage_limit: offer.usage_limit || undefined,
    });
    setIsDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Offers Management
            </CardTitle>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingOffer ? 'Update offer details' : 'Create a new promotional offer'}
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., New Year Special" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Offer description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discount_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discount_value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Value</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={isCreating || isUpdating}>
                        {editingOffer ? 'Update' : 'Create'} Offer
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : offers && offers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{offer.title}</div>
                      {offer.description && (
                        <div className="text-sm text-muted-foreground">{offer.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {offer.discount_type === 'percentage'
                      ? `${offer.discount_value}%`
                      : formatCurrency(offer.discount_value)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(offer.start_date), 'MMM d, yyyy')}</div>
                      <div className="text-muted-foreground">
                        to {format(new Date(offer.end_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {offer.usage_limit
                      ? `${offer.usage_count}/${offer.usage_limit}`
                      : offer.usage_count || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(offer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteOffer(offer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">No offers yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first promotional offer to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
