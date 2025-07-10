import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Textarea is available in read-only files

type Profile = {
  full_name: string;
  contact_number: string;
  business_name: string;
  business_details: string;
};

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast.error('Error', { description: 'Could not fetch profile.' });
        } else {
          setProfile(data);
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully.");
    window.location.href = '/auth';
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        contact_number: profile.contact_number,
        business_name: profile.business_name,
        business_details: profile.business_details,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    setLoading(false);

    if (error) {
      toast.error('Error', { description: 'Could not update profile.' });
    } else {
      toast.success('Success', { description: 'Profile updated successfully.' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  if (loading && !profile) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Manage your personal and business information.</CardDescription>
        </CardHeader>
        <CardContent>
          {profile && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={profile.full_name || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input id="contact_number" name="contact_number" value={profile.contact_number || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input id="business_name" name="business_name" value={profile.business_name || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_details">Business Details</Label>
                <Textarea id="business_details" name="business_details" value={profile.business_details || ''} onChange={handleInputChange} />
              </div>
              <div className="flex justify-between items-center pt-4">
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
