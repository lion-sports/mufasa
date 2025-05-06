import type { ScoutEventJson } from './scouts.service'
import type { ScoutEventPlayer } from 'lionn-common'

export type VolleyballPhase = 'serve' | 'receive' | 'defenseBreak' | 'defenseSideOut'

export type VolleyballScoutEventPosition = 1 | 2 | 3 | 4 | 5 | 6

export const ORDERED_POSITIONS: VolleyballScoutEventPosition[] = [1, 2, 3, 4, 5, 6]
export const OPPOSITE_POSITIONS: Record<
	VolleyballScoutEventPosition,
	VolleyballScoutEventPosition
> = {
	1: 4,
	2: 5,
	3: 6,
	4: 1,
	5: 2,
	6: 3
}

export type VolleyballPoints = {
	friends: {
		points: number
		sets: number
		won?: boolean
	}
	enemy: {
		points: number
		sets: number
		won?: boolean
	}
}

/*
1    2   3   4     5
    |----------|   
6   |7   8   9 |   10
11  |12  13  14|   15
16  |17  18  19|   20
    |----------|
21   22  23  24    25
*/
export type VolleyballScoutEventAnchor =
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15
	| 16
	| 17
	| 18
	| 19
	| 20
	| 21
	| 22
	| 23
	| 24
	| 25

export type VolleyballPlayersPosition = {
	friends: {
		[Key in VolleyballScoutEventPosition]?: {
			player: ScoutEventPlayer
			anchor?: VolleyballScoutEventAnchor
		}
	}
	enemy: {
		[Key in VolleyballScoutEventPosition]?: {
			player: ScoutEventPlayer
			anchor?: VolleyballScoutEventAnchor
		}
	}
}

export const FIRST_POINT: VolleyballPoints = {
	friends: {
		points: 0,
		sets: 0
	},
	enemy: {
		points: 0,
		sets: 0
	}
}

export type VolleyballPlayersDynamicPosition = {
	friends?: {
		[Key: number]: {
			position: VolleyballScoutEventPosition
			anchor?: VolleyballScoutEventAnchor
		}
	}
	enemy?: {
		[Key: number]: {
			position: VolleyballScoutEventPosition
			anchor?: VolleyballScoutEventAnchor
		}
	}
}

export type BlockScoutEventResult = 'handsOut' | 'point' | 'touch' | 'putBack'

export type BlockScoutExtraProperties = {
	playerId: number
	player: ScoutEventPlayer
	result: BlockScoutEventResult
	position: VolleyballScoutEventPosition
}
export type BlockScoutEventJson = ScoutEventJson<'block', 'volleyball'> & BlockScoutExtraProperties
export type BlockScoutEventParameters = BlockScoutEventJson

export type LiberoSubstitutionScoutExtraProperties = {
	opponent: boolean
	playerId: number
	player: ScoutEventPlayer
	position: VolleyballScoutEventPosition
	inOrOut: 'in' | 'out'
	liberoId: number
	libero: ScoutEventPlayer
}
export type LiberoSubstitutionScoutEventJson = ScoutEventJson<'liberoSubstitution', 'volleyball'> &
	LiberoSubstitutionScoutExtraProperties
export type LiberoSubstitutionScoutEventParameters = LiberoSubstitutionScoutEventJson

export type PlayerInPositionScoutExtraProperties = {
	playerId: number
	playerIsOpponent: boolean
	player: ScoutEventPlayer
	position: VolleyballScoutEventPosition
}
export type PlayerInPositionScoutEventJson = ScoutEventJson<'playerInPosition', 'volleyball'> &
	PlayerInPositionScoutExtraProperties
export type PlayerInPositionScoutEventParameters = PlayerInPositionScoutEventJson

export type PointScoredScoutExtraProperties = {
	opponent: boolean
	newPoints: VolleyballPoints
}
export type PointScoredScoutEventJson = ScoutEventJson<'pointScored', 'volleyball'> &
	PointScoredScoutExtraProperties
export type PointScoredScoutEventParameters = ScoutEventJson<'pointScored', 'volleyball'> & {
	opponent: boolean
	newPoints?: VolleyballPoints
}

export type ReceiveScoutEventResult = '++' | '+' | '-' | '/' | 'x'
export type ReceiveScoutExtraProperties = {
	playerId: number
	player: ScoutEventPlayer
	result: ReceiveScoutEventResult
	position: VolleyballScoutEventPosition
}
export type ReceiveScoutEventJson = ScoutEventJson<'receive', 'volleyball'> &
	ReceiveScoutExtraProperties
