import { AbsoluteFill, Sequence } from 'remotion';
import { colors, fonts } from './tokens';
import { HeroIntro } from './scenes/HeroIntro';
import { LandingPreview } from './scenes/LandingPreview';
import { DistressIntake } from './scenes/DistressIntake';
import { AITriageOutput } from './scenes/AITriageOutput';
import { StatsCountUp } from './scenes/StatsCountUp';
import { Outro } from './scenes/Outro';

// Scene timing (frames at 30fps)
// Scene 1: Hero Intro     0 – 150   (0–5s)
// Scene 2: Landing        150 – 360 (5–12s)
// Scene 3: Distress       360 – 540 (12–18s)
// Scene 4: Triage Output  540 – 720 (18–24s)
// Scene 5: Stats          720 – 840 (24–28s)
// Scene 6: Outro          840 – 900 (28–30s)

export const CrisisSyncPromo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(circle at top, rgba(80,110,255,0.18), transparent 30%),
          radial-gradient(circle at bottom right, rgba(235,76,90,0.14), transparent 26%),
          linear-gradient(180deg, ${colors.bg} 0%, ${colors.bgDeep} 100%)
        `,
        fontFamily: fonts.body,
        color: colors.text,
        overflow: 'hidden',
      }}
    >
      <Sequence from={0} durationInFrames={180}>
        <HeroIntro />
      </Sequence>

      <Sequence from={150} durationInFrames={240}>
        <LandingPreview />
      </Sequence>

      <Sequence from={360} durationInFrames={210}>
        <DistressIntake />
      </Sequence>

      <Sequence from={540} durationInFrames={210}>
        <AITriageOutput />
      </Sequence>

      <Sequence from={720} durationInFrames={150}>
        <StatsCountUp />
      </Sequence>

      <Sequence from={840} durationInFrames={60}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
