import type { TemplateDefinition, TemplateType } from '../types'

const yesNoUnsure = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
]

export const templates: TemplateDefinition[] = [
  {
    type: 'lease', title: 'Lease', shortTitle: 'Lease', icon: 'Home',
    description: 'Plan notice, moving, and lease-end milestones.',
    nameLabel: 'Lease name or address', namePlaceholder: 'Maple Street apartment', dateLabel: 'Lease end date',
    fields: [
      { key: 'noticeDays', label: 'Required notice period', type: 'select', required: true, options: [
        { value: '30', label: '30 days' }, { value: '60', label: '60 days' }, { value: '90', label: '90 days' }, { value: 'custom', label: 'Custom' },
      ] },
      { key: 'customNoticeDays', label: 'Custom notice period in days', type: 'number', required: true, showWhen: { key: 'noticeDays', values: ['custom'] } },
      { key: 'movingDate', label: 'Moving date', type: 'date', help: 'Optional' },
    ],
  },
  {
    type: 'passport', title: 'Passport', shortTitle: 'Passport', icon: 'BookOpen',
    description: 'Prepare for renewal and travel-validity requirements.',
    nameLabel: 'Passport nickname', namePlaceholder: 'My passport', dateLabel: 'Passport expiration date',
    fields: [
      { key: 'travelDate', label: 'Planned international travel date', type: 'date', help: 'Optional' },
      { key: 'validityMonths', label: 'Travel validity buffer', type: 'select', required: true, options: [
        { value: '3', label: '3 months' }, { value: '6', label: '6 months (recommended default)' },
      ] },
      { key: 'leadWeeks', label: 'Renewal lead time', type: 'select', required: true, options: [
        { value: '8', label: '8 weeks' }, { value: '12', label: '12 weeks' }, { value: '16', label: '16 weeks' },
      ] },
    ],
    disclaimer: 'Travel requirements vary. Verify current rules with the relevant government authority or carrier.',
  },
  {
    type: 'visa', title: 'Visa or immigration document', shortTitle: 'Visa', icon: 'FileBadge',
    description: 'Create an early planning timeline for an important document.',
    nameLabel: 'Document nickname', namePlaceholder: 'Work permit', dateLabel: 'Document expiration date',
    fields: [
      { key: 'leadDays', label: 'Start preparing', type: 'select', required: true, options: [
        { value: '90', label: '90 days before' }, { value: '120', label: '120 days before' }, { value: '180', label: '180 days before' },
      ] },
      { key: 'finalBuffer', label: 'Final filing buffer', type: 'select', required: true, options: [
        { value: '14', label: '14 days' }, { value: '30', label: '30 days' }, { value: '60', label: '60 days' },
      ] },
      { key: 'travelDate', label: 'Related travel date', type: 'date', help: 'Optional' },
    ],
    disclaimer: 'ActBeforeDue is a planning tool, not legal advice. Verify all dates with the appropriate authority or a qualified professional.',
  },
  {
    type: 'license', title: 'Driver’s license', shortTitle: 'License', icon: 'CreditCard',
    description: 'Plan renewal, documents, and appointments.',
    nameLabel: 'License nickname or region', namePlaceholder: 'New York license', dateLabel: 'License expiration date',
    fields: [
      { key: 'leadDays', label: 'Renewal lead time', type: 'select', required: true, options: [
        { value: '30', label: '30 days' }, { value: '60', label: '60 days' }, { value: '90', label: '90 days' },
      ] },
      { key: 'appointment', label: 'Appointment needed?', type: 'select', required: true, options: yesNoUnsure },
    ],
  },
  {
    type: 'registration', title: 'Vehicle registration', shortTitle: 'Registration', icon: 'Car',
    description: 'Plan inspection and renewal before registration expires.',
    nameLabel: 'Vehicle nickname', namePlaceholder: 'Family car', dateLabel: 'Registration expiration date',
    fields: [
      { key: 'leadDays', label: 'Renewal lead time', type: 'select', required: true, options: [
        { value: '30', label: '30 days' }, { value: '60', label: '60 days' },
      ] },
      { key: 'inspection', label: 'Inspection required?', type: 'select', required: true, options: yesNoUnsure },
    ],
  },
  {
    type: 'insurance', title: 'Insurance policy', shortTitle: 'Insurance', icon: 'ShieldCheck',
    description: 'Review coverage and renewal terms before the policy date.',
    nameLabel: 'Policy nickname', namePlaceholder: 'Renter’s insurance', dateLabel: 'Renewal or end date',
    fields: [
      { key: 'policyType', label: 'Policy type', type: 'select', required: true, options: [
        { value: 'renters', label: 'Renter’s' }, { value: 'home', label: 'Home' }, { value: 'auto', label: 'Auto' }, { value: 'health', label: 'Health' }, { value: 'other', label: 'Other' },
      ] },
      { key: 'reviewDays', label: 'Review lead time', type: 'select', required: true, options: [
        { value: '30', label: '30 days' }, { value: '45', label: '45 days' }, { value: '60', label: '60 days' },
      ] },
      { key: 'noticeDays', label: 'Cancellation notice period', type: 'number', help: 'Optional, in days' },
      { key: 'autoRenew', label: 'Does it renew automatically?', type: 'select', required: true, options: yesNoUnsure },
    ],
  },
  {
    type: 'subscription', title: 'Subscription or free trial', shortTitle: 'Subscription', icon: 'RefreshCcw',
    description: 'Decide whether to keep or cancel before the charge.',
    nameLabel: 'Service name', namePlaceholder: 'Streaming service', dateLabel: 'Renewal or trial-end date',
    fields: [
      { key: 'billingCycle', label: 'Billing cycle', type: 'select', required: true, options: [
        { value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual' }, { value: 'trial', label: 'Free trial' }, { value: 'other', label: 'Other' },
      ] },
      { key: 'noticeDays', label: 'Cancellation notice period', type: 'number', required: true, placeholder: '1' },
      { key: 'autoRenew', label: 'Does it renew automatically?', type: 'select', required: true, options: yesNoUnsure.slice(0, 2) },
    ],
  },
  {
    type: 'warranty', title: 'Warranty', shortTitle: 'Warranty', icon: 'BadgeCheck',
    description: 'Check an item and make any claim before coverage ends.',
    nameLabel: 'Item name', namePlaceholder: 'Laptop warranty', dateLabel: 'Warranty expiration date',
    fields: [
      { key: 'reviewDays', label: 'Review lead time', type: 'select', required: true, options: [
        { value: '14', label: '14 days' }, { value: '30', label: '30 days' }, { value: '60', label: '60 days' },
      ] },
      { key: 'proofCheck', label: 'Check proof of purchase?', type: 'select', required: true, options: yesNoUnsure.slice(0, 2) },
    ],
  },
  {
    type: 'professional', title: 'Professional license', shortTitle: 'Professional', icon: 'Award',
    description: 'Prepare renewal and continuing-education requirements.',
    nameLabel: 'License nickname', namePlaceholder: 'Teaching license', dateLabel: 'License expiration date',
    fields: [
      { key: 'leadDays', label: 'Renewal lead time', type: 'select', required: true, options: [
        { value: '60', label: '60 days' }, { value: '90', label: '90 days' }, { value: '120', label: '120 days' },
      ] },
      { key: 'education', label: 'Continuing education required?', type: 'select', required: true, options: yesNoUnsure },
    ],
    disclaimer: 'Requirements vary by profession and region. Confirm your official renewal requirements.',
  },
  {
    type: 'utilities', title: 'Utilities', shortTitle: 'Utilities', icon: 'PlugZap',
    description: 'Start, transfer, cancel, or review household services.',
    nameLabel: 'Service address or nickname', namePlaceholder: 'Maple Street internet', dateLabel: 'Move, renewal, or contract-end date',
    fields: [
      { key: 'action', label: 'What do you need to do?', type: 'select', required: true, options: [
        { value: 'start', label: 'Start service' }, { value: 'transfer', label: 'Transfer service' }, { value: 'cancel', label: 'Cancel service' }, { value: 'review', label: 'Review or renew service' },
      ] },
      { key: 'utilityType', label: 'Utility type', type: 'select', required: true, options: [
        { value: 'electricity', label: 'Electricity' }, { value: 'gas', label: 'Gas' }, { value: 'water', label: 'Water' }, { value: 'internet', label: 'Internet' }, { value: 'mobile', label: 'Mobile phone' }, { value: 'other', label: 'Other' },
      ] },
      { key: 'provider', label: 'Provider', type: 'text', required: true, placeholder: 'Provider name' },
      { key: 'serviceDate', label: 'Desired activation or cancellation date', type: 'date', required: true },
      { key: 'noticeDays', label: 'Notice period in days', type: 'number', showWhen: { key: 'action', values: ['transfer', 'cancel', 'review'] } },
      { key: 'equipment', label: 'Must equipment be returned?', type: 'select', required: true, options: yesNoUnsure, showWhen: { key: 'action', values: ['transfer', 'cancel'] } },
      { key: 'finalBillDate', label: 'Expected final bill date', type: 'date', help: 'Optional', showWhen: { key: 'action', values: ['transfer', 'cancel'] } },
    ],
  },
  {
    type: 'custom', title: 'Custom deadline', shortTitle: 'Custom', icon: 'CalendarPlus',
    description: 'Create a simple plan for any other important date.',
    nameLabel: 'Item name', namePlaceholder: 'Important deadline', dateLabel: 'Important date',
    fields: [
      { key: 'dateMeaning', label: 'What does this date mean?', type: 'select', required: true, options: [
        { value: 'expiration', label: 'Expiration' }, { value: 'event', label: 'Event' }, { value: 'renewal', label: 'Renewal' }, { value: 'other', label: 'Other' },
      ] },
      { key: 'leadDays', label: 'Start acting this many days before', type: 'number', required: true, placeholder: '30' },
      { key: 'finalActionDate', label: 'Final action date', type: 'date', help: 'Optional' },
      { key: 'firstMilestone', label: 'First milestone name', type: 'text', required: true, placeholder: 'Review what is needed' },
    ],
  },
]

export const templateMap = Object.fromEntries(templates.map((template) => [template.type, template])) as Record<TemplateType, TemplateDefinition>
