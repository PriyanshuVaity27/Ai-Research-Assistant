
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card';
import { NeonText } from '@/components/ui/neon-text';
import { GradientButton } from '@/components/ui/gradient-button';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { LogIn, Mail, Lock, AlertCircle, FileText, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back to PaperLytic!",
      });
      
      navigate('/');
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Google login failed",
        description: error.message,
      });
      setLoading(false);
    }
  };
  
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-electric-blue to-deep-purple flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
          </div>
          <NeonText as="h1" color="multi" size="3xl" className="font-bold mb-2">
            PaperLytic
          </NeonText>
          <p className="text-light-gray/70">
            AI-powered research assistant for your academic papers
          </p>
        </div>
        
        <GlassmorphicCard className="p-6">
          <div className="mb-6">
            <NeonText as="h2" color="blue" size="xl" className="font-semibold mb-1">
              Welcome Back
            </NeonText>
            <p className="text-light-gray/60 text-sm">
              Sign in to access your research dashboard
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 flex items-start">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5 mr-2" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-gray/80 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-light-gray/40" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white placeholder:text-light-gray/40 focus:outline-none focus:ring-1 focus:ring-electric-blue"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-light-gray/80 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-light-gray/40" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white placeholder:text-light-gray/40 focus:outline-none focus:ring-1 focus:ring-electric-blue"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <GradientButton 
                type="submit" 
                disabled={loading} 
                className="w-[48%]"
              >
                <LogIn size={18} />
                Sign In
              </GradientButton>
              <GradientButton 
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                variant="glow"
                className="w-[48%]"
              >
                Sign Up
              </GradientButton>
            </div>
          </form>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-deep-black text-light-gray/40 text-sm">OR</span>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-white text-gray-800 hover:bg-gray-100 transition-colors font-medium"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
        </GlassmorphicCard>
        
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <BrainCircuit size={18} className="text-electric-blue" />
            <NeonText color="blue" size="sm" className="tracking-wide">
              POWERED BY AI
            </NeonText>
          </div>
          <p className="text-light-gray/40 text-xs">
            Upload research papers and get AI-powered insights, summaries, and answers to your questions
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
