import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes, Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  AlertCircle, ArrowLeft, ArrowRight, Award, BadgeCheck, BookOpen, Calendar, CalendarPlus, Car, Check,
  CheckCircle2, ChevronRight, Clock3, CreditCard, Download, FileBadge, FileSpreadsheet, HardDrive, Home,
  Info, LockKeyhole, Menu, Plus, PlugZap, RefreshCcw, RotateCcw, Settings, ShieldCheck,
  Sparkles, Trash2, Upload, X,
} from 'lucide-react'
import type { Milestone, TemplateDefinition, TemplateType, TrackedItem, Urgency } from './types'
import { templates, templateMap } from './data/templates'
import { createDemoItems } from './data/demo'
import { generatePlan } from './lib/rules'
import { daysFromToday, formatDate, nextMilestone, relativeDays, urgencyFor } from './lib/date'
import { downloadBackup, downloadDashboardCsv, downloadIcs, googleCalendarUrl } from './lib/export'
import { clearLocalItems, deleteLocalItem, loadLocalItems, readBackupFile, replaceLocalItems, saveLocalItem } from './lib/localRepository'

const iconMap = { Home, BookOpen, FileBadge, CreditCard, Car, ShieldCheck, RefreshCcw, BadgeCheck, Award, PlugZap, CalendarPlus }
const urgencyCopy: Record<Urgency, { label: string; description: string }> = {
  'act-now': { label: 'Act now', description: 'Due within 7 days or past due' },
  'coming-soon': { label: 'Coming soon', description: 'Due within 30 days' },
  'on-track': { label: 'On track', description: 'More than 30 days away' },
  completed: { label: 'Completed', description: 'All milestones finished' },
}

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function App() {
  return <AppRoutes />
}

