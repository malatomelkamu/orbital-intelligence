import * as satellite from 'satellite.js'

type InputRecord = { noradId: number; name: string; line1: string; line2: string; type: 'active' | 'debris' | 'station' }
type WorkerMessage = { type: 'init'; satellites: InputRecord[] } | { type: 'tick'; timestamp: number }
type OutputPoint = { noradId: number; lat: number; lon: number; alt: number; x: number; y: number; z: number }
let records: Array<InputRecord & { satrec: satellite.SatRec }> = []

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  if (event.data.type === 'init') {
    records = event.data.satellites.map((item) => ({ ...item, satrec: satellite.twoline2satrec(item.line1, item.line2) }))
    self.postMessage({ type: 'ready', count: records.length })
    return
  }
  if (event.data.type === 'tick') {
    const date = new Date(event.data.timestamp)
    const gmst = satellite.gstime(date)
    const points: OutputPoint[] = []
    for (const item of records) {
      const position = satellite.propagate(item.satrec, date).position
      if (!position || typeof position === 'boolean') continue
      const geodetic = satellite.eciToGeodetic(position, gmst)
      const lat = satellite.degreesLat(geodetic.latitude)
      const lon = satellite.degreesLong(geodetic.longitude)
      points.push({ noradId: item.noradId, lat, lon, alt: geodetic.height, x: position.x, y: position.y, z: position.z })
    }
    self.postMessage({ type: 'positions', timestamp: event.data.timestamp, points })
  }
}
