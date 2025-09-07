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