import { describe, expect, it } from 'vitest'
import { generatePlan } from './rules'
import { buildDashboardCsv, buildIcs, foldIcsLine, googleCalendarUrl, icsFilename } from './export'

const lease = generatePlan('lease', {
  name: '18 Maple Street', importantDate: '2026-12-31', noticeDays: '60', movingDate: '', notes: 'Ask about elevator, then confirm.',
})

describe('portable exports', () => {
  it('creates valid calendar boundaries and one event per milestone', () => {
    const calendar = buildIcs(lease)
    expect(calendar).toContain('BEGIN:VCALENDAR\r\nVERSION:2.0')
    expect(calendar).toContain('METHOD:PUBLISH')
    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(lease.milestones.length)
    expect(calendar).toContain('DTSTART;VALUE=DATE:20261101')
    expect(calendar).toContain('DTEND;VALUE=DATE:20261102')
    expect(calendar.endsWith('END:VCALENDAR\r\n')).toBe(true)
    for (const line of calendar.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    }
  })

  it('folds long UTF-8 properties without corrupting characters', () => {
    const line = `DESCRIPTION:${'A clear résumé reminder — '.repeat(5)}`
    const folded = foldIcsLine(line)
    expect(folded).toContain('\r\n ')
    expect(folded.replaceAll('\r\n ', '')).toBe(line)
    for (const part of folded.split('\r\n')) {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75)
    }
  })

  it('escapes commas in spreadsheet values', () => {
    const csv = buildDashboardCsv([lease])
    expect(csv.split('\r\n')).toHaveLength(2)
    expect(csv).toContain('"Ask about elevator, then confirm."')
  })

  it('builds a permission-free Google Calendar template link', () => {
    const url = new URL(googleCalendarUrl(lease, lease.milestones[0]))
    expect(url.hostname).toBe('calendar.google.com')
    expect(url.searchParams.get('action')).toBe('TEMPLATE')
    expect(url.searchParams.get('dates')).toMatch(/^\d{8}\/\d{8}$/)
  })

  it('creates a safe calendar filename', () => {
    expect(icsFilename(lease)).toBe('18-maple-street-action-plan.ics')
  })
})
