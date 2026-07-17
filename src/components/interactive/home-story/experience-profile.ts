export type MotionProfile = 'full' | 'reduced';
export type MediaProfile = 'standard' | 'lite';

export interface MotionProfileInput {
  override: string | null;
  prefersReducedMotion: boolean;
}

export interface ConnectionHint {
  saveData?: boolean;
  effectiveType?: string;
}

export function resolveMotionProfile({
  override,
}: MotionProfileInput): MotionProfile {
  if (override === 'reduced') return 'reduced';
  return 'full';
}

export function resolveMediaProfile(connection?: ConnectionHint): MediaProfile {
  if (connection?.saveData) return 'lite';
  return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'
    ? 'lite'
    : 'standard';
}
