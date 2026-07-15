import { motion, useTransform, type MotionValue } from 'framer-motion';
import { OPENING_TILES, type OpeningTile } from './opening-tiles';

type OpeningVariant = 'mosaic-only' | 'channel-handoff';

interface OpeningTileCellProps {
  tile: OpeningTile;
  index: number;
  progress: MotionValue<number>;
  mobile: boolean;
  handoff: boolean;
}

function OpeningTileCell({ tile, index, progress, mobile, handoff }: OpeningTileCellProps) {
  const start = 0.18 + index * 0.012;
  const scale = useTransform(progress, [start, Math.min(start + 0.22, 0.50)], [0.25, 1]);
  const entranceOpacity = useTransform(progress, [start, Math.min(start + 0.14, 0.47)], [0, 1]);
  const exitOpacity = useTransform(
    progress,
    handoff && !tile.channelId ? [0.62, 0.72] : [0, 1],
    handoff && !tile.channelId ? [1, 0] : [1, 1],
  );
  const opacity = useTransform(() => Math.min(entranceOpacity.get(), exitOpacity.get()));
  const y = useTransform(progress, [start, Math.min(start + 0.22, 0.50)], [50, 0]);
  const position = mobile ? tile.mobile : tile.desktop;

  if (!position) return null;

  return (
    <motion.div
      data-opening-tile={tile.id}
      data-shared-tile-source={tile.channelId}
      style={{ gridColumn: position.col, gridRow: position.row, scale, opacity, y }}
      className="overflow-hidden rounded-lg bg-gray-100 md:rounded-xl lg:rounded-2xl"
    >
      <img src={tile.src} alt="" loading="lazy" className="size-full object-cover" />
    </motion.div>
  );
}

export default function OpeningMosaic({
  progress,
  variant,
  isMobile,
}: {
  progress: MotionValue<number>;
  variant: OpeningVariant;
  isMobile: boolean;
}) {
  const gridOpacity = useTransform(progress, [0.18, 0.35], [0, 1]);
  const handoff = variant === 'channel-handoff';
  const copyEntranceOpacity = useTransform(progress, [0.35, 0.50], [0, 1]);
  const copyExitOpacity = useTransform(progress, handoff ? [0.62, 0.72] : [0, 1], handoff ? [1, 0] : [1, 1]);
  const copyOpacity = useTransform(() => Math.min(copyEntranceOpacity.get(), copyExitOpacity.get()));

  const renderCopy = () => (
    <motion.h2
      style={{ opacity: copyOpacity }}
      className="relative text-center text-base font-light leading-snug text-black sm:text-lg md:text-2xl lg:text-4xl xl:text-5xl"
    >
      Tiendas, gyms, estéticas, clínicas y más.<br />
      Cobra, organiza y crece desde un solo lugar.
    </motion.h2>
  );

  return (
    <div
      data-opening-mosaic={variant}
      className="absolute inset-x-0 bottom-0 top-[100px] overflow-hidden bg-white"
    >
      <motion.div
        style={{ opacity: gridOpacity }}
        className={isMobile ? 'absolute inset-0 size-full p-3' : 'absolute inset-0 size-full p-4 md:p-6 lg:p-8'}
      >
        <div className={isMobile ? 'grid size-full grid-cols-3 grid-rows-5 gap-2' : 'grid size-full grid-cols-9 grid-rows-5 gap-3 lg:gap-4'}>
          {OPENING_TILES.map((tile, index) => (
            <OpeningTileCell
              key={tile.id}
              tile={tile}
              index={index}
              progress={progress}
              mobile={isMobile}
              handoff={handoff}
            />
          ))}
          <div className={isMobile ? 'relative z-20 col-span-3 col-start-1 row-start-3 flex items-center justify-center px-2' : 'relative z-20 col-span-9 col-start-1 row-start-3 flex items-center justify-center px-4'}>
            <div className="relative">
              <div className={isMobile ? 'absolute -inset-x-4 -inset-y-2 rounded-lg bg-white/90 backdrop-blur-sm' : 'absolute -inset-x-6 -inset-y-3 rounded-xl bg-white/90 backdrop-blur-sm'} />
              {renderCopy()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
