export type TemplateType =
  | 'lease'
  | 'passport'
  | 'visa'
  | 'license'
  | 'registration'
  | 'insurance'
  | 'subscription'
  | 'warranty'
  | 'professional'
  | 'utilities'
  | 'custom'

export type Urgency = 'act-now' | 'coming-soon' | 'on-track' | 'completed'

export interface Milestone {
  id: string
  name: string
  date: string
  explanation: string
  completed: boolean
  userCreated?: boolean
  manuallyEdited?: boolean
}

export interface TrackedItem {
  id: string
  userId?: string
  templateType: TemplateType
  name: string
  importantDate: string
  importantDateLabel: string
  fields: Record<string, string | boolean>
  notes: string
  milestones: Milestone[]
  ruleVersion: number
  createdAt: string
  updatedAt: string
}

export interface TemplateField {
  key: string
  label: string
  type: 'text' | 'date' | 'select' | 'number' | 'textarea'
  required?: boolean
  placeholder?: string
  help?: string
  options?: Array<{ value: string; label: string }>
  showWhen?: { key: string; values: string[] }
}

export interface TemplateDefinition {
  type: TemplateType
  title: string
  shortTitle: string
  description: string
  icon: string
  nameLabel: string
  namePlaceholder: string
  dateLabel: string
  fields: TemplateField[]
  disclaimer?: string
}
