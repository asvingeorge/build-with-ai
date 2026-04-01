import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { colors, fonts, radius } from '../tokens';

function TypeWriter({ text, startFrame, charsPerFrame = 2 }: { text: string; startFrame: number; charsPerFrame?: number }) {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const visibleChars = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const visible = text.slice(0, visibleChars);
  const cursor = visibleChars < text.length ? '|' : '';
  return <>{visible}{cursor}</>;
}

export const HeroIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background glow pulse
  const glowOpacity = interpolate(frame, [0, 60, 120, 180], [0, 0.7, 0.9, 0.6], { extrapolateRight: 'clamp' });

  // Logo spring entrance
  const logoSpring = spring({ frame, fps, config: { damping: 14, stiffness: 80 }, delay: 10 });
  const logoY = interpolate(logoSpring, [0, 1], [60, 0]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  // Badge fade
  const badgeOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Tagline
  const tagOpacity = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Sub-copy spring
  const subSpring = spring({ frame, fps, config: { damping: 18, stiffness: 60 }, delay: 70 });
  const subY = interpolate(subSpring, [0, 1], [30, 0]);
  const subOpacity = subSpring;

  // Scan line effect
  const scanY = interpolate(frame, [0, 180], [-20, 1120], { extrapolateRight: 'clamp' });

  // Scene fade out
  const fadeOut = interpolate(frame, [155, 180], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const TAGLINE = 'AI-powered emergency coordination.';

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Radial glow center */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(80,110,255,${glowOpacity * 0.22}), transparent 65%)`,
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Scan line */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: scanY,
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(147,166,255,0.4), transparent)',
        opacity: 0.6,
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(147,166,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(147,166,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }} />

      {/* Center content */}
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>

        {/* Alert badge */}
        <div style={{
          opacity: badgeOpacity,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 18px',
          borderRadius: radius.pill,
          background: colors.pillCriticalBg,
          border: `1px solid rgba(248,113,113,0.3)`,
          color: colors.pillCriticalText,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          marginBottom: 28,
          fontFamily: fonts.body,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: colors.pillCriticalText,
            boxShadow: `0 0 8px ${colors.pillCriticalText}`,
            animation: 'none',
            opacity: frame % 20 < 10 ? 1 : 0.4,
          }} />
          LIVE EMERGENCY PLATFORM
        </div>

        {/* Logo */}
        <div style={{
          transform: `translateY(${logoY}px)`,
          opacity: logoOpacity,
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <div style={{
            fontSize: 96,
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
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: colors.brand,
            marginTop: 10,
            fontFamily: fonts.body,
          }}>
            AI Emergency Coordination
          </div>
        </div>

        {/* Tagline typewriter */}
        <div style={{
          opacity: tagOpacity,
          fontSize: 28,
          color: colors.textMuted,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          maxWidth: 700,
          textAlign: 'center',
          lineHeight: 1.5,
          minHeight: 40,
          fontFamily: fonts.body,
          marginBottom: 40,
        }}>
          <TypeWriter text={TAGLINE} startFrame={45} charsPerFrame={1.4} />
        </div>

        {/* Divider */}
        <div style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          width: 320,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(147,166,255,0.5), transparent)',
          marginBottom: 30,
        }} />

        {/* Key stats row */}
        <div style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          display: 'flex',
          gap: 40,
          fontFamily: fonts.body,
        }}>
          {[
            { label: 'AI Triage', value: 'Gemini-powered' },
            { label: 'Response Mode', value: 'Real-time' },
            { label: 'Dispatch', value: 'Multi-channel' },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: colors.textWhite }}>{value}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
