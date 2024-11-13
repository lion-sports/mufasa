export type ScoringSystemConfigPoints = {
  mode: 'totalPoints'
  totalPoints: number
} | {
  mode: 'winPoints'
  winPoints: number
  hasAdvantages: boolean
  pointsLimit?: number
}

export type ScoringSystemConfig = {
  set: {
    mode: 'totalSet'
    totalSets: number
  } | {
    mode: 'winSet'
    winSets: number
  },
  points: ScoringSystemConfigPoints,
  tieBreak?: ScoringSystemConfigPoints
}

export const SPORTS = ['volleyball', 'basketball'] as const
export type Sport = typeof SPORTS[number]

export const VOLLEYBALL_ROLES = ['setter', 'outsideHitter', 'oppositeHitter', 'middleBlocker', 'libero'] as const
export const BASKETBALL_ROLES = ['pointGuard', 'shootingGuard', 'smallForward', 'powerForward', 'center'] as const
export const ROLES = [
  ...VOLLEYBALL_ROLES,
  ...BASKETBALL_ROLES
]
export type VolleyballRole = typeof VOLLEYBALL_ROLES[number]
export type BasketballRole = typeof BASKETBALL_ROLES[number]
export type Role = typeof ROLES[number]

export type ScoutEventPlayer = {
  id: number,
  convocationId?: number | null,
  scoutId: number,
  teammate?: {
    alias?: string,
    user: {
      firstname: string | undefined,
      lastname: string | undefined
    }
  },
  teammateId?: number | null,
  aliases: string[],
  role: Role,
  shirtId?: number,
  shirtNumber: number,
  shirtPrimaryColor: string | null | undefined,
  shirtSecondaryColor: string | null | undefined,
  isOpponent: boolean
}