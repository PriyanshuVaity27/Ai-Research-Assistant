
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Simulate search results - in a real app you'd call an API here
    setSearchResults([
      { 
        id: 1, 
        title: 'Advances in Neural Information Processing Systems', 
        author: 'A. Smith, B. Johnson',
        relevance: 0.95
      },
      { 
        id: 2, 
        title: 'Deep Learning Approaches for Natural Language Processing', 
        author: 'C. Lee, D. Brown',
        relevance: 0.87
      },
      { 
        id: 3, 
        title: 'A Survey of Transformer Models in Machine Learning', 
        author: 'E. Williams, F. Davis',
        relevance: 0.82
      },
    ]);
  };

  return (
    <section id="search" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Semantic Search
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-light-gray/80 max-w-2xl mx-auto"
          >
            Find exactly what you're looking for in your research papers using natural language
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-3xl mx-auto relative"
        >
          <form onSubmit={handleSearch}>
            <div 
              className={cn(
                "relative flex items-center w-full transition-all duration-300",
                isFocused ? "transform scale-[1.02]" : ""
              )}
            >
              <div 
                className={cn(
                  "absolute inset-0 rounded-xl transition-all duration-300",
                  isFocused ? "bg-gradient-to-r from-electric-blue to-deep-purple blur-[6px] opacity-50" : "opacity-0"
                )}
              />
              <div className="relative flex items-center w-full bg-muted border border-white/10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                <span className="pl-4">
                  <Search className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isFocused ? "text-electric-blue" : "text-light-gray/60"
                  )} />
                </span>
                <input
                  type="text"
                  placeholder="Search with natural language (e.g., 'Find papers about transformer models')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-transparent border-0 outline-none py-4 px-3 text-light-gray placeholder:text-light-gray/60"
                />
                <div className="flex items-center mr-4">
                  <kbd className="hidden sm:flex h-6 items-center gap-1 rounded border border-white/20 bg-white/5 px-2 font-mono text-[10px] font-medium text-light-gray/70">
                    <Command className="h-3 w-3" /> K
                  </kbd>
                </div>
              </div>
            </div>
            <div className="mt-3 text-right">
              <button
                type="submit"
                className="inline-flex items-center text-sm text-electric-blue hover:text-electric-blue/80 transition-colors"
              >
                <span>Search papers</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 space-y-4"
            >
              <h3 className="text-lg font-medium mb-4">Results</h3>
              {searchResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: result.id * 0.1 }}
                  className="bg-muted p-4 rounded-lg border border-white/10 hover:border-electric-blue/50 transition-colors duration-200 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium mb-1">{result.title}</h4>
                      <p className="text-sm text-light-gray/70">{result.author}</p>
                    </div>
                    <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-electric-blue/10 text-electric-blue">
                      {(result.relevance * 100).toFixed(0)}% match
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default SearchBar;
