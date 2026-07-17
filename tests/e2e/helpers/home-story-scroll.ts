import type { Page } from 'playwright/test';
import {
  STORY_SCENES,
  type StorySceneId,
} from '../../../src/components/interactive/home-story/story';

export async function settleFrames(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
}

export async function scrollStorySceneTo(
  page: Page,
  sceneId: StorySceneId,
  localProgress: number,
) {
  const scene = STORY_SCENES.find(item => item.id === sceneId);
  if (!scene) throw new Error(`Unknown story scene: ${sceneId}`);
  const globalProgress = scene.range[0]
    + localProgress * (scene.range[1] - scene.range[0]);
  await scrollStoryGlobalTo(page, globalProgress);
}

export async function scrollStoryGlobalTo(page: Page, globalProgress: number) {
  const root = page.locator('[data-story-mode="animated"]');
  await root.evaluate((element, value) => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: 'auto' });
  }, globalProgress);
  await settleFrames(page);
}

export async function scrollOpeningNarrativeTo(page: Page, localProgress: number) {
  const opening = page.locator('[data-opening-mode="animated"]');
  const globalProgress = 0.60 + localProgress * (0.98 - 0.60);
  await opening.evaluate((element, value) => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: 'auto' });
  }, globalProgress);
  await settleFrames(page);
}
