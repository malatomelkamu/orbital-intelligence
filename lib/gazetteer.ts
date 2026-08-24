export type CelestialBody = 'Sun' | 'Mercury' | 'Venus' | 'Earth' | 'Moon' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune'

export type GazetteerPin = { id: string; body: CelestialBody; name: string; lat: number; lon: number; mission: string; fact: string }

export const gazetteer: GazetteerPin[] = [
  { id: 'apollo-11', body: 'Moon', name: 'Apollo 11', lat: 0.6741, lon: 23.4729, mission: 'FIRST LANDING', fact: 'The first crewed landing site, where Tranquility Base became humanity’s first foothold on another world.' },
  { id: 'apollo-12', body: 'Moon', name: 'Apollo 12', lat: -3.0128, lon: -23.4216, mission: 'PRECISION LANDING', fact: 'Apollo 12 landed near Surveyor 3 and demonstrated pinpoint lunar navigation.' },
  { id: 'apollo-14', body: 'Moon', name: 'Apollo 14', lat: -3.6454, lon: -17.4719, mission: 'FRA MAURO', fact: 'The Fra Mauro expedition collected ancient ejecta from the Imbrium impact basin.' },
  { id: 'apollo-15', body: 'Moon', name: 'Apollo 15', lat: 26.1322, lon: 3.6339, mission: 'HADLEY–APENNINE', fact: 'The first mission to use a lunar rover, exploring the Hadley Rille and Apennine mountains.' },
  { id: 'apollo-16', body: 'Moon', name: 'Apollo 16', lat: -8.9734, lon: 15.5007, mission: 'DESCARTES HIGHLANDS', fact: 'Apollo 16 sampled highlands terrain and deployed a surface heat-flow experiment.' },
  { id: 'apollo-17', body: 'Moon', name: 'Apollo 17', lat: 20.1908, lon: 30.7717, mission: 'TAURUS–LITTROW', fact: 'The final Apollo landing returned the famous orange soil and the oldest rocks from the Moon.' },
  { id: 'artemis-zone-1', body: 'Moon', name: 'Artemis Zone 1', lat: -89.5, lon: 0, mission: 'SOUTH POLE', fact: 'A candidate science zone near permanently shadowed craters that may preserve accessible water ice.' },
  { id: 'change-6', body: 'Moon', name: "Chang'e 6", lat: -41.638, lon: 206.014, mission: 'FAR SIDE SAMPLE', fact: 'The first mission to return samples from the lunar far side, landing in the South Pole–Aitken basin.' },
  { id: 'tycho', body: 'Moon', name: 'Tycho Crater', lat: -43.31, lon: -11.36, mission: 'IMPACT FEATURE', fact: 'A young, ray-bright crater whose central peak rises roughly 1.6 kilometres above the floor.' },
  { id: 'olympus-mons', body: 'Mars', name: 'Olympus Mons', lat: 18.65, lon: 226.2, mission: 'VOLCANIC GIANT', fact: 'The tallest known volcano in the Solar System, rising about 22 kilometres above the datum.' },
  { id: 'jezero', body: 'Mars', name: 'Jezero Crater', lat: 18.44, lon: 77.45, mission: 'PERSEVERANCE', fact: 'An ancient river delta where Perseverance searches for biosignatures and caches rock cores.' },
  { id: 'gale', body: 'Mars', name: 'Gale Crater', lat: -5.4, lon: 137.8, mission: 'CURIOSITY', fact: 'Curiosity has climbed Mount Sharp inside Gale Crater, reading Mars’ changing climate history.' },
  { id: 'kennedy', body: 'Earth', name: 'Kennedy Space Center', lat: 28.5729, lon: -80.649, mission: 'SPACEPORT', fact: 'NASA’s historic Florida launch complex, supporting Apollo, Shuttle, and modern Artemis missions.' },
  { id: 'kourou', body: 'Earth', name: 'Guiana Space Centre', lat: 5.236, lon: -52.768, mission: 'SPACEPORT', fact: 'Europe’s equatorial gateway to orbit, operated from French Guiana on the Atlantic coast.' },
  { id: 'baikonur', body: 'Earth', name: 'Baikonur Cosmodrome', lat: 45.965, lon: 63.305, mission: 'SPACEPORT', fact: 'The world’s first spaceport and launch site for Sputnik, Vostok, and countless orbital missions.' },
]

export function latLonToVector3(lat: number, lon: number, radius = 1.55) {
  const phi = (90 - lat) * Math.PI / 180
  const theta = (lon + 180) * Math.PI / 180
  return { x: -(radius * Math.sin(phi) * Math.cos(theta)), y: radius * Math.cos(phi), z: radius * Math.sin(phi) * Math.sin(theta) }
}

export const bodyPins = (body: CelestialBody) => gazetteer.filter((pin) => pin.body === body)
