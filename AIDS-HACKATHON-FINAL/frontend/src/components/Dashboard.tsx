import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from './ui/glassmorphic-card';
import { NeonText } from './ui/neon-text';
import { GradientButton } from './ui/gradient-button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  MessageSquare, 
  Layers, 
  BarChart2, 
  FileText, 
  Clock, 
  Sparkles,
  Mic,
  Zap
} from 'lucide-react';
import UserProfile from './UserProfile';

interface Paper {
  id: string;
  title: string;
  uploaded_at: string;
  processed: boolean;
}

const Dashboard = () => {
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const navigate = useNavigate();

  // Voice recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    const fetchRecentPapers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
        
        const { data, error } = await supabase
          .from('papers')
          .select('id, title, uploaded_at, processed')
          .order('uploaded_at', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        
        setRecentPapers(data || []);
      } catch (error) {
        console.error('Error fetching recent papers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentPapers();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRecentPapers();
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleVoiceSearch = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    setIsListening(true);
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      setIsListening(false);
      console.log('Voice input:', transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      alert('Error occurred in voice recognition: ' + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Feature cards data
  const features = [
    {
      title: "Upload & Process PDFs",
      description: "Extract text and generate vector embeddings for semantic search",
      icon: <Upload className="text-electric-blue" size={24} />,
      link: "#upload"
    },
    {
      title: "Chat with Your Papers",
      description: "Ask questions and get answers based on your research papers",
      icon: <MessageSquare className="text-electric-blue" size={24} />,
      link: "#chat"
    },
    {
      title: "Compare Research",
      description: "Compare key sections from multiple papers side by side",
      icon: <Layers className="text-electric-blue" size={24} />,
      link: "#compare"
    },
    {
      title: "Visual Insights",
      description: "See visualizations and summaries of your research",
      icon: <BarChart2 className="text-electric-blue" size={24} />,
      link: "#insights"
    },
    {
      title: "Voice Search",
      description: "Search papers and ask questions using voice input",
      icon: isListening ? (
        <Mic className="text-electric-blue animate-pulse" size={24} />
      ) : (
        <Mic className="text-electric-blue" size={24} />
      ),
      onClick: handleVoiceSearch
    },
    {
      title: "AI Summary",
      description: "Get AI-generated summaries of your papers",
      icon: <Sparkles className="text-electric-blue" size={24} />,
      link: "#summary"
    }
  ];

  return (
    <section id="dashboard" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <NeonText as="h2" color="multi" size="3xl" className="font-bold mb-4">
              Research Dashboard
            </NeonText>
            <p className="text-light-gray/80 max-w-2xl mx-auto">
              Access all features and manage your research papers in one place
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-1">
            <UserProfile />
          </div>
          
          <div className="lg:col-span-2">
            <GlassmorphicCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock size={20} className="text-electric-blue mr-2" />
                  <NeonText color="blue" size="lg">Recent Papers</NeonText>
                </div>
                <GradientButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Upload size={16} />
                  Upload New
                </GradientButton>
              </div>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse bg-white/5 h-16 rounded-lg"></div>
                  ))}
                </div>
              ) : recentPapers.length > 0 ? (
                <div className="space-y-3">
                  {recentPapers.map(paper => (
                    <div 
                      key={paper.id}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => navigate(`/paper/${paper.id}`)}
                    >
                      <div className="flex items-center">
                        <div className="mr-3">
                          <FileText size={20} className="text-electric-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{paper.title}</h4>
                          <p className="text-xs text-light-gray/60">
                            {new Date(paper.uploaded_at).toLocaleDateString()}
                            {paper.processed ? 
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                <Zap size={10} className="mr-1" />
                                Processed
                              </span> : 
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                Processing
                              </span>
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={40} className="text-light-gray/30 mx-auto mb-3" />
                  <h4 className="text-light-gray/50 font-medium mb-2">No papers yet</h4>
                  <p className="text-light-gray/30 text-sm mb-4">
                    Upload your first research paper to get started
                  </p>
                  <GradientButton 
                    onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Upload size={16} />
                    Upload Papers
                  </GradientButton>
                </div>
              )}
            </GlassmorphicCard>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                onClick={feature.onClick}
                className={`block ${feature.onClick ? 'cursor-pointer' : ''}`}
              >
                <a href={!feature.onClick ? feature.link : undefined}>
                  <GlassmorphicCard 
                    className="p-6 h-full transition-all duration-300 hover:translate-y-[-5px]"
                    glowColor="rgba(0, 255, 255, 0.1)"
                  >
                    <div className="mb-4 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <NeonText color="blue" size="lg" className="font-medium mb-2">
                      {feature.title}
                    </NeonText>
                    <p className="text-light-gray/70 text-sm">
                      {feature.description}
                    </p>
                    {feature.title === "Voice Search" && voiceText && (
                      <p className="text-electric-blue text-sm mt-2">
                        Last voice input: {voiceText}
                      </p>
                    )}
                  </GlassmorphicCard>
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Dashboard;