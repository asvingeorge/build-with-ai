import { useEffect, useMemo, useRef, useState } from 'react'
import ScrollReveal from '../components/ScrollReveal'
import GoogleIncidentMap from '../components/GoogleIncidentMap'
import { dispatchIncidentAlerts, listResponderAlerts, subscribeToResponderAlerts } from '../lib/alertService'
import { analyzeEmergencyReport } from '../lib/emergencyClassifier'
import { classifyWithGemini, isGeminiConfigured } from '../lib/gemini'
import { listIncidents, saveIncident, subscribeToIncidents } from '../lib/incidentService'

const SAMPLE_INPUT =
  'A bus collided with a truck near the flyover. Several passengers are injured, fuel is leaking, and traffic is blocked.'

const EMPTY_ANALYSIS = {
  json: {
    type: '',
    severity: '',
    risks: [],
    actions: [],
    responders: [],
  },
  meta: {
    confidence: '',
    matchedSignals: [],
    peopleCount: 0,
    locationStatus: 'missing',
    severityTone: 'low',
    rankedCategories: [],
  },
}

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function formatTimestamp(value) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function renderLocationLabel(location) {
  if (!location?.hasCoordinates && !(location?.lat && location?.lng)) {
    return 'Location unavailable'
  }

  if (location?.label) {
    return location.label
  }

  return `Lat ${location.lat}, Lng ${location.lng}`
}

function buildAlertPlan(analysis, location) {
  const level = analysis.json.severity
  const hasLocation = location.lat && location.lng
  const nearbyUsers = level === 'Critical' ? 24 : level === 'High' ? 12 : level === 'Medium' ? 6 : 2

  return {
    nearbyUsers,
    dispatchMode: level === 'Critical' ? 'Immediate multi-channel alert' : level === 'High' ? 'Priority alert' : 'Advisory broadcast',
    channels: hasLocation ? ['In-app', 'SMS', 'Email'] : ['In-app'],
  }
}

