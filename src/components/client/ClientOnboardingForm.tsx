
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Building2, BarChart3, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  // Section 1: Basic Information
  client_name: z.string().min(1, 'Name is required'),
  company_name: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  company_size: z.string().min(1, 'Company size is required'),
  location: z.string().min(1, 'Location is required'),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  
  // Section 2: Business Analysis
  business_objectives: z.string().min(1, 'Business objectives are required'),
  pressing_issues: z.string().min(1, 'Pressing issues are required'),
  current_operations: z.string().min(1, 'Current operations description is required'),
  target_audience: z.string().min(1, 'Target audience description is required'),
  
  // Section 3: Services and Goals
  desired_services: z.array(z.string()).min(1, 'Please select at least one service'),
  consulting_goals: z.string().min(1, 'Consulting goals are required'),
  improvement_areas: z.string().min(1, 'Improvement areas are required'),
});

type FormData = z.infer<typeof formSchema>;

interface ClientOnboardingFormProps {
  onComplete: () => void;
}

export const ClientOnboardingForm = ({ onComplete }: ClientOnboardingFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitMessage, setSubmitMessage] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: '',
      company_name: '',
      industry: '',
      company_size: '',
      location: '',
      mobile_number: '',
      business_objectives: '',
      pressing_issues: '',
      current_operations: '',
      target_audience: '',
      desired_services: [],
      consulting_goals: '',
      improvement_areas: '',
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('client_questionnaires')
        .insert({
          user_id: user.id,
          client_name: data.client_name,
          company_name: data.company_name,
          industry: data.industry,
          company_size: data.company_size,
          location: data.location,
          mobile_number: data.mobile_number,
          business_objectives: data.business_objectives,
          pressing_issues: data.pressing_issues,
          current_operations: data.current_operations,
          target_audience: data.target_audience,
          desired_services: data.desired_services,
          consulting_goals: data.consulting_goals,
          improvement_areas: data.improvement_areas,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitMessage('Questionnaire submitted successfully! Our admin team will review your information.');
      queryClient.invalidateQueries({ queryKey: ['client-questionnaires'] });
      setTimeout(() => {
        onComplete();
      }, 2000);
    },
    onError: (error: any) => {
      setSubmitMessage(`Failed to submit questionnaire: ${error.message}`);
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['client_name', 'company_name', 'industry', 'company_size', 'location', 'mobile_number'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['business_objectives', 'pressing_issues', 'current_operations', 'target_audience'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  const progress = (currentStep / 3) * 100;

  const companySizeOptions = [
    { value: 'only_me', label: 'Only me' },
    { value: '1_to_5', label: '1 TO 5' },
    { value: '5_to_15', label: '5 TO 15' },
    { value: '25_to_50', label: '25 TO 50' },
    { value: 'other', label: 'Other' },
  ];

  const serviceOptions = [
    { value: 'business_management', label: 'Business Management' },
    { value: 'sales_marketing', label: 'Sales & Marketing' },
    { value: 'finance_management', label: 'Finance Management' },
    { value: 'other', label: 'Other' },
  ];

  if (submitMessage) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">TP CONSULTING SERVICES</h1>
          <div className={`p-4 rounded-lg mb-8 ${submitMessage.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {submitMessage}
          </div>
        </div>
        {!submitMessage.includes('Failed') && (
          <Button onClick={onComplete} className="px-8 py-3">
            Go to Dashboard
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">TP CONSULTING SERVICES</h1>
          <p className="text-muted-foreground mt-2">
            At TP consulting services, we're passionate about empowering businesses to achieve exceptional results. 
            Our team of expert consultants is dedicated to providing personalized guidance and support to help you 
            gain a competitive edge and drive success.
          </p>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Section {currentStep} of 3</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="client_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Example: Manufacturing, Transportation, Education" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size of Company *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-2"
                        >
                          {companySizeOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <Label htmlFor={option.value} className="text-sm">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number *</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Business Analysis and Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="business_objectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are your primary business objectives? *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pressing_issues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are the most pressing issues you're currently facing? *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_operations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Can you describe your current business operations or workflow? *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who is your target audience, and how do you differentiate from competitors? *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Services and Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="desired_services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Which services do you want? *</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2">
                          {serviceOptions.map((service) => (
                            <div key={service.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={service.value}
                                checked={field.value?.includes(service.value)}
                                onCheckedChange={(checked) => {
                                  const updatedServices = checked
                                    ? [...(field.value || []), service.value]
                                    : field.value?.filter((s) => s !== service.value) || [];
                                  field.onChange(updatedServices);
                                }}
                              />
                              <Label htmlFor={service.value} className="text-sm">
                                {service.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consulting_goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What do you want to achieve through this consulting engagement? *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="improvement_areas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What specific areas of your business need improvement? *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex items-center gap-2"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Questionnaire'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
