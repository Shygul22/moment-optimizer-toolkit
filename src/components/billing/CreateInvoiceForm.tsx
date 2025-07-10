import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  consultant_id: z.string().min(1, 'Consultant is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().default('INR'),
  due_days: z.number().min(1, 'Due days must be at least 1').default(30),
  description: z.string().optional(),
  line_items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    rate: z.number().min(0, 'Rate must be 0 or greater'),
    amount: z.number().min(0, 'Amount must be 0 or greater'),
  })).default([]),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface CreateInvoiceFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const CreateInvoiceForm = ({ trigger, onSuccess }: CreateInvoiceFormProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      currency: 'INR',
      due_days: 30,
      line_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    },
  });

  // Fetch user roles first
  const { data: userRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (error) throw error;
      return data;
    },
  });

  // Fetch profiles
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, business_name');
      if (error) throw error;
      return data;
    },
  });

  // Filter clients and consultants based on user roles
  const clients = profiles?.filter(profile => 
    userRoles?.some(role => role.user_id === profile.id && role.role === 'client')
  ) || [];

  const consultants = profiles?.filter(profile => 
    userRoles?.some(role => role.user_id === profile.id && role.role === 'consultant')
  ) || [];

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      // Generate invoice number
      const { data: invoiceNumber, error: numberError } = await supabase
        .rpc('generate_invoice_number');
      
      if (numberError) throw numberError;

      const dueDate = addDays(new Date(), data.due_days);
      
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          client_id: data.client_id,
          consultant_id: data.consultant_id,
          invoice_number: invoiceNumber,
          amount: data.amount,
          currency: data.currency,
          due_at: dueDate.toISOString(),
          description: data.description,
          line_items: data.line_items.length > 0 ? data.line_items : null,
        })
        .select()
        .single();

      if (error) throw error;
      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    createInvoiceMutation.mutate(data);
  };

  const addLineItem = () => {
    const currentItems = form.getValues('line_items');
    form.setValue('line_items', [
      ...currentItems,
      { description: '', quantity: 1, rate: 0, amount: 0 }
    ]);
  };

  const removeLineItem = (index: number) => {
    const currentItems = form.getValues('line_items');
    if (currentItems.length > 1) {
      form.setValue('line_items', currentItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItemAmount = (index: number) => {
    const items = form.getValues('line_items');
    const item = items[index];
    const amount = item.quantity * item.rate;
    form.setValue(`line_items.${index}.amount`, amount);
    
    // Update total amount
    const totalAmount = items.reduce((sum, item, i) => {
      const itemAmount = i === index ? amount : item.amount;
      return sum + itemAmount;
    }, 0);
    form.setValue('amount', totalAmount);
  };

  const watchedLineItems = form.watch('line_items');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.business_name || client.full_name || 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consultant_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultant</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a consultant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {consultants.map((consultant) => (
                          <SelectItem key={consultant.id} value={consultant.id}>
                            {consultant.business_name || consultant.full_name || 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due in (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Invoice description..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" variant="outline" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchedLineItems.map((_, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name={`line_items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Service description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`line_items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  updateLineItemAmount(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`line_items.${index}.rate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  updateLineItemAmount(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`line_items.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={watchedLineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
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

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createInvoiceMutation.isPending}>
                {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
