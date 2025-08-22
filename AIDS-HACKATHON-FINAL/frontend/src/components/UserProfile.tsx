
import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { GlassmorphicCard } from './ui/glassmorphic-card';
import { NeonText } from './ui/neon-text';
import { GradientButton } from './ui/gradient-button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        setUser(session.user);
        
        // Fetch profile data
        if (session.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', session.user.id)
            .single();
            
          if (error) throw error;
          
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getProfile();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', session.user.id)
            .single();
            
          setProfile(data);
        } else {
          setProfile(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "An error occurred while signing out.",
      });
    }
  };

  if (loading) {
    return (
      <GlassmorphicCard className="p-4 flex items-center justify-center h-20">
        <div className="animate-pulse flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-electric-blue"></div>
          <div className="w-2 h-2 rounded-full bg-electric-blue animation-delay-500"></div>
          <div className="w-2 h-2 rounded-full bg-electric-blue animation-delay-1000"></div>
        </div>
      </GlassmorphicCard>
    );
  }

  if (!user) {
    return (
      <GlassmorphicCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <UserIcon size={20} className="text-light-gray/60" />
            </div>
            <div className="ml-3">
              <NeonText color="blue" size="sm">Guest</NeonText>
              <p className="text-xs text-light-gray/60">Not signed in</p>
            </div>
          </div>
          
          <GradientButton size="sm" onClick={() => navigate('/auth')}>
            Sign In
          </GradientButton>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-white/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-electric-blue/20 flex items-center justify-center">
              <UserIcon size={20} className="text-electric-blue" />
            </div>
          )}
          
          <div className="ml-3">
            <NeonText color="blue" size="sm">
              {profile?.full_name || user.email?.split('@')[0] || 'User'}
            </NeonText>
            <p className="text-xs text-light-gray/60">{user.email}</p>
          </div>
        </div>
        
        <GradientButton 
          variant="ghost" 
          size="sm" 
          onClick={handleSignOut}
          className="text-light-gray/80 hover:text-white"
        >
          <LogOut size={16} />
          Sign Out
        </GradientButton>
      </div>
    </GlassmorphicCard>
  );
};

export default UserProfile;