export default function Dashboard() {
  const recognitionRef = useRef(null)
  const [expandedAlerts, setExpandedAlerts] = useState({})
  const [dispatchLogVisible, setDispatchLogVisible] = useState(true)
  const [categoryStrengthVisible, setCategoryStrengthVisible] = useState(true)
  const [coordinationFeedVisible, setCoordinationFeedVisible] = useState(true)
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [analysis, setAnalysis] = useState(EMPTY_ANALYSIS)
  const [incidents, setIncidents] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [voiceActive, setVoiceActive] = useState(false)
  const [nearbySmsStatus, setNearbySmsStatus] = useState('Not triggered')
  const [statusMessage, setStatusMessage] = useState('Ready to analyze incoming incidents.')
  const [provider, setProvider] = useState('Rules fallback')

  useEffect(() => {
    const bootstrap = async () => {
      const items = await listIncidents()
      const nextAlerts = await listResponderAlerts()
      setIncidents(items)
      setAlerts(nextAlerts)
    }

    bootstrap()
    const unsubscribeIncidents = subscribeToIncidents(setIncidents)
    const unsubscribeAlerts = subscribeToResponderAlerts(setAlerts)
    return () => {
      unsubscribeIncidents()
      unsubscribeAlerts()
    }
  }, [])

  const alertPlan = useMemo(() => buildAlertPlan(analysis, { lat, lng }), [analysis, lat, lng])

  const toggleAlertExpansion = (alertId) => {
    setExpandedAlerts((current) => ({
      ...current,
      [alertId]: !current[alertId],
    }))
  }

  const toggleDispatchLogVisibility = () => {
    setDispatchLogVisible((current) => !current)
  }

  const toggleCategoryStrengthVisibility = () => {
    setCategoryStrengthVisible((current) => !current)
  }

  const toggleCoordinationFeedVisibility = () => {
    setCoordinationFeedVisible((current) => !current)
  }

  const startVoiceCapture = () => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor()
    if (!SpeechRecognitionCtor) {
      setStatusMessage('Voice capture is not supported in this browser. Use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onstart = () => {
      setVoiceActive(true)
      setStatusMessage('Listening for distress report...')
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
      setDescription(transcript.trim())
    }

    recognition.onend = () => {
      setVoiceActive(false)
      setStatusMessage('Voice capture complete.')
    }

    recognition.onerror = () => {
      setVoiceActive(false)
      setStatusMessage('Voice capture failed. Please type the report manually.')
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported in this browser.')
      return
    }

    setStatusMessage('Requesting current location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(5))
        setLng(position.coords.longitude.toFixed(5))
        setStatusMessage('Location synced successfully.')
      },
      () => {
        setStatusMessage('Location permission denied or unavailable.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const loadSample = () => {
    setDescription(SAMPLE_INPUT)
    setLat('17.43993')
    setLng('78.49827')
    setStatusMessage('Sample incident loaded.')
  }

  const handleNearbySms = () => {
    if (!analysis.json.type) {
      setStatusMessage('Analyze an incident first before sending nearby alerts.')
      return
    }

    const simulatedRecipients = alertPlan.nearbyUsers
    setNearbySmsStatus(`Simulated SMS queued for ${simulatedRecipients} nearby people`)
    setStatusMessage(
      `Nearby public alert prepared for ${simulatedRecipients} people. Connect Twilio later to send it for real.`,
    )
  }

  const handleAnalyze = async (event) => {
    event.preventDefault()
    if (!description.trim()) {
      setStatusMessage('Please enter or dictate an emergency report first.')
      return
    }

    setLoading(true)
    setStatusMessage('Analyzing incident...')

    try {
      const payload = {
        description,
        location: { lat, lng },
      }

      let nextAnalysis = analyzeEmergencyReport(payload)
      let nextProvider = 'Rules fallback'

      if (isGeminiConfigured()) {
        try {
          const geminiJson = await classifyWithGemini(payload)
          nextAnalysis = {
            json: geminiJson,
            meta: {
              ...nextAnalysis.meta,
              confidence: 'AI-assisted',
              matchedSignals: ['Gemini model output'],
              severityTone: geminiJson.severity ? geminiJson.severity.toLowerCase() : 'low',
            },
          }
          nextProvider = 'Gemini AI'
        } catch {
          nextProvider = 'Rules fallback'
        }
      }

      setAnalysis(nextAnalysis)
      setProvider(nextProvider)

      const saved = await saveIncident({
        description,
        location: { lat, lng },
        analysis: nextAnalysis.json,
        source: voiceActive ? 'voice' : 'text',
        provider: nextProvider,
        status: 'active',
      })

      const dispatchedAlerts = await dispatchIncidentAlerts({
        incidentId: saved.id,
        analysis: nextAnalysis.json,
        description,
        location: { lat, lng },
      })

      const refreshed = await listIncidents()
      const refreshedAlerts = await listResponderAlerts()
      setIncidents(refreshed)
      setAlerts(refreshedAlerts)
      setStatusMessage(
        `Incident ${saved.id.slice(0, 8)} analyzed and routed to ${dispatchedAlerts.length} authority inboxes.`,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="classifier-shell">
      <ScrollReveal as="section" className="classifier-hero" delay={30}>
        <p className="classifier-kicker">CrisisSync AI</p>
        <h1>AI-powered emergency coordination, not just incident reporting.</h1>
        <p className="classifier-copy">
          Capture distress reports by text or voice, classify them with Gemini or built-in triage logic,
          sync location, generate responder actions, and keep a live coordination board updated.
        </p>
      </ScrollReveal>

      <ScrollReveal as="section" className="ops-bar" delay={70}>
        <span className={`status-pill ${isGeminiConfigured() ? 'medium' : 'neutral'}`}>
          {isGeminiConfigured() ? 'Gemini connected' : 'Gemini key missing'}
        </span>
        <span className="status-pill neutral">Provider: {provider}</span>
        <span className="status-pill neutral">{statusMessage}</span>
      </ScrollReveal>

      <section className="classifier-grid">
        <ScrollReveal as="form" className="classifier-panel" delay={110} onSubmit={handleAnalyze}>
          <div className="panel-head">
            <h2>Distress Intake</h2>
            <div className="panel-actions">
              <button type="button" className="ghost-button" onClick={loadSample}>
                Load sample
              </button>
              <button type="button" className="ghost-button" onClick={startVoiceCapture}>
                {voiceActive ? 'Listening...' : 'Voice input'}
              </button>
              <button type="button" className="ghost-button" onClick={captureLocation}>
                Use my location
              </button>
            </div>
          </div>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="8"
              placeholder="Describe the incident, people affected, visible hazards, and surroundings."
            />
          </label>

          <div className="location-grid">
            <label className="field">
              <span>Latitude</span>
              <input type="text" value={lat} onChange={(event) => setLat(event.target.value)} placeholder="Optional" />
            </label>
            <label className="field">
              <span>Longitude</span>
              <input type="text" value={lng} onChange={(event) => setLng(event.target.value)} placeholder="Optional" />
            </label>
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze and Coordinate'}
          </button>
        </ScrollReveal>

        <ScrollReveal as="section" className="classifier-panel classifier-output" delay={160}>
          <div className="panel-head">
            <h2>AI Triage Output</h2>
            <span className="output-chip">STRICT JSON</span>
          </div>

          <div className="badge-row">
            <span className={`status-pill ${analysis.meta.severityTone}`}>{analysis.json.severity || 'No severity yet'}</span>
            <span className="status-pill neutral">{analysis.json.type || 'No type yet'}</span>
            <span className="status-pill neutral">Confidence: {analysis.meta.confidence || 'N/A'}</span>
            <span className="status-pill neutral">Signals: {analysis.meta.matchedSignals.length || 0}</span>
          </div>

          <pre>{JSON.stringify(analysis.json, null, 2)}</pre>

          <div className="summary-grid">
            <article>
              <span>Matched signals</span>
              <strong>{analysis.meta.matchedSignals.length ? analysis.meta.matchedSignals.join(', ') : 'None yet'}</strong>
            </article>
            <article>
              <span>Likely people involved</span>
              <strong>{analysis.meta.peopleCount || 'Unknown'}</strong>
            </article>
          </div>
        </ScrollReveal>
      </section>

      <section className="classifier-grid classifier-grid-secondary">
        <ScrollReveal delay={80}>
          <GoogleIncidentMap lat={lat} lng={lng} severity={analysis.json.severity} incidents={incidents} />
        </ScrollReveal>

        <ScrollReveal as="section" className="classifier-panel" delay={120}>
          <div className="panel-head">
            <h2>Auto Alert Plan</h2>
          </div>
          <div className="score-list">
            <article className="score-card">
              <div>
                <strong>Dispatch mode</strong>
                <p>{alertPlan.dispatchMode}</p>
              </div>
            </article>
            <article className="score-card">
              <div>
                <strong>Nearby users to notify</strong>
                <p>{alertPlan.nearbyUsers} users inside the risk radius</p>
              </div>
            </article>
            <article className="score-card">
              <div>
                <strong>Suggested channels</strong>
                <p>{alertPlan.channels.join(', ')}</p>
              </div>
            </article>
            <article className="score-card">
              <div>
                <strong>Nearby public SMS</strong>
                <p>{nearbySmsStatus}</p>
              </div>
              <button type="button" className="ghost-button compact-button" onClick={handleNearbySms}>
                Send SMS to nearby people
              </button>
            </article>
          </div>
        </ScrollReveal>
      </section>

      <section className="classifier-grid classifier-grid-secondary">
        <ScrollReveal as="section" className="classifier-panel" delay={70}>
          <div className="panel-head">
            <h2>Category Strength</h2>
            <button type="button" className="ghost-button" onClick={toggleCategoryStrengthVisibility}>
              {categoryStrengthVisible ? 'Hide list' : 'Show details'}
            </button>
          </div>
          {categoryStrengthVisible ? (
            <div className="score-list">
              {analysis.meta.rankedCategories.length ? (
                analysis.meta.rankedCategories.map((entry) => (
                  <article key={entry.type} className="score-card">
                    <div>
                      <strong>{entry.type}</strong>
                      <p>{entry.matches.join(', ')}</p>
                    </div>
                    <span>{entry.score}</span>
                  </article>
                ))
              ) : (
                <p className="empty-copy">Submit a report to see how each category scored.</p>
              )}
            </div>
          ) : (
            <p className="empty-copy">Category strength hidden. Click Show details to view the scoring breakdown.</p>
          )}
        </ScrollReveal>

        <ScrollReveal as="section" className="classifier-panel" delay={120}>
          <div className="panel-head">
            <h2>Live Coordination Feed</h2>
            <button type="button" className="ghost-button" onClick={toggleCoordinationFeedVisibility}>
              {coordinationFeedVisible ? 'Hide list' : 'Show details'}
            </button>
          </div>
          {coordinationFeedVisible ? (
            <div className="history-list">
              {incidents.length ? (
                incidents.map((item) => (
                  <article key={item.id} className="history-card">
                    <div className="badge-row">
                      <span className={`status-pill ${(item.analysis?.severity || 'low').toLowerCase()}`}>
                        {item.analysis?.severity || 'Low'}
                      </span>
                      <span className="status-pill neutral">{item.analysis?.type || 'Other'}</span>
                      <span className="status-pill neutral">{item.provider}</span>
                    </div>
                    <strong>{formatTimestamp(item.createdAt)}</strong>
                    <p>{item.description}</p>
                  </article>
                ))
              ) : (
                <p className="empty-copy">No incidents recorded yet.</p>
              )}
            </div>
          ) : (
            <p className="empty-copy">Coordination feed hidden. Click Show details to view recent incident entries.</p>
          )}
        </ScrollReveal>
      </section>

      <section className="classifier-grid classifier-grid-secondary">
        <ScrollReveal as="section" className="classifier-panel" delay={70}>
          <div className="panel-head">
            <h2>Authority Dispatch Log</h2>
            {alerts.length ? (
              <button type="button" className="ghost-button" onClick={toggleDispatchLogVisibility}>
                {dispatchLogVisible ? 'Hide list' : 'Show details'}
              </button>
            ) : null}
          </div>
          {dispatchLogVisible ? (
            <div className="history-list">
              {alerts.length ? (
                alerts.map((alert) => (
                  <article key={alert.id} className="history-card">
                    <div className="badge-row">
                      <span className={`status-pill ${alert.status === 'failed' ? 'critical' : alert.status === 'sent' ? 'medium' : 'neutral'}`}>
                        {alert.status}
                      </span>
                      <span className="status-pill neutral">{alert.payload?.type || 'Dispatch'}</span>
                      <span className="status-pill neutral">{alert.channel}</span>
                    </div>
                    <strong>{alert.official || alert.responder || alert.target}</strong>
                    <p>{alert.target}</p>
                    <button
                      type="button"
                      className="ghost-button dispatch-toggle"
                      onClick={() => toggleAlertExpansion(alert.id)}
                    >
                      {expandedAlerts[alert.id] ? 'Show less' : 'Show more'}
                    </button>
                    {expandedAlerts[alert.id] ? (
                      <>
                        <div className="dispatch-location-card">
                          <div>
                            <span className="dispatch-label">Current location</span>
                            <strong>{renderLocationLabel(alert.payload?.location)}</strong>
                          </div>
                          {alert.payload?.location?.mapUrl ? (
                            <a
                              href={alert.payload.location.mapUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="dispatch-map-link"
                            >
                              Open in Maps
                            </a>
                          ) : null}
                        </div>
                        <pre className="dispatch-payload">{JSON.stringify(alert.payload, null, 2)}</pre>
                      </>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="empty-copy">No dispatch records yet. Analyze an incident to auto-route the JSON.</p>
              )}
            </div>
          ) : (
            <p className="empty-copy">Dispatch list hidden. Click Show details to view routed authority records.</p>
          )}
        </ScrollReveal>

        <ScrollReveal as="section" className="classifier-panel" delay={120}>
          <div className="panel-head">
            <h2>What Gets Sent</h2>
          </div>
          <div className="score-list">
            <article className="score-card">
              <div>
                <strong>Structured payload</strong>
                <p>Each authority receives the incident JSON, source description, location, and dispatch timestamp.</p>
              </div>
            </article>
            <article className="score-card">
              <div>
                <strong>Authority routing</strong>
                <p>Fire goes to Fire Control, medical to EMS, security to Police, disasters to Disaster Cell.</p>
              </div>
            </article>
            <article className="score-card">
              <div>
                <strong>Delivery mode</strong>
                <p>Right now deliveries are logged in-app with optional webhook forwarding when configured.</p>
              </div>
            </article>
          </div>
        </ScrollReveal>
      </section>
    </main>
  )
}
