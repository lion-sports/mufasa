import { ServeScoutEventParameters } from "dist/src/main"
import { ScoringSystemConfig } from "../common"
import { BlockScoutEventParameters, PlayerSubstitutionScoutEventParameters, PointScoredScoutEventParameters, ReceiveScoutEventParameters, SpikeScoutEventParameters, TeamRotationScoutEventParameters, VolleyballScoutEventParameters } from "../events"
import { ScoutInfoGeneral, ScoutInfoSettings } from "../info"
import { incrementScore } from "../points"
import { FIRST_POINT, VolleyballScoutEventPosition, VolleyballScoutStash } from "./volleyball"
import lodash from 'lodash'
import { getPlayersPositions, rotate } from "./rotation"

type ScoutContext = {
  stash?: VolleyballScoutStash,
  scoutInfo: {
    general?: ScoutInfoGeneral,
    settings?: ScoutInfoSettings
  },
  scoringSystem: ScoringSystemConfig
}

export function getNextAutomatedEvents(params: {
  event: VolleyballScoutEventParameters,
  context: ScoutContext
}): {
  events: VolleyballScoutEventParameters[],
  context: ScoutContext
} {
  let events: VolleyballScoutEventParameters[] = []

  if(params.event.type == 'block') {
    let blockEventResults = handleBlockEvent({
      event: params.event,
      context: params.context
    })
    events = [...blockEventResults.events]
    params.context = blockEventResults.context
  } else if(params.event.type == 'pointScored') {
    let pointScoredEventResults = handlePointScoredEvent({
      event: params.event,
      context: params.context
    })
    events = [...pointScoredEventResults.events]
    params.context = pointScoredEventResults.context
  } else if(params.event.type == 'receive') {
    let receiveEventResults = handleReceiveEvent({
      event: params.event,
      context: params.context
    })
    events = [...receiveEventResults.events]
    params.context = receiveEventResults.context
  } else if(params.event.type == 'serve') {
    let serveEventResults = handleServeEvent({
      event: params.event,
      context: params.context
    })
    events = [...serveEventResults.events]
    params.context = serveEventResults.context
  } else if(params.event.type == 'spike') {
    let spikeEventResults = handleSpikeEvent({
      event: params.event,
      context: params.context
    })
    events = [...spikeEventResults.events]
    params.context = spikeEventResults.context
  } else if(params.event.type == 'teamRotation') {
    let spikeEventResults = handleTeamRotationEvent({
      event: params.event,
      context: params.context
    })
    events = [...spikeEventResults.events]
    params.context = spikeEventResults.context
  } else if(params.event.type == 'playerSubstitution') {
    let playerSubstitutionEventResults = handlePlayerSubstitutionEvent({
      event: params.event,
      context: params.context
    })
    events = [...playerSubstitutionEventResults.events]
    params.context = playerSubstitutionEventResults.context
  }

  return {
    events,
    context: params.context
  }
}

function handlePlayerSubstitutionEvent(params: {
  event: PlayerSubstitutionScoutEventParameters
  context: ScoutContext
}): {
  events: VolleyballScoutEventParameters[],
  context: ScoutContext
} {
  let currentPlayerPosition: VolleyballScoutEventPosition | undefined = undefined

  if (params.event.playerIsOpponent && !!params.context.stash?.playersServePositions?.enemy) {
    for (const [key, value] of Object.entries(params.context.stash?.playersServePositions.enemy)) {
      if(value.player.id == params.event.playerId) {
        currentPlayerPosition = key as any as VolleyballScoutEventPosition
        break
      }
    }
  } else if (!!params.context.stash?.playersServePositions?.friends) {
    for (const [key, value] of Object.entries(params.context.stash?.playersServePositions.friends)) {
      if (value.player.id == params.event.playerId) {
        currentPlayerPosition = key as any as VolleyballScoutEventPosition
        break
      }
    }
  }

  if (currentPlayerPosition !== undefined && !!params.context.stash?.playersServePositions) {
    params.context.stash.playersServePositions[params.event.player.isOpponent ? 'enemy' : 'friends'][currentPlayerPosition] = {
      player: params.event.playerIn
    }
  }

  return {
    events: [],
    context: params.context
  }
}


function handleBlockEvent(params: {
  event: BlockScoutEventParameters
  context: ScoutContext
}): {
  events: VolleyballScoutEventParameters[],
  context: ScoutContext
} {
  let events: VolleyballScoutEventParameters[] = []

  if (
    params.event.result == 'handsOut' &&
    params.context.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes('blockHandsOut')
  ) {
    events.push({
      type: 'pointScored',
      opponent: !params.event.player.isOpponent,
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.event.points
    })
  } else if(
    params.event.result == 'point' &&
    params.context.scoutInfo.settings?.automations?.autoPoint?.friends?.includes('blockPoint')
  ) {
    events.push({
      type: 'pointScored',
      opponent: params.event.player.isOpponent,
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.event.points
    })
  }

  let automatedEvents: typeof events = []
  for(let i = 0; i < events.length; i += 1) {
    let currentEvent = events[i]
    let currentAutomatedEvents = getNextAutomatedEvents({
      event: currentEvent,
      context: params.context
    })
    automatedEvents = [
      ...automatedEvents,
      ...currentAutomatedEvents.events
    ]
    params.context = currentAutomatedEvents.context
  }
  events = [
    ...events,
    ...automatedEvents
  ]

  return {
    events,
    context: params.context
  }
}


