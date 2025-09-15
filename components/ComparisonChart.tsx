import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatPace, formatTimeOfDayAxis } from '../utils/helpers';

interface ComparisonChartProps {
  data: any[];
  metric: 'hr' | 'pace';
  labelA?: string;
  labelB?: string;
  yMin?: number;
  yMax?: number;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ data, metric, labelA = 'A', labelB = 'B', yMin, yMax }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>Upload files to see the comparison chart.</p>
      </div>
    );
  }

  const isHr = metric === 'hr';
  
  const defaultDomain: [number, number] = isHr ? [100, 200] : [180, 540]; // Default: HR 100-200, Pace 3-9 min/km
  const yDomain: [number | 'auto', number | 'auto'] = [yMin ?? defaultDomain[0], yMax ?? defaultDomain[1]];
  const yLabel = isHr ? 'Heart Rate (bpm)' : 'Pace (min/km)';
  
  const colorA = '#3b82f6'; // Blue for device A
  const colorB = '#f97316'; // Orange for device B
  const colorMerged = '#8b5cf6'; // Purple for merged
  const axisColor = '#475569'; // Neutral slate for axis

  const dataKeyA = isHr ? 'hrA' : 'paceA';
  const dataKeyB = isHr ? 'hrB' : 'paceB';
  const dataKeyMerged = isHr ? 'hrMerged' : 'paceMerged';

  const nameA = isHr ? `HR ${labelA}` : `Pace ${labelA}`;
  const nameB = isHr ? `HR ${labelB}` : `Pace ${labelB}`;
  const nameMerged = 'Merged';

  const hasMergedData = data.some(d => d.hrMerged !== null || d.paceMerged !== null);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="time"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={formatTimeOfDayAxis}
          label={{ value: 'Time of Day', position: 'insideBottom', offset: -15 }}
          stroke="#475569"
        />
        <YAxis
          yAxisId="main"
          stroke={axisColor}
          domain={yDomain}
          reversed={!isHr} // Pace is inverted (lower is better/higher on chart)
          tickFormatter={isHr ? (val) => String(Math.round(val)) : (s) => formatPace(s)}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 0, fill: axisColor }}
          allowDataOverflow={true}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (typeof value !== 'number') return ['--', name];
            if (name.toLowerCase().includes('pace')) {
              return [formatPace(value), name];
            }
            return [Math.round(value), name];
          }}
          labelFormatter={(label: number) => `Time: ${formatTimeOfDayAxis(label)}`}
        />
        <Legend wrapperStyle={{ bottom: -5 }} />
        <Line yAxisId="main" type="monotone" dataKey={dataKeyA} name={nameA} stroke={colorA} dot={false} connectNulls />
        <Line yAxisId="main" type="monotone" dataKey={dataKeyB} name={nameB} stroke={colorB} dot={false} connectNulls />
        {hasMergedData && (
          <Line yAxisId="main" type="monotone" dataKey={dataKeyMerged} name={nameMerged} stroke={colorMerged} strokeWidth={2.5} dot={false} connectNulls />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};