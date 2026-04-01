import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { colors, fonts, radius, shadows } from '../tokens';

const JSON_LINES = [
  '{',
  '  "type": "Vehicle Accident",',
  '  "severity": "Critical",',
  '  "risks": [',
  '    "fuel_leak",',
  '    "passenger_entrapment",',
  '    "traffic_obstruction"',
  '  ],',
  '  "actions": [',
  '    "Dispatch Fire and EMS immediately",',
  '    "Establish safety perimeter",',
  '    "Notify Traffic Control"',
  '  ],',
  '  "responders": [',
  '    "Fire Control",',
  '    "EMS",',
  '    "Police Traffic Unit"',
  '  ]',
  '}',
];

const LINES_PER_FRAME = 0.18; // ~1 line every 5-6 frames

export const AITriageOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in
  const containerIn = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Left panel spring
  const leftSpring = spring({ frame, fps, config: { damping: 16, stiffness: 70 }, delay: 10 });

  // Right panel spring
  const rightSpring = spring({ frame, fps, config: { damping: 16, stiffness: 60 }, delay: 25 });

  // How many JSON lines are visible — starts appearing at frame 40
  const jsonStartFrame = 40;
  const visibleLines = Math.min(
    JSON_LINES.length,
    Math.floor(Math.max(0, frame - jsonStartFrame) * LINES_PER_FRAME)
  );

  // Severity badge color animates from neutral → critical once severity line appears
  const severityLineIdx = 2; // "severity": "Critical"
  const severityVisible = visibleLines > severityLineIdx + 1;
  const badgeProgress = severityVisible
    ? interpolate(frame, [jsonStartFrame + (severityLineIdx + 1) / LINES_PER_FRAME, jsonStartFrame + (severityLineIdx + 8) / LINES_PER_FRAME], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Glow on severity badge
  const badgeGlow = badgeProgress;

  // Confidence chip spring
  const confidenceIn = spring({ frame, fps, config: { damping: 20, stiffness: 80 }, delay: 90 });

  // Responder alert pills stagger
  const responderPills = ['Fire Control', 'EMS', 'Police Traffic Unit'];
  const pillSprings = responderPills.map((_, i) =>
    spring({ frame, fps, config: { damping: 18, stiffness: 70 }, delay: 100 + i * 15 })
  );

  // Fade out
  const fadeOut = interpolate(frame, [185, 210], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const panelStyle: React.CSSProperties = {
    border: `1px solid ${colors.border}`,
    borderRadius: radius.card,
    background: `linear-gradient(180deg, ${colors.surface}, rgba(7,12,23,0.86)), radial-gradient(circle at top left, rgba(84,120,255,0.1), transparent 32%)`,
    boxShadow: shadows.card,
    padding: 30,
    position: 'relative',
    overflow: 'hidden',
  };

  // Severity pill interpolated color
  const severityBg = severityVisible
    ? `rgba(248,113,113,${0.08 + badgeProgress * 0.08})`
    : colors.pillNeutralBg;
  const severityColor = severityVisible
    ? `rgb(${Math.floor(interpolate(badgeProgress, [0,1], [216, 252]))},${Math.floor(interpolate(badgeProgress, [0,1], [225, 165]))},${Math.floor(interpolate(badgeProgress, [0,1], [255, 165]))})`
    : colors.pillNeutralText;

  return (
    <AbsoluteFill style={{ opacity: fadeOut * containerIn, padding: '48px 80px', display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div style={{ opacity: leftSpring }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: colors.kicker, letterSpacing: '0.24em', textTransform: 'uppercase', fontFamily: fonts.body, marginBottom: 10 }}>
          CrisisSync AI
        </div>
        <h1 style={{ margin: 0, fontSize: 48, fontWeight: 900, letterSpacing: '-0.05em', color: colors.textWhite, lineHeight: 0.95, fontFamily: fonts.body }}>
          AI Triage Output
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, flex: 1 }}>

        {/* Left: JSON output */}
        <div style={{ ...panelStyle, opacity: leftSpring, transform: `translateY(${interpolate(leftSpring, [0,1], [40,0])}px)` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 18, color: '#f3f6ff', fontFamily: fonts.body }}>AI Triage Output</h2>
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '6px 10px',
              borderRadius: radius.pill, background: 'rgba(255,114,134,0.12)',
              color: '#ffb3bf', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.08em', fontFamily: fonts.body,
            }}>STRICT JSON</span>
          </div>

          {/* Badge row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
            <span style={{
              borderRadius: radius.pill, padding: '7px 14px',
              background: severityBg, color: severityColor,
              fontSize: 13, fontWeight: 700, fontFamily: fonts.body,
              boxShadow: badgeGlow > 0.5 ? `0 0 ${interpolate(badgeGlow, [0,1], [0,20])}px rgba(252,165,165,${badgeGlow * 0.5})` : 'none',
              transition: 'all 0.3s ease',
            }}>
              {severityVisible ? 'Critical' : 'No severity yet'}
            </span>
            <span style={{ borderRadius: radius.pill, padding: '7px 14px', background: colors.pillNeutralBg, color: colors.pillNeutralText, fontSize: 13, fontWeight: 700, fontFamily: fonts.body }}>
              {visibleLines > 1 ? 'Vehicle Accident' : 'No type yet'}
            </span>
            <span style={{ borderRadius: radius.pill, padding: '7px 14px', background: colors.pillNeutralBg, color: colors.pillNeutralText, fontSize: 13, fontWeight: 700, fontFamily: fonts.body, opacity: confidenceIn }}>
              Confidence: AI-assisted
            </span>
            <span style={{ borderRadius: radius.pill, padding: '7px 14px', background: colors.pillNeutralBg, color: colors.pillNeutralText, fontSize: 13, fontWeight: 700, fontFamily: fonts.body, opacity: confidenceIn }}>
              Signals: 4
            </span>
          </div>

          {/* JSON display */}
          <div style={{
            padding: '18px', borderRadius: 18,
            background: 'rgba(4,8,15,0.92)',
            border: `1px solid rgba(140,156,196,0.14)`,
            fontSize: 14, lineHeight: 1.65,
            fontFamily: 'monospace',
            minHeight: 280,
          }}>
            {JSON_LINES.slice(0, visibleLines).map((line, i) => {
              // Color-code keys vs values
              let color = '#cfe3ff';
              if (line.includes('"severity"') && line.includes('Critical')) color = colors.pillCriticalText;
              else if (line.includes('"type"')) color = colors.accentCyan;
              else if (line.includes('"risks"') || line.includes('"actions"') || line.includes('"responders"')) color = colors.accent;
              else if (line.trim().startsWith('"') && !line.includes(':')) color = '#98a8c8';

              return (
                <div key={i} style={{ color, opacity: i === visibleLines - 1 ? 0.85 : 1 }}>
                  {line}
                  {i === visibleLines - 1 && visibleLines < JSON_LINES.length && (
                    <span style={{ opacity: frame % 14 < 7 ? 1 : 0, color: colors.accent }}>█</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Summary + Responder alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Summary grid */}
          <div style={{
            ...panelStyle,
            opacity: rightSpring,
            transform: `translateY(${interpolate(rightSpring, [0,1], [40,0])}px)`,
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, color: '#f3f6ff', fontFamily: fonts.body }}>Analysis Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Matched signals', val: visibleLines > 5 ? 'fuel_leak, collision, injury' : 'Pending...' },
                { label: 'People involved', val: visibleLines > 3 ? '~12 estimated' : 'Pending...' },
                { label: 'Location status', val: 'Lat/Lng synced' },
                { label: 'Confidence level', val: visibleLines > 10 ? 'AI-assisted' : 'Calculating...' },
              ].map(({ label, val }) => (
                <div key={label} style={{
                  borderRadius: 18, padding: 16,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${colors.borderSoft}`,
                  fontFamily: fonts.body,
                }}>
                  <div style={{ fontSize: 12, color: '#90a3cc', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: colors.textWhite }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Responder dispatch pills */}
          <div style={{
            ...panelStyle,
            opacity: rightSpring,
            transform: `translateY(${interpolate(rightSpring, [0,1], [40,0])}px)`,
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, color: '#f3f6ff', fontFamily: fonts.body }}>Authority Routing</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {responderPills.map((resp, i) => (
                <div key={resp} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  opacity: pillSprings[i],
                  transform: `translateX(${interpolate(pillSprings[i], [0,1], [-20,0])}px)`,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${colors.borderSoft}`,
                  fontFamily: fonts.body,
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: colors.pillMediumText,
                    boxShadow: `0 0 8px ${colors.pillMediumText}`,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, color: colors.textWhite, fontWeight: 700, fontSize: 15 }}>{resp}</div>
                  <span style={{
                    padding: '5px 12px', borderRadius: radius.pill,
                    background: colors.pillMediumBg, color: colors.pillMediumText,
                    fontSize: 12, fontWeight: 700,
                  }}>Dispatched</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