function handleReceiveEvent(params: {
  event: ReceiveScoutEventParameters
  context: ScoutContext
}): {
  events: VolleyballScoutEventParameters[],
  context: ScoutContext
} {
  let events: VolleyballScoutEventParameters[] = []

  if (
    params.event.result == 'x' &&
    params.context.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes('receiveError')
  ) {
    events.push({
      type: 'pointScored',
      opponent: !params.event.player.isOpponent,
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash?.points
    })
  } else if (
    !params.event.player.isOpponent &&
    params.context.scoutInfo.settings?.automations?.autoPhase?.friends?.includes('receive')
  ) {
    events.push({
      type: 'manualPhase',
      phase: 'defenseSideOut',
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash?.points
    })
  } else if (
    params.event.player.isOpponent &&
    params.context.scoutInfo.settings?.automations?.autoPhase?.enemy?.includes('receive')
  ) {
    events.push({
      type: 'manualPhase',
      phase: 'defenseBreak',
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash?.points
    })
  }

  let automatedEvents: typeof events = []
  for (let i = 0; i < events.length; i += 1) {
    let currentEvent = events[i]
    let currentAutomatedEvents = getNextAutomatedEvents({
      event: currentEvent,
      context: params.context
    })
    automatedEvents = [
      ...automatedEvents,
      ...currentAutomatedEvents.events
    ]
    params.context = currentAutomatedEvents.context
  }
  events = [
    ...events,
    ...automatedEvents
  ]

  return {
    events,
    context: params.context
  }
}

function handleServeEvent(params: {
  event: ServeScoutEventParameters
  context: ScoutContext
}): {
  events: VolleyballScoutEventParameters[],
  context: ScoutContext
} {
  let events: VolleyballScoutEventParameters[] = []

  if (
    params.event.result == 'error' &&
    params.context.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes('serveError')
  ) {
    events.push({
      type: 'pointScored',
      opponent: !params.event.player.isOpponent,
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash?.points
    })
  } else if (
    params.event.result == 'point' &&
    params.context.scoutInfo.settings?.automations?.autoPoint?.friends?.includes('servePoint')
  ) {
    events.push({
      type: 'pointScored',
      opponent: params.event.player.isOpponent,
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash?.points
    })
  } else if (
    params.event.result == 'received' &&
    !params.event.player.isOpponent &&
    params.context.scoutInfo.settings?.automations?.autoPhase?.friends?.includes('serveReceived')
  ) {
    events.push({
      type: 'manualPhase',
      phase: 'defenseBreak',
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash?.points
    })
  } else if (
    params.event.result == 'received' &&
    params.event.player.isOpponent &&
    params.context.scoutInfo.settings?.automations?.autoPhase?.enemy?.includes('serveReceived')
  ) {
    events.push({
      type: 'manualPhase',
      phase: 'defenseSideOut',
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash?.points
    })
  }

  let automatedEvents: typeof events = []
  for (let i = 0; i < events.length; i += 1) {
    let currentEvent = events[i]
    let currentAutomatedEvents = getNextAutomatedEvents({
      event: currentEvent,
      context: params.context
    })
    automatedEvents = [
      ...automatedEvents,
      ...currentAutomatedEvents.events
    ]
    params.context = currentAutomatedEvents.context
  }
  events = [
    ...events,
    ...automatedEvents
  ]

  return {
    events,
    context: params.context
  }
}

function handleSpikeEvent(params: {
  event: SpikeScoutEventParameters
  context: ScoutContext
}): {
  events: VolleyballScoutEventParameters[],
  context: ScoutContext
} {
  let events: VolleyballScoutEventParameters[] = []

  if (
    params.event.result == 'error' &&
    params.context.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes('spikeError')
  ) {
    events.push({
      type: 'pointScored',
      opponent: !params.event.player.isOpponent,
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash?.points
    })
  } else if (
    params.event.result == 'point' &&
    params.context.scoutInfo.settings?.automations?.autoPoint?.friends?.includes('spikePoint')
  ) {
    events.push({
      type: 'pointScored',
      opponent: params.event.player.isOpponent,
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash?.points
    })
  }

  let automatedEvents: typeof events = []
  for (let i = 0; i < events.length; i += 1) {
    let currentEvent = events[i]
    let currentAutomatedEvents = getNextAutomatedEvents({
      event: currentEvent,
      context: params.context
    })
    automatedEvents = [
      ...automatedEvents,
      ...currentAutomatedEvents.events
    ]
    params.context = currentAutomatedEvents.context
  }
  events = [
    ...events,
    ...automatedEvents
  ]

  return {
    events,
    context: params.context
  }
}

