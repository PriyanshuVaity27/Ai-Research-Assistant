
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UploadZone from './UploadZone';
import UploadStatus from './UploadStatus';
import FileList from './FileList';
import UploadButton from './UploadButton';
import { uploadFile } from "@/utils/api"; 

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFilesDrop = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles.filter((file) => file.type === "application/pdf")]);
};


  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploadStatus("uploading");
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = await uploadFile(file);

        if (!filePath) {
            setUploadStatus("error");
            return;
        }
    }

    setUploadProgress(100);
    setUploadStatus("success");

    // Reset after 3 seconds
    setTimeout(() => {
        setUploadStatus("idle");
        setUploadProgress(0);
        setFiles([]);
    }, 3000);
};

  const handleTryAgain = () => {
    setUploadStatus('idle');
  };

  return (
    <section id="upload" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Upload Your Research Papers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-light-gray/80 max-w-2xl mx-auto"
          >
            Upload PDF files to analyze, search, and extract insights from your academic documents
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <UploadZone 
            onFilesDrop={handleFilesDrop} 
            uploadStatus={uploadStatus} 
            uploadProgress={uploadProgress} 
          />
          
          <UploadStatus 
            status={uploadStatus} 
            progress={uploadProgress} 
            onTryAgain={handleTryAgain} 
          />
        </motion.div>

        {uploadStatus === 'idle' && (
          <>
            <FileList files={files} onRemoveFile={handleRemoveFile} />
            <UploadButton fileCount={files.length} onUpload={handleUpload} />
          </>
        )}
      </div>
    </section>
  );
};

export default FileUpload;
