import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 900

const NOAA = 'https://services.swpc.noaa.gov'
let cache: { expires: number; data: SpaceWeather } | undefined

type SpaceWeather = { kp: number; kpTime: string; solarWindSpeed: number; solarFlux: number; level: 'quiet' | 'unsettled' | 'storm'; dragImpact: 'LOW' | 'ELEVATED' | 'HIGH' }

export async function GET() {
  if (cache && cache.expires > Date.now()) return NextResponse.json(cache.data, { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' } })
  try {
    const [kpResult, windResult, fluxResult] = await Promise.allSettled([
      fetch(`${NOAA}/products/noaa-planetary-k-index.json`, { next: { revalidate: 900 } }).then((response) => response.ok ? response.json() : []),
      fetch(`${NOAA}/products/solar-wind/plasma-7-day.json`, { next: { revalidate: 900 } }).then((response) => response.ok ? response.json() : []),
      fetch(`${NOAA}/products/summary/10cm-flux.json`, { next: { revalidate: 900 } }).then((response) => response.ok ? response.json() : []),
    ])
    const kpRows = kpResult.status === 'fulfilled' ? kpResult.value as { time_tag: string; Kp: number }[] : []
    const windRows = windResult.status === 'fulfilled' ? windResult.value as { time_tag: string; speed: number }[] : []
    const fluxRows = fluxResult.status === 'fulfilled' ? fluxResult.value as { flux: number }[] : []
    const kpRow = kpRows.at(-1)
    const kp = Number(kpRow?.Kp ?? 0)
    const solarWindSpeed = Math.round(Number(windRows.at(-1)?.speed ?? 0))
    const solarFlux = Math.round(Number(fluxRows.at(-1)?.flux ?? 0))
    const level = kp >= 6 ? 'storm' : kp >= 4 ? 'unsettled' : 'quiet'
    const dragImpact = kp >= 6 || solarWindSpeed >= 650 ? 'HIGH' : kp >= 4 || solarWindSpeed >= 500 ? 'ELEVATED' : 'LOW'
    const data = { kp, kpTime: kpRow?.[0] ?? new Date().toISOString(), solarWindSpeed, solarFlux, level, dragImpact } satisfies SpaceWeather
    cache = { data, expires: Date.now() + 900_000 }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' } })
  } catch {
    return NextResponse.json({ error: 'NOAA SWPC feed unavailable' }, { status: 502 })
  }
}
