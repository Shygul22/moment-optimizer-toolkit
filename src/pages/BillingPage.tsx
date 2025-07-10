
import { useAuth } from '@/hooks/useAuth';
import { InvoiceList } from '@/components/billing/InvoiceList';
import { PaymentHistory } from '@/components/billing/PaymentHistory';
import { OffersManager } from '@/components/billing/OffersManager';
import { CouponsManager } from '@/components/billing/CouponsManager';
import { ReferralsManager } from '@/components/billing/ReferralsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BillingPage = () => {
  const { user, roles } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email;
  const isAdmin = roles.includes('admin');

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-10">
      <header className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
          {isAdmin ? 'Billing Management' : 'My Billing'}
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
          {isAdmin 
            ? 'Manage invoices, payments, offers, coupons, and referrals'
            : `View your billing information and manage referrals, ${displayName}`
          }
        </p>
      </header>
      
      <Tabs defaultValue="invoices" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-1 sm:gap-0">
          <TabsTrigger value="invoices" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            Payments
          </TabsTrigger>
          <TabsTrigger value="offers" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            Offers
          </TabsTrigger>
          <TabsTrigger value="coupons" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            Coupons
          </TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            Referrals
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices">
          <InvoiceList />
        </TabsContent>
        
        <TabsContent value="payments">
          <PaymentHistory />
        </TabsContent>
        
        <TabsContent value="offers">
          <OffersManager />
        </TabsContent>
        
        <TabsContent value="coupons">
          <CouponsManager />
        </TabsContent>
        
        <TabsContent value="referrals">
          <ReferralsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingPage;
