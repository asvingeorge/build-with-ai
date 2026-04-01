import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { colors, fonts, radius, shadows } from '../tokens';

const SAMPLE_TEXT = 'A bus collided with a truck near the flyover. Several passengers are injured, fuel is leaking, and traffic is blocked.';

function TypeInTextarea({ text, startFrame, fps }: { text: string; startFrame: number; fps: number }) {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  // Type ~3 chars per frame for brisk feel
  const visible = text.slice(0, Math.min(text.length, Math.floor(elapsed * 2.8)));
  const showCursor = visible.length < text.length;
  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {visible}
      {showCursor && <span style={{ opacity: frame % 16 < 8 ? 1 : 0, color: colors.accent }}>|</span>}
    </span>
  );
}

export const DistressIntake: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Container fade-in
  const containerIn = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Panel slides up
  const panelSpring = spring({ frame, fps, config: { damping: 16, stiffness: 70 }, delay: 10 });
  const panelY = interpolate(panelSpring, [0, 1], [60, 0]);

  // Right panel
  const rightSpring = spring({ frame, fps, config: { damping: 16, stiffness: 60 }, delay: 30 });
  const rightY = interpolate(rightSpring, [0, 1], [60, 0]);

  // Lat/lng fields fade in after text is mostly typed
  const locFieldsOpacity = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Analyze button pulse
  const buttonFrame = Math.max(0, frame - 130);
  const pulseScale = 1 + 0.025 * Math.sin(buttonFrame * 0.18);
  const buttonGlow = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // "Analyzing..." text appears
  const analyzingOpacity = interpolate(frame, [168, 185], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Status bar pills
  const statusIn = spring({ frame, fps, config: { damping: 20, stiffness: 80 }, delay: 5 });

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

  return (
    <AbsoluteFill style={{ opacity: fadeOut * containerIn, padding: '48px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ opacity: spring({ frame, fps, config: { damping: 20, stiffness: 80 } }) }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: colors.kicker, letterSpacing: '0.24em', textTransform: 'uppercase', fontFamily: fonts.body, marginBottom: 10 }}>
          CrisisSync AI
        </div>
        <h1 style={{ margin: 0, fontSize: 52, fontWeight: 900, letterSpacing: '-0.05em', color: colors.textWhite, lineHeight: 0.95, fontFamily: fonts.body }}>
          AI-powered emergency coordination.
        </h1>
      </div>

      {/* Status bar */}
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap',
        opacity: statusIn,
        transform: `translateY(${interpolate(statusIn, [0, 1], [20, 0])}px)`,
      }}>
        {[
          { label: 'Gemini connected', cls: 'medium' },
          { label: 'Provider: Gemini AI', cls: 'neutral' },
          { label: analyzingOpacity > 0.5 ? 'Analyzing incident...' : 'Ready to analyze incoming incidents.', cls: 'neutral' },
        ].map(({ label, cls }) => {
          const bg = cls === 'medium' ? colors.pillMediumBg : colors.pillNeutralBg;
          const color = cls === 'medium' ? colors.pillMediumText : colors.pillNeutralText;
          return (
            <span key={label} style={{
              display: 'inline-flex', alignItems: 'center',
              borderRadius: radius.pill, padding: '7px 14px',
              background: bg, color, fontSize: 13, fontWeight: 700,
              fontFamily: fonts.body,
            }}>{label}</span>
          );
        })}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, flex: 1 }}>

        {/* Left: Distress Intake form */}
        <div style={{ ...panelStyle, transform: `translateY(${panelY}px)`, opacity: panelSpring }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 18, color: '#f3f6ff', fontFamily: fonts.body }}>Distress Intake</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Load sample', 'Voice input', 'Use my location'].map(btn => (
                <div key={btn} style={{
                  padding: '8px 12px', borderRadius: 12,
                  background: colors.pillNeutralBg, color: colors.pillNeutralText,
                  fontSize: 12, fontWeight: 700, fontFamily: fonts.body,
                }}>{btn}</div>
              ))}
            </div>
          </div>

          {/* Description field */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: colors.textFaint, fontWeight: 600, marginBottom: 8, fontFamily: fonts.body }}>Description</div>
            <div style={{
              width: '100%',
              border: `1px solid rgba(111,161,255,0.72)`,
              borderRadius: 16,
              background: 'rgba(5,10,19,0.88)',
              color: '#eef2ff',
              padding: '14px 16px',
              fontSize: 15,
              lineHeight: 1.65,
              minHeight: 200,
              boxShadow: '0 0 0 4px rgba(88,129,255,0.16)',
              fontFamily: fonts.body,
            }}>
              <TypeInTextarea text={SAMPLE_TEXT} startFrame={35} fps={fps} />
            </div>
          </div>

          {/* Location fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, opacity: locFieldsOpacity, marginBottom: 16 }}>
            {[['Latitude', '17.43993'], ['Longitude', '78.49827']].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 13, color: colors.textFaint, fontWeight: 600, marginBottom: 8, fontFamily: fonts.body }}>{label}</div>
                <div style={{
                  border: `1px solid rgba(140,156,196,0.18)`,
                  borderRadius: 16,
                  background: 'rgba(5,10,19,0.88)',
                  color: '#eef2ff',
                  padding: '14px 16px',
                  fontSize: 15,
                  fontFamily: fonts.body,
                }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Submit button */}
          <div style={{
            width: '100%',
            padding: '16px 18px',
            borderRadius: 16,
            fontWeight: 700,
            color: '#08111d',
            background: 'linear-gradient(135deg, #93a6ff, #6ce0ff)',
            fontSize: 16,
            textAlign: 'center',
            transform: `scale(${pulseScale})`,
            boxShadow: buttonGlow > 0 ? `0 0 ${interpolate(buttonGlow, [0, 1], [0, 40])}px rgba(147,166,255,${interpolate(buttonGlow, [0, 1], [0, 0.6])})` : 'none',
            fontFamily: fonts.body,
            cursor: 'pointer',
          }}>
            {analyzingOpacity > 0.5 ? 'Analyzing...' : 'Analyze and Coordinate'}
          </div>
        </div>

        {/* Right: triage placeholder before output */}
        <div style={{ ...panelStyle, transform: `translateY(${rightY}px)`, opacity: rightSpring }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 18, color: '#f3f6ff', fontFamily: fonts.body }}>AI Triage Output</h2>
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '6px 10px',
              borderRadius: radius.pill, background: 'rgba(255,114,134,0.12)',
              color: '#ffb3bf', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.08em', fontFamily: fonts.body,
            }}>STRICT JSON</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {['No severity yet', 'No type yet', 'Confidence: N/A', 'Signals: 0'].map(p => (
              <span key={p} style={{
                borderRadius: radius.pill, padding: '7px 14px',
                background: colors.pillNeutralBg, color: colors.pillNeutralText,
                fontSize: 12, fontWeight: 700, fontFamily: fonts.body,
              }}>{p}</span>
            ))}
          </div>

          <div style={{
            padding: '18px', borderRadius: 18,
            background: 'rgba(4,8,15,0.92)',
            border: `1px solid rgba(140,156,196,0.14)`,
            color: '#cfe3ff', fontSize: 15, lineHeight: 1.65,
            fontFamily: 'monospace',
          }}>
            {`{
  "type": "",
  "severity": "",
  "risks": [],
  "actions": [],
  "responders": []
}`}
          </div>

          <div style={{ color: colors.textMuted, fontSize: 15, marginTop: 20, fontFamily: fonts.body }}>
            Submit a distress report to see the AI triage output appear here in real time.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
