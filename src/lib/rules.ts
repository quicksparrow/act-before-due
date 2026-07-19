import type { Milestone, TemplateType, TrackedItem } from '../types'
import { addCalendarDays, addCalendarMonths, formatDate } from './date'

type FormValues = Record<string, string>

function milestone(name: string, date: string, explanation: string): Milestone {
  return { id: crypto.randomUUID(), name, date, explanation, completed: false }
}

function days(values: FormValues, key: string, fallback: number): number {
  const parsed = Number(values[key])
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export function generatePlan(type: TemplateType, values: FormValues): TrackedItem {
  const importantDate = values.importantDate
  let milestones: Milestone[] = []
  let importantDateLabel = 'Important date'

  switch (type) {
    case 'lease': {
      importantDateLabel = 'Lease end date'
      const noticeDays = values.noticeDays === 'custom' ? days(values, 'customNoticeDays', 60) : days(values, 'noticeDays', 60)
      const noticeDate = addCalendarDays(importantDate, -noticeDays)
      milestones = [
        milestone('Review whether to renew or move', addCalendarDays(noticeDate, -30), `This gives you 30 days to decide before notice is due on ${formatDate(noticeDate)}.`),
        milestone('Start searching for a new home', addCalendarDays(noticeDate, -21), `This starts three weeks before your final notice date.`),
        milestone('Submit required notice', noticeDate, `Your lease ends ${formatDate(importantDate)} and requires ${noticeDays} days’ notice.`),
        milestone('Confirm moving arrangements', values.movingDate || addCalendarDays(importantDate, -14), values.movingDate ? `This uses your planned moving date of ${formatDate(values.movingDate)}.` : 'This is scheduled two weeks before your lease ends.'),
        milestone('Lease ends', importantDate, `This is the lease end date you entered: ${formatDate(importantDate)}.`),
      ]
      break
    }
    case 'passport': {
      importantDateLabel = 'Passport expiration date'
      const leadWeeks = days(values, 'leadWeeks', 12)
      const validityMonths = days(values, 'validityMonths', 6)
      const travelThreshold = values.travelDate ? addCalendarDays(values.travelDate, -30) : addCalendarMonths(importantDate, -validityMonths)
      milestones = [
        milestone('Check current renewal requirements', addCalendarDays(importantDate, -(leadWeeks * 7 + 14)), `This gives you two weeks to gather information before the recommended renewal window.`),
        milestone('Prepare renewal materials', addCalendarDays(importantDate, -(leadWeeks * 7)), `This is ${leadWeeks} weeks before expiration.`),
        milestone('Check travel validity window', travelThreshold, values.travelDate ? `This is 30 days before travel. Confirm that your passport remains valid for at least ${validityMonths} months after your trip, if required.` : `Some trips may require ${validityMonths} months of passport validity beyond travel; verify current requirements.`),
        milestone('Passport expires', importantDate, `This is the expiration date you entered.`),
      ]
      break
    }
    case 'visa': {
      importantDateLabel = 'Document expiration date'
      const lead = days(values, 'leadDays', 120)
      const buffer = days(values, 'finalBuffer', 30)
      milestones = [
        milestone('Review official requirements', addCalendarDays(importantDate, -lead), `This is ${lead} days before the document expires.`),
        milestone('Gather supporting materials', addCalendarDays(importantDate, -Math.max(buffer + 30, Math.round(lead / 2))), 'This creates preparation time before your intended filing buffer.'),
        milestone('Complete a final filing check', addCalendarDays(importantDate, -buffer), `This preserves a ${buffer}-day buffer before expiration.`),
        milestone('Document expires', importantDate, 'This is the expiration date you entered.'),
      ]
      break
    }
    case 'license': {
      importantDateLabel = 'License expiration date'
      const lead = days(values, 'leadDays', 30)
      milestones = [
        milestone('Review renewal requirements', addCalendarDays(importantDate, -lead), `This is ${lead} days before your license expires.`),
        ...(values.appointment !== 'no' ? [milestone('Schedule a renewal appointment', addCalendarDays(importantDate, -Math.max(14, lead - 7)), 'You indicated that an appointment may be needed.')] : []),
        milestone('Complete the renewal', addCalendarDays(importantDate, -7), 'This leaves one week to resolve a problem before expiration.'),
        milestone('License expires', importantDate, 'This is the expiration date you entered.'),
      ]
      break
    }
    case 'registration': {
      importantDateLabel = 'Registration expiration date'
      const lead = days(values, 'leadDays', 30)
      milestones = [
        milestone('Review registration requirements', addCalendarDays(importantDate, -lead), `This is ${lead} days before registration expires.`),
        ...(values.inspection !== 'no' ? [milestone('Complete any required inspection', addCalendarDays(importantDate, -Math.max(14, lead - 7)), 'You indicated that an inspection may be required.')] : []),
        milestone('Submit the renewal', addCalendarDays(importantDate, -7), 'This leaves a one-week buffer before expiration.'),
        milestone('Registration expires', importantDate, 'This is the expiration date you entered.'),
      ]
      break
    }
    case 'insurance': {
      importantDateLabel = 'Policy renewal or end date'
      const reviewDays = days(values, 'reviewDays', 30)
      const noticeDays = days(values, 'noticeDays', 7)
      milestones = [
        milestone('Review coverage and renewal terms', addCalendarDays(importantDate, -reviewDays), `This is ${reviewDays} days before the policy date.`),
        milestone('Compare options and confirm changes', addCalendarDays(importantDate, -Math.max(noticeDays + 7, Math.round(reviewDays / 2))), 'This creates time to compare options before a cancellation deadline.'),
        milestone(values.autoRenew === 'yes' ? 'Confirm or cancel renewal' : 'Confirm continued coverage', addCalendarDays(importantDate, -noticeDays), `This uses a ${noticeDays}-day action buffer.`),
        milestone('Policy renews or ends', importantDate, 'This is the policy date you entered.'),
      ]
      break
    }
    case 'subscription': {
      importantDateLabel = 'Renewal or trial-end date'
      const noticeDays = days(values, 'noticeDays', 1)
      milestones = [
        milestone('Review whether to keep the service', addCalendarDays(importantDate, -Math.max(7, noticeDays + 5)), 'This gives you time to review the value before cancellation is due.'),
        milestone('Cancel or confirm renewal', addCalendarDays(importantDate, -noticeDays), `This is ${noticeDays} day${noticeDays === 1 ? '' : 's'} before the renewal or trial end.`),
        milestone('Subscription renews or trial ends', importantDate, 'This is the date you entered.'),
      ]
      break
    }
    case 'warranty': {
      importantDateLabel = 'Warranty expiration date'
      const reviewDays = days(values, 'reviewDays', 30)
      milestones = [
        milestone('Check the item for problems', addCalendarDays(importantDate, -reviewDays), `This is ${reviewDays} days before the warranty expires.`),
        ...(values.proofCheck === 'yes' ? [milestone('Locate proof of purchase', addCalendarDays(importantDate, -Math.max(7, reviewDays - 7)), 'You chose to include a proof-of-purchase check.')] : []),
        milestone('Submit any warranty claim', addCalendarDays(importantDate, -7), 'This leaves one week before coverage ends.'),
        milestone('Warranty expires', importantDate, 'This is the warranty expiration date you entered.'),
      ]
      break
    }
    case 'professional': {
      importantDateLabel = 'Professional license expiration date'
      const lead = days(values, 'leadDays', 90)
      milestones = [
        milestone('Review official renewal requirements', addCalendarDays(importantDate, -lead), `This is ${lead} days before the license expires.`),
        ...(values.education !== 'no' ? [milestone('Check continuing-education progress', addCalendarDays(importantDate, -Math.max(45, lead - 30)), 'You indicated that continuing education may be required.')] : []),
        milestone('Prepare and submit renewal', addCalendarDays(importantDate, -30), 'This creates a 30-day processing buffer.'),
        milestone('Professional license expires', importantDate, 'This is the expiration date you entered.'),
      ]
      break
    }
    case 'utilities': {
      importantDateLabel = 'Service-related date'
      const serviceDate = values.serviceDate || importantDate
      const noticeDays = days(values, 'noticeDays', 14)
      const isStart = values.action === 'start'
      const isReview = values.action === 'review'
      milestones = isStart ? [
        milestone('Review available providers', addCalendarDays(serviceDate, -21), 'This is three weeks before your desired service date.'),
        milestone('Select a provider', addCalendarDays(serviceDate, -14), 'This leaves two weeks to arrange activation.'),
        milestone('Schedule activation', addCalendarDays(serviceDate, -7), 'This is one week before service should begin.'),
        milestone('Confirm service is active', serviceDate, 'This is your desired activation date.'),
        milestone('Verify billing details', addCalendarDays(serviceDate, 3), 'This is three days after activation.'),
      ] : isReview ? [
        milestone('Review contract and alternatives', addCalendarDays(importantDate, -Math.max(30, noticeDays + 14)), 'This gives you time to compare choices.'),
        milestone('Confirm or change service', addCalendarDays(importantDate, -noticeDays), `This uses the ${noticeDays}-day notice period you entered.`),
        milestone('Service renews or contract ends', importantDate, 'This is the date you entered.'),
      ] : [
        milestone('Review transfer or cancellation requirements', addCalendarDays(serviceDate, -Math.max(21, noticeDays + 7)), 'This gives you time to check provider requirements.'),
        milestone(values.action === 'transfer' ? 'Schedule the service transfer' : 'Schedule service cancellation', addCalendarDays(serviceDate, -noticeDays), `This uses a ${noticeDays}-day notice period.`),
        milestone('Confirm the appointment', addCalendarDays(serviceDate, -2), 'This is two days before the requested service date.'),
        milestone(values.action === 'transfer' ? 'Confirm service was transferred' : 'Confirm service ended', serviceDate, 'This is your desired service date.'),
        ...(values.equipment !== 'no' ? [milestone('Return provider equipment', addCalendarDays(serviceDate, 5), 'You indicated that equipment may need to be returned.')] : []),
        milestone('Check for the final bill', values.finalBillDate || addCalendarDays(serviceDate, 14), values.finalBillDate ? 'This uses the final bill date you entered.' : 'This is two weeks after service ends.'),
      ]
      break
    }
    case 'custom': {
      importantDateLabel = values.dateMeaning ? `${values.dateMeaning[0].toUpperCase()}${values.dateMeaning.slice(1)} date` : 'Important date'
      const lead = days(values, 'leadDays', 30)
      milestones = [
        milestone(values.firstMilestone || 'Review what is needed', addCalendarDays(importantDate, -lead), `This is ${lead} days before your important date.`),
        ...(values.finalActionDate ? [milestone('Final practical date to act', values.finalActionDate, 'This uses the final action date you entered.')] : []),
        milestone(values.dateMeaning === 'renewal' ? 'Renewal date' : 'Important date arrives', importantDate, 'This is the important date you entered.'),
      ]
    }
  }

  milestones.sort((a, b) => a.date.localeCompare(b.date))
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(), templateType: type, name: values.name, importantDate, importantDateLabel,
    fields: Object.fromEntries(Object.entries(values).filter(([key]) => !['name', 'importantDate', 'notes'].includes(key))),
    notes: values.notes || '', milestones, ruleVersion: 1, createdAt: now, updatedAt: now,
  }
}
