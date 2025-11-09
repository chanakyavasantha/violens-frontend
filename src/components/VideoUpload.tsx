"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Film, AlertCircle } from 'lucide-react';

interface VideoUploadProps {
  onVideoUpload: (file: File) => void;
}

export default function VideoUpload({ onVideoUpload }: VideoUploadProps) {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file');
      return;
    }
    
    // Enforce allowed extensions (including .avi)
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const allowedExts = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
    if (!allowedExts.includes(ext)) {
      setError('Unsupported format. Allowed: MP4, AVI, MOV, WMV, FLV, WebM');
      return;
    }
    
    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return;
    }
    
    // Do NOT block upload if the browser can’t preview the format.
    setError('');
    onVideoUpload(file);
  }, [onVideoUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          upload-area p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'drag-over' : ''}
          ${isDragReject ? 'border-red-500 bg-red-500/10' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-6">
          {isDragActive ? (
            <>
              <Upload className="w-16 h-16 mx-auto text-orange-400 animate-bounce" />
              <div>
                <h3 className="text-2xl font-semibold text-orange-400 mb-2">
                  Drop your video here
                </h3>
                <p className="text-slate-300">
                  Release to upload your video file
                </p>
              </div>
            </>
          ) : (
            <>
              <Film className="w-16 h-16 mx-auto text-blue-400" />
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Upload Your Video
                </h3>
                <p className="text-slate-300 mb-4">
                  Drag and drop your video file here, or click to browse
                </p>
                <button className="btn-primary">
                  Choose Video File
                </button>
              </div>
            </>
          )}
          
          <div className="text-sm text-slate-400 space-y-1">
            <p>Supported for analysis: MP4, AVI, MOV, WMV, FLV, WebM</p>
            <p>Browser preview works best with MP4/WebM/MOV.</p>
            <p>Maximum file size: 100MB</p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
}