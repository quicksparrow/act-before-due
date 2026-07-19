import type { Milestone, TrackedItem } from '../types'
import { daysFromToday, formatDate, nextMilestone, urgencyFor } from './date'

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

const utf8Encoder = new TextEncoder()

export function foldIcsLine(line: string): string {
  if (utf8Encoder.encode(line).length <= 75) return line
  const segments: string[] = []
  let segment = ''
  let limit = 75
  for (const character of line) {
    if (utf8Encoder.encode(segment + character).length > limit) {
      segments.push(segment)
      segment = character
      limit = 74
    } else {
      segment += character
    }
  }
  if (segment) segments.push(segment)
  return segments.join('\r\n ')
}

function compactDate(value: string): string {
  return value.replaceAll('-', '')
}

function eventLines(item: TrackedItem, milestone: Milestone): string[] {
  const nextDay = new Date(`${milestone.date}T12:00:00Z`)
  nextDay.setUTCDate(nextDay.getUTCDate() + 1)
  return [
    'BEGIN:VEVENT',
    `UID:${milestone.id}@actbeforedue.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${compactDate(milestone.date)}`,
    `DTEND;VALUE=DATE:${compactDate(nextDay.toISOString().slice(0, 10))}`,
    `SUMMARY:${escapeIcs(`${milestone.name} — ${item.name}`)}`,
    `DESCRIPTION:${escapeIcs(`${milestone.explanation}${item.notes ? `\n\nNotes: ${item.notes}` : ''}`)}`,
    'TRANSP:TRANSPARENT',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
  ]
}

function download(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000)
}

export function downloadIcs(item: TrackedItem, milestones = item.milestones.filter((entry) => !entry.completed)): void {
  download(buildIcs(item, milestones), icsFilename(item), 'text/calendar;charset=utf-8;method=PUBLISH')
}

export function icsFilename(item: TrackedItem): string {
  return `${slug(item.name)}-action-plan.ics`
}

export function buildIcs(item: TrackedItem, milestones = item.milestones.filter((entry) => !entry.completed)): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ActBeforeDue//Action Plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(`${item.name} action plan`)}`,
    ...milestones.flatMap((entry) => eventLines(item, entry)),
    'END:VCALENDAR',
  ]
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`
}

export function googleCalendarUrl(item: TrackedItem, milestone: Milestone): string {
  const start = compactDate(milestone.date)
  const next = new Date(`${milestone.date}T12:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${milestone.name} — ${item.name}`,
    dates: `${start}/${compactDate(next.toISOString().slice(0, 10))}`,
    details: `${milestone.explanation}${item.notes ? `\n\nNotes: ${item.notes}` : ''}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function csvCell(value: string | number): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function downloadDashboardCsv(items: TrackedItem[]): void {
  download(`\ufeff${buildDashboardCsv(items)}`, `actbeforedue-dashboard-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8')
}

export function downloadBackup(items: TrackedItem[]): void {
  const backup = JSON.stringify({
    app: 'ActBeforeDue',
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
  }, null, 2)
  download(backup, `actbeforedue-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json;charset=utf-8')
}

export function buildDashboardCsv(items: TrackedItem[]): string {
  const headers = ['Status', 'Category', 'Item', 'Next action', 'Action date', 'Important date', 'Days remaining', 'Completed milestones', 'Total milestones', 'Notes', 'Updated']
  const rows = items.map((item) => {
    const next = nextMilestone(item)
    return [
      urgencyFor(item).replace('-', ' '), item.templateType, item.name, next?.name || 'Complete', next ? formatDate(next.date) : '',
      formatDate(item.importantDate), next ? daysFromToday(next.date) : '', item.milestones.filter((entry) => entry.completed).length,
      item.milestones.length, item.notes, new Date(item.updatedAt).toLocaleDateString(),
    ]
  })
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'plan'
}
