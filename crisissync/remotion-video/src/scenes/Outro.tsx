import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { colors, fonts, radius } from '../tokens';

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const urlOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pillsOpacity = interpolate(frame, [28, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeToBlack = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(80,110,255,0.15), transparent 65%)',
        filter: 'blur(50px)', pointerEvents: 'none',
        opacity: logoSpring,
      }} />

      {/* Logo block */}
      <div style={{
        textAlign: 'center',
        opacity: logoSpring,
        transform: `scale(${interpolate(logoSpring, [0, 1], [0.85, 1])})`,
      }}>
        <div style={{
          fontSize: 100,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          background: `linear-gradient(135deg, #f8fbff 0%, ${colors.accent} 50%, ${colors.accentCyan} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: fonts.body,
        }}>
          CrisisSync
        </div>
        <div style={{
          fontSize: 18, fontWeight: 700, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: colors.brand,
          marginTop: 10, fontFamily: fonts.body,
        }}>
          AI Emergency Coordination
        </div>
      </div>

      {/* URL */}
      <div style={{
        opacity: urlOpacity,
        marginTop: 28,
        fontSize: 24,
        color: colors.textMuted,
        fontFamily: fonts.body,
        letterSpacing: '0.06em',
      }}>
        crisissync.app
      </div>

      {/* Pill tags */}
      <div style={{
        opacity: pillsOpacity,
        display: 'flex',
        gap: 14,
        marginTop: 24,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {['AI Triage', 'Geo-aware', 'Command View', 'Authority Dispatch'].map(tag => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center',
            borderRadius: radius.pill, padding: '8px 16px',
            background: colors.pillNeutralBg, color: colors.pillNeutralText,
            fontSize: 14, fontWeight: 700,
            fontFamily: fonts.body,
          }}>{tag}</span>
        ))}
      </div>

      {/* Fade to black overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#000',
        opacity: fadeToBlack,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
