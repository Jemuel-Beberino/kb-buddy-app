// data/stories/index.js
// Central import point for all KB Buddy stories

import { coconutSeedlings } from './coconut-seedlings';
import { zeroPercentBatteryAtTheRobustaFarm } from './zero-percent-battery';
import { missingFootbridgeOfQuezon } from './missing-footbridge';
import { dayTheClassroomWentSilent } from './silent-classroom';
import { riceFieldAfterTheRain } from './rice-field-after-rain';
import { boyWhoFollowedTheFireflies } from './fireflies';
import { stormInQuezon } from './storm-in-quezon';
import { schoolGardenProject } from './school-garden';

export const allStories = [
  coconutSeedlings,
  zeroPercentBatteryAtTheRobustaFarm,
  missingFootbridgeOfQuezon,
  dayTheClassroomWentSilent,
  riceFieldAfterTheRain,
  boyWhoFollowedTheFireflies,
  stormInQuezon,
  schoolGardenProject,
];

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'values', label: 'Values' },
  { id: 'science', label: 'Science' },
  { id: 'sports', label: 'Sports' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'fable', label: 'Fable' },
];