function AppRoutes() {
  const routeLocation = useLocation()
  const [demoItems, setDemoItems] = useState<TrackedItem[]>(() => createDemoItems())
  const [items, setItems] = useState<TrackedItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [routeLocation.pathname])

  useEffect(() => {
    setDataError('')
    void loadLocalItems()
      .then(setItems)
      .catch(() => setDataError('This browser could not open local storage. Check your privacy settings or try a normal browser window.'))
      .finally(() => setLoadingItems(false))
  }, [])

  async function saveLocal(item: TrackedItem) {
    await saveLocalItem(item)
    setItems((current) => [item, ...current.filter((entry) => entry.id !== item.id)])
  }

  async function updateLocal(item: TrackedItem) {
    await saveLocal({ ...item, updatedAt: new Date().toISOString() })
  }

  async function removeLocal(id: string) {
    await deleteLocalItem(id)
    setItems((current) => current.filter((entry) => entry.id !== id))
  }

  async function restoreLocal(restored: TrackedItem[]) {
    await replaceLocalItems(restored)
    setItems(restored)
  }

  async function clearAllLocal() {
    await clearLocalItems()
    setItems([])
  }

  function saveDemo(item: TrackedItem) {
    setDemoItems((current) => [item, ...current.filter((entry) => entry.id !== item.id)])
  }

  function updateDemo(item: TrackedItem) {
    saveDemo({ ...item, updatedAt: new Date().toISOString() })
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/demo" element={<DashboardPage mode="demo" items={demoItems} loading={false} onReset={() => setDemoItems(createDemoItems())} />} />
      <Route path="/demo/track" element={<TrackFlow mode="demo" onSave={async (item) => saveDemo(item)} />} />
      <Route path="/demo/item/:id" element={<ItemPage mode="demo" items={demoItems} onUpdate={async (item) => updateDemo(item)} onDelete={async (id) => setDemoItems((current) => current.filter((entry) => entry.id !== id))} />} />
      <Route path="/dashboard" element={<DashboardPage mode="local" items={items} loading={loadingItems} error={dataError} onRestore={restoreLocal} />} />
      <Route path="/track" element={<TrackFlow mode="local" onSave={saveLocal} />} />
      <Route path="/item/:id" element={<ItemPage mode="local" items={items} onUpdate={updateLocal} onDelete={removeLocal} />} />
      <Route path="/settings" element={<SettingsPage items={items} onRestore={restoreLocal} onClear={clearAllLocal} />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsPolicy />} />
      <Route path="/data-safety" element={<DataSafetyPolicy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function Page({ children, mode, compact = false }: { children: ReactNode; mode?: 'demo' | 'local'; compact?: boolean }) {
  return <div className="app"><Header mode={mode} /><main id="main" className={compact ? 'main main--compact' : 'main'}>{children}</main><Footer /></div>
}

function Header({ mode }: { mode?: 'demo' | 'local' }) {
  const [open, setOpen] = useState(false)
  const home = mode === 'demo' ? '/demo' : mode === 'local' ? '/dashboard' : '/'
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to={home} className="brand" aria-label="ActBeforeDue home"><span className="brand-mark"><Clock3 size={20} /></span><span className="brand-name">ActBeforeDue</span><span className="brand-tagline">Track important dates. Know when to act.</span></Link>
        <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation"><Menu /></button>
        <nav className={open ? 'nav nav--open' : 'nav'} aria-label="Main navigation">
          {mode && <Link to="/" className="text-link" onClick={() => setOpen(false)}><Home size={17} /> Home</Link>}
          {mode === 'demo' && <span className="demo-pill">Demo mode</span>}
          {mode === 'local' && <span className="local-pill"><HardDrive size={14} /> On this device</span>}
          {mode && <Link to={mode === 'demo' ? '/demo/track' : '/track'} className="button button--small"><Plus size={17} /> Track a date</Link>}
          {mode === 'local' && <Link to="/settings" className="icon-button" aria-label="Backup and settings"><Settings size={20} /></Link>}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return <footer className="footer"><div><strong>ActBeforeDue</strong><span>Free, local-first, and open source.</span></div><nav aria-label="Legal"><Link to="/privacy">Privacy</Link><Link to="/data-safety">Data safety</Link><Link to="/terms">Terms</Link></nav></footer>
}

function Landing() {
  return (
    <Page compact>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={16} /> Plan before the deadline</p>
          <h1>Track important dates.<br /><span>Know when to act.</span></h1>
          <p className="hero-lede">Turn one expiration date into a clear action plan for your lease, passport, license, utilities, subscriptions, and more.</p>
          <div className="hero-actions"><Link to="/dashboard" className="button button--large">Start on this device <ArrowRight size={19} /></Link><InstallAppButton large /><Link to="/demo" className="button button--secondary button--large">See sample plans</Link></div>
          <div className="trust-line"><LockKeyhole size={17} /><span>No account. No cloud database. Your plans stay in this browser.</span></div>
        </div>
        <div className="hero-visual" aria-label="Example lease action plan">
          <div className="example-card">
            <div className="example-top"><span className="category-icon"><Home size={22} /></span><span className="status status--soon">Coming soon</span></div>
            <p className="card-kicker">18 Maple Street</p><h2>Submit required notice</h2>
            <div className="countdown"><strong>60</strong><span>days before<br />lease end</span></div>
            <div className="date-bridge"><div><span>Act by</span><strong>November 1</strong></div><ChevronRight /><div><span>Lease ends</span><strong>December 31</strong></div></div>
            <p className="calculation-note"><CheckCircle2 size={18} /> Calculated from your 60-day notice period.</p>
          </div>
          <span className="floating-tag floating-tag--one"><Check size={15} /> Clear steps</span><span className="floating-tag floating-tag--two"><Calendar size={15} /> Calendar-ready</span>
        </div>
      </section>
      <section className="how-section" aria-labelledby="how-heading">
        <div className="section-heading"><p className="eyebrow">One date, a complete plan</p><h2 id="how-heading">The expiration date is not always the real deadline.</h2></div>
        <div className="steps-grid">
          <article><span>1</span><h3>Choose what matters</h3><p>Pick a lease, document, service, subscription, or custom deadline.</p></article>
          <article><span>2</span><h3>See when to act</h3><p>Transparent rules calculate earlier action dates and explain why.</p></article>
          <article><span>3</span><h3>Save and back up</h3><p>Your plans stay on this device. Download a backup so you can restore them if needed.</p></article>
        </div>
      </section>
      <section className="privacy-band"><div><ShieldCheck size={28} /><div><h2>Built for dates, never sensitive details.</h2><p>Use simple labels like “Passport renewal.” Never enter document numbers, passwords, financial details, medical information, or security answers.</p></div></div><Link to="/data-safety" className="text-link text-link--arrow">Read the simple safety guide <ArrowRight size={17} /></Link></section>
    </Page>
  )
}

function InstallAppButton({ large = false }: { large?: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  useEffect(() => {
    function capturePrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', capturePrompt)
    return () => window.removeEventListener('beforeinstallprompt', capturePrompt)
  }, [])
  async function install() {
    if (!installPrompt) {
      setHelpOpen(true)
      return
    }
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    setInstallPrompt(null)
    if (choice.outcome === 'dismissed') setHelpOpen(true)
  }
  return <><button type="button" className={`button button--secondary${large ? ' button--large' : ''}`} onClick={() => void install()}><Download size={large ? 19 : 18} /> Install app</button>{helpOpen && <Modal title="Install ActBeforeDue" onClose={() => setHelpOpen(false)}><p className="install-lede">Install keeps ActBeforeDue one tap away. Your plans still stay only on this device.</p><div className="install-steps"><div><strong>Chrome or Edge on a computer</strong><span>Open the browser menu (three dots), then choose <b>Install ActBeforeDue</b> or <b>Apps → Install this site as an app</b>.</span></div><div><strong>Safari on iPhone or iPad</strong><span>Tap <b>Share</b>, then choose <b>Add to Home Screen</b>.</span></div><div><strong>Already installed or no option?</strong><span>Your browser may not support installation. You can still use the website normally and it will save plans in this browser.</span></div></div><div className="modal-actions"><button className="button" onClick={() => setHelpOpen(false)}>Got it</button></div></Modal>}</>
}

function DashboardPage({ mode, items, loading, error, onReset, onRestore }: { mode: 'demo' | 'local'; items: TrackedItem[]; loading: boolean; error?: string; onReset?: () => void; onRestore?: (items: TrackedItem[]) => Promise<void> }) {
  const [filter, setFilter] = useState<'all' | Urgency>('all')
  const [exportOpen, setExportOpen] = useState(false)
  const sorted = useMemo(() => [...items].sort((a, b) => {
    const aDate = nextMilestone(a)?.date || '9999'
    const bDate = nextMilestone(b)?.date || '9999'
    return aDate.localeCompare(bDate)
  }), [items])
  const visible = filter === 'all' ? sorted : sorted.filter((item) => urgencyFor(item) === filter)
  const next = sorted.find((item) => nextMilestone(item))

  return (
    <Page mode={mode}>
      {mode === 'demo' && <div className="demo-banner"><div><Sparkles size={19} /><p><strong>You’re exploring sample plans.</strong><span>Changes here are temporary and do not affect your saved plans.</span></p></div><button className="text-button" onClick={onReset}><RotateCcw size={16} /> Reset samples</button></div>}
      {mode === 'local' && <div className="local-data-banner"><div><HardDrive size={21} /><p><strong>Saved only in this browser</strong><span>We cannot recover your plans. Download a backup after important changes.</span></p></div><button className="button button--secondary button--small" onClick={() => setExportOpen(true)}><Download size={16} /> Back up now</button></div>}
      <div className="page-title-row"><div><p className="eyebrow">Your action center</p><h1>{mode === 'demo' ? 'Explore a sample dashboard.' : 'Your dates, on this device.'}</h1><p>See what needs your attention next without creating an account.</p></div><div className="title-actions"><button className="button button--secondary" onClick={() => setExportOpen(true)} disabled={mode === 'demo' && !items.length}><FileSpreadsheet size={18} /> {mode === 'demo' ? 'Export samples' : 'Backup & export'}</button><Link to={mode === 'demo' ? '/demo/track' : '/track'} className="button"><Plus size={18} /> Track a date</Link></div></div>
      {mode === 'local' && <PrivacyNotice />}
      {error && <InlineAlert>{error}</InlineAlert>}
      {loading ? <DashboardSkeleton /> : !items.length ? <EmptyDashboard mode={mode} /> : <>
        {next && <NextAction item={next} mode={mode} />}
        <div className="dashboard-toolbar"><div><h2>Your plans</h2><p>{items.length} important date{items.length === 1 ? '' : 's'} tracked</p></div><div className="filter-row" aria-label="Filter plans">
          {(['all', 'act-now', 'coming-soon', 'on-track', 'completed'] as const).map((value) => <button key={value} className={filter === value ? 'filter-chip filter-chip--active' : 'filter-chip'} onClick={() => setFilter(value)}>{value === 'all' ? 'All' : urgencyCopy[value].label}<span>{value === 'all' ? items.length : items.filter((item) => urgencyFor(item) === value).length}</span></button>)}
        </div></div>
        {visible.length ? <div className="plans-grid">{visible.map((item) => <PlanCard key={item.id} item={item} mode={mode} />)}</div> : <div className="empty-inline"><h3>No plans match this filter.</h3><button className="text-link" onClick={() => setFilter('all')}>Show all plans</button></div>}
      </>}
      {exportOpen && <ExportDialog items={items} mode={mode} onRestore={onRestore} onClose={() => setExportOpen(false)} />}
    </Page>
  )
}

function NextAction({ item, mode }: { item: TrackedItem; mode: 'demo' | 'local' }) {
  const milestone = nextMilestone(item)!
  const days = daysFromToday(milestone.date)
  return <section className="next-card"><div className="next-card-main"><p className="eyebrow">Next action</p><div className="next-heading"><div><span className="category-label">{templateMap[item.templateType].shortTitle} · {item.name}</span><h2>{milestone.name}</h2></div><div className={days <= 7 ? 'days-box days-box--urgent' : 'days-box'}><strong>{days < 0 ? Math.abs(days) : days}</strong><span>{days < 0 ? 'days past due' : days === 1 ? 'day left' : 'days left'}</span></div></div><p className="next-explanation">{milestone.explanation}</p><div className="next-actions"><Link to={`${mode === 'demo' ? '/demo' : ''}/item/${item.id}`} className="button">View action plan</Link><a href={googleCalendarUrl(item, milestone)} target="_blank" rel="noreferrer" className="button button--secondary"><Calendar size={18} /> Add to calendar</a></div></div><div className="next-date"><Calendar size={21} /><div><span>Action date</span><strong>{formatDate(milestone.date)}</strong><small>{relativeDays(milestone.date)}</small></div></div></section>
}

function PlanCard({ item, mode }: { item: TrackedItem; mode: 'demo' | 'local' }) {
  const template = templateMap[item.templateType]
  const Icon = iconMap[template.icon as keyof typeof iconMap]
  const urgency = urgencyFor(item)
  const next = nextMilestone(item)
  const completed = item.milestones.filter((entry) => entry.completed).length
  return <Link to={`${mode === 'demo' ? '/demo' : ''}/item/${item.id}`} className="plan-card"><div className="plan-card-top"><span className="category-icon"><Icon size={21} /></span><span className={`status status--${urgency}`}>{urgencyCopy[urgency].label}</span></div><p className="card-kicker">{template.shortTitle}</p><h3>{item.name}</h3>{next ? <div className="plan-next"><span>Next</span><strong>{next.name}</strong><p><Calendar size={15} /> {formatDate(next.date)} · {relativeDays(next.date)}</p></div> : <div className="plan-next plan-next--complete"><CheckCircle2 /><strong>All milestones complete</strong></div>}<div className="progress-line"><span style={{ width: `${(completed / item.milestones.length) * 100}%` }} /></div><div className="plan-footer"><span>{completed} of {item.milestones.length} done</span><ArrowRight size={18} /></div></Link>
}

function TrackFlow({ mode, onSave }: { mode: 'demo' | 'local'; onSave: (item: TrackedItem) => Promise<void> }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<TemplateType | null>(null)
  const [draft, setDraft] = useState<TrackedItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const destination = mode === 'demo' ? '/demo' : '/dashboard'

  async function save() {
    if (!draft) return
    setSaving(true); setError('')
    try { await onSave(draft); navigate(`${mode === 'demo' ? '/demo' : ''}/item/${draft.id}`, { state: { saved: true } }) }
    catch { setError('Your plan could not be saved. Your changes are still here. Please try again.') }
    finally { setSaving(false) }
  }

  if (draft) return <Page mode={mode}><ReviewPlan item={draft} onChange={setDraft} onBack={() => setDraft(null)} onSave={save} saving={saving} error={error} /></Page>
  if (selected) return <Page mode={mode}><TemplateForm template={templateMap[selected]} onBack={() => setSelected(null)} onSubmit={(values) => { const { safeData: _safeData, ...planValues } = values; setDraft(generatePlan(selected, planValues)) }} /></Page>
  return <Page mode={mode}><section className="content-page"><Link to={destination} className="back-link"><ArrowLeft size={17} /> Back to dashboard</Link><div className="narrow-heading"><p className="eyebrow">Create an action plan</p><h1>What do you want to track?</h1><p>Choose the option that best matches your important date.</p></div><div className="template-grid">{templates.map((template) => { const Icon = iconMap[template.icon as keyof typeof iconMap]; return <button key={template.type} className="template-card" onClick={() => setSelected(template.type)}><span className="category-icon category-icon--large"><Icon /></span><span><strong>{template.title}</strong><small>{template.description}</small></span><ChevronRight /></button> })}</div><PrivacyNotice /></section></Page>
}

function TemplateForm({ template, onBack, onSubmit }: { template: TemplateDefinition; onBack: () => void; onSubmit: (values: Record<string, string>) => void }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Record<string, string>>({
    defaultValues: Object.fromEntries(template.fields.map((field) => [field.key, field.options?.[0]?.value || ''])),
  })
  const Icon = iconMap[template.icon as keyof typeof iconMap]
  return <section className="form-page"><button className="back-link" onClick={onBack}><ArrowLeft size={17} /> Choose another type</button><div className="form-heading"><span className="category-icon category-icon--large"><Icon /></span><div><p className="eyebrow">Create an action plan</p><h1>Track your {template.title.toLowerCase()}</h1><p>Enter the date you know. We’ll calculate when to start acting.</p></div></div><form onSubmit={handleSubmit(onSubmit)} noValidate><div className="form-card"><Field label={template.nameLabel} error={errors.name?.message}><input {...register('name', { required: `${template.nameLabel} is required.` })} placeholder={template.namePlaceholder} aria-invalid={Boolean(errors.name)} /></Field><Field label={template.dateLabel} error={errors.importantDate?.message}><input type="date" {...register('importantDate', { required: `${template.dateLabel} is required.` })} aria-invalid={Boolean(errors.importantDate)} /></Field>{template.fields.map((field) => {
    if (field.showWhen && !field.showWhen.values.includes(watch(field.showWhen.key))) return null
    const validation = field.required ? { required: `${field.label} is required.` } : undefined
    return <Field key={field.key} label={field.label} help={field.help} error={errors[field.key]?.message}>{field.type === 'select' ? <select {...register(field.key, validation)} aria-invalid={Boolean(errors[field.key])}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === 'textarea' ? <textarea {...register(field.key, validation)} placeholder={field.placeholder} /> : <input type={field.type} {...register(field.key, validation)} placeholder={field.placeholder} min={field.type === 'number' ? 0 : undefined} aria-invalid={Boolean(errors[field.key])} />}</Field>
  })}<Field label="Notes" help="Optional"><textarea {...register('notes')} placeholder="Example: Check the official renewal page. Never add private numbers or details." rows={4} /></Field>{template.disclaimer && <InlineAlert tone="info">{template.disclaimer}</InlineAlert>}<PrivacyNotice compact /><label className="safety-check"><input type="checkbox" {...register('safeData', { required: 'Please confirm that you did not enter sensitive information.' })} /><span><strong>I used dates and simple labels only.</strong><small>I did not enter sensitive or private information.</small></span></label>{errors.safeData && <span className="field-error"><AlertCircle size={15} />{errors.safeData.message}</span>}</div><div className="form-actions"><button type="button" className="button button--secondary" onClick={onBack}>Cancel</button><button className="button" type="submit">Create action plan <ArrowRight size={18} /></button></div></form></section>
}

function Field({ label, help, error, children }: { label: string; help?: string; error?: string; children: ReactNode }) {
  return <label className="field"><span className="field-label">{label}{help && <small>{help}</small>}</span>{children}{error && <span className="field-error"><AlertCircle size={15} />{error}</span>}</label>
}

function ReviewPlan({ item, onChange, onBack, onSave, saving, error }: { item: TrackedItem; onChange: (item: TrackedItem) => void; onBack: () => void; onSave: () => void; saving: boolean; error: string }) {
  function updateMilestone(id: string, patch: Partial<Milestone>) { onChange({ ...item, milestones: item.milestones.map((entry) => entry.id === id ? { ...entry, ...patch, manuallyEdited: true } : entry).sort((a, b) => a.date.localeCompare(b.date)) }) }
  function remove(id: string) { onChange({ ...item, milestones: item.milestones.filter((entry) => entry.id !== id) }) }
  function add() { onChange({ ...item, milestones: [...item.milestones, { id: crypto.randomUUID(), name: 'New milestone', date: item.importantDate, explanation: 'You added this milestone.', completed: false, userCreated: true }] }) }
  return <section className="review-page"><button className="back-link" onClick={onBack}><ArrowLeft size={17} /> Edit details</button><div className="review-heading"><div><p className="eyebrow">Check before saving</p><h1>Review your action plan</h1><p>Change, remove, or add any step. Dates are sorted automatically.</p></div><div className="important-date"><span>{item.importantDateLabel}</span><strong>{formatDate(item.importantDate)}</strong><small>{item.name}</small></div></div>{error && <InlineAlert>{error}</InlineAlert>}<div className="explanation-card"><div><CheckCircle2 /><div><strong>How we calculated this</strong><p>{item.milestones.find((entry) => entry.name.toLowerCase().includes('notice'))?.explanation || item.milestones[0]?.explanation}</p></div></div><span>Transparent rule</span></div><div className="timeline-card"><div className="timeline-heading"><div><h2>Your timeline</h2><p>{item.milestones.length} milestones</p></div><button className="button button--secondary button--small" onClick={add}><Plus size={16} /> Add milestone</button></div><div className="editable-timeline">{item.milestones.map((entry, index) => <div className="editable-row" key={entry.id}><div className="timeline-node"><span>{index + 1}</span>{index < item.milestones.length - 1 && <i />}</div><div className="editable-fields"><input value={entry.name} onChange={(event) => updateMilestone(entry.id, { name: event.target.value })} aria-label={`Milestone ${index + 1} name`} /><input type="date" value={entry.date} onChange={(event) => updateMilestone(entry.id, { date: event.target.value })} aria-label={`Milestone ${index + 1} date`} /><p>{entry.explanation}</p></div><button className="icon-button icon-button--danger" onClick={() => remove(entry.id)} aria-label={`Remove ${entry.name}`}><Trash2 size={18} /></button></div>)}</div></div><div className="review-actions"><button className="button button--secondary" onClick={onBack}>Edit details</button><button className="button button--large" onClick={onSave} disabled={saving || !item.milestones.length}>{saving ? 'Saving…' : 'Save action plan'} {!saving && <ArrowRight size={18} />}</button></div></section>
}

function ItemPage({ mode, items, onUpdate, onDelete }: { mode: 'demo' | 'local'; items: TrackedItem[]; onUpdate: (item: TrackedItem) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const item = items.find((entry) => entry.id === id)
  const [calendarOpen, setCalendarOpen] = useState<Milestone | null>(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [downloadMessage, setDownloadMessage] = useState('')
  if (!item) return <Page mode={mode}><div className="empty-page"><AlertCircle /><h1>Plan not found</h1><p>This plan may have been removed from this browser.</p><Link to={mode === 'demo' ? '/demo' : '/dashboard'} className="button">Return to dashboard</Link></div></Page>
  const currentItem = item

  async function toggle(entry: Milestone) {
    setBusy(entry.id); setError('')
    try { await onUpdate({ ...currentItem, milestones: currentItem.milestones.map((milestone) => milestone.id === entry.id ? { ...milestone, completed: !milestone.completed } : milestone) }) }
    catch { setError('We could not update this milestone. Please try again.') }
    finally { setBusy('') }
  }
  async function remove() {
    if (!window.confirm('Delete this plan? This cannot be undone. Calendar files or events you already exported will not be removed.')) return
    try { await onDelete(currentItem.id); navigate(mode === 'demo' ? '/demo' : '/dashboard') } catch { setError('We could not delete this plan. Please try again.') }
  }
  function downloadCalendar(milestones: Milestone[]) {
    downloadIcs(currentItem, milestones)
    setDownloadMessage(`Downloaded ${milestones.length === 1 ? '1 event' : `${milestones.length} events`}. Open the calendar file from your browser downloads to add it to your preferred calendar app.`)
  }
  const next = nextMilestone(item)
  const template = templateMap[item.templateType]
  const Icon = iconMap[template.icon as keyof typeof iconMap]
  return <Page mode={mode}><section className="details-page"><Link to={mode === 'demo' ? '/demo' : '/dashboard'} className="back-link"><ArrowLeft size={17} /> Back to dashboard</Link>{location.state?.saved && <div className="success-banner"><CheckCircle2 /><div><strong>Action plan saved</strong><span>Your next step is ready below.</span></div></div>}{downloadMessage && <div className="success-banner" role="status"><Download /><div><strong>Calendar file ready</strong><span>{downloadMessage}</span></div></div>}{error && <InlineAlert>{error}</InlineAlert>}<div className="detail-hero"><div><div className="detail-category"><span className="category-icon category-icon--large"><Icon /></span><span>{template.title}</span></div><h1>{item.name}</h1><p>{item.notes || 'A clear timeline for this important date.'}</p></div><div className="detail-actions"><button className="button button--secondary" onClick={() => downloadCalendar(item.milestones)}><Download size={18} /> Download calendar plan</button><button className="icon-button icon-button--danger" onClick={remove} aria-label="Delete plan"><Trash2 size={19} /></button></div></div>{next ? <div className="detail-next"><div><p className="eyebrow">Next action</p><h2>{next.name}</h2><p>{next.explanation}</p><button className="button button--secondary button--small" onClick={() => setCalendarOpen(next)}><Calendar size={17} /> Add to calendar</button></div><div className="detail-countdown"><strong>{Math.abs(daysFromToday(next.date))}</strong><span>{daysFromToday(next.date) < 0 ? 'days past due' : 'days left'}</span><small>{formatDate(next.date)}</small></div></div> : <div className="completion-card"><CheckCircle2 /><div><h2>This plan is complete.</h2><p>You finished all of its milestones.</p></div></div>}<div className="detail-grid"><section className="timeline-card timeline-card--details"><div className="timeline-heading"><div><h2>Your timeline</h2><p>{item.milestones.filter((entry) => entry.completed).length} of {item.milestones.length} complete</p></div></div><div className="detail-timeline">{item.milestones.map((entry) => <article key={entry.id} className={entry.completed ? 'detail-row detail-row--complete' : 'detail-row'}><button onClick={() => toggle(entry)} disabled={busy === entry.id} className="check-button" aria-label={`${entry.completed ? 'Mark incomplete' : 'Mark complete'}: ${entry.name}`}>{entry.completed && <Check size={16} />}</button><div><span>{formatDate(entry.date)} · {relativeDays(entry.date)}</span><h3>{entry.name}</h3><p>{entry.explanation}</p><div className="row-actions"><button onClick={() => setCalendarOpen(entry)} className="text-button"><Calendar size={15} /> Add to calendar</button></div></div></article>)}</div></section><aside className="detail-sidebar"><div className="summary-card"><h2>Plan details</h2><dl><div><dt>Important date</dt><dd>{formatDate(item.importantDate)}</dd></div><div><dt>Type</dt><dd>{template.title}</dd></div><div><dt>Milestones</dt><dd>{item.milestones.length}</dd></div><div><dt>Last updated</dt><dd>{new Date(item.updatedAt).toLocaleDateString()}</dd></div></dl></div><PrivacyNotice compact /></aside></div>{calendarOpen && <CalendarDialog item={item} milestone={calendarOpen} onClose={() => setCalendarOpen(null)} />}</section></Page>
}

function CalendarDialog({ item, milestone, onClose }: { item: TrackedItem; milestone: Milestone; onClose: () => void }) {
  const [downloaded, setDownloaded] = useState(false)
  function downloadCalendarFile() {
    downloadIcs(item, [milestone])
    setDownloaded(true)
  }
  return <Modal title="Add this milestone to your calendar" onClose={onClose}><div className="event-preview"><span>Event</span><strong>{milestone.name} — {item.name}</strong><span>Date</span><strong>{formatDate(milestone.date)}</strong><span>Description</span><p>{milestone.explanation}</p></div><p className="fine-print">Choose Google Calendar, or download a calendar file that opens in Apple Calendar, Outlook, and most other calendar apps. ActBeforeDue does not access your calendar.</p>{downloaded && <div className="download-confirmation" role="status"><CheckCircle2 size={18} /><span>Calendar file downloaded. Open it from your browser downloads.</span></div>}<div className="modal-actions"><button className="button button--secondary" onClick={downloadCalendarFile}><Download size={18} /> Download calendar file</button><a className="button" href={googleCalendarUrl(item, milestone)} target="_blank" rel="noreferrer" onClick={onClose}>Open Google Calendar <ArrowRight size={18} /></a></div></Modal>
}

function ExportDialog({ items, mode, onRestore, onClose }: { items: TrackedItem[]; mode: 'demo' | 'local'; onRestore?: (items: TrackedItem[]) => Promise<void>; onClose: () => void }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function restore(file: File | undefined) {
    if (!file || !onRestore) return
    setError(''); setMessage('')
    try {
      const restored = await readBackupFile(file)
      if (!window.confirm(`Restore ${restored.length} plan${restored.length === 1 ? '' : 's'}? This replaces the plans currently saved in this browser.`)) return
      await onRestore(restored)
      setMessage(`${restored.length} plan${restored.length === 1 ? '' : 's'} restored.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'That backup could not be restored.')
    }
  }
  return <Modal title={mode === 'demo' ? 'Export sample plans' : 'Back up your plans'} onClose={onClose}><div className="backup-choice"><article><span className="large-icon"><HardDrive /></span><div><strong>Backup file</strong><p>Saves everything needed to restore your plans later.</p></div><button className="button" disabled={!items.length} onClick={() => { downloadBackup(items); setMessage('Backup downloaded. Keep it somewhere safe.') }}><Download size={18} /> Download backup</button></article><article><span className="large-icon"><FileSpreadsheet /></span><div><strong>Spreadsheet</strong><p>A readable list for Excel or Google Sheets. It cannot restore the app.</p></div><button className="button button--secondary" disabled={!items.length} onClick={() => downloadDashboardCsv(items)}><Download size={18} /> Download CSV</button></article></div>{mode === 'local' && <div className="restore-box"><div><Upload size={20} /><div><strong>Restore a backup</strong><p>This replaces the plans in this browser.</p></div></div><label className="button button--secondary button--small">Choose backup<input type="file" accept=".json,application/json" onChange={(event) => void restore(event.target.files?.[0])} /></label></div>}{message && <div className="download-confirmation" role="status"><CheckCircle2 size={18} /><span>{message}</span></div>}{error && <InlineAlert>{error}</InlineAlert>}<PrivacyNotice compact /><div className="modal-actions"><button className="button button--secondary" onClick={onClose}>Done</button></div></Modal>
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><h2 id="modal-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X /></button></div>{children}</section></div>
}

function SettingsPage({ items, onRestore, onClear }: { items: TrackedItem[]; onRestore: (items: TrackedItem[]) => Promise<void>; onClear: () => Promise<void> }) {
  const navigate = useNavigate()
  const [backupOpen, setBackupOpen] = useState(false)
  async function clearAll() {
    if (!window.confirm('Delete every plan saved in this browser? This cannot be undone. Download a backup first if you may need them later.')) return
    await onClear()
    navigate('/dashboard')
  }
  return <Page mode="local"><section className="settings-page"><Link to="/dashboard" className="back-link"><ArrowLeft size={17} /> Back to dashboard</Link><div className="narrow-heading"><p className="eyebrow">This device</p><h1>Backup and settings</h1><p>Your plans are saved in this browser. There is no account and no cloud copy.</p></div><div className="settings-card settings-card--featured"><HardDrive size={27} /><div><h2>Protect your plans</h2><p>Download a backup after important changes. Keep the file somewhere you can find again, such as an encrypted drive or your own trusted storage.</p><button className="button" onClick={() => setBackupOpen(true)}><Download size={18} /> Backup or restore</button></div></div><div className="settings-card"><h2>Install the app</h2><p>Choose the button below. If your browser supports installation, it will show the install prompt. Otherwise, it will show the exact steps for your browser.</p><InstallAppButton /><InlineAlert tone="info">Installing does not create a cloud backup. Your plans still stay on this device.</InlineAlert></div><div className="settings-card"><h2>Understand your data</h2><div className="policy-links"><Link to="/data-safety">Data safety guide <ArrowRight size={16} /></Link><Link to="/privacy">Privacy policy <ArrowRight size={16} /></Link><Link to="/terms">Terms and deadline disclaimer <ArrowRight size={16} /></Link></div></div><div className="settings-card settings-card--danger"><h2>Delete local plans</h2><p>This permanently removes all {items.length} plan{items.length === 1 ? '' : 's'} from this browser.</p><button className="button button--danger" disabled={!items.length} onClick={() => void clearAll()}>Delete all plans</button></div>{backupOpen && <ExportDialog items={items} mode="local" onRestore={onRestore} onClose={() => setBackupOpen(false)} />}</section></Page>
}

function PolicyPage({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return <Page><article className="policy-page"><Link to="/" className="back-link"><ArrowLeft size={17} /> Back home</Link>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p className="policy-date">Effective July 19, 2026</p>{children}<div className="policy-callout"><Info size={21} /><p>Questions or security concerns can be reported through the project’s GitHub repository. Do not include private information in a public issue.</p></div></article></Page>
}

function PrivacyPolicy() {
  return <PolicyPage title="Privacy policy"><h2>The short version</h2><p>ActBeforeDue does not require an account. Your plans are stored in your browser on your device. The app does not send your plans to an ActBeforeDue database because there is no app database.</p><h2>Information you enter</h2><p>Plan names, dates, notes, and milestones stay in this browser unless you choose to export or share them. Never enter document numbers, passwords, financial details, medical information, security answers, or other sensitive data.</p><h2>Calendar choices</h2><p>If you choose Google Calendar, the event details are placed in a Google Calendar link and sent to Google when you open it. If you download a calendar file, it stays in your downloads until you move, share, or delete it.</p><h2>Hosting records</h2><p>The company that hosts the public website may keep ordinary technical logs, such as an IP address, browser type, and request time. ActBeforeDue does not add analytics, advertising trackers, or marketing cookies.</p><h2>Your control</h2><p>You can delete individual plans or all local plans from Settings. You can also clear this site’s browser data. Exported backup, CSV, and calendar files must be deleted separately.</p></PolicyPage>
}

function DataSafetyPolicy() {
  return <PolicyPage eyebrow="Read this first" title="Keep your plans safe"><div className="never-store"><ShieldCheck size={28} /><div><h2>Never store sensitive information here</h2><p>Use a simple label such as “Passport renewal” or “Insurance review.” Do not type document numbers, account numbers, passwords, payment details, medical details, security answers, or copies of documents.</p></div></div><h2>Where plans are saved</h2><p>Plans are saved only in this browser on this device. They do not automatically appear on another phone, computer, browser, or browser profile.</p><h2>Make a backup</h2><ol><li>Open <strong>Backup & export</strong> from your dashboard.</li><li>Choose <strong>Download backup</strong>.</li><li>Keep the file in a trusted place you control.</li><li>Repeat after important changes.</li></ol><h2>When data can be lost</h2><p>Your plans may disappear if you clear browser data, use private browsing, uninstall the browser, reset or lose the device, or if the device’s storage fails. ActBeforeDue cannot recover them.</p><h2>Restoring</h2><p>Choose <strong>Restore a backup</strong> and select an ActBeforeDue backup file. Restoring replaces the plans currently stored in that browser, so back up the current plans first.</p></PolicyPage>
}

function TermsPolicy() {
  return <PolicyPage eyebrow="Terms of use" title="Use ActBeforeDue responsibly"><h2>Informational tool</h2><p>ActBeforeDue helps organize dates and creates suggested milestones from the information you enter. It does not provide legal, financial, immigration, medical, insurance, or other professional advice.</p><h2>Verify every deadline</h2><p>Rules, contracts, agencies, and personal circumstances can differ. You are responsible for checking every date and requirement with the relevant document, provider, agency, professional, or official source.</p><h2>No guarantee</h2><p>The software is provided free of charge and “as is,” without promises that calculations, availability, exports, local storage, or reminders will always be correct or uninterrupted.</p><h2>Your responsibility</h2><p>You are responsible for what you enter, for avoiding sensitive information, for maintaining backups, and for acting before your actual deadline. To the extent allowed by law, the project’s contributors are not responsible for missed deadlines, lost local data, or decisions made using the app.</p><h2>Open-source software</h2><p>The source code may be inspected, copied, and modified under the license included with the public repository. Modified or separately hosted copies are controlled by their own operators, not by the original ActBeforeDue project.</p></PolicyPage>
}

function EmptyDashboard({ mode }: { mode: 'demo' | 'local' }) { return <div className="empty-dashboard"><span className="large-icon"><CalendarPlus /></span><h2>No dates tracked yet</h2><p>Add an important date and we’ll turn it into a clear action plan saved in this browser.</p><Link to={mode === 'demo' ? '/demo/track' : '/track'} className="button">Track a date</Link></div> }
function DashboardSkeleton() { return <div className="skeleton-wrap"><div className="skeleton skeleton--hero" /><div className="skeleton-grid"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div></div> }
function NotFound() { return <Page><div className="empty-page"><AlertCircle /><h1>Page not found</h1><p>The page you’re looking for may have moved.</p><Link to="/" className="button">Go home</Link></div></Page> }
function InlineAlert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'info' }) { return <div className={`inline-alert inline-alert--${tone}`}><AlertCircle size={19} /><span>{children}</span></div> }
function PrivacyNotice({ compact = false }: { compact?: boolean }) { return <div className={compact ? 'privacy-note privacy-note--compact' : 'privacy-note'}><ShieldCheck size={21} /><div><strong>Never enter sensitive information</strong><p>Use simple labels only. No document or account numbers, passwords, payment details, medical information, security answers, or document copies.</p></div></div> }
