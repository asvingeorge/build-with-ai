const WEBHOOKS = {
  'Fire Department': import.meta.env.VITE_FIRE_WEBHOOK_URL,
  EMS: import.meta.env.VITE_EMS_WEBHOOK_URL,
  Police: import.meta.env.VITE_POLICE_WEBHOOK_URL,
  'Disaster Management Authority': import.meta.env.VITE_DISASTER_WEBHOOK_URL,
  Dispatcher: import.meta.env.VITE_DISPATCH_WEBHOOK_URL,
  'Special Response Unit': import.meta.env.VITE_SPECIAL_RESPONSE_WEBHOOK_URL,
}

const AUTHORITY_DIRECTORY = {
  'Fire Department': {
    official: 'Central Fire Control Room',
    channels: ['App inbox', 'Email'],
    target: 'fire-control@crisissync.demo',
  },
  EMS: {
    official: 'City EMS Command Desk',
    channels: ['App inbox', 'SMS'],
    target: '+91-90000-11111',
  },
  Police: {
    official: 'Police Control Room',
    channels: ['App inbox', 'SMS'],
    target: '+91-90000-22222',
  },
  'Disaster Management Authority': {
    official: 'District Disaster Cell',
    channels: ['App inbox', 'Email'],
    target: 'disaster-cell@crisissync.demo',
  },
  Dispatcher: {
    official: 'Unified Dispatch Desk',
    channels: ['App inbox'],
    target: 'dispatch-console',
  },
  'Special Response Unit': {
    official: 'Special Response Unit',
    channels: ['App inbox', 'Priority SMS'],
    target: '+91-90000-33333',
  },
}

function pickChannels(responder, severity) {
  const defaults = AUTHORITY_DIRECTORY[responder]?.channels || ['App inbox']
  if (severity === 'Critical' && !defaults.includes('Priority SMS')) {
    return [...defaults, 'Priority SMS']
  }
  return defaults
}

function buildLocationPayload(location) {
  const lat = location?.lat || ''
  const lng = location?.lng || ''
  const hasCoordinates = lat !== '' && lng !== ''

  return {
    lat,
    lng,
    hasCoordinates,
    mapUrl: hasCoordinates ? `https://www.google.com/maps?q=${lat},${lng}` : '',
    label: hasCoordinates ? `Lat ${lat}, Lng ${lng}` : 'Location unavailable',
  }
}

export function buildAuthorityDispatchPlan({ incidentId, analysis, description, location }) {
  const responders = Array.isArray(analysis.responders) ? analysis.responders : []
  const uniqueResponders = [...new Set(responders.length ? responders : ['Dispatcher'])]
  const locationPayload = buildLocationPayload(location)

  return uniqueResponders.map((responder) => ({
    id: crypto.randomUUID(),
    incidentId,
    responder,
    official: AUTHORITY_DIRECTORY[responder]?.official || responder,
    target: AUTHORITY_DIRECTORY[responder]?.target || responder,
    channels: pickChannels(responder, analysis.severity),
    webhookUrl: WEBHOOKS[responder] || '',
    payload: {
      incidentId,
      type: analysis.type,
      severity: analysis.severity,
      risks: analysis.risks,
      actions: analysis.actions,
      responders: analysis.responders,
      description,
      location: locationPayload,
      dispatchedAt: new Date().toISOString(),
    },
  }))
}
