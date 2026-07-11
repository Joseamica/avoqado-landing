import { motion, useTransform, type MotionValue } from 'framer-motion';
import { CalendarDays, Globe2, MonitorSmartphone, Smartphone, type LucideIcon } from 'lucide-react';
import SceneFrame from '../SceneFrame';
import { STORY_FIXTURE } from '../story-fixture';
import type { StoryScene } from '../story';

interface Channel {
  label: string;
  detail: string;
  result: string;
  icon: LucideIcon;
  active?: boolean;
}

function ChannelRow({ channel, index, progress }: {
  channel: Channel;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = 0.06 + index * 0.08;
  const opacity = useTransform(progress, [start, start + 0.18], [0.35, 1]);
  const x = useTransform(progress, [start, start + 0.18], [-14, 0]);
  const Icon = channel.icon;

  return (
    <motion.li
      className={channel.active
        ? 'story-channel-row relative grid grid-cols-[1.6rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-black/8 bg-green-100/70 py-2.5 pl-2 pr-2 text-green-950 last:border-b-0 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-3 sm:py-3.5 sm:pl-3'
        : 'story-channel-row relative grid grid-cols-[1.6rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-black/8 py-2.5 pl-2 pr-2 text-neutral-700 last:border-b-0 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-3 sm:py-3.5 sm:pl-3'}
      style={{ opacity, x }}
    >
      <span className={channel.active ? 'grid size-7 place-items-center text-green-900 sm:size-8' : 'grid size-7 place-items-center text-neutral-400 sm:size-8'}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <strong className="block text-[0.74rem] font-semibold leading-tight sm:text-sm">{channel.label}</strong>
        <span className="mt-0.5 block truncate text-[0.62rem] leading-tight text-current opacity-65 sm:text-xs">{channel.detail}</span>
      </span>
      <span className="flex items-center gap-2 text-right text-[0.58rem] font-medium uppercase tracking-[0.08em] text-current opacity-70 sm:text-[0.65rem]">
        {channel.result}
        <span className={channel.active ? 'h-px w-5 origin-left bg-avoqado-green sm:w-10' : 'h-px w-5 bg-neutral-300 sm:w-10'} />
      </span>
    </motion.li>
  );
}

export default function ChannelsScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const eventOpacity = useTransform(progress, [0.28, 0.5], [0, 1]);
  const eventX = useTransform(progress, [0.28, 0.56], [18, 0]);
  const desktopPulseX = useTransform(progress, [0, 0.16, 0.52, 0.84, 1], [0, 22, 410, 22, 0]);
  const desktopPulseY = useTransform(progress, [0, 0.16, 0.52, 0.84, 1], [0, -72, -10, -72, 0]);
  const mobilePulseY = useTransform(progress, [0, 0.22, 0.62, 0.86, 1], [0, 96, 250, 96, 0]);
  const pulseScale = useTransform(progress, [0.36, 0.5, 0.62], [0.94, 1.08, 1]);
  const channels: Channel[] = [
    { label: 'Consumer App', detail: 'La clienta elige y reserva', result: 'Reserva', icon: Smartphone },
    { label: STORY_FIXTURE.selectedChannel, detail: 'Cita con depósito', result: 'Ruta activa', icon: CalendarDays, active: true },
    { label: 'Online', detail: 'Ecommerce + liga de pago', result: 'Pago', icon: Globe2 },
    { label: 'Punto de venta', detail: 'POS iOS · POS Android · POS Desktop', result: 'Venta presencial', icon: MonitorSmartphone },
  ];

  return (
    <SceneFrame
      scene={scene}
      accessibleSummary={`${STORY_FIXTURE.selectedChannel} es la ruta activa. Registra ${STORY_FIXTURE.service} para ${STORY_FIXTURE.customer} a las ${STORY_FIXTURE.appointmentTime} en ${STORY_FIXTURE.venue}. Consumer App, POS iOS, POS Android y POS Desktop son canales disponibles.`}
    >
      <div className="story-channel-visual relative grid h-full min-h-0 content-center gap-3 sm:grid-cols-[minmax(260px,1.05fr)_minmax(220px,0.8fr)] sm:items-center sm:gap-8">
        <div className="story-channel-ledger relative border-y border-black/10 bg-neutral-50">
          <p className="border-b border-black/8 px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:py-3 sm:text-[0.65rem]">
            Entradas de la operación
          </p>
          <ol>
            {channels.map((channel, index) => (
              <ChannelRow key={channel.label} channel={channel} index={index} progress={progress} />
            ))}
          </ol>
        </div>

        <motion.div
          className="story-channel-event relative border border-white/8 bg-neutral-950 px-4 py-3.5 text-neutral-50 shadow-[0_20px_60px_oklch(0.13_0.005_155_/_0.16)] sm:px-5 sm:py-5"
          style={{ opacity: eventOpacity, x: eventX }}
        >
          <div className="story-channel-event-header flex items-center justify-between border-b border-white/10 pb-2.5 sm:pb-3">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-avoqado-green sm:text-[0.65rem]">Reserva confirmada</span>
            <span className="text-[0.65rem] text-neutral-400 sm:text-xs">{STORY_FIXTURE.appointmentTime}</span>
          </div>
          <p className="story-channel-event-service mt-3 text-base font-medium tracking-[-0.02em] sm:mt-5 sm:text-xl">{STORY_FIXTURE.service}</p>
          <p className="mt-1 text-xs text-neutral-300 sm:text-sm">{STORY_FIXTURE.customer}</p>
          <p className="story-channel-event-venue mt-2 text-[0.65rem] text-neutral-500 sm:mt-4 sm:text-xs">{STORY_FIXTURE.venue}</p>
          <span className="absolute -left-1 top-1/2 size-2 rounded-full border border-avoqado-green/30 bg-avoqado-green" />
        </motion.div>

        <div className="pointer-events-none absolute left-0 top-1/2 hidden h-px w-[54%] bg-black/10 sm:block" />
        <motion.span
          className="pointer-events-none absolute left-0 top-1/2 z-20 hidden size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green sm:block"
          style={{ x: desktopPulseX, y: desktopPulseY, scale: pulseScale }}
        />
        <div className="pointer-events-none absolute left-3 top-0 h-[88%] w-px bg-black/10 sm:hidden" />
        <motion.span
          className="pointer-events-none absolute left-[0.48rem] top-0 z-20 size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green sm:hidden"
          style={{ y: mobilePulseY, scale: pulseScale }}
        />
      </div>
    </SceneFrame>
  );
}
