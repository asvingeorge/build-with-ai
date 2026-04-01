import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { colors, fonts, radius, shadows } from '../tokens';

function Pill({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: radius.pill,
      padding: '7px 14px',
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: '0.02em',
      background: bg,
      color,
      fontFamily: fonts.body,
    }}>
      {children}
    </span>
  );
}

export const LandingPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in from black
  const containerOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Hero card slides in from left
  const heroSpring = spring({ frame, fps, config: { damping: 16, stiffness: 70 }, delay: 15 });
  const heroX = interpolate(heroSpring, [0, 1], [-120, 0]);
  const heroOpacity = heroSpring;

  // Preview card slides in from right
  const previewSpring = spring({ frame, fps, config: { damping: 16, stiffness: 70 }, delay: 35 });
  const previewX = interpolate(previewSpring, [0, 1], [120, 0]);
  const previewOpacity = previewSpring;

  // Nav bar drops in from top
  const navSpring = spring({ frame, fps, config: { damping: 18, stiffness: 90 }, delay: 5 });
  const navY = interpolate(navSpring, [0, 1], [-40, 0]);
  const navOpacity = navSpring;

  // Feature cards stagger in
  const feat1Spring = spring({ frame, fps, config: { damping: 16, stiffness: 60 }, delay: 70 });
  const feat2Spring = spring({ frame, fps, config: { damping: 16, stiffness: 60 }, delay: 90 });
  const feat3Spring = spring({ frame, fps, config: { damping: 16, stiffness: 60 }, delay: 110 });
  const featSprings = [feat1Spring, feat2Spring, feat3Spring];

  // Fade out
  const fadeOut = interpolate(frame, [210, 240], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const cardStyle: React.CSSProperties = {
    border: `1px solid ${colors.border}`,
    borderRadius: radius.cardLg,
    background: `linear-gradient(180deg, ${colors.surface}, rgba(7,12,23,0.86)), radial-gradient(circle at top left, rgba(84,120,255,0.1), transparent 32%)`,
    boxShadow: shadows.card,
    padding: 34,
    position: 'relative',
    overflow: 'hidden',
  };

  const featureCards = [
    { index: '01', title: 'AI Triage', copy: 'Gemini-assisted crisis classification turns raw distress reports into structured action plans in seconds.' },
    { index: '02', title: 'Live Coordination', copy: 'Keep operations teams aligned with incident feeds, dispatch logs, location context, and responder routing.' },
    { index: '03', title: 'Public Safety Alerts', copy: 'Prepare authority handoff payloads and nearby people notifications from one dashboard.' },
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeOut * containerOpacity, padding: '40px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Nav Bar */}
      <div style={{
        transform: `translateY(${navY}px)`,
        opacity: navOpacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: colors.brand, fontFamily: fonts.body }}>
            CrisisSync AI
          </div>
          <div style={{ fontSize: 14, color: '#8da0c8', marginTop: 4, fontFamily: fonts.body }}>Smart Emergency Coordination Platform</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['Login', 'Sign up'].map(btn => (
            <div key={btn} style={{
              padding: '9px 16px',
              borderRadius: 12,
              background: colors.pillNeutralBg,
              color: colors.pillNeutralText,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: fonts.body,
            }}>{btn}</div>
          ))}
        </div>
      </div>

      {/* Hero grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 24, flex: '0 0 auto' }}>

        {/* Left: Hero copy */}
        <div style={{ ...cardStyle, transform: `translateX(${heroX}px)`, opacity: heroOpacity }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: colors.kicker, marginBottom: 16, fontFamily: fonts.body }}>
            AI-powered decision and coordination
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: '-0.05em',
            color: colors.textWhite,
            maxWidth: '9ch',
            fontFamily: fonts.body,
          }}>
            Detect crises faster.
          </h1>
          <p style={{ marginTop: 20, color: colors.textMuted, fontSize: 18, lineHeight: 1.7, maxWidth: 500, fontFamily: fonts.body }}>
            CrisisSync combines AI triage, real-time location context, live coordination dashboards, and authority dispatch workflows.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
            <div style={{
              padding: '16px 24px',
              borderRadius: 18,
              fontWeight: 800,
              color: '#08111d',
              background: 'linear-gradient(135deg, #93a6ff, #6ce0ff)',
              fontSize: 16,
              fontFamily: fonts.body,
            }}>
              Let's Get Started
            </div>
            <div style={{ color: '#d8e1ff', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', fontFamily: fonts.body }}>
              Create an account
            </div>
          </div>

          {/* Stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 28 }}>
            {[
              { label: 'AI Triage', desc: 'Structured JSON from reports' },
              { label: 'Geo-aware', desc: 'Map-ready coordinates' },
              { label: 'Command View', desc: 'Realtime dispatch logs' },
            ].map(s => (
              <div key={s.label} style={{
                borderRadius: 18, padding: 14,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${colors.borderSoft}`,
                fontFamily: fonts.body,
              }}>
                <div style={{ fontWeight: 700, color: colors.textWhite, fontSize: 14, marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: '#98a8c8', fontSize: 12 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live ops preview */}
        <div style={{ ...cardStyle, transform: `translateX(${previewX}px)`, opacity: previewOpacity, padding: 24 }}>
          <div style={{
            display: 'inline-flex', padding: '7px 12px', borderRadius: radius.pill,
            background: colors.pillNeutralBg, color: colors.pillNeutralText,
            fontSize: 12, fontWeight: 700, marginBottom: 16, fontFamily: fonts.body,
          }}>
            Live ops preview
          </div>
          <div style={{
            borderRadius: 24,
            background: 'rgba(4,8,15,0.84)',
            border: `1px solid ${colors.borderSoft}`,
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: `1px solid ${colors.borderSoft}`,
              color: '#9fb3d8', fontSize: 14, fontFamily: fonts.body,
            }}>
              <span>Incident routed</span>
              <span>Critical</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                <Pill color={colors.pillCriticalText} bg={colors.pillCriticalBg}>Fire</Pill>
                <Pill color={colors.pillNeutralText} bg={colors.pillNeutralBg}>Authority handoff</Pill>
                <Pill color={colors.pillNeutralText} bg={colors.pillNeutralBg}>Nearby alert</Pill>
              </div>
              <h2 style={{ margin: 0, color: colors.textWhite, fontSize: 28, lineHeight: 1.08, fontFamily: fonts.body }}>
                Apartment smoke escalation with one resident trapped inside.
              </h2>
              <p style={{ color: '#98a8c8', fontSize: 14, lineHeight: 1.6, marginTop: 12, fontFamily: fonts.body }}>
                AI identifies a high-risk fire event, routes the report to Fire Control and Police, and prepares nearby SMS notifications with location context.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
                {[
                  ['Responders', 'Fire, Police'],
                  ['Dispatch mode', 'Immediate multi-channel'],
                  ['Location', 'Lat 17.43993, Lng 78.49827'],
                  ['Nearby people', '24 public alerts'],
                ].map(([label, val]) => (
                  <div key={label} style={{
                    borderRadius: 14, padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${colors.borderSoft}`,
                    fontFamily: fonts.body,
                  }}>
                    <div style={{ color: '#98a8c8', fontSize: 11 }}>{label}</div>
                    <div style={{ color: colors.textWhite, fontWeight: 700, fontSize: 14, marginTop: 3 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {featureCards.map((card, i) => (
          <div key={card.title} style={{
            ...cardStyle,
            padding: 24,
            opacity: featSprings[i],
            transform: `translateY(${interpolate(featSprings[i], [0, 1], [30, 0])}px)`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', color: colors.kicker, marginBottom: 10, fontFamily: fonts.body }}>{card.index}</div>
            <h3 style={{ margin: '0 0 8px', color: colors.textWhite, fontSize: 18, fontFamily: fonts.body }}>{card.title}</h3>
            <p style={{ margin: 0, color: '#98a8c8', fontSize: 14, lineHeight: 1.6, fontFamily: fonts.body }}>{card.copy}</p>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
