
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tag, X } from 'lucide-react';

interface CouponInputProps {
  orderAmount: number;
  onCouponApplied: (discount: any) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: any;
}

interface CouponResult {
  valid: boolean;
  coupon_id?: string;
  discount_amount?: number;
  discount_type?: string;
  title?: string;
  error?: string;
}

export const CouponInput = ({ 
  orderAmount, 
  onCouponApplied, 
  onCouponRemoved, 
  appliedCoupon 
}: CouponInputProps) => {
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');

  const { mutate: validateCoupon, isPending: isValidating } = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc('apply_coupon', {
        p_coupon_code: code,
        p_user_id: user?.id,
        p_order_amount: orderAmount
      });

      if (error) throw error;
      
      // Safely parse the JSON response
      let result: CouponResult;
      if (typeof data === 'string') {
        result = JSON.parse(data);
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        result = data as unknown as CouponResult;
      } else {
        throw new Error('Invalid response format');
      }
      
      return result;
    },
    onSuccess: (result) => {
      if (result.valid) {
        onCouponApplied(result);
        setCouponCode('');
        toast.success(`Coupon applied! You saved ${formatCurrency(result.discount_amount || 0)}`);
      } else {
        toast.error(result.error || 'Invalid coupon');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to apply coupon: ${error.message}`);
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    validateCoupon(couponCode.toUpperCase());
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast.success('Coupon removed');
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
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="h-5 w-5" />
          Apply Coupon
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appliedCoupon ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{appliedCoupon.title}</Badge>
                  <span className="text-sm text-green-700">
                    Saved {formatCurrency(appliedCoupon.discount_amount)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                className="text-green-700 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApplyCoupon();
                }
              }}
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={isValidating || !couponCode.trim()}
            >
              {isValidating ? 'Applying...' : 'Apply'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
