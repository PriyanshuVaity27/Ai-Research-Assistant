
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from './ui/glassmorphic-card';
import { GradientButton } from './ui/gradient-button';
import { NeonText } from './ui/neon-text';
import { Send, Bot, User as UserIcon, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  content: string;
}

interface Paper {
  id: string;
  title: string;
}

const initialMessages = [
  { id: 1, sender: 'ai', content: 'Hello! I\'m your AI research assistant. How can I help you analyze your papers today?' },
];

const EnhancedChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        // Fetch user's papers
        const { data, error } = await supabase
          .from('papers')
          .select('id, title')
          .eq('user_id', session.user.id)
          .eq('processed', true)
          .order('uploaded_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching papers:', error);
        } else {
          setPapers(data || []);
          if (data && data.length > 0) {
            setSelectedPaper(data[0].id);
          }
        }
      }
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          // Fetch user's papers on auth change
          const { data, error } = await supabase
            .from('papers')
            .select('id, title')
            .eq('user_id', session.user.id)
            .eq('processed', true)
            .order('uploaded_at', { ascending: false });
            
          if (error) {
            console.error('Error fetching papers:', error);
          } else {
            setPapers(data || []);
            if (data && data.length > 0 && !selectedPaper) {
              setSelectedPaper(data[0].id);
            }
          }
        } else {
          setPapers([]);
          setSelectedPaper(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [selectedPaper]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() === '') return;
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use the chat feature",
      });
      navigate('/auth');
      return;
    }
    
    if (!selectedPaper) {
      toast({
        variant: "destructive",
        title: "No paper selected",
        description: "Please select a paper to chat about",
      });
      return;
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: inputValue,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI response after a delay
    setTimeout(async () => {
      const aiResponses = [
        "Based on the papers you've uploaded, the main research focus appears to be on transformer architectures in NLP.",
        "I've analyzed the methodology sections and found that 75% of the papers use attention mechanisms as their primary approach.",
        "The results across these papers suggest that transformer models consistently outperform traditional RNN-based approaches by an average of 15%.",
        "Would you like me to generate a detailed comparison of the methodologies used in these papers?",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: ChatMessage = {
        id: messages.length + 2,
        sender: 'ai',
        content: randomResponse,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      try {
        // Store chat history in the database
        if (user && selectedPaper) {
          await supabase
            .from('chat_history')
            .insert({
              user_id: user.id,
              paper_id: selectedPaper,
              question: userMessage.content,
              answer: randomResponse,
            });
        }
      } catch (error) {
        console.error('Error storing chat history:', error);
      }
    }, 1500);
  };
  
  const handlePaperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPaper(e.target.value);
    
    // Reset chat when paper changes
    setMessages([
      { 
        id: 1, 
        sender: 'ai', 
        content: 'I\'ve loaded a new paper. How can I help you with your research?' 
      }
    ]);
  };

  return (
    <section id="chat" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <NeonText as="h2" color="multi" size="3xl" className="font-bold mb-4">
              AI Research Assistant
            </NeonText>
            <p className="text-light-gray/80 max-w-2xl mx-auto">
              Chat with your papers and discover insights
            </p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassmorphicCard className="p-0 h-[600px] flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-electric-blue to-deep-purple">
                <Bot size={20} className="text-white" />
              </div>
              <NeonText as="h3" color="blue" size="lg" className="font-medium ml-3">
                Research Assistant
              </NeonText>
              
              {user && papers.length > 0 && (
                <div className="ml-auto flex-1 max-w-[200px] md:max-w-xs">
                  <select
                    value={selectedPaper || ''}
                    onChange={handlePaperChange}
                    className="w-full py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-electric-blue"
                  >
                    {papers.map(paper => (
                      <option key={paper.id} value={paper.id}>
                        {paper.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="ml-auto">
                <GradientButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setMessages(initialMessages);
                  }}
                >
                  <Sparkles size={16} />
                  New Chat
                </GradientButton>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!user && (
                <div className="mb-6 p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30 flex items-start">
                  <AlertTriangle size={20} className="text-yellow-500 shrink-0 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-yellow-200 font-medium">Authentication required</p>
                    <p className="text-xs text-yellow-200/70 mt-1">
                      Please <a href="/auth" className="underline hover:text-yellow-200">sign in</a> to use the chat feature
                    </p>
                  </div>
                </div>
              )}
              
              {user && papers.length === 0 && (
                <div className="text-center py-10">
                  <FileText size={40} className="text-light-gray/30 mx-auto mb-3" />
                  <h4 className="text-light-gray/50 font-medium mb-2">No processed papers</h4>
                  <p className="text-light-gray/30 text-sm mb-4 max-w-md mx-auto">
                    Upload research papers and wait for them to be processed before you can chat with them
                  </p>
                  <GradientButton 
                    onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Upload Papers
                  </GradientButton>
                </div>
              )}
              
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-deep-purple/30 rounded-tr-none' 
                        : 'bg-white/10 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.sender === 'ai' ? (
                        <>
                          <Bot size={16} className="text-electric-blue mr-2" />
                          <span className="text-xs font-medium text-electric-blue">Assistant</span>
                        </>
                      ) : (
                        <>
                          <UserIcon size={16} className="text-deep-purple mr-2" />
                          <span className="text-xs font-medium text-deep-purple">You</span>
                        </>
                      )}
                    </div>
                    <p className="text-white leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%]">
                    <div className="flex items-center mb-1">
                      <Bot size={16} className="text-electric-blue mr-2" />
                      <span className="text-xs font-medium text-electric-blue">Assistant</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse animation-delay-500"></div>
                      <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse animation-delay-1000"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-white/10">
              <form onSubmit={handleSubmit} className="flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={user ? "Ask about your papers..." : "Please sign in to chat"}
                  className="flex-1 bg-white/5 border border-white/10 rounded-l-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-electric-blue"
                  disabled={!user || papers.length === 0}
                />
                <button 
                  type="submit"
                  className="button-gradient h-[50px] px-5 rounded-r-xl flex items-center justify-center"
                  disabled={!user || papers.length === 0 || inputValue.trim() === ''}
                >
                  <Send size={20} />
                </button>
              </form>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <button 
                  className="px-3 py-1 text-sm rounded-full bg-white/10 hover:bg-white/15 transition-colors"
                  disabled={!user || papers.length === 0}
                  onClick={() => {
                    if (user && papers.length > 0) {
                      setInputValue("Summarize main findings");
                    }
                  }}
                >
                  Summarize main findings
                </button>
                <button 
                  className="px-3 py-1 text-sm rounded-full bg-white/10 hover:bg-white/15 transition-colors"
                  disabled={!user || papers.length === 0}
                  onClick={() => {
                    if (user && papers.length > 0) {
                      setInputValue("Compare methodologies");
                    }
                  }}
                >
                  Compare methodologies
                </button>
                <button 
                  className="px-3 py-1 text-sm rounded-full bg-white/10 hover:bg-white/15 transition-colors"
                  disabled={!user || papers.length === 0}
                  onClick={() => {
                    if (user && papers.length > 0) {
                      setInputValue("Identify research gaps");
                    }
                  }}
                >
                  Identify research gaps
                </button>
              </div>
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </section>
  );
};

export default EnhancedChatInterface;
