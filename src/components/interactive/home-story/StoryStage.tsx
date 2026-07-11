import type { MotionValue } from 'framer-motion';
import SceneFrame from './SceneFrame';
import StoryLayer from './StoryLayer';
import { STORY_SCENES, type StoryScene } from './story';
import AftercareScene from './scenes/AftercareScene';
import ChannelsScene from './scenes/ChannelsScene';
import FinanceScene from './scenes/FinanceScene';
import HeroScene from './scenes/HeroScene';
import OperationsScene from './scenes/OperationsScene';
import PaymentScene from './scenes/PaymentScene';
import ServiceScene from './scenes/ServiceScene';

interface Props {
  progress: MotionValue<number>;
  activeIndex: number;
}

function renderScene(scene: StoryScene, progress: MotionValue<number>) {
  switch (scene.id) {
    case 'entry':
      return <HeroScene scene={scene} progress={progress} />;
    case 'channels':
      return <ChannelsScene scene={scene} progress={progress} />;
    case 'service':
      return <ServiceScene scene={scene} progress={progress} />;
    case 'payment':
      return <PaymentScene scene={scene} progress={progress} />;
    case 'aftercare':
      return <AftercareScene scene={scene} progress={progress} />;
    case 'operations':
      return <OperationsScene scene={scene} progress={progress} />;
    case 'finance':
      return <FinanceScene scene={scene} progress={progress} />;
    default:
      return <SceneFrame scene={scene}><div className="h-full" /></SceneFrame>;
  }
}

export default function StoryStage({ progress, activeIndex }: Props) {
  return (
    <div className="relative h-full w-full">
      {STORY_SCENES.map((scene, index) => (
        <StoryLayer
          key={scene.id}
          scene={scene}
          index={index}
          total={STORY_SCENES.length}
          progress={progress}
          active={index === activeIndex}
        >
          {localProgress => renderScene(scene, localProgress)}
        </StoryLayer>
      ))}
    </div>
  );
}
