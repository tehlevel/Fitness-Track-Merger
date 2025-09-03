
import type { ActivityData } from '../types';

export const buildGpx = (activityData: ActivityData): string => {
  const pointsXml = activityData.trackPoints.map(p => {
    const eleXml = p.elevation !== null ? `<ele>${p.elevation.toFixed(2)}</ele>` : '';
    
    const hasExtensions = p.heartRate !== null || p.cadence !== null;
    let extensionsXml = '';
    if (hasExtensions) {
        const hrXml = p.heartRate !== null ? `<gpxtpx:hr>${p.heartRate}</gpxtpx:hr>` : '';
        const cadXml = p.cadence !== null ? `<gpxtpx:cad>${p.cadence}</gpxtpx:cad>` : '';
        extensionsXml = `
      <extensions>
        <gpxtpx:TrackPointExtension>${hrXml}${cadXml}</gpxtpx:TrackPointExtension>
      </extensions>`;
    }
    
    return `
      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}">
        ${eleXml}
        <time>${p.time}</time>${extensionsXml}
      </trkpt>`;
  }).join('');

  const now = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="Fitness Track Merger" version="1.1"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd"
  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <metadata>
    <name>${activityData.name}</name>
    <time>${now}</time>
  </metadata>
  <trk>
    <name>${activityData.name}</name>
    <trkseg>${pointsXml}
    </trkseg>
  </trk>
</gpx>`;
};
