# CrisisSync Manual Setup

## 1. Gemini

- Create a Gemini API key in Google AI Studio.
- Add it to `.env.local`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_MODEL=gemini-2.0-flash
```

## 2. Supabase

- Open Supabase SQL Editor.
- Run [`supabase/crisissync_schema.sql`](./supabase/crisissync_schema.sql).
- In Supabase, enable Realtime for:
  - `incidents`
  - `incident_updates`
  - `responder_alerts`

## 3. Authentication

- Enable Email provider if you want signup/login to work.

## 4. Voice Input

- Browser microphone permission is required.
- Best support is in Chrome/Edge for Web Speech API.

## 5. Google Maps

- Create a Google Maps Platform API key in Google Cloud.
- Enable `Maps JavaScript API`.
- Add it to `.env.local`:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

## 6. Real Alerts

- The app currently generates alert recommendations and local coordination data.
- To send real notifications, connect one of these manually:
  - Twilio for SMS/WhatsApp
  - Resend for email
  - Firebase for push notifications
- Optional webhook env vars for demo dispatch:

```env
VITE_FIRE_WEBHOOK_URL=
VITE_EMS_WEBHOOK_URL=
VITE_POLICE_WEBHOOK_URL=
VITE_DISASTER_WEBHOOK_URL=
VITE_DISPATCH_WEBHOOK_URL=
VITE_SPECIAL_RESPONSE_WEBHOOK_URL=
VITE_TWILIO_FUNCTION_URL=
```

- If you already ran the SQL before this update, also run:
  - [`supabase/alert_policy_patch.sql`](./supabase/alert_policy_patch.sql)

### Twilio SMS via Supabase Edge Function

- Rotate your Twilio auth token if it has been pasted or shared anywhere.
- Create or verify a Twilio phone number that can send SMS.
- Set Supabase Edge Function secrets:

```bash
supabase secrets set TWILIO_ACCOUNT_SID=your_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_FROM_NUMBER=your_twilio_number
```

- Deploy the function:

```bash
supabase functions deploy twilio-dispatch
```

- Set this in `.env.local` to your deployed function URL:

```env
VITE_TWILIO_FUNCTION_URL=https://<project-ref>.functions.supabase.co/twilio-dispatch
```

## 7. Production Note

- `VITE_GEMINI_API_KEY` is client-exposed because this is a fast hackathon setup.
- For production, move Gemini calls to a server or edge function.
