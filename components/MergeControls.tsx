import React from 'react';
import type { DataSource } from '../types';
import { DownloadIcon } from './Icons';

interface MergeControlsProps {
  baseSource: DataSource;
  hrSource: DataSource;
  onBaseSourceChange: (source: DataSource) => void;
  onHrSourceChange: (source: DataSource) => void;
  onMerge: () => void;
  fileAName: string;
  fileBName: string;
}

const RadioOption: React.FC<{
    name: string;
    value: DataSource;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
}> = ({ name, value, checked, onChange, label }) => (
    <label className="flex items-center p-3 bg-slate-50 rounded-lg border has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 cursor-pointer transition-colors">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
        <span className="ml-3 text-sm font-medium text-slate-800 truncate" title={label}>{label}</span>
    </label>
);

export const MergeControls: React.FC<MergeControlsProps> = ({
  baseSource,
  hrSource,
  onBaseSourceChange,
  onHrSourceChange,
  onMerge,
  fileAName,
  fileBName
}) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-xl font-bold text-slate-700 border-b pb-2">2. Configure Merge</h2>
      
      <fieldset className="space-y-2">
        <legend className="text-md font-semibold text-slate-700">Track & Time Source</legend>
        <p className="text-sm text-slate-500">The base for coordinates, elevation, and time.</p>
        <div className="grid grid-cols-2 gap-4 pt-2">
           <RadioOption name="baseSource" value="A" checked={baseSource === 'A'} onChange={(e) => onBaseSourceChange(e.target.value as DataSource)} label={fileAName} />
           <RadioOption name="baseSource" value="B" checked={baseSource === 'B'} onChange={(e) => onBaseSourceChange(e.target.value as DataSource)} label={fileBName} />
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-md font-semibold text-slate-700">Heart Rate Source</legend>
        <p className="text-sm text-slate-500">The data to use for heart rate.</p>
        <div className="grid grid-cols-2 gap-4 pt-2">
            <RadioOption name="hrSource" value="A" checked={hrSource === 'A'} onChange={(e) => onHrSourceChange(e.target.value as DataSource)} label={fileAName} />
            <RadioOption name="hrSource" value="B" checked={hrSource === 'B'} onChange={(e) => onHrSourceChange(e.target.value as DataSource)} label={fileBName} />
        </div>
      </fieldset>

      <div>
        <button
          onClick={onMerge}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <DownloadIcon className="h-5 w-5 mr-2" />
          Create and Download Merged File
        </button>
      </div>
    </div>
  );
};