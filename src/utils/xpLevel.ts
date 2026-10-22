export interface LevelTier {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badgeName: string;
  color: string;
  perks: string[];
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    level: 1,
    title: 'Novice Learner',
    minXp: 0,
    maxXp: 299,
    badgeName: 'Bronze Scholar',
    color: 'from-amber-600 to-amber-800',
    perks: ['Basic skill assessments', 'Personalized roadmap access', 'Standard AI feedback'],
  },
  {
    level: 2,
    title: 'Apprentice Coder',
    minXp: 300,
    maxXp: 699,
    badgeName: 'Silver Artisan',
    color: 'from-slate-400 to-slate-600',
    perks: ['Adaptive difficulty calibration', 'Interactive practice tasks', 'Milestone completion bonuses'],
  },
  {
    level: 3,
    title: 'Code Practitioner',
    minXp: 700,
    maxXp: 1299,
    badgeName: 'Gold Adept',
    color: 'from-amber-500 to-yellow-600',
    perks: ['AI Socrates deep diagnostics', 'Custom study time tuning', 'Advanced code output questions'],
  },
  {
    level: 4,
    title: 'Proficient Builder',
    minXp: 1300,
    maxXp: 2199,
    badgeName: 'Platinum Developer',
    color: 'from-cyan-500 to-blue-600',
    perks: ['Multi-topic tailored quizzes', 'Deep misconception breakdowns', 'Speed challenge mode'],
  },
  {
    level: 5,
    title: 'Skill Specialist',
    minXp: 2200,
    maxXp: 3399,
    badgeName: 'Ruby Specialist',
    color: 'from-rose-500 to-pink-600',
    perks: ['Capstone mini-projects', 'Architecture design reviews', 'Priority AI generation'],
  },
  {
    level: 6,
    title: 'Senior Craftsman',
    minXp: 3400,
    maxXp: 4899,
    badgeName: 'Emerald Veteran',
    color: 'from-emerald-500 to-teal-700',
    perks: ['System design question sets', 'Comprehensive interview mock runs', 'Community leaderboard spotlight'],
  },
  {
    level: 7,
    title: 'Engineering Adept',
    minXp: 4900,
    maxXp: 6799,
    badgeName: 'Sapphire Architect',
    color: 'from-blue-600 to-indigo-800',
    perks: ['Expert-level scenario challenges', 'Custom curriculum export', 'Academic honor roll distinction'],
  },
  {
    level: 8,
    title: 'Systems Master',
    minXp: 6800,
    maxXp: 8999,
    badgeName: 'Diamond Master',
    color: 'from-indigo-500 to-purple-700',
    perks: ['Real-time bottleneck profiling drills', 'Mastery certificate generation', 'Peer mentor status'],
  },
  {
    level: 9,
    title: 'Staff Architect',
    minXp: 9000,
    maxXp: 11999,
    badgeName: 'Obsidian Luminary',
    color: 'from-purple-600 to-violet-900',
    perks: ['Advanced concurrency & distributed drills', 'Unlimited AI deep diagnostics'],
  },
  {
    level: 10,
    title: 'Engineering Legend',
    minXp: 12000,
    maxXp: Infinity,
    badgeName: 'Mythic Paragon',
    color: 'from-amber-400 via-rose-500 to-purple-600',
    perks: ['Max-level mastery prestige', 'All roadmap curricula unlocked', 'Hall of Fame recognition'],
  },
];

export interface UserLevelInfo {
  level: number;
  title: string;
  badgeName: string;
  badgeColor: string;
  totalXp: number;
  currentLevelMinXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
  isMaxLevel: boolean;
  perks: string[];
}

export function getUserLevelInfo(xp: number = 0): UserLevelInfo {
  const safeXp = Math.max(0, Math.floor(xp || 0));

  let currentTier = LEVEL_TIERS[0];
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_TIERS[i].minXp) {
      currentTier = LEVEL_TIERS[i];
      break;
    }
  }

  const isMaxLevel = currentTier.level === LEVEL_TIERS[LEVEL_TIERS.length - 1].level;
  const currentLevelMinXp = currentTier.minXp;
  const nextLevelXp = isMaxLevel ? currentTier.minXp + 3000 : currentTier.maxXp + 1;
  const range = nextLevelXp - currentLevelMinXp;
  const xpInCurrentLevel = safeXp - currentLevelMinXp;
  const xpNeededForNextLevel = Math.max(0, nextLevelXp - safeXp);
  const progressPercentage = isMaxLevel
    ? 100
    : Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / range) * 100)));

  return {
    level: currentTier.level,
    title: currentTier.title,
    badgeName: currentTier.badgeName,
    badgeColor: currentTier.color,
    totalXp: safeXp,
    currentLevelMinXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage,
    isMaxLevel,
    perks: currentTier.perks,
  };
}

export const XP_REWARDS = {
  ASSESSMENT_COMPLETION: 150,
  CORRECT_ANSWER: 25,
  HIGH_SCORE_BONUS: 75, // score >= 80%
  PERFECT_SCORE_BONUS: 150, // score === 100%
  ROADMAP_MILESTONE: 100,
};

export function calculateAssessmentXp(score: number, correctCount: number): number {
  let xp = XP_REWARDS.ASSESSMENT_COMPLETION + correctCount * XP_REWARDS.CORRECT_ANSWER;
  if (score === 100) {
    xp += XP_REWARDS.PERFECT_SCORE_BONUS;
  } else if (score >= 80) {
    xp += XP_REWARDS.HIGH_SCORE_BONUS;
  }
  return xp;
}
