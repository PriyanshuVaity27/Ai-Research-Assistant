import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Hero from '@/components/Hero';
import Navigation from '@/components/Navigation';
import { FileUpload } from '@/components/fileUpload';
import SearchBar from '@/components/SearchBar';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';
import Dashboard from '@/components/Dashboard';
import VisualInsights from '@/components/VisualInsights';
import ComparisonView from '@/components/ComparisonView';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  
  // Add smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(anchor.hash);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.getBoundingClientRect().top + window.scrollY - 100,
            behavior: 'smooth'
          });
        }
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Process papers automatically after upload
  useEffect(() => {
    const processPapers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get unprocessed papers
      const { data: papers, error } = await supabase
        .from('papers')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('processed', false);
        
      if (error || !papers || papers.length === 0) return;
      
      // Process each paper
      for (const paper of papers) {
        try {
          await supabase.functions.invoke('process-pdf', {
            body: { paperId: paper.id }
          });
        } catch (e) {
          console.error('Error processing paper:', e);
        }
      }
    };
    
    processPapers();
    
    // Set up subscription to process newly uploaded papers
    const channel = supabase
      .channel('papers-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'papers'
        },
        (payload) => {
          if (payload.new && !payload.new.processed) {
            supabase.functions.invoke('process-pdf', {
              body: { paperId: payload.new.id }
            }).catch(e => console.error('Error processing new paper:', e));
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-deep-black text-light-gray">
      <Navigation />
      <Hero />
      
      <Dashboard />
      
      <FileUpload />
      
      <SearchBar />
      
      <EnhancedChatInterface />
      
      <ComparisonView />
      
      <VisualInsights />
      
      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-electric-blue to-deep-purple" />
                <span className="text-lg font-bold tracking-tight">PaperLytic</span>
              </div>
              <p className="mt-2 text-sm text-light-gray/60">
                Unlock insights from your research papers
              </p>
            </div>
            
            <div className="flex space-x-8">
              <div>
                <h4 className="font-medium mb-3">Features</h4>
                <ul className="space-y-2">
                  <li><a href="#dashboard" className="text-sm text-light-gray/60 hover:text-white transition-colors">Dashboard</a></li>
                  <li><a href="#upload" className="text-sm text-light-gray/60 hover:text-white transition-colors">Upload</a></li>
                  <li><a href="#search" className="text-sm text-light-gray/60 hover:text-white transition-colors">Search</a></li>
                  <li><a href="#chat" className="text-sm text-light-gray/60 hover:text-white transition-colors">Chat</a></li>
                  <li><a href="#compare" className="text-sm text-light-gray/60 hover:text-white transition-colors">Compare</a></li>
                  <li><a href="#insights" className="text-sm text-light-gray/60 hover:text-white transition-colors">Insights</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-light-gray/60 hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-sm text-light-gray/60 hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="text-sm text-light-gray/60 hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-sm text-light-gray/60 hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-white/10 text-center text-sm text-light-gray/40">
            &copy; {new Date().getFullYear()} PaperLytic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
