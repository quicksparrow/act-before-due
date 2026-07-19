import { describe, expect, it } from 'vitest'
import { addCalendarDays, addCalendarMonths } from './date'
import { generatePlan } from './rules'

describe('calendar date arithmetic', () => {
  it('subtracts calendar days across month boundaries', () => {
    expect(addCalendarDays('2026-12-31', -60)).toBe('2026-11-01')
  })

  it('clamps month-end dates', () => {
    expect(addCalendarMonths('2026-08-31', -6)).toBe('2026-02-28')
  })
})

describe('deterministic action plans', () => {
  it('calculates a lease notice deadline from the notice period', () => {
    const plan = generatePlan('lease', {
      name: 'Example lease', importantDate: '2026-12-31', noticeDays: '60', movingDate: '', notes: '',
    })
    const notice = plan.milestones.find((entry) => entry.name === 'Submit required notice')
    expect(notice?.date).toBe('2026-11-01')
    expect(notice?.explanation).toContain('60 days’ notice')
  })

  it('sorts all generated milestones by date', () => {
    const plan = generatePlan('subscription', {
      name: 'Example service', importantDate: '2026-09-30', noticeDays: '1', billingCycle: 'monthly', autoRenew: 'yes', notes: '',
    })
    expect(plan.milestones.map((entry) => entry.date)).toEqual([...plan.milestones.map((entry) => entry.date)].sort())
  })

  it('includes equipment return when a utility provider requires it', () => {
    const plan = generatePlan('utilities', {
      name: 'Internet', importantDate: '2026-08-31', serviceDate: '2026-08-20', action: 'cancel', utilityType: 'internet', provider: 'Provider', noticeDays: '14', equipment: 'yes', finalBillDate: '', notes: '',
    })
    expect(plan.milestones.some((entry) => entry.name === 'Return provider equipment')).toBe(true)
  })
})
