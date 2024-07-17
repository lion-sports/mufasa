import type { ScoutEventJson, ScoutEventPlayer } from "./scouts.service"

export type VolleyballScoutEventPosition = 1 | 2 | 3 | 4 | 5 | 6

export type VolleyballPoints = {
  friends: {
    points: number
    sets: number
  },
  enemy: {
    points: number
    sets: number
  }
}

export type VolleyballPlayersPosition = {
  friends: Record<VolleyballScoutEventPosition, ScoutEventPlayer>
  enemy: Record<VolleyballScoutEventPosition, ScoutEventPlayer>
}

export type BlockScoutEventResult = 'handsOut' | 'point' | 'touch' | 'putBack'

export type BlockScoutExtraProperties = {
  playerId: number,
  player: ScoutEventPlayer,
  result: BlockScoutEventResult,
  position: VolleyballScoutEventPosition
}
export type BlockScoutEventJson = ScoutEventJson<'block', 'volleyball'> & BlockScoutExtraProperties

export type LiberoSubstitutionScoutExtraProperties = {
  playerIsOpponent: boolean,
  playerId: number,
  player: ScoutEventPlayer,
  inOrOut: 'in' | 'out'
}

export type LiberoSubstitutionScoutEventJson = ScoutEventJson<'liberoSubstitution', 'volleyball'> & LiberoSubstitutionScoutExtraProperties

export type PlayerInPositionScoutExtraProperties = {
  playerId: number,
  playerIsOpponent: boolean,
  player: ScoutEventPlayer,
  position: VolleyballScoutEventPosition
}
export type PlayerInPositionScoutEventJson = ScoutEventJson<'playerInPosition', 'volleyball'> & PlayerInPositionScoutExtraProperties

export type PointScoredScoutExtraProperties = {
  opponent: boolean,
  newPoints: VolleyballPoints
}

export type PointScoredScoutEventJson = ScoutEventJson<'pointScored', 'volleyball'> & PointScoredScoutExtraProperties

export type ReceiveScoutEventResult = '++' | '+' | '-' | '/' | 'x'

export type ReceiveScoutExtraProperties = {
  playerId: number,
  player: ScoutEventPlayer,
  result: ReceiveScoutEventResult,
  position: VolleyballScoutEventPosition
}

export type ReceiveScoutEventJson = ScoutEventJson<'receive', 'volleyball'> & ReceiveScoutExtraProperties

export type ServeScoutEventResult = 'error' | 'point' | 'received'

export type ServeScoutExtraProperties = {
  playerId: number,
  player: ScoutEventPlayer,
  result: ServeScoutEventResult
}

export type ServeScoutEventJson = ScoutEventJson<'serve', 'volleyball'> & ServeScoutExtraProperties

export type SpikeScoutEventResult = 'error' | 'point' | 'difense'

export type SpikeScoutExtraProperties = {
  playerId: number,
  player: ScoutEventPlayer,
  result: SpikeScoutEventResult,
}

export type SpikeScoutEventJson = ScoutEventJson<'spike', 'volleyball'> & SpikeScoutExtraProperties

export type TimeoutScoutExtraProperties = {
  opponent: boolean
}

export type TimeoutScoutEventJson = ScoutEventJson<'timeout', 'volleyball'> & TimeoutScoutExtraProperties

export type PlayerSubstitutionScoutExtraProperties = {
  playerIsOpponent: boolean,
  playerId: number,
  player: ScoutEventPlayer,
  position: VolleyballScoutEventPosition
  playerIn: ScoutEventPlayer
  playerIdIn: number
}

export type PlayerSubstitutionScoutEventJson = ScoutEventJson<'playerSubstitution', 'volleyball'> & PlayerSubstitutionScoutExtraProperties

export type VolleyballScoutEventJson = BlockScoutEventJson | LiberoSubstitutionScoutEventJson |
  PlayerInPositionScoutEventJson | PointScoredScoutEventJson | ReceiveScoutEventJson |
  ServeScoutEventJson | SpikeScoutEventJson | TimeoutScoutEventJson | PlayerSubstitutionScoutEventJson