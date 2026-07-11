import type { ReactNode } from 'react';
import type { StoryScene } from './story';
import './home-story.css';

interface Props {
  scene: StoryScene;
  headingLevel?: 1 | 2;
  actions?: ReactNode;
  accessibleSummary?: string;
  children: ReactNode;
}

export default function SceneFrame({
  scene,
  headingLevel = 2,
  actions,
  accessibleSummary,
  children,
}: Props) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const light = scene.theme === 'light';
  const headingSize = headingLevel === 1
    ? 'text-[clamp(2.05rem,9vw,2.6rem)] lg:text-[clamp(2.6rem,4.3vw,5.25rem)]'
    : 'text-[clamp(1.9rem,8vw,2.35rem)] lg:text-[clamp(2.15rem,3.6vw,4.5rem)]';

  return (
    <div
      data-scene-frame={scene.id}
      className={`${headingLevel === 1 ? 'story-frame--hero' : 'story-frame--scene'} ${light ? 'h-full overflow-hidden bg-neutral-50 text-neutral-950' : 'h-full overflow-hidden bg-neutral-950 text-neutral-50'}`}
    >
      <div className="story-frame-grid mx-auto grid h-full max-w-[1400px] grid-rows-[minmax(0,42%)_minmax(0,58%)] gap-3 px-5 pb-4 pt-5 sm:gap-5 sm:px-6 sm:pb-6 sm:pt-7 md:grid-rows-[minmax(0,38%)_minmax(0,62%)] md:px-10 md:pb-8 md:pt-9 lg:grid-cols-[minmax(280px,34fr)_minmax(0,66fr)] lg:grid-rows-1 lg:items-center lg:gap-12 lg:px-16 lg:py-12 xl:gap-16 xl:px-20">
        <header className="relative z-20 min-h-0 max-w-[440px] self-center lg:pl-12">
          <p className={light ? 'text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-green-800 sm:text-xs' : 'text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-avoqado-green sm:text-xs'}>
            {scene.eyebrow}
          </p>
          <Heading className={`story-frame-heading ${headingLevel === 1 ? 'story-frame-heading--hero' : 'story-frame-heading--scene'} mt-2 font-light leading-[0.96] tracking-[-0.052em] sm:mt-3 lg:mt-4 ${headingSize}`}>
            {scene.title}
          </Heading>
          <p className={light ? 'story-frame-body mt-2 max-w-[62ch] text-[0.83rem] leading-[1.42] text-neutral-600 sm:mt-3 sm:text-[0.95rem] lg:mt-5 lg:text-[1.05rem] lg:leading-relaxed' : 'story-frame-body mt-2 max-w-[62ch] text-[0.83rem] leading-[1.42] text-neutral-300 sm:mt-3 sm:text-[0.95rem] lg:mt-5 lg:text-[1.05rem] lg:leading-relaxed'}>
            {scene.body}
          </p>
          {accessibleSummary ? <p className="sr-only">{accessibleSummary}</p> : null}
          {actions ? <div className="story-frame-actions mt-3 sm:mt-4 lg:mt-7">{actions}</div> : null}
        </header>
        <div aria-hidden="true" {...{ inert: '' }} className="story-frame-visual relative min-h-0 self-stretch lg:min-h-[520px]">
          {children}
        </div>
      </div>
    </div>
  );
}
