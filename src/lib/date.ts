import { format, parseISO } from 'date-fns'
import type { Milestone, TrackedItem, Urgency } from '../types'

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12))
}

export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addCalendarDays(value: string, days: number): string {
  const date = parseDateOnly(value)
  date.setUTCDate(date.getUTCDate() + days)
  return toDateOnly(date)
}

export function addCalendarMonths(value: string, months: number): string {
  const date = parseDateOnly(value)
  const originalDay = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months)
  const finalDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 12)).getUTCDate()
  date.setUTCDate(Math.min(originalDay, finalDay))
  return toDateOnly(date)
}

export function formatDate(value: string): string {
  if (!value) return 'Date not set'
  return format(parseDateOnly(value), 'MMM d, yyyy')
}

export function daysFromToday(value: string): number {
  const today = new Date()
  const normalizedToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12)
  return Math.round((parseDateOnly(value).getTime() - normalizedToday) / 86_400_000)
}

export function nextMilestone(item: TrackedItem): Milestone | undefined {
  return [...item.milestones]
    .filter((milestone) => !milestone.completed)
    .sort((a, b) => a.date.localeCompare(b.date))[0]
}

export function urgencyFor(item: TrackedItem): Urgency {
  const next = nextMilestone(item)
  if (!next) return 'completed'
  const days = daysFromToday(next.date)
  if (days <= 7) return 'act-now'
  if (days <= 30) return 'coming-soon'
  return 'on-track'
}

export function relativeDays(value: string): string {
  const days = daysFromToday(value)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return '1 day past due'
  if (days < 0) return `${Math.abs(days)} days past due`
  return `${days} days left`
}

export function safeParseDate(value?: string): Date | null {
  if (!value) return null
  const date = parseISO(value)
  return Number.isNaN(date.getTime()) ? null : date
}
