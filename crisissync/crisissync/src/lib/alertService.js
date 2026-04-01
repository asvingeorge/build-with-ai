import { supabase } from './supabase'
import { buildAuthorityDispatchPlan } from './authorityRouting'
import { sendTwilioAlert } from './twilioClient'

const ALERTS_KEY = 'crisissync_responder_alerts_v1'

function readLocalAlerts() {
  try {
    return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocalAlerts(items) {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(items))
}

function normalizeAlert(row) {
  return {
    id: row.id,
    incidentId: row.incident_id || row.incidentId,
    channel: row.channel,
    target: row.target,
    status: row.status,
    payload: row.payload || {},
    responder: row.payload?.responder || row.responder || '',
    official: row.payload?.official || row.official || '',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  }
}

async function tryWebhookDispatch(planItem) {
  if (planItem.channels.includes('SMS') || planItem.channels.includes('Priority SMS')) {
    const smsResult = await sendTwilioAlert({
      to: planItem.target,
      payload: planItem.payload,
    })

    if (smsResult.status === 'sent') {
      return smsResult
    }
  }

  if (!planItem.webhookUrl) {
    return { status: 'simulated' }
  }

  try {
    const response = await fetch(planItem.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planItem.payload),
    })

    return { status: response.ok ? 'sent' : 'failed' }
  } catch {
    return { status: 'failed' }
  }
}

export async function dispatchIncidentAlerts({ incidentId, analysis, description, location }) {
  const plan = buildAuthorityDispatchPlan({ incidentId, analysis, description, location })
  const created = []

  for (const item of plan) {
    const webhook = await tryWebhookDispatch(item)

    const baseRecord = normalizeAlert({
      id: item.id,
      incidentId,
      channel: item.channels.join(', '),
      target: item.target,
      status: webhook.status,
      payload: {
        ...item.payload,
        responder: item.responder,
        official: item.official,
      },
      createdAt: new Date().toISOString(),
      responder: item.responder,
      official: item.official,
    })

    const nextLocal = [baseRecord, ...readLocalAlerts()].slice(0, 40)
    writeLocalAlerts(nextLocal)
    created.push(baseRecord)

    try {
      await supabase.from('responder_alerts').insert({
        id: baseRecord.id,
        incident_id: incidentId,
        channel: baseRecord.channel,
        target: baseRecord.target,
        status: baseRecord.status,
        payload: baseRecord.payload,
      })
    } catch {
      // Local fallback is enough for hackathon mode.
    }
  }

  return created
}

export async function listResponderAlerts() {
  const local = readLocalAlerts()

  try {
    const { data, error } = await supabase
      .from('responder_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(40)

    if (!error && Array.isArray(data) && data.length) {
      return data.map(normalizeAlert)
    }
  } catch {
    // Fall through to local alerts.
  }

  return local
}

export function subscribeToResponderAlerts(onChange) {
  try {
    const channel = supabase
      .channel('crisissync-alerts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'responder_alerts' },
        async () => {
          const items = await listResponderAlerts()
          onChange(items)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  } catch {
    return () => {}
  }
}
