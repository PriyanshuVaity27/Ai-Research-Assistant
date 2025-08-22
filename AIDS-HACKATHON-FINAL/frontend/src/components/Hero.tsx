
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] rounded-full bg-electric-blue/20 blur-[100px] animate-float" />
      <div className="absolute bottom-[20%] right-[15%] w-[250px] h-[250px] rounded-full bg-deep-purple/20 blur-[100px] animate-float animation-delay-1000" />

      <div className="max-w-4xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-wider text-electric-blue bg-electric-blue/10 border border-electric-blue/30 rounded-full">
            Research Paper Analysis
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
        >
          <span className="text-gradient">Unlock insights</span> from your research papers
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-light-gray/80 mb-10 max-w-2xl mx-auto"
        >
          Upload, search, visualize, and chat with your academic documents using our 
          AI-powered platform. Discover connections and insights you never knew existed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#upload" className="button-gradient text-black font-medium px-8 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 inline-block min-w-[180px]">
            Upload Paper
          </a>
          <a href="#search" className="bg-transparent text-light-gray hover:text-white border border-light-gray/30 hover:border-white/50 font-medium px-8 py-3 rounded-lg transform hover:scale-105 transition-all duration-300 inline-block min-w-[180px]">
            Try Semantic Search
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-light-gray/60" />
      </motion.div>
    </section>
  );
};

export default Hero;
