export const FRIENDS_FIELD_SIDES = ['right', 'left'] as const
export const FIELD_RENDER_ENGINES = ['2d', '3d'] as const

export type ScoutInfoGeneral = {
  opponent?: {
    name?: string
  }
  friendsFieldSide?: typeof FRIENDS_FIELD_SIDES[number],
  fieldRenderEngine?: typeof FIELD_RENDER_ENGINES[number]
}

export const POSSIBLE_AUTO_POINT_FRIENDS_EVENTS = ['blockPoint', 'servePoint', 'spikePoint'] as const
export const POSSIBLE_AUTO_POINT_ENEMY_EVENTS = ['blockHandsOut', 'serveError', 'spikeError', 'receiveError'] as const

export const POSSIBLE_AUTO_PAHSE_EVENTS = ['serveReceived', 'receive'] as const

export type ScoutInfoSettings = {
  automations?: {
    autoPoint?: {
      friends?: (typeof POSSIBLE_AUTO_POINT_FRIENDS_EVENTS[number])[],
      enemy?: (typeof POSSIBLE_AUTO_POINT_ENEMY_EVENTS[number])[]
    },
    autoPhase?: {
      friends?: (typeof POSSIBLE_AUTO_PAHSE_EVENTS[number])[],
      enemy?: (typeof POSSIBLE_AUTO_PAHSE_EVENTS[number])[]
    }
  }
}