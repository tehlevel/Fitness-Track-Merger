// Triggers a file download in the browser
export const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Calculates distance between two lat/lon points using the Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Formats seconds into a mm:ss string
export const formatPace = (secondsPerKm: number): string => {
  if (secondsPerKm === null || isNaN(secondsPerKm) || !isFinite(secondsPerKm)) {
    return 'N/A';
  }
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Parses a "mm:ss" or "ss" string into seconds
export const parsePaceToSeconds = (paceString: string): number | null => {
  if (!paceString || typeof paceString !== 'string') return null;

  const parts = paceString.split(':').map(part => parseInt(part, 10));

  if (parts.some(isNaN)) return null;

  if (parts.length === 1) {
    return parts[0]; // Just seconds
  }
  if (parts.length === 2) {
    const minutes = parts[0];
    const seconds = parts[1];
    if (minutes < 0 || seconds < 0 || seconds >= 60) return null;
    return minutes * 60 + seconds; // Minutes and seconds
  }

  return null; // Invalid format
};


// Formats seconds into an hh:mm:ss string
export const formatDuration = (totalSeconds: number): string => {
  if (isNaN(totalSeconds)) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Formats seconds into a mm:ss or hh:mm:ss string for elapsed time
export const formatTimeAxis = (totalSeconds: number): string => {
  if (isNaN(totalSeconds)) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
      return `${hours.toString()}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`;
};

// Formats a JS timestamp into a HH:mm string for chart axes
export const formatTimeOfDayAxis = (timestamp: number): string => {
  if (isNaN(timestamp)) return '';
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Smoothes an array of numerical data using a centered Simple Moving Average (SMA) algorithm.
 * @param data The array of source data (e.g., pace values). Can contain nulls.
 * @param windowSize The size of the window for smoothing. Should be an odd number.
 * @returns A new array with the smoothed data.
 */
export const simpleMovingAverage = (data: (number | null)[], windowSize: number): (number | null)[] => {
  if (!data || windowSize <= 1) {
    return data;
  }

  const smoothedData: (number | null)[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < data.length; i++) {
    const startIndex = Math.max(0, i - halfWindow);
    const endIndex = Math.min(data.length - 1, i + halfWindow);
    
    const window = data.slice(startIndex, endIndex + 1);
    const validWindowValues = window.filter((val): val is number => val !== null && isFinite(val));
    
    if (validWindowValues.length === 0) {
      smoothedData.push(data[i]); // Keep original value if no valid points in window
    } else {
      const sum = validWindowValues.reduce((acc, val) => acc + val, 0);
      smoothedData.push(sum / validWindowValues.length);
    }
  }
  
  return smoothedData;
};