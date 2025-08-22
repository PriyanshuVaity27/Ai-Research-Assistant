
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from './ui/glassmorphic-card';
import { GradientButton } from './ui/gradient-button';
import { NeonText } from './ui/neon-text';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

// Sample paper data for comparison
const papers = [
  {
    id: 1,
    title: "Attention Is All You Need: Transformer Models in NLP",
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism...",
    methodology: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior...",
    results: "On both WMT 2014 English-to-German and WMT 2014 English-to-French translation tasks, we achieve a new state of the art. In the former task our best model outperforms even all previously reported ensembles...",
  },
  {
    id: 2,
    title: "Deep Learning Approaches for Natural Language Processing",
    abstract: "Recent advances in deep learning have significantly improved the performance of natural language processing systems. This paper reviews the key deep learning methods that have been applied to natural language processing tasks...",
    methodology: "We review various architectures including recurrent neural networks, convolutional neural networks, and attention-based models. We discuss their applications to tasks such as sentiment analysis, machine translation, and question answering...",
    results: "Our experiments show that deep learning approaches consistently outperform traditional machine learning methods across a variety of NLP tasks. In particular, transformer-based models achieve state-of-the-art performance...",
  },
  {
    id: 3,
    title: "A Survey of Transformer-Based Models in Machine Learning",
    abstract: "Transformer models have revolutionized the field of natural language processing and are now being applied to computer vision, audio processing, and multimodal learning. This survey paper provides a comprehensive overview of transformer-based architectures...",
    methodology: "We systematically categorize transformer variants based on their architectural modifications, pre-training objectives, and downstream applications. We analyze the computational requirements and scalability of these models...",
    results: "Our analysis reveals that scaling transformer models in terms of parameters, data, and compute has consistently led to improvements in performance across multiple domains. However, challenges remain in terms of computational efficiency and interpretability...",
  }
];

const tabs = ["Abstract", "Methodology", "Results"];

const ComparisonView = () => {
  const [selectedPapers, setSelectedPapers] = useState([papers[0], papers[1]]);
  const [activeTab, setActiveTab] = useState("Abstract");
  const [fullScreen, setFullScreen] = useState(false);
  
  const getContentForTab = (paper) => {
    switch(activeTab) {
      case "Abstract": return paper.abstract;
      case "Methodology": return paper.methodology;
      case "Results": return paper.results;
      default: return paper.abstract;
    }
  };
  
  const handlePaperChange = (index, direction) => {
    const currentPaperIndex = papers.findIndex(p => p.id === selectedPapers[index].id);
    let newIndex = currentPaperIndex;
    
    if (direction === 'next') {
      newIndex = (currentPaperIndex + 1) % papers.length;
    } else {
      newIndex = (currentPaperIndex - 1 + papers.length) % papers.length;
    }
    
    const newSelectedPapers = [...selectedPapers];
    newSelectedPapers[index] = papers[newIndex];
    setSelectedPapers(newSelectedPapers);
  };

  return (
    <section id="compare" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <NeonText as="h2" color="multi" size="3xl" className="font-bold mb-4">
              Compare Papers
            </NeonText>
            <p className="text-light-gray/80 max-w-2xl mx-auto">
              Analyze similarities and differences between multiple research papers
            </p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassmorphicCard 
            className={`p-0 overflow-hidden transition-all duration-500 ease-out ${fullScreen ? 'fixed inset-4 z-50' : ''}`}
            variant="elevated"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <NeonText as="h3" color="blue" size="xl" className="font-medium">
                Paper Comparison
              </NeonText>
              <button 
                onClick={() => setFullScreen(!fullScreen)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {fullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
            
            <div className="flex border-b border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 font-medium transition-colors ${
                    activeTab === tab 
                      ? 'text-white border-b-2 border-electric-blue' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col md:flex-row">
              {selectedPapers.map((paper, index) => (
                <div 
                  key={paper.id} 
                  className={`flex-1 p-6 ${index === 0 ? 'md:border-r border-white/10' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => handlePaperChange(index, 'prev')}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <h4 className="text-lg font-medium text-center line-clamp-1">{paper.title}</h4>
                    
                    <button 
                      onClick={() => handlePaperChange(index, 'next')}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-5 h-[300px] overflow-y-auto">
                    <p className="text-light-gray/90 leading-relaxed">
                      {getContentForTab(paper)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-white/10 flex justify-center">
              <GradientButton size="sm">
                Generate Comparison Report
              </GradientButton>
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonView;
