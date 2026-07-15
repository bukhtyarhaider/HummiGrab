<div align="center">

# HummiGrab 🐦

**A fast YouTube research toolkit for media downloads, transcripts, summaries, and audience sentiment.**

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Flask API](https://img.shields.io/badge/Backend-Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://github.com/bukhtyarhaider/HummiGrab-api)

</div>

HummiGrab combines a lightweight React interface with a Flask backend to help users inspect a YouTube video, choose an available format, monitor download progress, generate a transcript, create a concise summary, and analyze comment sentiment from one workspace.

## What it can do

- Read video information and available media formats from a YouTube URL
- Download supported formats with live progress feedback
- Generate and display video transcripts
- Produce a readable content summary or gist
- Analyze comments as positive, negative, or neutral
- Show sentiment totals, percentages, polarity, and subjectivity
- Save recent video history in browser storage
- Handle standard, shortened, embedded, and Shorts URLs

## Architecture

```text
React + TypeScript client
        │
        ├── video info / formats
        ├── download progress
        ├── transcript + summary
        └── comment sentiment
        │
        ▼
Flask API: github.com/bukhtyarhaider/HummiGrab-api
```

| Component | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Styling and motion | Tailwind CSS, Framer Motion |
| Requests | Axios |
| Notifications | React Toastify |
| Backend | Python, Flask |
| Persistence | Browser local storage |

## Run the frontend locally

```bash
git clone https://github.com/bukhtyarhaider/HummiGrab.git
cd HummiGrab
npm install
npm run dev
```

The frontend sends requests to `/api`. Run the companion [HummiGrab API](https://github.com/bukhtyarhaider/HummiGrab-api) and configure your local proxy or deployment routing so `/api` reaches that service.

## Available scripts

```bash
npm run dev      # start the Vite development server
npm run build    # type-check and build for production
npm run lint     # run ESLint
npm run preview  # preview the production build
```

## Responsible use

Use HummiGrab only for content you own, content you have permission to download, or uses permitted by applicable law and the platform's terms. This project is an educational tool; users are responsible for how they use it.

## Roadmap

- Improve deployment documentation for the frontend/API pair
- Add automated tests for URL handling and API states
- Make long transcript and sentiment jobs resumable
- Add clearer format metadata and file-size estimates
- Improve accessibility and keyboard navigation

## Contributing

Bug reports and pull requests are welcome. Please describe the affected video flow, expected behavior, browser, and any relevant API response without sharing private data.

---

Built by [Bukhtyar Haider](https://github.com/bukhtyarhaider) · Backend: [HummiGrab-api](https://github.com/bukhtyarhaider/HummiGrab-api)
