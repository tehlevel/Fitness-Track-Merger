
import type { ActivityData, TrackPoint } from '../types';
import { calculateDistance } from '../utils/helpers';

export const parseTcx = (tcxString: string, fileName: string): Promise<ActivityData> => {
  return new Promise((resolve, reject) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(tcxString, "application/xml");

      const errorNode = xmlDoc.querySelector("parsererror");
      if (errorNode) {
          throw new Error("Failed to parse TCX file. It might be corrupted or not a valid TCX.");
      }

      const creatorNode = xmlDoc.querySelector("Creator > Name, Author > Name");
      const deviceName = creatorNode?.textContent || null;
      
      const trackPoints: TrackPoint[] = [];
      const tpElements = xmlDoc.getElementsByTagName("Trackpoint");

      if (tpElements.length === 0) {
        throw new Error("No track points found in the TCX file.");
      }

      let cumulativeDistance = 0;
      let totalCadence = 0;
      let cadencePointsCount = 0;

      for (let i = 0; i < tpElements.length; i++) {
        const pt = tpElements[i];

        const timeNode = pt.querySelector("Time");
        const time = timeNode?.textContent || new Date().toISOString();

        const latNode = pt.querySelector("LatitudeDegrees");
        const lonNode = pt.querySelector("LongitudeDegrees");
        if (!latNode || !lonNode) continue; 
        
        const lat = parseFloat(latNode.textContent || "0");
        const lon = parseFloat(lonNode.textContent || "0");

        const eleNode = pt.querySelector("AltitudeMeters");
        const elevation = eleNode ? parseFloat(eleNode.textContent || "0") : null;

        const hrNode = pt.querySelector("HeartRateBpm > Value");
        const heartRate = hrNode ? parseInt(hrNode.textContent || "0", 10) : null;
        
        const cadenceNode = pt.querySelector("Cadence");
        const cadence = cadenceNode ? parseInt(cadenceNode.textContent || "0", 10) : null;
        
        if(cadence !== null) {
            // TCX run cadence is often steps per minute, but can sometimes be revolutions (one leg).
            // Values around 90 are likely one-leg, values > 150 are likely two-leg.
            // We'll assume the provided value is per minute for one leg and double it for SPM.
            const spm = cadence > 100 ? cadence : cadence * 2;
            totalCadence += spm;
            cadencePointsCount++;
            trackPoints.push({ lat, lon, elevation, time, heartRate, distance: cumulativeDistance, pace: null, cadence: spm });
        } else {
             trackPoints.push({ lat, lon, elevation, time, heartRate, distance: cumulativeDistance, pace: null, cadence: null });
        }
        
        const currentPoint = trackPoints[trackPoints.length - 1];
        let pace = null;
        const distNode = pt.querySelector("DistanceMeters");
        
        if (distNode) {
             const newCumulativeDistance = parseFloat(distNode.textContent || "0") / 1000;
             if (i > 0) {
                 const prevPt = trackPoints[i-1];
                 const dist = newCumulativeDistance - prevPt.distance;
                 const timeDiff = (new Date(currentPoint.time).getTime() - new Date(prevPt.time).getTime()) / 1000;
                 if (dist > 0 && timeDiff > 0) {
                     pace = timeDiff / dist;
                 }
             }
             currentPoint.distance = newCumulativeDistance;
             currentPoint.pace = pace;
             cumulativeDistance = newCumulativeDistance;

        } else if (i > 0) {
            const prevPt = trackPoints[i-1];
            const dist = calculateDistance(prevPt.lat, prevPt.lon, currentPoint.lat, currentPoint.lon);
            cumulativeDistance += dist;
            currentPoint.distance = cumulativeDistance;
            const timeDiff = (new Date(currentPoint.time).getTime() - new Date(prevPt.time).getTime()) / 1000;
            if (dist > 0 && timeDiff > 0) {
                currentPoint.pace = timeDiff / dist;
            }
        }
      }

      const totalDistance = cumulativeDistance;
      const duration = trackPoints.length > 0 ? (new Date(trackPoints[trackPoints.length-1].time).getTime() - new Date(trackPoints[0].time).getTime()) / 1000 : 0;
      const hrPoints = trackPoints.map(p => p.heartRate).filter((hr): hr is number => hr !== null);
      const avgHeartRate = hrPoints.length > 0 ? hrPoints.reduce((a,b) => a+b, 0) / hrPoints.length : null;
      const avgPace = totalDistance > 0 && duration > 0 ? duration / totalDistance : null;
      const avgCadence = cadencePointsCount > 0 ? totalCadence / cadencePointsCount : null;

      const activityNode = xmlDoc.querySelector("Activity");
      const name = activityNode?.getAttribute("Sport") || fileName;
      
      resolve({
        name,
        deviceName,
        trackPoints,
        stats: { totalDistance, duration, avgHeartRate, avgPace, avgCadence }
      });

    } catch (e) {
      reject(e);
    }
  });
};