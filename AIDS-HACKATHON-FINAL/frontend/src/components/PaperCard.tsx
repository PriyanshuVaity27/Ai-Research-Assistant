
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, MoreHorizontal, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaperCardProps {
  title: string;
  authors: string[];
  abstract: string;
  date: string;
  pdfUrl: string;
  thumbnail?: string;
  className?: string;
}

const PaperCard = ({
  title,
  authors,
  abstract,
  date,
  pdfUrl,
  thumbnail,
  className,
}: PaperCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card border border-white/10 transition-all duration-300 hover:border-electric-blue/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.15)]",
        className
      )}
    >
      <div className="absolute -right-20 -top-20 h-[150px] w-[150px] rounded-full bg-electric-blue/10 blur-[60px] transition-all duration-500 group-hover:bg-electric-blue/20" />
      
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-electric-blue/10">
              <FileText className="h-4 w-4 text-electric-blue" />
            </div>
            <span className="text-xs text-light-gray/60">{date}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="rounded-full p-1.5 text-light-gray/60 hover:bg-muted hover:text-light-gray transition-colors">
              <Download className="h-4 w-4" />
            </button>
            <button className="rounded-full p-1.5 text-light-gray/60 hover:bg-muted hover:text-light-gray transition-colors">
              <ExternalLink className="h-4 w-4" />
            </button>
            <button className="rounded-full p-1.5 text-light-gray/60 hover:bg-muted hover:text-light-gray transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-electric-blue">
          {title}
        </h3>
        
        <p className="mb-3 text-sm text-light-gray/60">
          {authors.join(", ")}
        </p>
        
        <p className="mb-4 line-clamp-3 text-sm text-light-gray/80">
          {abstract}
        </p>
        
        <div className="mt-auto flex justify-between">
          <button className="text-sm font-medium text-electric-blue">
            Read summary
          </button>
          
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-light-gray/60 hover:text-light-gray transition-colors"
          >
            View PDF
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default PaperCard;
