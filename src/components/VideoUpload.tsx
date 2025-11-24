"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Film, AlertCircle, FileVideo } from 'lucide-react';

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

    // Enforce allowed extensions
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const allowedExts = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    if (!allowedExts.includes(ext)) {
      setError('Unsupported format. Allowed: MP4, AVI, MOV, WMV, FLV, WebM, MKV');
      return;
    }

    // Validate file size (max 200MB)
    if (file.size > 200 * 1024 * 1024) {
      setError('File size must be less than 200MB');
      return;
    }

    setError('');
    onVideoUpload(file);
  }, [onVideoUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    },
    multiple: false,
    maxSize: 200 * 1024 * 1024 // 200MB
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
          ${isDragActive
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
            : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50'
          }
          ${isDragReject ? 'border-red-500 bg-red-500/10' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="p-16 text-center relative z-10">
          <div className={`
            w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragActive ? 'bg-blue-500 text-white scale-110 rotate-3' : 'bg-slate-800 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20'}
          `}>
            {isDragActive ? (
              <Upload className="w-10 h-10 animate-bounce" />
            ) : (
              <Film className="w-10 h-10" />
            )}
          </div>

          <h3 className={`text-2xl font-bold mb-3 transition-colors ${isDragActive ? 'text-blue-400' : 'text-white'}`}>
            {isDragActive ? 'Drop video to upload' : 'Upload Video for Analysis'}
          </h3>

          <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
            Drag and drop your video file here, or click to browse.
            <br />
            <span className="text-sm opacity-75">Supports MP4, AVI, MOV, WMV, WebM</span>
          </p>

          <button className={`
            btn btn-primary px-8 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20
            ${isDragActive ? 'pointer-events-none opacity-50' : 'group-hover:scale-105'}
          `}>
            Select Video File
          </button>
        </div>

        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-400 font-medium">{error}</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-slate-500">
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
          <FileVideo className="w-4 h-4 mx-auto mb-2 text-slate-400" />
          <span>Max file size: 200MB</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
          <Film className="w-4 h-4 mx-auto mb-2 text-slate-400" />
          <span>HD/4K Supported</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
          <Upload className="w-4 h-4 mx-auto mb-2 text-slate-400" />
          <span>Secure Processing</span>
        </div>
      </div>
    </div>
  );
}