import { Composition } from 'remotion';
import { CrisisSyncPromo } from './CrisisSyncPromo';
import { VIDEO_DURATION_FRAMES, VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from './tokens';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="CrisisSyncPromo"
        component={CrisisSyncPromo}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
