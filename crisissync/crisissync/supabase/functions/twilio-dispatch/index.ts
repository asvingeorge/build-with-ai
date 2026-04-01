// Supabase Edge Function: twilio-dispatch
// Sends SMS alerts through Twilio without exposing secrets to the frontend.

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || ''
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || ''
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER') || ''

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(),
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return jsonResponse({ error: 'Twilio env vars are not configured.' }, 500)
  }

  try {
    const payload = await request.json()
    const to = payload?.to
    const message = payload?.message

    if (!to || !message) {
      return jsonResponse({ error: 'Missing "to" or "message".' }, 400)
    }

    const form = new URLSearchParams()
    form.set('To', String(to))
    form.set('From', TWILIO_FROM_NUMBER)
    form.set('Body', String(message))

    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      },
    )

    const result = await response.json()

    if (!response.ok) {
      return jsonResponse({ error: result }, 500)
    }

    return jsonResponse({
      sid: result.sid,
      status: result.status,
      to: result.to,
    })
  } catch (error) {
    return jsonResponse({ error: String(error) }, 500)
  }
})
