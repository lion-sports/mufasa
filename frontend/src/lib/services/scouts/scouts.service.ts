import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { Event } from '../events/events.service'
import type { ScoringSystem } from '../scoringSystems/scoringSystems.service'
import type { Player } from '../players/players.service'
import type { LiberoSubstitutionScoutEventJson, ReceiveScoutEventResult, VolleyballPhase, VolleyballPlayersDynamicPosition, VolleyballPlayersPosition, VolleyballPoints, VolleyballScoutEventJson } from './volleyball'
import type { Teammate } from '../teams/teams.service'
import type { User } from '../auth/auth.service'

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
  id: Player['id'],
  convocationId?: Player['convocationId'],
  scoutId: Player['scoutId'],
  teammateId?: Player['teammateId'],
  teammate?: {
    alias?: Teammate['alias'],
    user: {
      firstname: User['firstname'],
      lastname: User['lastname']
    }
  },
  aliases: Player['aliases'],
  role: Player['role'],
  shirtId: Player['shirtId'],
  shirtNumber: Player['shirtNumber'],
  shirtPrimaryColor?: Player['shirtPrimaryColor'],
  shirtSecondaryColor?: Player['shirtSecondaryColor'],
  isOpponent: Player['isOpponent']
}

export type VolleyballScoutStash = {
  points: VolleyballPoints,
  playersServePositions?: VolleyballPlayersPosition,
  playersReceivePositions?: VolleyballPlayersDynamicPosition,
  playersDefenseBreakPositions?: VolleyballPlayersPosition,
  playersDefenseSideOutPositions?: VolleyballPlayersPosition,
  currentSetSubstitutionsMade: {
    friends: {
      playerIn: ScoutEventPlayer,
      playerOut: ScoutEventPlayer
    }[]
    enemy: {
      playerIn: ScoutEventPlayer,
      playerOut: ScoutEventPlayer
    }[]
  },
  currentSetOpenLiberoSubstitution?: LiberoSubstitutionScoutEventJson[],
  currentSetTimeoutsCalled: {
    friends: number
    enemy: number
  },
  phase?: VolleyballPhase
}

export type Scout = {
  id: number
  sport: Sport
  name: string
  stash?: VolleyballScoutStash
  startedAt: Date
  eventId: number
  scoringSystem: ScoringSystem
  scoringSystemId: number
  players: Player[]
  event: Event
  scoutInfo: ScoutInfo
  createdAt: Date
  updatedAt: Date
}

export type ScoutEventJson<Type = string, S extends Sport = Sport> = {
  _id?: string
  date: Date
  scoutId: number
  teamId: number
  sport: S
  type: Type
  createdByUserId?: number
  points: any
}

export type ScoutStudio = {
  scout: Scout,
  selectedPlayer?: ScoutEventPlayer,
  lastEventsForPlayers?: Record<number, VolleyballScoutEventJson[]>,
  analysis?: ScoutAnalysis
}

export type ScoutAnalysis = {
  pointsMade: {
    player: ScoutEventPlayer,
    pointsMade: number,
    category: 'block' | 'serve' | 'spike'
  }[],
  errorsMade: {
    player: ScoutEventPlayer,
    errorsMade: number,
    category: 'block' | 'serve' | 'spike'
  }[],
  receiveOverTimeByPlayer: {
    player: ScoutEventPlayer,
    result: ReceiveScoutEventResult,
    points: VolleyballPoints,
    sortPointIndex: number
    resultValue: number
  }[]
}

export const FRIENDS_FIELD_SIDES = ['right', 'left'] as const

export type ScoutInfoGeneral = {
  opponent?: {
    name?: string
  }
  friendsFieldSide?: typeof FRIENDS_FIELD_SIDES[number]
}

export const POSSIBLE_AUTO_POINT_FRIENDS_EVENTS = ['blockPoint', 'servePoint', 'spikePoint'] as const
export const POSSIBLE_AUTO_POINT_ENEMY_EVENTS = ['blockHandsOut', 'serveError', 'spikeError', 'receiveError'] as const
export const POSSIBLE_AUTO_PAHSE_EVENTS = ['serveReceived', 'receive'] as const

export type ScoutInfoSettings = {
  automations?: {
    autoPoint?: {
      friends?: (typeof POSSIBLE_AUTO_POINT_FRIENDS_EVENTS[number])[]
      enemy?: (typeof POSSIBLE_AUTO_POINT_ENEMY_EVENTS[number])[]
    }
    autoPhase?: {
      friends?: (typeof POSSIBLE_AUTO_PAHSE_EVENTS[number])[]
      enemy?: (typeof POSSIBLE_AUTO_PAHSE_EVENTS[number])[]
    }
  }
}

