
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import ProfileForm from '@/components/ProfileForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

const fetchProfile = async (userId: string): Promise<Tables<'profiles'> | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    throw new Error(error.message);
  }

  return data;
};

const ProfilePage = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/auth');
    }
  }, [session, navigate]);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  if (isLoading || !user) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <div className="space-y-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load profile: {error.message}</AlertDescription>
      </Alert>
    );
  }
  
  if (!profile) {
      return (
          <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Profile not found</AlertTitle>
              <AlertDescription>We couldn't find a profile for your user. This might be a sync issue. Try logging out and back in.</AlertDescription>
          </Alert>
      )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      {profile && <ProfileForm profile={profile} />}
    </div>
  );
};

export default ProfilePage;
