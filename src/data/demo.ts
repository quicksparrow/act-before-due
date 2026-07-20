import type { TrackedItem } from '../types'
import { generatePlan } from '../lib/rules'
import { addCalendarDays } from '../lib/date'

function dateFromToday(days: number): string {
  const now = new Date()
  const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return addCalendarDays(local, days)
}

export function createDemoItems(): TrackedItem[] {
  const lease = generatePlan('lease', {
    name: '18 Maple Street', importantDate: dateFromToday(65), noticeDays: '60', movingDate: dateFromToday(56), notes: 'Confirm the loading elevator with the building manager.',
  })
  const passport = generatePlan('passport', {
    name: 'Travel passport', importantDate: dateFromToday(300), travelDate: dateFromToday(210), validityMonths: '6', leadWeeks: '12', notes: '',
  })
  const license = generatePlan('license', {
    name: 'Driver’s license', importantDate: dateFromToday(74), leadDays: '60', appointment: 'yes', notes: '',
  })
  const utilities = generatePlan('utilities', {
    name: 'Maple Street internet', importantDate: dateFromToday(56), action: 'transfer', utilityType: 'internet', provider: 'CityNet', serviceDate: dateFromToday(56), noticeDays: '14', equipment: 'yes', finalBillDate: dateFromToday(70), notes: 'Router must be returned at a retail location.',
  })
  const insurance = generatePlan('insurance', {
    name: 'Renter’s insurance', importantDate: dateFromToday(42), policyType: 'renters', reviewDays: '30', noticeDays: '7', autoRenew: 'yes', notes: '',
  })
  const subscription = generatePlan('subscription', {
    name: 'Storage subscription', importantDate: dateFromToday(20), billingCycle: 'annual', noticeDays: '1', autoRenew: 'yes', notes: '',
  })

  lease.id = 'demo-lease'
  passport.id = 'demo-passport'
  license.id = 'demo-license'
  utilities.id = 'demo-utilities'
  insurance.id = 'demo-insurance'
  subscription.id = 'demo-subscription'

  lease.milestones[0].completed = true
  lease.milestones[1].completed = true
  utilities.milestones[0].completed = true
  return [lease, subscription, insurance, utilities, license, passport]
}
