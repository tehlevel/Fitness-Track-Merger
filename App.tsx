import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { MergeControls } from './components/MergeControls';
import { ComparisonChart } from './components/ComparisonChart';
import { ActivitySummary } from './components/ActivitySummary';
import { ChartControls } from './components/ChartControls';
import { parseGpx } from './services/gpxParser';
import { parseTcx } from './services/tcxParser';
import { buildGpx } from './services/gpxBuilder';
import { downloadFile } from './utils/helpers';
import type { ActivityData, DataSource, TrackPoint } from './types';

const App: React.FC = () => {
  const [activityA, setActivityA] = useState<ActivityData | null>(null);
  const [activityB, setActivityB] = useState<ActivityData | null>(null);
  const [isLoading, setIsLoading] = useState<{ a: boolean; b: boolean }>({ a: false, b: false });
  const [error, setError] = useState<{ a: string | null; b: string | null }>({ a: null, b: null });

  const [customLabelA, setCustomLabelA] = useState<string>('');
  const [customLabelB, setCustomLabelB] = useState<string>('');

  const [baseSource, setBaseSource] = useState<DataSource>('A');
  const [hrSource, setHrSource] = useState<DataSource>('A');
  
  // State for chart Y-axis ranges
  const [hrRange, setHrRange] = useState({ min: 100, max: 200 });
  // For pace, UI Min is slower (e.g., 9:00) and UI Max is faster (e.g., 3:00),
  // which is inverted for the chart's domain.
  const [paceUiRange, setPaceUiRange] = useState({ uiMin: 540, uiMax: 180 });

  const handleFileLoad = useCallback(async (fileContent: string, fileName: string, type: DataSource) => {
    setIsLoading(prev => ({ ...prev, [type.toLowerCase()]: true }));
    setError(prev => ({ ...prev, [type.toLowerCase()]: null }));
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(fileContent, "application/xml");

      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Invalid XML file.");
      }

      let parsedData;
      if (xmlDoc.getElementsByTagName("TrainingCenterDatabase").length > 0) {
        parsedData = await parseTcx(fileContent, fileName);
      } else if (xmlDoc.getElementsByTagName("gpx").length > 0) {
        parsedData = await parseGpx(fileContent, fileName);
      } else {
        throw new Error("Unsupported file. Please upload a GPX or TCX file.");
      }
      
      if (type === 'A') {
        setActivityA(parsedData);
        setCustomLabelA(parsedData.deviceName || '');
      } else {
        setActivityB(parsedData);
        setCustomLabelB(parsedData.deviceName || '');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during parsing.';
      setError(prev => ({ ...prev, [type.toLowerCase()]: errorMessage }));
      if (type === 'A') {
        setActivityA(null);
        setCustomLabelA('');
      } else {
        setActivityB(null);
        setCustomLabelB('');
      }
    } finally {
      setIsLoading(prev => ({ ...prev, [type.toLowerCase()]: false }));
    }
  }, []);

  const handleMerge = useCallback(() => {
    const baseActivity = baseSource === 'A' ? activityA : activityB;
    const hrActivity = hrSource === 'A' ? activityA : activityB;

    if (!baseActivity || !hrActivity) {
      alert("Please ensure both files are loaded and sources are selected.");
      return;
    }

    const hrPointsMap = new Map<string, TrackPoint>();
    hrActivity.trackPoints.forEach(p => hrPointsMap.set(p.time, p));

    const mergedTrackPoints: TrackPoint[] = baseActivity.trackPoints.map(p => {
      const hrPoint = hrPointsMap.get(p.time);
      return {
        ...p,
        heartRate: hrPoint ? hrPoint.heartRate : p.heartRate, // Fallback to original HR if no match
      };
    });
    
    const hrPoints = mergedTrackPoints.map(p => p.heartRate).filter((hr): hr is number => hr !== null);
    const avgHeartRate = hrPoints.length > 0 ? hrPoints.reduce((a, b) => a + b, 0) / hrPoints.length : null;

    const mergedActivity: ActivityData = {
      ...baseActivity,
      name: `${baseActivity.name} (Merged)`,
      trackPoints: mergedTrackPoints,
      stats: {
        ...baseActivity.stats,
        avgHeartRate,
      }
    };

    const gpxString = buildGpx(mergedActivity);
    downloadFile(gpxString, `merged_activity.gpx`, 'application/gpx+xml');
  }, [activityA, activityB, baseSource, hrSource]);

  const chartData = useMemo(() => {
    if (!activityA && !activityB) return [];

    const pointsA = activityA?.trackPoints || [];
    const pointsB = activityB?.trackPoints || [];

    if (pointsA.length === 0 && pointsB.length === 0) return [];

    const startTimeA = pointsA.length > 0 ? new Date(pointsA[0].time).getTime() : Infinity;
    const startTimeB = pointsB.length > 0 ? new Date(pointsB[0].time).getTime() : Infinity;
    const globalStartTime = Math.min(startTimeA, startTimeB);
    
    if (globalStartTime === Infinity) return [];
    
    type CombinedPoint = {
        time: number; // JavaScript timestamp
        hrA: number | null;
        hrB: number | null;
        paceA: number | null;
        paceB: number | null;
    };
    const combinedPoints: CombinedPoint[] = [];

    const transformPoints = (points: TrackPoint[]) => {
        const map = new Map<number, { heartRate: number | null; pace: number | null }>();
        points.forEach(p => {
            const elapsedTime = Math.round((new Date(p.time).getTime() - globalStartTime) / 1000);
            map.set(elapsedTime, { heartRate: p.heartRate, pace: p.pace });
        });
        return map;
    };
    
    const mapA = transformPoints(pointsA);
    const mapB = transformPoints(pointsB);

    const endTimeA = pointsA.length > 0 ? (new Date(pointsA[pointsA.length-1].time).getTime() - globalStartTime) / 1000 : 0;
    const endTimeB = pointsB.length > 0 ? (new Date(pointsB[pointsB.length-1].time).getTime() - globalStartTime) / 1000 : 0;
    const maxTime = Math.ceil(Math.max(endTimeA, endTimeB));
    
    for (let t = 0; t <= maxTime; t++) {
        const pA = mapA.get(t);
        const pB = mapB.get(t);
        combinedPoints.push({
            time: globalStartTime + t * 1000,
            hrA: pA?.heartRate ?? null,
            hrB: pB?.heartRate ?? null,
            paceA: pA?.pace ?? null,
            paceB: pB?.pace ?? null,
        });
    }

    return combinedPoints;
  }, [activityA, activityB]);

  const mergeLabelA = `File A${customLabelA ? ` (${customLabelA})` : ''}`;
  const mergeLabelB = `File B${customLabelB ? ` (${customLabelB})` : ''}`;
  const chartLabelA = customLabelA || 'A';
  const chartLabelB = customLabelB || 'B';


  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
              <h2 className="text-xl font-bold text-slate-700 border-b pb-2">1. Upload Files</h2>
              <FileUpload
                id="file-a"
                label="File A"
                onFileLoad={(content, name) => handleFileLoad(content, name, 'A')}
                isLoading={isLoading.a}
                error={error.a}
                fileName={activityA?.name}
                activityLoaded={!!activityA}
                customLabel={customLabelA}
                onCustomLabelChange={setCustomLabelA}
              />
              <FileUpload
                id="file-b"
                label="File B"
                onFileLoad={(content, name) => handleFileLoad(content, name, 'B')}
                isLoading={isLoading.b}
                error={error.b}
                fileName={activityB?.name}
                activityLoaded={!!activityB}
                customLabel={customLabelB}
                onCustomLabelChange={setCustomLabelB}
              />
            </div>

            {activityA && activityB && (
              <MergeControls
                baseSource={baseSource}
                hrSource={hrSource}
                onBaseSourceChange={setBaseSource}
                onHrSourceChange={setHrSource}
                onMerge={handleMerge}
                fileAName={mergeLabelA}
                fileBName={mergeLabelB}
              />
            )}
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-700 mb-4">3. Compare & Verify</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {activityA ? (
                        <ActivitySummary activity={activityA} label={mergeLabelA} />
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center h-full text-slate-500">File A not loaded.</div>
                    )}
                    {activityB ? (
                        <ActivitySummary activity={activityB} label={mergeLabelB} />
                     ) : (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center h-full text-slate-500">File B not loaded.</div>
                    )}
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">Heart Rate Comparison</h3>
                    <ChartControls
                      metric="hr"
                      min={hrRange.min}
                      max={hrRange.max}
                      onMinChange={(newMin) => !isNaN(newMin) && setHrRange(prev => ({ ...prev, min: newMin }))}
                      onMaxChange={(newMax) => !isNaN(newMax) && setHrRange(prev => ({ ...prev, max: newMax }))}
                    />
                    <div className="h-64">
                      <ComparisonChart data={chartData} metric="hr" labelA={chartLabelA} labelB={chartLabelB} yMin={hrRange.min} yMax={hrRange.max} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">Pace Comparison</h3>
                    <ChartControls
                      metric="pace"
                      min={paceUiRange.uiMin}
                      max={paceUiRange.uiMax}
                      onMinChange={(newMin) => setPaceUiRange(prev => ({ ...prev, uiMin: newMin }))}
                      onMaxChange={(newMax) => setPaceUiRange(prev => ({ ...prev, uiMax: newMax }))}
                    />
                    <div className="h-64">
                      <ComparisonChart 
                        data={chartData} 
                        metric="pace" 
                        labelA={chartLabelA} 
                        labelB={chartLabelB} 
                        yMin={paceUiRange.uiMax} // Pass smaller value (faster pace) as yMin
                        yMax={paceUiRange.uiMin} // Pass larger value (slower pace) as yMax
                      />
                    </div>
                  </div>
                </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;