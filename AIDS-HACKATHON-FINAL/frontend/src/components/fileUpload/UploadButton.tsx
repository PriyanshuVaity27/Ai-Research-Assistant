
import React from 'react';
import { motion } from 'framer-motion';

interface UploadButtonProps {
  fileCount: number;
  onUpload: () => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ fileCount, onUpload }) => {
  if (fileCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex justify-center"
    >
      <button
        onClick={onUpload}
        className="button-gradient text-black font-medium px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
      >
        Upload {fileCount} {fileCount === 1 ? 'file' : 'files'}
      </button>
    </motion.div>
  );
};

export default UploadButton;