function handlePointScoredEvent(params: {
  event: PointScoredScoutEventParameters
  context: ScoutContext
}): {
  events: VolleyballScoutEventParameters[],
  context: ScoutContext
} {
  let events: VolleyballScoutEventParameters[] = []

  let startingPoints = !!params.context.stash?.points ? lodash.cloneDeep(params.context.stash?.points) : undefined
  if(!startingPoints) startingPoints = FIRST_POINT

  if (!params.context.stash) params.context.stash = {}

  if (!startingPoints) throw new Error('no starting points defined')
  else if(!params.context.stash) throw new Error('stash has to be defined')

  params.context.stash.points = incrementScore({
    data: {
      currentScore: startingPoints,
      opponent: params.event.opponent,
      scoringSystemConfig: params.context.scoringSystem
    }
  })

  if (
    !params.event.opponent &&
    (
      params.context.stash.phase == 'receive' ||
      params.context.stash.phase == 'defenseSideOut'
    ) &&
    !!params.context.stash.playersServePositions
  ) {
    events.push({
      type: 'teamRotation',
      rotationType: 'forward',
      fromPositions: params.context.stash.playersServePositions,
      opponent: false,
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash.points
    })
    events.push({
      type: 'manualPhase',
      phase: 'serve',
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash.points
    })
  }

  if (
    params.event.opponent &&
    (
      params.context.stash.phase == 'serve' ||
      params.context.stash.phase == 'defenseBreak'
    ) &&
    !!params.context.stash.playersServePositions
  ) {
    events.push({
      type: 'teamRotation',
      rotationType: 'forward',
      fromPositions: params.context.stash.playersServePositions,
      opponent: true,
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash.points
    })

    events.push({
      type: 'manualPhase',
      phase: 'receive',
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash.points
    })
  }

  if (params.event.opponent && params.context.stash.phase == 'defenseSideOut') {
    events.push({
      type: 'manualPhase',
      phase: 'receive',
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash.points
    })
  } else if (!params.event.opponent && params.context.stash.phase == 'defenseBreak') {
    events.push({
      type: 'manualPhase',
      phase: 'serve',
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.context.stash.points
    })
  }

  let automatedEvents: typeof events = []
  for (let i = 0; i < events.length; i += 1) {
    let currentEvent = events[i]
    let currentAutomatedEvents = getNextAutomatedEvents({
      event: currentEvent,
      context: params.context
    })
    automatedEvents = [
      ...automatedEvents,
      ...currentAutomatedEvents.events
    ]
    params.context = currentAutomatedEvents.context
  }
  events = [
    ...events,
    ...automatedEvents
  ]

  return {
    events,
    context: params.context
  }
}


function handleTeamRotationEvent(params: {
  event: TeamRotationScoutEventParameters
  context: ScoutContext
}): {
  events: VolleyballScoutEventParameters[],
  context: ScoutContext
} {
  let events: VolleyballScoutEventParameters[] = []

  let startingPosistion = !!params.context.stash?.playersServePositions ? lodash.cloneDeep(params.context.stash.playersServePositions) : undefined
  if (!startingPosistion) return {
    events, context: params.context
  }

  if (!params.context.stash) params.context.stash = {}
  if (!params.context.stash) throw new Error('stash has to be defined')

  let newPositions = rotate({
    position: params.event.fromPositions,
    opponent: params.event.opponent,
    rotationType: params.event.rotationType
  })


  let playersPositions = getPlayersPositions({
    positions: newPositions
  })

  params.context.stash.playersDefenseBreakPositions = playersPositions.playersDefenseBreakPositions
  params.context.stash.playersDefenseSideOutPositions = playersPositions.playersDefenseSideoutPositions
  params.context.stash.playersReceivePositions = playersPositions.playersReceivePositions
  params.context.stash.playersServePositions = playersPositions.playersServePositions

  let positionFourPlayer = newPositions.friends[4]?.player
  if (!!positionFourPlayer && positionFourPlayer.role == 'libero') {
    let openLiberoSub = params.context.stash.currentSetOpenLiberoSubstitution?.find((os) => os.liberoId == positionFourPlayer.id)
    if (!!openLiberoSub) {
      events.push({
        type: 'liberoSubstitution',
        libero: openLiberoSub.libero,
        liberoId: openLiberoSub.liberoId,
        inOrOut: 'out',
        player: openLiberoSub.player,
        playerId: openLiberoSub.playerId,
        position: 4,
        opponent: openLiberoSub.player.isOpponent,
        date: new Date(),
        scoutId: params.event.scoutId,
        sport: 'volleyball',
        teamId: params.event.teamId,
        createdByUserId: params.event.createdByUserId,
        points: params.context.stash.points
      })
    }
  }

  let automatedEvents: typeof events = []
  for (let i = 0; i < events.length; i += 1) {
    let currentEvent = events[i]
    let currentAutomatedEvents = getNextAutomatedEvents({
      event: currentEvent,
      context: params.context
    })
    automatedEvents = [
      ...automatedEvents,
      ...currentAutomatedEvents.events
    ]
    params.context = currentAutomatedEvents.context
  }
  events = [
    ...events,
    ...automatedEvents
  ]

  return {
    events,
    context: params.context
  }
}