
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
import { Plus, Edit, Trash2, Copy, Tag } from 'lucide-react';
import { format } from 'date-fns';

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').transform(val => val.toUpperCase()),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.number().positive('Discount value must be positive'),
  min_order_amount: z.number().min(0).optional(),
  max_discount_amount: z.number().positive().optional(),
  start_date: z.string(),
  end_date: z.string(),
  usage_limit: z.number().positive().optional(),
  user_usage_limit: z.number().positive().optional(),
});

type CouponFormData = z.infer<typeof couponSchema>;

export const CouponsManager = () => {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  const isAdmin = roles.includes('admin');

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      start_date: '',
      end_date: '',
      user_usage_limit: 1,
    },
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { mutate: createCoupon, isPending: isCreating } = useMutation({
    mutationFn: async (data: CouponFormData) => {
      const { error } = await supabase.from('coupons').insert([{
        code: data.code,
        title: data.title,
        description: data.description || null,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_amount: data.min_order_amount || 0,
        max_discount_amount: data.max_discount_amount || null,
        start_date: data.start_date,
        end_date: data.end_date,
        usage_limit: data.usage_limit || null,
        user_usage_limit: data.user_usage_limit || 1,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Coupon created successfully');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create coupon: ${error.message}`);
    },
  });

  const { mutate: updateCoupon, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CouponFormData }) => {
      const { error } = await supabase
        .from('coupons')
        .update({
          code: data.code,
          title: data.title,
          description: data.description || null,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          min_order_amount: data.min_order_amount || 0,
          max_discount_amount: data.max_discount_amount || null,
          start_date: data.start_date,
          end_date: data.end_date,
          usage_limit: data.usage_limit || null,
          user_usage_limit: data.user_usage_limit || 1,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Coupon updated successfully');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsDialogOpen(false);
      setEditingCoupon(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update coupon: ${error.message}`);
    },
  });

  const { mutate: deleteCoupon } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Coupon deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete coupon: ${error.message}`);
    },
  });

  const onSubmit = (data: CouponFormData) => {
    if (editingCoupon) {
      updateCoupon({ id: editingCoupon.id, data });
    } else {
      createCoupon(data);
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    form.reset({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || 0,
      max_discount_amount: coupon.max_discount_amount || undefined,
      start_date: format(new Date(coupon.start_date), 'yyyy-MM-dd'),
      end_date: format(new Date(coupon.end_date), 'yyyy-MM-dd'),
      usage_limit: coupon.usage_limit || undefined,
      user_usage_limit: coupon.user_usage_limit || 1,
    });
    setIsDialogOpen(true);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard');
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
              <Tag className="h-5 w-5" />
              Coupons Management
            </CardTitle>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCoupon ? 'Update coupon details' : 'Create a new discount coupon'}
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupon Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., SAVE20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 20% Off" {...field} />
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
                            <Textarea placeholder="Coupon description..." {...field} />
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
                        {editingCoupon ? 'Update' : 'Create'} Coupon
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
        ) : coupons && coupons.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{coupon.title}</div>
                      {coupon.description && (
                        <div className="text-sm text-muted-foreground">{coupon.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}%`
                      : formatCurrency(coupon.discount_value)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(coupon.start_date), 'MMM d, yyyy')}</div>
                      <div className="text-muted-foreground">
                        to {format(new Date(coupon.end_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.usage_limit
                      ? `${coupon.usage_count}/${coupon.usage_limit}`
                      : coupon.usage_count || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
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
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">No coupons yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first discount coupon to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
