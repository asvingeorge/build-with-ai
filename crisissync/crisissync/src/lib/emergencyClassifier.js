const CATEGORY_KEYWORDS = {
  Fire: [
    { phrase: 'fire', weight: 4 },
    { phrase: 'smoke', weight: 3 },
    { phrase: 'burn', weight: 2 },
    { phrase: 'burning', weight: 3 },
    { phrase: 'flame', weight: 3 },
    { phrase: 'explosion', weight: 4 },
    { phrase: 'gas leak', weight: 4 },
    { phrase: 'wildfire', weight: 5 },
  ],
  Medical: [
    { phrase: 'unconscious', weight: 5 },
    { phrase: 'not breathing', weight: 6 },
    { phrase: 'heart attack', weight: 6 },
    { phrase: 'stroke', weight: 5 },
    { phrase: 'injured', weight: 3 },
    { phrase: 'bleeding', weight: 5 },
    { phrase: 'seizure', weight: 5 },
    { phrase: 'collapse', weight: 3 },
    { phrase: 'medical', weight: 2 },
  ],
  'Security Threat': [
    { phrase: 'gun', weight: 6 },
    { phrase: 'weapon', weight: 5 },
    { phrase: 'armed', weight: 6 },
    { phrase: 'hostage', weight: 7 },
    { phrase: 'intruder', weight: 4 },
    { phrase: 'threat', weight: 3 },
    { phrase: 'assault', weight: 5 },
    { phrase: 'attack', weight: 4 },
    { phrase: 'shooter', weight: 7 },
    { phrase: 'violence', weight: 4 },
    { phrase: 'bomb', weight: 7 },
  ],
  'Natural Disaster': [
    { phrase: 'earthquake', weight: 6 },
    { phrase: 'flood', weight: 5 },
    { phrase: 'storm', weight: 3 },
    { phrase: 'hurricane', weight: 6 },
    { phrase: 'tornado', weight: 6 },
    { phrase: 'landslide', weight: 5 },
    { phrase: 'tsunami', weight: 7 },
    { phrase: 'cyclone', weight: 6 },
  ],
  Accident: [
    { phrase: 'crash', weight: 5 },
    { phrase: 'collision', weight: 5 },
    { phrase: 'accident', weight: 3 },
    { phrase: 'overturned', weight: 4 },
    { phrase: 'vehicle', weight: 2 },
    { phrase: 'car', weight: 2 },
    { phrase: 'truck', weight: 2 },
    { phrase: 'bike', weight: 2 },
    { phrase: 'industrial accident', weight: 5 },
  ],
}

const CRITICAL_KEYWORDS = [
  'not breathing',
  'unconscious',
  'active shooter',
  'armed',
  'hostage',
  'major fire',
  'explosion',
  'severe bleeding',
  'collapsed building',
  'multiple victims',
  'trapped inside',
]

const HIGH_KEYWORDS = [
  'fire',
  'smoke',
  'weapon',
  'gun',
  'attack',
  'stroke',
  'heart attack',
  'seizure',
  'flood',
  'earthquake',
  'crash',
  'collision',
  'gas leak',
]

const MEDIUM_KEYWORDS = [
  'injured',
  'threat',
  'suspicious',
  'accident',
  'medical',
  'storm',
  'alarm',
]

const RISK_KEYWORDS = [
  ['smoke', 'smoke inhalation'],
  ['fire', 'rapid fire spread'],
  ['explosion', 'secondary explosions'],
  ['gas leak', 'explosion risk from leaking gas'],
  ['bleeding', 'severe blood loss'],
  ['unconscious', 'loss of airway or cardiac arrest'],
  ['not breathing', 'immediate loss of life'],
  ['weapon', 'armed escalation'],
  ['gun', 'gunfire or ballistic injury'],
  ['flood', 'rising water and entrapment'],
  ['earthquake', 'structural collapse and debris'],
  ['storm', 'flying debris and infrastructure damage'],
  ['collision', 'multi-vehicle pileup or fuel leak'],
  ['crash', 'vehicle instability and trauma'],
  ['trapped', 'entrapment and delayed rescue'],
]

const RESPONDER_MAP = {
  Fire: ['Fire Department', 'Police'],
  Medical: ['EMS', 'Police'],
  'Security Threat': ['Police', 'Special Response Unit'],
  'Natural Disaster': ['Fire Department', 'Police', 'Disaster Management Authority'],
  Accident: ['EMS', 'Police', 'Fire Department'],
  Other: ['Dispatcher'],
}

const ACTION_MAP = {
  Fire: [
    'Evacuate nearby people if it is safe to move.',
    'Avoid smoke and do not use elevators.',
    'Shut off gas or power only if it can be done safely.',
  ],
  Medical: [
    'Keep the affected person still and monitor breathing.',
    'Provide first aid only if trained to do so.',
    'Clear access for emergency medical responders.',
  ],
  'Security Threat': [
    'Move to a secure location immediately.',
    'Lock or barricade doors if sheltering in place.',
    'Avoid confronting the threat unless absolutely necessary to survive.',
  ],
  'Natural Disaster': [
    'Move away from unstable structures and hazard zones.',
    'Follow local emergency alerts and evacuation guidance.',
    'Prepare for aftershocks, flooding, or utility disruption.',
  ],
  Accident: [
    'Secure the area and prevent additional traffic or crowd exposure.',
    'Do not move injured people unless there is immediate danger.',
    'Watch for fuel leaks, fire, or unstable vehicles.',
  ],
  Other: [
    'Gather more details from witnesses on what is happening.',
    'Keep people at a safe distance until the situation is clearer.',
    'Escalate to emergency services if conditions worsen.',
  ],
}

