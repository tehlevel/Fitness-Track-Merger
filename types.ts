
export interface TrackPoint {
  lat: number;
  lon: number;
  elevation: number | null;
  time: string;
  heartRate: number | null;
  cadence: number | null;
  distance: number; // Cumulative distance in km
  pace: number | null; // Pace in seconds per km
}

export interface ActivityData {
  name: string;
  deviceName: string | null;
  trackPoints: TrackPoint[];
  stats: {
    totalDistance: number;
    duration: number; // in seconds
    avgHeartRate: number | null;
    avgPace: number | null; // in seconds per km
    avgCadence: number | null;
  };
}

export type DataSource = 'A' | 'B';