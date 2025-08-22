import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/utils/api';

interface UploadZoneProps {
  onFilesDrop: (files: File[]) => void;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  uploadProgress: number;
}

const UploadZone: React.FC<UploadZoneProps> = ({ 
  onFilesDrop, 
  uploadStatus, 
  uploadProgress 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (droppedFiles.length > 0) {
      onFilesDrop(droppedFiles);
      await handleUpload(droppedFiles);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf'
      );
      
      if (selectedFiles.length > 0) {
        onFilesDrop(selectedFiles);
        await handleUpload(selectedFiles);
      }
    }
  };

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      const result = await uploadFile(file);
      if (result) {
        console.log("File uploaded successfully:", result);
      } else {
        console.error("File upload failed");
      }
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200",
        isDragging ? "border-electric-blue bg-electric-blue/5" : "border-gray-700 hover:border-gray-500",
        uploadStatus === 'uploading' ? "border-electric-blue/50" : "",
        uploadStatus === 'success' ? "border-green-500/50" : "",
        uploadStatus === 'error' ? "border-red-500/50" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        multiple
        className="hidden"
        id="file-upload"
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        {uploadStatus === 'idle' && (
          <>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
              <Upload className="w-8 h-8 text-light-gray" />
            </div>
            <h3 className="text-xl font-medium">Drag & Drop your PDF files here</h3>
            <p className="text-light-gray/60 max-w-md">
              or <button 
                className="text-electric-blue hover:underline focus:outline-none"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </button> to choose files
            </p>
            <p className="text-xs text-light-gray/40">Supports only PDF files</p>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
