
import React from 'react';
import { FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemoveFile }) => {
  if (files.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.5 }}
      className="bg-muted rounded-xl p-6 mb-6"
    >
      <h3 className="text-lg font-medium mb-4">Selected Files ({files.length})</h3>
      <div className="space-y-3">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-electric-blue" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-sm md:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-light-gray/60">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemoveFile(index)}
              className="text-light-gray/60 hover:text-white focus:outline-none"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FileList;
