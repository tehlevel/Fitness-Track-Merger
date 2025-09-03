
import type { ActivityData, TrackPoint } from '../types';
import { calculateDistance } from '../utils/helpers';

export const parseGpx = (gpxString: string, fileName: string): Promise<ActivityData> => {
  return new Promise((resolve, reject) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(gpxString, "application/xml");

      const errorNode = xmlDoc.querySelector("parsererror");
      if (errorNode) {
          throw new Error("Failed to parse GPX file. It might be corrupted or not a valid GPX.");
      }

      const trackPoints: TrackPoint[] = [];
      const trkptElements = xmlDoc.getElementsByTagName("trkpt");
      
      if (trkptElements.length === 0) {
        throw new Error("No track points found in the GPX file.");
      }

      let cumulativeDistance = 0;
      let totalCadence = 0;
      let cadencePointsCount = 0;

      for (let i = 0; i < trkptElements.length; i++) {
        const pt = trkptElements[i];
        const lat = parseFloat(pt.getAttribute("lat") || "0");
        const lon = parseFloat(pt.getAttribute("lon") || "0");
        
        const eleNode = pt.querySelector("ele");
        const elevation = eleNode ? parseFloat(eleNode.textContent || "0") : null;

        const timeNode = pt.querySelector("time");
        const time = timeNode?.textContent || new Date().toISOString();

        const hrNode = pt.querySelector("hr") || pt.querySelector("gpxtpx\\:hr"); // Support different hr tags
        const heartRate = hrNode ? parseInt(hrNode.textContent || "0", 10) : null;
        
        const cadNode = pt.querySelector("cad") || pt.querySelector("gpxtpx\\:cad");
        const cadence = cadNode ? parseInt(cadNode.textContent || "0", 10) : null;
        if(cadence !== null) {
            totalCadence += cadence;
            cadencePointsCount++;
        }

        let pace = null;
        if (i > 0) {
          const prevPt = trackPoints[i-1];
          const dist = calculateDistance(prevPt.lat, prevPt.lon, lat, lon);
          cumulativeDistance += dist;
          
          const timeDiff = (new Date(time).getTime() - new Date(prevPt.time).getTime()) / 1000; // in seconds
          if (dist > 0 && timeDiff > 0) {
            pace = timeDiff / dist; // seconds per km
          }
        }
        
        trackPoints.push({ lat, lon, elevation, time, heartRate, distance: cumulativeDistance, pace, cadence });
      }

      // Calculate stats
      const totalDistance = cumulativeDistance;
      const duration = trackPoints.length > 0 ? (new Date(trackPoints[trackPoints.length-1].time).getTime() - new Date(trackPoints[0].time).getTime()) / 1000 : 0;
      const hrPoints = trackPoints.map(p => p.heartRate).filter((hr): hr is number => hr !== null);
      const avgHeartRate = hrPoints.length > 0 ? hrPoints.reduce((a,b) => a+b, 0) / hrPoints.length : null;
      const avgPace = totalDistance > 0 && duration > 0 ? duration / totalDistance : null;
      const avgCadence = cadencePointsCount > 0 ? totalCadence / cadencePointsCount : null;

      const activityNameNode = xmlDoc.querySelector("metadata > name") || xmlDoc.querySelector("trk > name");
      const name = activityNameNode?.textContent || fileName;
      
      resolve({
        name,
        trackPoints,
        stats: { totalDistance, duration, avgHeartRate, avgPace, avgCadence }
      });

    } catch (e) {
      reject(e);
    }
  });
};