export type ScoutInfo = {
  general?: ScoutInfoGeneral,
  settings?: ScoutInfoSettings
}

export type PaginatedScouts = {
  data: Scout[]
  meta: PaginationData
}


export default class ScoutsService extends FetchBasedService {
  public async create(params: { 
    sport: Sport
    name: string
    startedAt: Date
    eventId: number
    scoringSystemId: number
    scoutInfo?: ScoutInfo
  }): Promise<Scout> {
    let response = await this.client.post({
      url: '/scouts',
      body: params
    })

    return response
  }

  public async list(params?: { page?: number; perPage?: number }): Promise<PaginatedScouts> {
    if (!params)
      params = {
        page: 1,
        perPage: 300
      }
    if (!params.page) params.page = 1
    if (!params.perPage) params.perPage = 300

    let response = await this.client.get({
      url: '/scouts',
      params: params
    })

    return response
  }

  public async show(params: { id: number }): Promise<Scout> {
    let response = await this.client.get({
      url: '/scouts/' + params.id
    })

    response.startedAt = new Date(response.startedAt)
    response.createdAt = new Date(response.createdAt)
    response.updatedAt = new Date(response.updatedAt)

    return response
  }

  public async importTeammates(params: {
    id: number
    importShirts?: boolean
    importRoles?: boolean
    importAbsents?: boolean
  }): Promise<{ success: boolean }> {
    let response = await this.client.post({
      url: '/scouts/' + params.id + '/importTeammates',
      body: params
    })

    return response
  }

  public async update(params: { 
    id: number; 
    sport?: Sport
    name?: string
    startedAt?: Date
    eventId?: number
    scoringSystemId?: number
    scoutInfo?: ScoutInfo
  }): Promise<Scout> {
    let response = await this.client.put({
      url: '/scouts/' + params.id,
      body: params
    })

    return response
  }

  public async updateGeneralInfo(params: {
    id: number,
    general: ScoutInfoGeneral
  }): Promise<Scout> {
    return await this.update({
      id: params.id,
      scoutInfo: {
        general: params.general
      }
    })
  }

  public async updateSetting(params: {
    id: number,
    settings: ScoutInfoSettings
  }): Promise<Scout> {
    return await this.update({
      id: params.id,
      scoutInfo: {
        settings: params.settings
      }
    })
  }

  public async destroy(params: { id: number }): Promise<void> {
    let response = await this.client.delete({
      url: '/scouts/' + params.id
    })

    return response
  }

  public async studio(params: { id: number }): Promise<ScoutStudio> {
    let response = await this.client.get({
      url: '/scouts/' + params.id + '/studio'
    })

    return response
  }

  public async getFirstSetStartingSix(params: { id: number }): Promise<VolleyballPlayersPosition> {
    let response = await this.client.get({
      url: '/scouts/' + params.id + '/getFirstSetStartingSix'
    })

    return response
  }

  public async exportXlsx(params: {
    id: number
  }): Promise<void> {
    const response = await this.client.getWithDownload({
      url: `/scouts/${params.id}/exportXlsx`,
      params: {
      },
      fileExt: 'xlsx',
      fileName: 'Export scout',
      fileMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    return response
  }

  public static get friendsColors() {
    return [
      '#3b82f6',
      '#1354bf',
      '#4481e5',
      '#224a8d',
      '#5d8ad6',
      '#123a7e'
    ]
  }

  public static get categoryToColorFriends() {
    return {
      'spike': '#52b69a',
      'block': '#184e77',
      'serve': '#a2d6f9'
    }
  }

  public static get friendsRgbColors() {
    return [
      '59, 130, 246',
      '19, 84, 191',
      '68, 129, 229',
      '34, 74, 141',
      '93, 138, 214',
      '18, 58, 126'
    ]
  }  

  public static get opponentsColors() {
    return [
      '#ef4444',
      '#cb0f0f',
      '#fc1d1d',
      '#9d1010',
      '#952b2b',
      '#963d3d'
    ]
  }

  public static get categoryToColorOpponents() {
    return {
      'spike': '#ff7f51',
      'block': '#ce4257',
      'serve': '#c1121f'
    }
  }

  public static get opponentsRgbColors() {
    return [
      '239, 68, 68',
      '203, 15, 15',
      '252, 29, 29',
      '157, 16, 16',
      '149, 43, 43',
      '150, 61, 61'
    ]
  }

}
