
import React from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';

interface UploadStatusProps {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  onTryAgain: () => void;
}

const UploadStatus: React.FC<UploadStatusProps> = ({ status, progress, onTryAgain }) => {
  if (status === 'idle') return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {status === 'uploading' && (
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-3">
            <Upload className="w-8 h-8 text-electric-blue animate-pulse" />
          </div>
          <h3 className="text-xl font-medium mb-3">Uploading files...</h3>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div 
              className="bg-electric-blue h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <p className="text-sm text-light-gray/60">{progress}% complete</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-3 mx-auto">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Upload Complete!</h3>
          <p className="text-light-gray/60">Your files have been successfully uploaded</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-3 mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Upload Failed</h3>
          <p className="text-light-gray/60">Something went wrong. Please try again.</p>
          <button 
            className="mt-4 px-4 py-2 text-sm text-white bg-muted rounded-md hover:bg-muted/80 transition-colors"
            onClick={onTryAgain}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadStatus;
