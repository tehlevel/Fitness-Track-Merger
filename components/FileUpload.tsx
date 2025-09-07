import React, { useCallback, useRef } from 'react';
import { UploadIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface FileUploadProps {
  id: string;
  label: string;
  onFileLoad: (content: string, fileName:string) => void;
  isLoading: boolean;
  error: string | null;
  fileName?: string;
  activityLoaded: boolean;
  customLabel: string;
  onCustomLabelChange: (label: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  id, 
  label, 
  onFileLoad, 
  isLoading, 
  error, 
  fileName,
  activityLoaded,
  customLabel,
  onCustomLabelChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onFileLoad(content, file.name);
        }
      };
      reader.readAsText(file);
    }
  }, [onFileLoad]);

  const statusIcon = () => {
    if (isLoading) {
      return (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500"></div>
      );
    }
    if (error) {
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
    }
    if (fileName) {
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    }
    return <UploadIcon className="h-6 w-6 text-slate-500" />;
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-600">{label}</label>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="flex-grow text-left px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait"
        >
          {fileName ? (
            <span className="truncate">{fileName}</span>
          ) : (
            <span className="text-slate-500">Choose a .gpx or .tcx file...</span>
          )}
        </button>
        <input
          type="file"
          id={id}
          ref={inputRef}
          onChange={handleFileChange}
          accept=".gpx,.tcx,.txt"
          className="hidden"
          disabled={isLoading}
        />
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">{statusIcon()}</div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      
      {activityLoaded && (
        <div className="mt-2">
           <label htmlFor={`${id}-label`} className="block text-xs font-medium text-slate-500 mb-1">Device / Custom Label</label>
           <input
             type="text"
             id={`${id}-label`}
             value={customLabel}
             onChange={(e) => onCustomLabelChange(e.target.value)}
             placeholder="e.g., Watch, Phone"
             className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
           />
        </div>
      )}
    </div>
  );
};