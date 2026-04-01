# CrisisSync 🚨

> AI-powered emergency coordination platform — report incidents, triage with Gemini, and auto-dispatch the right responders instantly.

---

## Problem Statement

During emergencies, the gap between an incident being reported and the right responder being notified costs lives. Bystanders don't know which authority to contact, call centres are overloaded, and critical information (location, severity, type) is lost in translation. There is no fast, structured, AI-assisted pipeline that takes a plain-language distress report and immediately routes it to the correct emergency services with full context.

---

## Project Description

**CrisisSync** is a real-time emergency coordination web app. A user submits a distress report (typed or via voice input) and their current GPS location. The platform immediately:

1. **AI Triage** — Sends the description to **Google Gemini 2.0 Flash**, which classifies the emergency type (Medical, Fire, Accident, Security Threat, Natural Disaster), assigns a severity level (Low → Critical), lists key risks, recommends immediate actions, and identifies which responder agencies to notify.
2. **Intelligent Fallback Classifier** — A local keyword-weight engine runs in parallel; if Gemini is unavailable it handles classification without downtime.
3. **Authority Routing** — Based on the AI output, an automatic dispatch plan is built: Fire → Fire Control Room, Medical → EMS + Police, etc. Each record contains the channel (SMS, App inbox, Priority SMS), target contact, and a structured JSON payload.
4. **Live Dispatch Log** — All dispatches are persisted in **Supabase** (PostgreSQL + Realtime) so operators can monitor every alert in real time, with local-storage fallback for offline resilience.
5. **Location Sync** — An embedded **Google Maps** view pins the incident coordinates, allowing responders to navigate directly.
6. **Auto Alert Plan** — Calculates nearby users within a risk radius and suggests broadcast channels (SMS, Email, In-app).

### What makes it useful
- **Zero ambiguity** — AI converts free-text into a structured JSON triage before anything is sent.
- **Right responders, right channels** — Authority routing logic ensures Fire goes to Fire Control, Medical goes to EMS, disasters go to the Disaster Cell.
- **Works offline-first** — LocalStorage fallback means no incident is lost even if Supabase is unreachable.
- **Hackathon-ready demo** — Sample incident loader, simulated dispatch mode, and a live coordination feed allow full end-to-end demonstration without real infrastructure.

---

## Google AI Usage

### Tools / Models Used
- **Google Gemini 2.0 Flash** (`gemini-2.0-flash`) via the Generative Language REST API
- **Google Maps JavaScript API** (live incident map with coordinate pinning)

### How Google AI Was Used

When a user submits a distress report, CrisisSync calls `classifyWithGemini()` in [`src/lib/gemini.js`](./src/lib/gemini.js):

```js
// Prompt sent to Gemini 2.0 Flash
"You are an AI emergency response classifier.
Analyze this emergency report and return a structured JSON:
- type (Fire / Medical / Accident / Security Threat / Natural Disaster / Other)
- severity (Low / Medium / High / Critical)
- risks []
- actions []
- responders []"
```

Gemini's response (strict JSON mode, `temperature: 0.2`) drives the entire downstream pipeline — authority selection, dispatch payload construction, and the alert shown to the user. The response is parsed and validated before use, with a local classifier as fallback.

**Google Maps** is loaded dynamically via [`src/lib/googleMapsLoader.js`](./src/lib/googleMapsLoader.js) and rendered in [`src/components/GoogleIncidentMap.jsx`](./src/components/GoogleIncidentMap.jsx) to display a live pin at the reported incident coordinates.

---

## Proof of Google AI Usage

Screenshots showing live Gemini API responses are in the `/proof` folder:

![AI Triage Output - Gemini classifying a bus collision as Medical/High severity](./proof/screenshot1.png)
![Authority Dispatch Log - Gemini-driven responders auto-routed to Police & EMS](./proof/screenshot2.png)
![Location Sync - Google Maps live pin at incident coordinates](./proof/screenshot3.png)

---

## Screenshots

![CrisisSync Dashboard — AI Triage Panel](./assets/screenshot1.png)
![Authority Dispatch Log with live responder routing](./assets/screenshot2.png)
![Google Maps Location Sync and Auto Alert Plan](./assets/screenshot3.png)

---

## Demo Video

Upload your demo video to Google Drive and paste the shareable link here (max 3 minutes).

[▶ Watch Demo](#)

---

## Installation Steps

```bash
# Clone the repository
git clone https://github.com/asvingeorge/crisissync

# Go to project folder
cd crisissync

# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file with the following keys:
cp .env.local.example .env.local
# Then fill in your own API keys:
#   VITE_GEMINI_API_KEY       — Google Gemini API key
#   VITE_GEMINI_MODEL         — gemini-2.0-flash (default)
#   VITE_GOOGLE_MAPS_API_KEY  — Google Maps JavaScript API key
#   VITE_SUPABASE_URL         — Your Supabase project URL
#   VITE_SUPABASE_ANON_KEY    — Your Supabase anon/public key

# Run the project
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Routing | React Router v7 |
| AI Triage | Google Gemini 2.0 Flash (REST API) |
| Map | Google Maps JavaScript API |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth | Supabase Auth |
| Styling | Vanilla CSS (custom dark-mode design system) |

---

## Project Structure

```
src/
├── lib/
│   ├── gemini.js              # Gemini API integration (AI triage)
│   ├── emergencyClassifier.js # Local keyword-weight fallback classifier
│   ├── authorityRouting.js    # Builds responder dispatch plans
│   ├── alertService.js        # Dispatches alerts, persists to Supabase
│   ├── incidentService.js     # Incident CRUD (Supabase + localStorage)
│   ├── googleMapsLoader.js    # Dynamic Maps API loader
│   └── supabase.js            # Supabase client init
├── components/
│   ├── GoogleIncidentMap.jsx  # Live Google Maps incident pin
│   └── ScrollReveal.jsx       # Scroll animation utility
└── pages/
    ├── Dashboard.jsx          # Main coordination dashboard
    ├── LandingPage.jsx        # Marketing / hero page
    ├── Login.jsx              # Auth - login
    ├── Signup.jsx             # Auth - signup
    └── ForgotPassword.jsx     # Auth - password reset
```
