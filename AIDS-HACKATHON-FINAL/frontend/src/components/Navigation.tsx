
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Search, Upload, BarChart2, MessageSquare, Layers, Menu, X, User, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GradientButton } from './ui/gradient-button';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-10 py-4",
        scrolled ? "bg-deep-black/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-2"
        >
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-electric-blue to-deep-purple" />
          <span className="text-xl font-bold tracking-tight">PaperLytic</span>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {[
            { name: 'Dashboard', icon: BarChart2, href: '#dashboard' },
            { name: 'Upload', icon: Upload, href: '#upload' },
            { name: 'Search', icon: Search, href: '#search' },
            { name: 'Chat', icon: MessageSquare, href: '#chat' },
            { name: 'Compare', icon: Layers, href: '#compare' },
          ].map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * [1, 2, 3, 4, 5].indexOf([1, 2, 3, 4, 5].find(i => i)) }}
              className="flex items-center space-x-1 text-light-gray/80 hover:text-white transition-colors duration-200 group"
            >
              <item.icon className="w-4 h-4 group-hover:text-electric-blue transition-colors duration-200" />
              <span className="text-sm font-medium">{item.name}</span>
            </motion.a>
          ))}
          
          {user ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <GradientButton 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-light-gray/80 hover:text-white"
              >
                <User size={16} />
                Sign Out
              </GradientButton>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <GradientButton 
                size="sm" 
                onClick={() => navigate('/auth')}
              >
                <LogIn size={16} />
                Sign In
              </GradientButton>
            </motion.div>
          )}
        </nav>

        {/* Mobile Nav Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex md:hidden text-light-gray focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Nav */}
        <motion.div
          initial={false}
          animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: '100%' }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed inset-0 top-[60px] bg-deep-black/95 backdrop-blur-md z-40 md:hidden",
            !isOpen && "pointer-events-none"
          )}
        >
          <nav className="flex flex-col p-8 space-y-8">
            {[
              { name: 'Dashboard', icon: BarChart2, href: '#dashboard' },
              { name: 'Upload', icon: Upload, href: '#upload' },
              { name: 'Search', icon: Search, href: '#search' },
              { name: 'Chat', icon: MessageSquare, href: '#chat' },
              { name: 'Compare', icon: Layers, href: '#compare' },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-4 text-light-gray/80 hover:text-white transition-colors duration-200 group"
              >
                <item.icon className="w-6 h-6 group-hover:text-electric-blue transition-colors duration-200" />
                <span className="text-lg font-medium">{item.name}</span>
              </a>
            ))}
            
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-4 text-light-gray/80 hover:text-white transition-colors duration-200 group"
              >
                <User className="w-6 h-6 group-hover:text-electric-blue transition-colors duration-200" />
                <span className="text-lg font-medium">Sign Out</span>
              </button>
            ) : (
              <a
                href="/auth"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-4 text-light-gray/80 hover:text-white transition-colors duration-200 group"
              >
                <LogIn className="w-6 h-6 group-hover:text-electric-blue transition-colors duration-200" />
                <span className="text-lg font-medium">Sign In</span>
              </a>
            )}
          </nav>
        </motion.div>
      </div>
    </header>
  );
};

export default Navigation;
