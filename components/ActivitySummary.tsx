
import React from 'react';
import type { ActivityData } from '../types';
import { formatPace, formatDuration } from '../utils/helpers';
import { RunIcon, HeartIcon, ClockIcon, GaugeIcon, CadenceIcon } from './Icons';

interface ActivitySummaryProps {
  activity: ActivityData;
  label: string;
}

export const ActivitySummary: React.FC<ActivitySummaryProps> = ({ activity, label }) => {
  const { totalDistance, duration, avgHeartRate, avgPace, avgCadence } = activity.stats;

  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="text-md font-bold text-slate-700">{label}</h3>
        <p className="text-sm text-slate-500 truncate mb-4" title={activity.name}>{activity.name}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="flex items-center">
                <RunIcon className="h-5 w-5 text-slate-500 mr-2" />
                <div>
                    <div className="font-semibold">{totalDistance.toFixed(2)} km</div>
                    <div className="text-xs text-slate-500">Distance</div>
                </div>
            </div>
             <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-slate-500 mr-2" />
                <div>
                    <div className="font-semibold">{formatDuration(duration)}</div>
                    <div className="text-xs text-slate-500">Duration</div>
                </div>
            </div>
             <div className="flex items-center">
                <HeartIcon className="h-5 w-5 text-slate-500 mr-2" />
                <div>
                    <div className="font-semibold">{avgHeartRate ? `${Math.round(avgHeartRate)} bpm` : 'N/A'}</div>
                    <div className="text-xs text-slate-500">Avg HR</div>
                </div>
            </div>
             <div className="flex items-center">
                <GaugeIcon className="h-5 w-5 text-slate-500 mr-2" />
                <div>
                    <div className="font-semibold">{avgPace ? `${formatPace(avgPace)} /km` : 'N/A'}</div>
                    <div className="text-xs text-slate-500">Avg Pace</div>
                </div>
            </div>
            <div className="flex items-center">
                <CadenceIcon className="h-5 w-5 text-slate-500 mr-2" />
                <div>
                    <div className="font-semibold">{avgCadence ? `${Math.round(avgCadence)} spm` : 'N/A'}</div>
                    <div className="text-xs text-slate-500">Avg Cadence</div>
                </div>
            </div>
        </div>
    </div>
  );
};
