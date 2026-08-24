'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { CelestialBody } from '@/lib/gazetteer'

const CelestialViewport = dynamic(() => import('@/components/celestial-viewport'), { ssr: false })
import {
  Activity, ChevronDown, CircleDot, Crosshair, Database, Gauge, Globe2,
  Layers3, LockKeyhole, Menu, Pause, Play, Radio, Satellite, Search,
  Settings2, Target, UserRound, Waves, X, Zap, CloudSun,
} from 'lucide-react'

const bodies = ['Sun', 'Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']
const menuGroups = [
  ['CELESTIAL WORLDS', 'Sun', 'Mercury', 'Venus', 'Earth Orbit', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
  ['LIVE TRACKERS', 'Starlink', 'ISS', 'Tiangong', 'JWST / Hubble', 'GNSS', 'Active Payloads'],
  ['SPACE INTEL & SSA', 'Space Debris Cloud', 'Conjunction Warnings', 'Re-entry Forecast', 'Maneuvers', 'Space Weather'],
  ['OBSERVATION', "Tonight's Visible Passes", 'Lunar / Solar Transits', 'Optical Sunlit Filter', 'Radio Frequencies'],
  ['VEHICLES & DATA', 'Launch Schedule', 'Rockets', 'Spaceports', 'Surface Gazetteer', 'Academy'],
]

type SatelliteTelemetry = { noradId: number; name: string; alt: number; lat: number; lon: number }

function OrbitMap({ activeBody, onSatelliteSelect }: { activeBody: string; onSatelliteSelect: (satellite: SatelliteTelemetry) => void }) {
  return <CelestialViewport body={activeBody as CelestialBody} onSatelliteSelect={onSatelliteSelect} />
}

function Telemetry({ activeBody, satellite }: { activeBody: string; satellite: SatelliteTelemetry | null }) {
  const rows = [['ALTITUDE', satellite ? satellite.alt.toFixed(1) : activeBody === 'Earth' ? '408.2' : '1,284.6', 'KM'], ['VELOCITY', satellite ? '7.66' : '7.66', 'KM/S'], ['ORBITAL PERIOD', '92.68', 'MIN'], ['SUB-POINT LAT', satellite ? `${Math.abs(satellite.lat).toFixed(2)}°` : '28° 32\' 14.2"', satellite?.lat && satellite.lat < 0 ? 'S' : 'N'], ['SUB-POINT LON', satellite ? `${Math.abs(satellite.lon).toFixed(2)}°` : '−80° 39\' 11.0"', satellite?.lon && satellite.lon > 0 ? 'E' : 'W']]
  return <aside className="panel telemetry"><div className="panel-heading"><span><Target size={14} /> TARGET TELEMETRY</span><span className="status-dot">● LIVE</span></div><div className="target-name"><span className="planet-mini" />{activeBody.toUpperCase()} <small>O-408</small></div><div className="telemetry-rows">{rows.map(([label, value, unit]) => <div className="telemetry-row" key={label}><span>{label}</span><strong>{value} <small>{unit}</small></strong></div>)}</div><div className="signal"><div className="signal-head"><span>LINK QUALITY</span><b>98.7%</b></div><div className="signal-bars">{Array.from({ length: 18 }, (_, i) => <i key={i} className={i < 16 ? 'on' : ''} />)}</div></div><button className="ride-button"><Radio size={15} /> RIDE ALONG <span>↗</span></button></aside>
}

function LayersPanel() {
  const [layers, setLayers] = useState(['Live Orbiters', 'Sun / Terminator'])
  const options = [['Landing Sites', MapPinIcon], ['Craters', CircleDot], ['Live Orbiters', Satellite], ['Sun / Terminator', Zap], ['Surface Temperature', Waves]] as const
  return <aside className="panel layers"><div className="panel-heading"><span><Layers3 size={14} /> MAP LAYERS</span><Settings2 size={15} /></div><div className="layer-list">{options.map(([name, Icon]) => <button key={name} className={`layer-row ${layers.includes(name) ? 'selected' : ''}`} onClick={() => setLayers((current) => current.includes(name) ? current.filter(x => x !== name) : [...current, name])}><span className="layer-icon"><Icon size={14} /></span><span>{name}</span><i className="toggle" /></button>)}</div><div className="layer-footer"><span><Database size={13} /> 14,284 OBJECTS</span><span>SYNCED</span></div></aside>
}
function MapPinIcon({ size }: { size?: number }) { return <span style={{ fontSize: size ? size * .8 : 12 }}>⌖</span> }

type SpaceWeatherData = { kp: number; solarWindSpeed: number; solarFlux: number; level: 'quiet' | 'unsettled' | 'storm'; dragImpact: 'LOW' | 'ELEVATED' | 'HIGH' }

function SpaceWeather() {
  const [weather, setWeather] = useState<SpaceWeatherData | null>(null)
  useEffect(() => { let active = true; fetch('/api/space-weather').then((response) => response.ok ? response.json() : null).then((data) => { if (active) setWeather(data) }).catch(() => undefined); return () => { active = false } }, [])
  const kp = weather?.kp ?? 0
  const danger = weather?.level === 'storm' ? 'storm' : weather?.level === 'unsettled' ? 'unsettled' : 'quiet'
  return <aside className={`weather-widget ${danger}`} aria-label="Live space weather">
    <div className="panel-heading"><span><CloudSun size={14} /> SPACE WEATHER</span><span className="status-dot">● NOAA</span></div>
    <div className="weather-kp"><div><span className="eyebrow">PLANETARY KP INDEX</span><strong>{weather ? kp.toFixed(1) : '—'}</strong></div><b>{danger === 'storm' ? 'STORM' : danger === 'unsettled' ? 'UNSETTLED' : 'QUIET'}</b></div>
    <div className="weather-stats"><span>SOLAR WIND <b>{weather?.solarWindSpeed ?? '—'} <small>KM/S</small></b></span><span>SOLAR FLUX <b>{weather?.solarFlux ?? '—'} <small>SFU</small></b></span></div>
    <div className="drag-impact"><span>ATMOSPHERIC DRAG IMPACT</span><b>{weather?.dragImpact ?? '—'}</b></div>
  </aside>
}

export default function Page() {
  const [activeBody, setActiveBody] = useState('Earth')
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteTelemetry | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState('1x')
  const [live, setLive] = useState(true)
  const [time, setTime] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id) }, [])
  const utc = time.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
  return <main className="dashboard">
    <header className="topbar"><button className="icon-button menu-trigger" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="brand"><span className="brand-mark"><Globe2 size={17} /></span><span>ORBITAL <b>INTELLIGENCE</b></span><small>/ {activeBody.toUpperCase()}</small></div><nav className="body-nav" aria-label="Celestial bodies">{bodies.map(body => <button key={body} className={activeBody === body ? 'active' : ''} onClick={() => setActiveBody(body)}>{body}</button>)}</nav><div className="header-tools"><div className="mission-clock"><span className="eyebrow">MISSION CLOCK</span><b>{utc}</b></div><span className="tracked"><Activity size={13} /> 14,284</span><button className="profile" aria-label="Profile"><UserRound size={17} /></button></div></header>
    <section className="workspace"><Telemetry activeBody={activeBody} satellite={selectedSatellite} /><OrbitMap activeBody={activeBody} onSatelliteSelect={setSelectedSatellite} /><LayersPanel /><SpaceWeather /><div className="coordinates"><span>LAT <b>28.5383° N</b></span><span>LON <b>80.6421° W</b></span><span>ZOOM <b>1.00×</b></span></div><div className="crosshair-center"><span /></div></section>
    <footer className="timeline"><button className="play-button" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause simulation' : 'Play simulation'}>{playing ? <Pause size={17} /> : <Play size={17} />}</button><div className="timeline-info"><span className="eyebrow">SIMULATION TIMELINE</span><b>2024-03-14 <em>14:32:08</em> UTC</b></div><div className="scrubber"><div className="scrub-fill" /><i className="scrub-thumb" /></div><div className="speeds">{['1x', '10x', '100x'].map(value => <button key={value} className={speed === value ? 'active' : ''} onClick={() => setSpeed(value)}>{value}</button>)}</div><button className={`live-lock ${live ? 'active' : ''}`} onClick={() => setLive(!live)}>{live ? <LockKeyhole size={13} /> : <Search size={13} />} {live ? 'LIVE' : 'SCRUB'}</button></footer>
    {menuOpen && <div className="mega-overlay"><div className="mega-top"><div className="brand"><span className="brand-mark"><Globe2 size={17} /></span><span>ORBITAL <b>INTELLIGENCE</b></span></div><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={22} /></button></div><div className="mega-grid">{menuGroups.map(([title, ...items]) => <section key={title}><h2>{title}</h2>{items.map(item => <button key={item} onClick={() => { setActiveBody(item.includes('Earth') ? 'Earth' : bodies.includes(item) ? item : activeBody); setMenuOpen(false) }}>{item}<span>↗</span></button>)}</section>)}</div><div className="mega-footer"><span>ORBITAL INTELLIGENCE SYSTEMS <b>v2.4.1</b></span><span>SECURE CHANNEL <i className="status-dot">●</i></span></div></div>}
  </main>
}
