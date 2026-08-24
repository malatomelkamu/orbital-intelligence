import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 21600

type SatelliteRecord = { noradId: number; name: string; line1: string; line2: string; type: 'active' | 'debris' | 'station' }

type Cache = { expires: number; data: SatelliteRecord[] }
let cache: Cache | undefined

const feeds = [
  ['https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle', 'active'] as const,
  ['https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle', 'station'] as const,
  ['https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium&FORMAT=tle', 'active'] as const,
]

function parseTle(text: string, fallback: SatelliteRecord['type']): SatelliteRecord[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const records: SatelliteRecord[] = []
  for (let i = 0; i + 2 < lines.length;) {
    const name = lines[i]
    const line1 = lines[i + 1]
    const line2 = lines[i + 2]
    if (!line1.startsWith('1 ') || !line2.startsWith('2 ')) { i += 1; continue }
    const noradId = Number(line1.slice(2, 7).trim())
    if (Number.isFinite(noradId)) records.push({ noradId, name: name.replace(/^0 /, '').slice(0, 64), line1, line2, type: /DEB|R-B|ROCKET BODY/i.test(name) ? 'debris' : fallback })
    i += 3
  }
  return records
}

export async function GET() {
  if (cache && cache.expires > Date.now()) return NextResponse.json(cache.data, { headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' } })
  try {
    const responses = await Promise.all(feeds.map(async ([url, type]) => parseTle(await (await fetch(url, { next: { revalidate: 21600 } })).text(), type)))
    const unique = new Map<number, SatelliteRecord>()
    responses.flat().forEach((record) => unique.set(record.noradId, record))
    const data = [...unique.values()]
    cache = { data, expires: Date.now() + 21600_000 }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' } })
  } catch {
    return NextResponse.json({ error: 'TLE feed unavailable' }, { status: 502 })
  }
}
