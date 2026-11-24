import { PoseTracker } from './PoseTracker';
import type { Tracker } from './types';

export function createTracker(): Tracker {
  return new PoseTracker();
}