const SEVERITY_COLORS = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
}

function normalize(text) {
  return String(text || '').trim().toLowerCase()
}

function countPeopleIndicators(text) {
  const patterns = [/(\d+)\s+(people|persons|victims|patients|residents)/g, /several/g, /multiple/g]
  return patterns.reduce((total, pattern) => {
    if (pattern.global) {
      const matches = [...text.matchAll(pattern)]
      return total + matches.reduce((sum, match) => sum + (Number(match[1]) || 2), 0)
    }
    return total + (pattern.test(text) ? 2 : 0)
  }, 0)
}

function getCategoryScores(text) {
  return Object.entries(CATEGORY_KEYWORDS).map(([type, terms]) => {
    const matches = terms.filter(({ phrase }) => text.includes(phrase))
    const score = matches.reduce((sum, match) => sum + match.weight, 0)
    return {
      type,
      score,
      matches: matches.map(({ phrase }) => phrase),
    }
  })
}

function detectType(text) {
  const ranked = getCategoryScores(text).sort((a, b) => b.score - a.score)
  const best = ranked[0]
  const second = ranked[1]

  if (!best || best.score === 0) {
    return { type: 'Other', ranked, confidence: 'Low' }
  }

  const margin = best.score - (second?.score || 0)
  const confidence = best.score >= 8 || margin >= 4 ? 'High' : margin >= 2 ? 'Medium' : 'Low'

  return { type: best.type, ranked, confidence }
}

function detectSeverity(text, peopleCount) {
  if (CRITICAL_KEYWORDS.some((keyword) => text.includes(keyword)) || peopleCount >= 4) {
    return 'Critical'
  }
  if (HIGH_KEYWORDS.some((keyword) => text.includes(keyword)) || peopleCount >= 2) {
    return 'High'
  }
  if (MEDIUM_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return 'Medium'
  }
  return 'Low'
}

function extractRisks(text, type) {
  const risks = RISK_KEYWORDS.filter(([keyword]) => text.includes(keyword)).map(([, risk]) => risk)

  if (text.includes('inside') || text.includes('trapped')) {
    risks.push('possible people trapped in the hazard zone')
  }

  if (!risks.length) {
    const fallbackByType = {
      Fire: 'possible spread to people, vehicles, or nearby structures',
      Medical: 'condition may deteriorate before responders arrive',
      'Security Threat': 'possible escalation and harm to bystanders',
      'Natural Disaster': 'infrastructure disruption and secondary hazards',
      Accident: 'additional injury from unstable vehicles or debris',
      Other: 'insufficient detail to confirm the exact emergency',
    }
    risks.push(fallbackByType[type] || 'unclear hazard conditions')
  }

  return [...new Set(risks)]
}

function buildActions(type, severity, hasLocation) {
  const actions = [...(ACTION_MAP[type] || ACTION_MAP.Other)]

  if (!hasLocation) {
    actions.unshift('Confirm the exact location with landmarks, address, or GPS coordinates.')
  }
  if (severity === 'Critical') {
    actions.unshift('Call emergency services immediately and keep the line open if possible.')
  }
  if (severity === 'High') {
    actions.unshift('Warn nearby people and create a clear access path for responders.')
  }

  return [...new Set(actions)]
}

function buildResponders(type, severity) {
  const responders = [...(RESPONDER_MAP[type] || RESPONDER_MAP.Other)]

  if (severity === 'Critical') {
    responders.unshift('Emergency Dispatch')
  }
  if (severity === 'High' && !responders.includes('Emergency Dispatch')) {
    responders.unshift('Dispatcher')
  }

  return [...new Set(responders)]
}

export function classifyEmergencyReport({ description, location }) {
  return analyzeEmergencyReport({ description, location }).json
}

export function analyzeEmergencyReport({ description, location }) {
  const text = normalize(description)
  const hasLocation = Boolean(
    location &&
    location.lat !== '' &&
    location.lng !== '' &&
    !Number.isNaN(Number(location.lat)) &&
    !Number.isNaN(Number(location.lng)),
  )

  if (!text) {
    const fallback = {
      type: 'Other',
      severity: 'Low',
      risks: ['insufficient incident details'],
      actions: [
        'Collect a clear description of what is happening.',
        'Confirm the exact location if available.',
        'Assess whether there is immediate danger to life or property.',
      ],
      responders: ['Dispatcher'],
    }

    return {
      json: fallback,
      meta: {
        confidence: 'Low',
        matchedSignals: [],
        peopleCount: 0,
        locationStatus: 'missing',
        severityTone: SEVERITY_COLORS.Low,
        rankedCategories: [],
      },
    }
  }

  const peopleCount = countPeopleIndicators(text)
  const typeResult = detectType(text)
  const severity = detectSeverity(text, peopleCount)
  const json = {
    type: typeResult.type,
    severity,
    risks: extractRisks(text, typeResult.type),
    actions: buildActions(typeResult.type, severity, hasLocation),
    responders: buildResponders(typeResult.type, severity),
  }

  return {
    json,
    meta: {
      confidence: typeResult.confidence,
      matchedSignals: typeResult.ranked.find((entry) => entry.type === typeResult.type)?.matches || [],
      peopleCount,
      locationStatus: hasLocation ? 'confirmed' : 'missing',
      severityTone: SEVERITY_COLORS[severity],
      rankedCategories: typeResult.ranked.filter((entry) => entry.score > 0),
    },
  }
}
