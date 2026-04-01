import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { colors, fonts, radius, shadows } from '../tokens';

interface StatDef {
  label: string;
  sublabel: string;
  numericTarget: number;
  formatFn: (v: number, p: number) => string;
  icon: string;
  color: string;
  glowColor: string;
}

const STATS: StatDef[] = [
  {
    label: 'AI Triage',
    sublabel: 'Structured JSON from text and voice reports',
    numericTarget: 2,
    formatFn: (v) => `< ${v.toFixed(1)}s`,
    icon: '⚡',
    color: colors.accent,
    glowColor: 'rgba(147,166,255,0.3)',
  },
  {
    label: 'Incidents Handled',
    sublabel: 'Coordinated through CrisisSync',
    numericTarget: 1240,
    formatFn: (v, p) => Math.floor(v).toLocaleString() + (p >= 1 ? '+' : ''),
    icon: '🚨',
    color: colors.pillCriticalText,
    glowColor: 'rgba(252,165,165,0.3)',
  },
  {
    label: 'Responder Speed',
    sublabel: 'From intake to authority dispatch',
    numericTarget: 4.8,
    formatFn: (v) => `${v.toFixed(1)}s`,
    icon: '📡',
    color: colors.accentCyan,
    glowColor: 'rgba(108,224,255,0.3)',
  },
];

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export const StatsCountUp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerIn = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [125, 150], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerSpring = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const statSprings = STATS.map((_, i) =>
    spring({ frame, fps, config: { damping: 14, stiffness: 60 }, delay: 20 + i * 18 })
  );
  const countProgress = easeOut(
    interpolate(frame, [30, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );

  return (
    <AbsoluteFill style={{
      opacity: fadeOut * containerIn,
      padding: '80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 48,
    }}>
      <div style={{
        textAlign: 'center',
        opacity: headerSpring,
        transform: `translateY(${interpolate(headerSpring, [0, 1], [30, 0])}px)`,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.kicker, letterSpacing: '0.24em', textTransform: 'uppercase', fontFamily: fonts.body, marginBottom: 12 }}>
          Platform Performance
        </div>
        <h2 style={{ margin: 0, fontSize: 60, fontWeight: 900, letterSpacing: '-0.05em', color: colors.textWhite, lineHeight: 0.95, fontFamily: fonts.body }}>
          Built for speed and precision.
        </h2>
        <p style={{ marginTop: 16, color: colors.textMuted, fontSize: 20, fontFamily: fonts.body }}>
          From raw distress report to coordinated response in seconds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, width: '100%', maxWidth: 1100 }}>
        {STATS.map((stat, i) => (
          <div key={stat.label} style={{
            border: `1px solid ${colors.border}`,
            borderRadius: radius.cardLg,
            background: `linear-gradient(180deg, ${colors.surface}, rgba(7,12,23,0.86))`,
            boxShadow: shadows.card,
            padding: 40,
            textAlign: 'center',
            opacity: statSprings[i],
            transform: `translateY(${interpolate(statSprings[i], [0, 1], [50, 0])}px)`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
              width: 200, height: 200, borderRadius: '50%',
              background: `radial-gradient(circle, ${stat.glowColor}, transparent 65%)`,
              filter: 'blur(30px)', opacity: countProgress, pointerEvents: 'none',
            }} />
            <div style={{ fontSize: 42, marginBottom: 12 }}>{stat.icon}</div>
            <div style={{
              fontSize: 72, fontWeight: 900, letterSpacing: '-0.04em',
              color: stat.color, lineHeight: 1, fontFamily: fonts.body,
              textShadow: `0 0 ${30 * countProgress}px ${stat.glowColor}`,
            }}>
              {stat.formatFn(stat.numericTarget * countProgress, countProgress)}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: colors.textWhite, marginTop: 14, fontFamily: fonts.body }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 14, color: colors.textMuted, marginTop: 8, lineHeight: 1.5, fontFamily: fonts.body }}>
              {stat.sublabel}
            </div>
            <div style={{
              position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2,
              background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
              opacity: countProgress * 0.6,
            }} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
