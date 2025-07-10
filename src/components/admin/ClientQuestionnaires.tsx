
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Eye, FileText, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const ClientQuestionnaires = () => {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['admin-client-questionnaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_questionnaires')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updateData: any = { 
        status,
        reviewed_at: new Date().toISOString(),
      };
      
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from('client_questionnaires')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-client-questionnaires'] });
      setSelectedQuestionnaire(null);
      setAdminNotes('');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading questionnaires...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Client Questionnaires</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-yellow-50">
            Pending: {questionnaires?.filter(q => q.status === 'pending').length || 0}
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            Reviewed: {questionnaires?.filter(q => q.status === 'reviewed').length || 0}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Questionnaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questionnaires?.map((questionnaire) => (
                <TableRow key={questionnaire.id}>
                  <TableCell className="font-medium">{questionnaire.client_name}</TableCell>
                  <TableCell>{questionnaire.company_name}</TableCell>
                  <TableCell>{questionnaire.industry}</TableCell>
                  <TableCell>
                    {new Date(questionnaire.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(questionnaire.status)}>
                      {questionnaire.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedQuestionnaire(questionnaire);
                            setAdminNotes(questionnaire.admin_notes || '');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Questionnaire Details - {questionnaire.client_name}</DialogTitle>
                        </DialogHeader>
                        
                        {selectedQuestionnaire && (
                          <div className="space-y-6">
                            {/* Basic Information */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Basic Information</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-medium">Name:</label>
                                    <p>{selectedQuestionnaire.client_name}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Company:</label>
                                    <p>{selectedQuestionnaire.company_name}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Industry:</label>
                                    <p>{selectedQuestionnaire.industry}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Company Size:</label>
                                    <p>{selectedQuestionnaire.company_size}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Location:</label>
                                    <p>{selectedQuestionnaire.location}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Mobile:</label>
                                    <p>{selectedQuestionnaire.mobile_number}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Business Analysis */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Business Analysis</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <label className="font-medium">Business Objectives:</label>
                                  <p className="mt-1 text-sm text-gray-600">{selectedQuestionnaire.business_objectives}</p>
                                </div>
                                <div>
                                  <label className="font-medium">Pressing Issues:</label>
                                  <p className="mt-1 text-sm text-gray-600">{selectedQuestionnaire.pressing_issues}</p>
                                </div>
                                <div>
                                  <label className="font-medium">Current Operations:</label>
                                  <p className="mt-1 text-sm text-gray-600">{selectedQuestionnaire.current_operations}</p>
                                </div>
                                <div>
                                  <label className="font-medium">Target Audience:</label>
                                  <p className="mt-1 text-sm text-gray-600">{selectedQuestionnaire.target_audience}</p>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Services and Goals */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Services and Goals</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <label className="font-medium">Desired Services:</label>
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    {selectedQuestionnaire.desired_services?.map((service: string, index: number) => (
                                      <Badge key={index} variant="secondary">{service}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="font-medium">Consulting Goals:</label>
                                  <p className="mt-1 text-sm text-gray-600">{selectedQuestionnaire.consulting_goals}</p>
                                </div>
                                <div>
                                  <label className="font-medium">Improvement Areas:</label>
                                  <p className="mt-1 text-sm text-gray-600">{selectedQuestionnaire.improvement_areas}</p>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Admin Notes and Actions */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <MessageSquare className="h-5 w-5" />
                                  Admin Notes & Actions
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <label className="font-medium">Admin Notes:</label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this questionnaire..."
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => updateStatusMutation.mutate({
                                      id: selectedQuestionnaire.id,
                                      status: 'reviewed',
                                      notes: adminNotes
                                    })}
                                    disabled={updateStatusMutation.isPending}
                                    variant="outline"
                                  >
                                    Mark as Reviewed
                                  </Button>
                                  <Button
                                    onClick={() => updateStatusMutation.mutate({
                                      id: selectedQuestionnaire.id,
                                      status: 'approved',
                                      notes: adminNotes
                                    })}
                                    disabled={updateStatusMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => updateStatusMutation.mutate({
                                      id: selectedQuestionnaire.id,
                                      status: 'rejected',
                                      notes: adminNotes
                                    })}
                                    disabled={updateStatusMutation.isPending}
                                    variant="destructive"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {questionnaires?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No questionnaires submitted yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
