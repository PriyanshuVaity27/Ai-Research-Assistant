
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from './ui/glassmorphic-card';
import { GradientButton } from './ui/gradient-button';
import { NeonText } from './ui/neon-text';
import { File, Upload, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

const EnhancedFileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to upload files",
      });
      navigate('/auth');
      return;
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type === 'application/pdf'
      );
      setFiles(prev => [...prev, ...newFiles]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to upload files",
      });
      navigate('/auth');
      return;
    }
    
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf'
      );
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const processFiles = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to upload files",
      });
      navigate('/auth');
      return;
    }
    
    if (files.length === 0) return;
    
    setUploading(true);
    const newProgress: Record<string, number> = {};
    files.forEach(file => {
      newProgress[file.name] = 0;
    });
    setUploadProgress(newProgress);
    
    try {
      for (const file of files) {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${user.id}/${fileName}`;
        
        // Upload file to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('pdfs')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: percent
              }));
            }
          });
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Create record in papers table
        const { error: insertError } = await supabase
          .from('papers')
          .insert({
            user_id: user.id,
            title: file.name,
            file_path: filePath,
            file_size: file.size,
          });
        
        if (insertError) {
          throw insertError;
        }
      }
      
      toast({
        title: "Upload successful",
        description: `${files.length} ${files.length === 1 ? 'file' : 'files'} uploaded successfully.`,
      });
      
      // Clear files after successful upload
      setFiles([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "An error occurred while uploading your files.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section id="upload" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <NeonText as="h2" color="multi" size="3xl" className="font-bold mb-4">
              Upload Your Research
            </NeonText>
            <p className="text-light-gray/80 max-w-2xl mx-auto">
              Drag and drop your PDFs to get started with AI-powered analysis
            </p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassmorphicCard className="p-0 overflow-hidden">
            <div 
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-10 transition-all duration-300 ${
                isDragging 
                  ? 'bg-white/10 border-2 border-dashed border-electric-blue' 
                  : 'border-2 border-dashed border-white/20'
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-white/5">
                  <Upload size={36} className="text-electric-blue" />
                </div>
                <NeonText color="blue" size="xl" className="mb-2">
                  Drop your PDFs here
                </NeonText>
                <p className="text-light-gray/70 mb-6 max-w-md">
                  Supports PDF research papers, articles, and publications
                </p>
                
                {!user && (
                  <div className="mb-6 p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30 flex items-start">
                    <AlertTriangle size={20} className="text-yellow-500 shrink-0 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm text-yellow-200 font-medium">Authentication required</p>
                      <p className="text-xs text-yellow-200/70 mt-1">
                        Please <a href="/auth" className="underline hover:text-yellow-200">sign in</a> to upload and process PDF files
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileInput}
                />
                <label htmlFor="file-upload">
                  <GradientButton variant="glow" type="button" className="cursor-pointer">
                    <Upload size={18} />
                    Browse Files
                  </GradientButton>
                </label>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="p-6 border-t border-white/10">
                <h3 className="font-medium text-white mb-4">Selected Files ({files.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {files.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <File size={20} className="text-electric-blue mr-3 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{file.name}</p>
                          <p className="text-xs text-white/60">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      
                      {uploading && uploadProgress[file.name] !== undefined && (
                        <div className="w-24 mr-3">
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div 
                              className="bg-electric-blue h-1.5 rounded-full" 
                              style={{ width: `${uploadProgress[file.name]}%` }}
                            />
                          </div>
                          <p className="text-xs text-white/60 text-right mt-1">
                            {uploadProgress[file.name]}%
                          </p>
                        </div>
                      )}
                      
                      {!uploading && (
                        <button 
                          onClick={() => removeFile(index)}
                          className="p-1 rounded-full hover:bg-white/10 transition-colors"
                          disabled={uploading}
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <GradientButton 
                    onClick={processFiles}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin mr-1">
                          <Upload size={18} />
                        </div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Process Files
                      </>
                    )}
                  </GradientButton>
                </div>
              </div>
            )}
          </GlassmorphicCard>
        </motion.div>
      </div>
    </section>
  );
};

export default EnhancedFileUpload;
