# ActBeforeDue - built with Codex and GPT-5.6

**Track important dates. Know when to act.**

ActBeforeDue is a free, local-first planning app for turning an important date into a practical sequence of earlier actions. It helps people prepare for renewals, expirations, moves, subscriptions, and other deadlines before the last minute. 
## Live demo

Try the app at [act-before-due.vercel.app](https://act-before-due.vercel.app/)
<img width="1241" height="719" alt="image" src="https://github.com/user-attachments/assets/ad634de6-c2ff-4941-9681-e1402f89a637" />


## The problem it solves

Knowing an expiration or renewal date is not always enough. Many real life deadlines require notice, appointments, documents, comparison shopping, or follow-up well before the final date. ActBeforeDue works backward from the date you provide and gives you an editable action plan, so there is time to prepare instead of reacting late.

## What ActBeforeDue does

Create a plan for an important date, review the recommended milestones, and keep track of what is complete. The app is designed for simple personal planning, not for storing sensitive records or replacing official guidance.

## Main features

- Guided planning templates for leases, passports, visas and immigration documents, driver’s licenses, vehicle registrations, insurance, subscriptions and free trials, warranties, professional licenses, utilities, and custom deadlines.
- Automatically generated, editable milestones based on the date and planning choices you provide.
- A dashboard that highlights the next action and sorts plans by urgency.
- Completion tracking for individual milestones.
- Calendar export: download an `.ics` calendar file or open an event in Google Calendar.
- Data portability: download JSON backups, restore them later, and export plans to CSV.
- Installable progressive web app (PWA) experience for supported browsers.
- Local-first design: no account, sign-in, application database, analytics, or advertising trackers.

### Prerequisites

- Node.js 20 or later
- npm

### Start the development server

```bash
git clone <your-repository-url>
cd APP-actbeforedue
npm install
npm run dev
```

Vite will print the local URL, normally `http://localhost:5173`.

## Test and verify

Run the checks used for this project before publishing changes:

```bash
npm run typecheck
npm test
npm run build
```

- `npm run typecheck` checks TypeScript types.
- `npm test` runs the Vitest test suite.
- `npm run build` creates a production build in `dist/`.

To preview the production output locally after building, run:

```bash
npx vite preview
```

## How Codex and GPT-5.6 were used

Codex and GPT-5.6 were used as development assistants during this project. Their role was to accelerate planning, implementation, review, and documentation - not to make product decisions independently or operate the deployed application.

Assisted with:

- Exploring and refining the React user interface and flows for creating, viewing, and editing plans.
- Implementing and reviewing date planning rules, editable milestone lists, and the local-first IndexedDB data model.
- Developing backup, CSV, and calendar export functionality, along with supporting validation and user facing copy.
- Writing and improving automated tests, then running TypeScript, test-suite, production-build, and dependency audit checks during development.
- Reviewing the repository for public release risks, including exposed credentials, unexpected network activity, unsafe data handling, browser storage, service worker behavior, and deployment security configuration.
- Drafting and improving project documentation, including this README and the security policy.

The project author reviewed the resulting code and documentation, decided what to keep, and remains responsible for testing, deployment, maintenance, and user support. AI-generated output can contain mistakes, so it was treated as a starting point and validated against the actual application.

Codex and GPT-5.6 do not run in the production app, do not operate the live deployment, and do not receive or retain users' plan data through ActBeforeDue. The deployed app remains local-first: plans are stored in the user's browser unless the user explicitly exports them or chooses to open a Google Calendar link.

## Technologies used

- [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for local development and production builds
- [React Router](https://reactrouter.com/) for client-side routing
- [React Hook Form](https://react-hook-form.com/) for forms
- [date-fns](https://date-fns.org/) for date calculations
- [Lucide](https://lucide.dev/) for icons
- Browser IndexedDB for on-device storage
- Service worker and web app manifest for PWA support
- [Vitest](https://vitest.dev/) and Testing Library for tests
- [Vercel](https://vercel.com/) for the live deployment

## Known limitations

- Plans are stored only in the current browser on the current device. Clearing site data, private browsing, browser removal, device reset, or device loss can remove them permanently.
- ActBeforeDue cannot recover local plans. Download a JSON backup after important changes and store it somewhere you trust.
- Calendar files and Google Calendar events are exports; changing or deleting a plan does not update an event that was already exported.
- Suggested timelines are planning aids, not legal, immigration, travel, insurance, licensing, contractual, or financial advice. Always confirm requirements and dates with the relevant authority or provider.
- The app does not send notifications by itself. Use the calendar export if you want calendar reminders.

## Privacy and security notes

ActBeforeDue is intentionally local-first:

- It has no user accounts, sign-in flow, application backend, or application database.
- Plans are saved in IndexedDB in your browser and are not sent to an ActBeforeDue server.
- There are no analytics, advertising trackers, or marketing cookies.
- Selecting **Google Calendar** opens a Google Calendar link containing the event details you chose to export. Downloaded calendar, CSV, and JSON backup files are handled by your browser and should be treated as private.
- Browser storage and exported files are not encrypted by this app. Anyone who can access an unlocked device or browser profile may be able to view them.

Do not enter document numbers, account numbers, passwords, payment details, medical information, security answers, or document copies. Use nicknames and dates only.

For vulnerability reporting, see [SECURITY.md](SECURITY.md). Please do not put sensitive information or exploit details in public issues.

## License

MIT. See [LICENSE](LICENSE).
