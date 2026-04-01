const TWILIO_FUNCTION_URL = import.meta.env.VITE_TWILIO_FUNCTION_URL || ''

function buildSmsMessage(payload) {
  const location = payload.location?.label || 'Location unavailable'
  const mapUrl = payload.location?.mapUrl ? ` Map: ${payload.location.mapUrl}` : ''

  return [
    `CrisisSync Alert`,
    `${payload.type} | ${payload.severity}`,
    payload.description,
    `Location: ${location}`,
    mapUrl,
  ]
    .filter(Boolean)
    .join('\n')
}

export async function sendTwilioAlert({ to, payload }) {
  if (!TWILIO_FUNCTION_URL) {
    return { status: 'simulated' }
  }

  try {
    const response = await fetch(TWILIO_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        message: buildSmsMessage(payload),
      }),
    })

    if (!response.ok) {
      return { status: 'failed' }
    }

    return { status: 'sent' }
  } catch {
    return { status: 'failed' }
  }
}
