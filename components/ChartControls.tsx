import React, { useState, useEffect } from 'react';
import { formatPace, parsePaceToSeconds } from '../utils/helpers';
import { SettingsIcon } from './Icons';

interface ChartControlsProps {
  metric: 'hr' | 'pace';
  min: number;
  max: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  smoothingLevel?: number;
  onSmoothingChange?: (value: number) => void;
}

const PaceInput: React.FC<{
    id: string;
    label: string;
    valueInSeconds: number;
    onChangeInSeconds: (value: number) => void;
}> = ({ id, label, valueInSeconds, onChangeInSeconds }) => {
    
    const [displayValue, setDisplayValue] = useState(() => formatPace(valueInSeconds));

    useEffect(() => {
        setDisplayValue(formatPace(valueInSeconds));
    }, [valueInSeconds]);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const newSeconds = parsePaceToSeconds(e.target.value);
        if (newSeconds !== null && !isNaN(newSeconds)) {
            if (newSeconds !== valueInSeconds) {
                onChangeInSeconds(newSeconds);
            }
        } else {
            setDisplayValue(formatPace(valueInSeconds));
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayValue(e.target.value);
    };

    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-slate-600">{label}</label>
            <input
                type="text"
                id={id}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full mt-1 px-2 py-1 bg-white border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="m:ss"
            />
        </div>
    );
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  metric,
  min,
  max,
  onMinChange,
  onMaxChange,
  smoothingLevel,
  onSmoothingChange,
}) => {
  const isHr = metric === 'hr';
  const title = isHr ? 'Heart Rate Y-Axis (bpm)' : 'Pace Y-Axis (min/km)';
  
  return (
    <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center text-sm font-semibold text-slate-700 mb-2">
         <SettingsIcon className="h-4 w-4 mr-2 text-slate-500" />
         <span>{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {isHr ? (
          <>
            <div>
              <label htmlFor={`${metric}-min`} className="block text-xs font-medium text-slate-600">Min</label>
              <input
                type="number"
                id={`${metric}-min`}
                value={min}
                onChange={(e) => onMinChange(parseInt(e.target.value, 10))}
                className="w-full mt-1 px-2 py-1 bg-white border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`${metric}-max`} className="block text-xs font-medium text-slate-600">Max</label>
              <input
                type="number"
                id={`${metric}-max`}
                value={max}
                onChange={(e) => onMaxChange(parseInt(e.target.value, 10))}
                className="w-full mt-1 px-2 py-1 bg-white border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        ) : (
          <>
             <PaceInput id="pace-min" label="Min (e.g., 9:00)" valueInSeconds={min} onChangeInSeconds={onMinChange} />
             <PaceInput id="pace-max" label="Max (e.g., 3:00)" valueInSeconds={max} onChangeInSeconds={onMaxChange} />
          </>
        )}
      </div>

      {metric === 'pace' && smoothingLevel !== undefined && onSmoothingChange && (
        <div className="mt-4 pt-4 border-t border-slate-200">
            <label htmlFor="pace-smoothing" className="block text-xs font-medium text-slate-600 mb-1">
                Smoothing Level <span className="font-normal text-slate-500">({smoothingLevel === 1 ? 'Off' : `Window of ${smoothingLevel}`})</span>
            </label>
            <input
                type="range"
                id="pace-smoothing"
                min="1"
                max="21"
                step="2" // Ensures odd numbers for a symmetrical smoothing window
                value={smoothingLevel}
                onChange={(e) => onSmoothingChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
        </div>
      )}
    </div>
  );
};