import { supabase } from './supabase'

const LOCAL_KEY = 'crisissync_incidents_v1'

function readLocalIncidents() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocalIncidents(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
}

function normalizeIncidentRow(row) {
  return {
    id: row.id,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    description: row.description || '',
    location: row.location || { lat: '', lng: '' },
    analysis: row.analysis || row.summary || null,
    source: row.source || 'text',
    status: row.status || 'active',
    provider: row.provider || 'local',
  }
}

export async function saveIncident(incident) {
  const localIncident = normalizeIncidentRow({
    ...incident,
    id: incident.id || crypto.randomUUID(),
    created_at: incident.createdAt || new Date().toISOString(),
  })

  const next = [localIncident, ...readLocalIncidents()].slice(0, 25)
  writeLocalIncidents(next)

  try {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        id: localIncident.id,
        description: localIncident.description,
        location: localIncident.location,
        analysis: localIncident.analysis,
        source: localIncident.source,
        status: localIncident.status,
        provider: localIncident.provider,
      })
      .select()
      .single()

    if (!error && data) {
      return normalizeIncidentRow(data)
    }
  } catch {
    // Fall back to local-only mode when Supabase tables are not ready.
  }

  return localIncident
}

export async function listIncidents() {
  const local = readLocalIncidents()

  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25)

    if (!error && Array.isArray(data) && data.length) {
      return data.map(normalizeIncidentRow)
    }
  } catch {
    // Ignore and use local incidents.
  }

  return local
}

export function subscribeToIncidents(onChange) {
  try {
    const channel = supabase
      .channel('crisissync-incidents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        async () => {
          const items = await listIncidents()
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
