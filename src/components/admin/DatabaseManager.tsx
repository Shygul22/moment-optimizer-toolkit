
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Eye, Edit, Trash2, Plus, Database, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type TableName = 'profiles' | 'user_roles' | 'bookings' | 'consultant_availability' | 'chat_rooms' | 'chat_messages' | 'chat_attachments' | 'invoices' | 'payments' | 'notifications';

const DATABASE_TABLES: TableName[] = [
  'profiles',
  'user_roles', 
  'bookings',
  'consultant_availability',
  'chat_rooms',
  'chat_messages',
  'chat_attachments',
  'invoices',
  'payments',
  'notifications'
];

export const DatabaseManager = () => {
  const [selectedTable, setSelectedTable] = useState<TableName>('profiles');
  const [sqlQuery, setSqlQuery] = useState('');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const queryClient = useQueryClient();

  // Fetch table data
  const { data: tableData, isLoading, refetch } = useQuery({
    queryKey: ['admin-table-data', selectedTable],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(selectedTable as any)
        .select('*')
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTable,
  });

  // Execute custom SQL query - simplified without RPC
  const { mutate: executeQuery, isPending: isExecuting } = useMutation({
    mutationFn: async (query: string) => {
      // For now, just show a message that custom SQL execution requires backend setup
      toast.error('Custom SQL execution requires additional backend setup');
      throw new Error('Custom SQL execution not available');
    },
    onSuccess: () => {
      toast.success('Query executed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-table-data'] });
    },
    onError: (error: any) => {
      toast.error('Query failed', { description: error.message });
    },
  });

  // Delete record
  const { mutate: deleteRecord } = useMutation({
    mutationFn: async ({ table, id }: { table: TableName; id: string }) => {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Record deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error('Failed to delete record', { description: error.message });
    },
  });

  const getColumnNames = (data: any[]) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  const handleDeleteRecord = (record: any) => {
    if (record && record.id && confirm('Are you sure you want to delete this record?')) {
      deleteRecord({ table: selectedTable, id: record.id });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tables" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="query">SQL Query</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="tables" className="space-y-4">
              <div className="flex gap-4 items-center">
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value as TableName)}
                  className="border rounded px-3 py-2"
                >
                  {DATABASE_TABLES.map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => setShowAddRecord(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">Loading table data...</div>
              ) : tableData && tableData.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {getColumnNames(tableData).map((column) => (
                            <TableHead key={column} className="min-w-32">
                              {column}
                            </TableHead>
                          ))}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.map((record, index) => (
                          <TableRow key={index}>
                            {getColumnNames(tableData).map((column) => (
                              <TableCell key={column} className="max-w-48">
                                <div className="truncate" title={String(record[column])}>
                                  {formatCellValue(record[column])}
                                </div>
                              </TableCell>
                            ))}
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingRecord(record)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteRecord(record)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No data found in {selectedTable}
                </div>
              )}
            </TabsContent>

            <TabsContent value="query" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Custom SQL execution requires additional backend setup with database functions. 
                    Currently, you can view and manage data through the Tables tab.
                  </p>
                </div>
                <Textarea
                  placeholder="Enter your SQL query here..."
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={10}
                  disabled
                />
                <Button
                  onClick={() => executeQuery(sqlQuery)}
                  disabled={true}
                >
                  Execute Query (Not Available)
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <DatabaseStats />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Record Detail Modal */}
      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Details - {selectedTable}</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <div className="space-y-4">
              {Object.entries(editingRecord).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-4 items-start">
                  <Badge variant="outline">{key}</Badge>
                  <div className="col-span-2">
                    <code className="text-sm bg-gray-100 p-2 rounded block">
                      {typeof value === 'object' 
                        ? JSON.stringify(value, null, 2)
                        : String(value || 'NULL')
                      }
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Database Statistics Component
const DatabaseStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-database-stats'],
    queryFn: async () => {
      const results = await Promise.all(
        DATABASE_TABLES.map(async (table) => {
          const { count, error } = await supabase
            .from(table as any)
            .select('*', { count: 'exact', head: true });
          
          return {
            table,
            count: error ? 0 : count || 0,
            error: error?.message
          };
        })
      );
      return results;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats?.map((stat) => (
        <Card key={stat.table}>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-600">{stat.table}</div>
            <div className="text-2xl font-bold">
              {stat.error ? 'Error' : stat.count.toLocaleString()}
            </div>
            {stat.error && (
              <div className="text-xs text-red-500 mt-1">{stat.error}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
