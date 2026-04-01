const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'

function extractJsonBlock(text) {
  const match = String(text || '').match(/\{[\s\S]*\}/)
  return match ? match[0] : null
}

export function isGeminiConfigured() {
  return Boolean(GEMINI_API_KEY)
}

export async function classifyWithGemini({ description, location }) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured.')
  }

  const prompt = `
You are an AI emergency response classifier.

Analyze the given emergency report and return a structured JSON response.

INPUT:
Description: ${description || ''}
Location: ${JSON.stringify(location || {})}

TASK:
1. Classify the emergency type
2. Determine severity level
3. Extract key risks
4. Suggest immediate actions
5. Recommend which responders to notify

CATEGORIES:
- Fire
- Medical
- Security Threat
- Natural Disaster
- Accident
- Other

SEVERITY:
- Low
- Medium
- High
- Critical

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "type": "",
  "severity": "",
  "risks": [],
  "actions": [],
  "responders": []
}
`.trim()

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Gemini request failed.')
  }

  const payload = await response.json()
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''
  const jsonText = extractJsonBlock(text)

  if (!jsonText) {
    throw new Error('Gemini did not return valid JSON.')
  }

  const parsed = JSON.parse(jsonText)
  return {
    type: parsed.type || 'Other',
    severity: parsed.severity || 'Low',
    risks: Array.isArray(parsed.risks) ? parsed.risks : [],
    actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    responders: Array.isArray(parsed.responders) ? parsed.responders : [],
  }
}
