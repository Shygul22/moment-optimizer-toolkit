
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle, Plus, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button asChild variant="outline" className="h-16 flex-col gap-2">
            <Link to="/booking">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Book Session</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-16 flex-col gap-2">
            <Link to="/chat">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs">Message</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-16 flex-col gap-2">
            <Link to="/billing">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Billing</span>
            </Link>
          </Button>
          
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Clock className="h-5 w-5" />
            <span className="text-xs">Reschedule</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