export type ReceiveScoutEventParameters = ReceiveScoutEventJson

export type ServeScoutEventResult = 'error' | 'point' | 'received'
export type ServeScoutExtraProperties = {
	playerId: number
	player: ScoutEventPlayer
	result: ServeScoutEventResult
}
export type ServeScoutEventJson = ScoutEventJson<'serve', 'volleyball'> & ServeScoutExtraProperties
export type ServeScoutEventParameters = ServeScoutEventJson

export type SpikeScoutEventResult = 'error' | 'point' | 'defense'
export type SpikeScoutExtraProperties = {
	playerId: number
	player: ScoutEventPlayer
	result: SpikeScoutEventResult
	position: VolleyballScoutEventPosition
}
export type SpikeScoutEventJson = ScoutEventJson<'spike', 'volleyball'> & SpikeScoutExtraProperties
export type SpikeScoutEventParameters = SpikeScoutEventJson

export type TimeoutScoutExtraProperties = {
	opponent: boolean
}
export type TimeoutScoutEventJson = ScoutEventJson<'timeout', 'volleyball'> &
	TimeoutScoutExtraProperties
export type TimeoutScoutEventParameters = TimeoutScoutEventJson

export type PlayerSubstitutionScoutExtraProperties = {
	playerIsOpponent: boolean
	playerId: number
	player: ScoutEventPlayer
	position: VolleyballScoutEventPosition
	playerIn: ScoutEventPlayer
	playerIdIn: number
}
export type PlayerSubstitutionScoutEventJson = ScoutEventJson<'playerSubstitution', 'volleyball'> &
	PlayerSubstitutionScoutExtraProperties
export type PlayerSubstitutionScoutEventParameters = PlayerSubstitutionScoutEventJson

export type ManualPhaseScoutExtraProperties = {
	phase: VolleyballPhase
}
export type ManualPhaseScoutEventJson = ScoutEventJson<'manualPhase', 'volleyball'> &
	ManualPhaseScoutExtraProperties
export type ManualPhaseScoutEventParameters = ManualPhaseScoutEventJson

export type RotationType = 'backward' | 'forward'
export type TeamRotationScoutExtraProperties = {
	opponent: boolean
	newPositions: VolleyballPlayersPosition
	rotationType: RotationType
}
export type TeamRotationScoutEventJson = ScoutEventJson<'teamRotation', 'volleyball'> &
	TeamRotationScoutExtraProperties
export type TeamRotationScoutEventParameters = Omit<TeamRotationScoutEventJson, 'newPositions'> & {
	fromPositions: VolleyballPlayersPosition
}

export type VolleyballScoutEventJson =
	| BlockScoutEventJson
	| LiberoSubstitutionScoutEventJson
	| PlayerInPositionScoutEventJson
	| PointScoredScoutEventJson
	| ReceiveScoutEventJson
	| ServeScoutEventJson
	| SpikeScoutEventJson
	| TimeoutScoutEventJson
	| PlayerSubstitutionScoutEventJson
	| ManualPhaseScoutEventJson
	| TeamRotationScoutEventJson

export type VolleyballScoutEventParameters =
	| BlockScoutEventParameters
	| LiberoSubstitutionScoutEventParameters
	| PlayerInPositionScoutEventParameters
	| PointScoredScoutEventParameters
	| ReceiveScoutEventParameters
	| ServeScoutEventParameters
	| SpikeScoutEventParameters
	| TimeoutScoutEventParameters
	| PlayerSubstitutionScoutEventParameters
	| ManualPhaseScoutEventParameters
	| TeamRotationScoutEventParameters

export const EVENT_TYPE_TRANSLATIONS: Record<VolleyballScoutEventJson['type'], string> = {
	block: 'Muro',
	liberoSubstitution: 'Entrata/uscita libero',
	manualPhase: 'Cambio fase',
	playerInPosition: 'Giocatore in posizione',
	playerSubstitution: 'Sostituzione',
	pointScored: 'Punto',
	receive: 'Ricezione',
	serve: 'Battuta',
	spike: 'Attacco',
	teamRotation: 'Giro',
	timeout: 'Timeout'
}

export type EventToResultType = {
	serve: ServeScoutEventResult
	spike: SpikeScoutEventResult
	block: BlockScoutEventResult
	receive: ReceiveScoutEventResult
}
