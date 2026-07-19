# ActBeforeDue

**Track important dates. Know when to act.**

ActBeforeDue is a free, local-first web app that turns expiration, renewal, and other important dates into clear action plans with earlier milestones.

## Privacy model

- No account or sign-in
- No application database
- Plans stay in IndexedDB in the user's browser
- No analytics, advertising trackers, or marketing cookies
- JSON backup and restore for portability
- CSV and calendar exports when the user chooses

Users should never enter document numbers, account numbers, passwords, payment details, medical information, security answers, or document copies. This app is for dates and simple reminders only.

## Local development

```bash
npm install
npm run dev
```

No environment variables, API keys, or external services are required.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

## Publishing

The production build is a static PWA. Any static host that supports single-page application fallbacks can serve the `dist` directory. Configure unknown routes to return `index.html`.

## Data limitations

Browser data can be lost if a user clears site data, uses private browsing, removes the browser, resets the device, or loses the device. The UI tells users to download backups after important changes. ActBeforeDue cannot recover local plans.

## Security

Please read [SECURITY.md](SECURITY.md). Do not include private user information in public GitHub issues.

## License

MIT. See [LICENSE](LICENSE).
