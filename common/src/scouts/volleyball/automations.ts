import { BlockScoutEventParameters, VolleyballScoutEventParameters } from "../events"
import { ScoutInfoGeneral, ScoutInfoSettings } from "../info"
import { VolleyballScoutStash } from "./volleyball"

type ScoutContext = {
  stash?: VolleyballScoutStash,
  scoutInfo: {
    general?: ScoutInfoGeneral,
    settings?: ScoutInfoSettings
  }
}

export function getNextAutomatedEvents(params: {
  event: VolleyballScoutEventParameters,
  context: ScoutContext
}): VolleyballScoutEventParameters[] {
  // prende in input un evento e ritorna in output gli eventi in ordine da aggiungere
  // fare una ricorsione: se un evento che bisogna ritornare ha una conseguenza occorre processare anche lui
  let results: VolleyballScoutEventParameters[] = []

  if(params.event.type == 'block') {
    let blockEventResults = handleBlockEvent({
      event: params.event,
      context: params.context
    })
    results = [...blockEventResults]
  }

  return results
}


function handleBlockEvent(params: {
  event: BlockScoutEventParameters
  context: ScoutContext
}): VolleyballScoutEventParameters[] {
  let results: VolleyballScoutEventParameters[] = []

  if (
    params.event.result == 'handsOut' &&
    params.context.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes('blockHandsOut')
  ) {
    results.push({
      type: 'pointScored',
      opponent: !params.event.player.isOpponent,
      date: new Date(),
      scoutId: params.event.scoutId,
      sport: 'volleyball',
      teamId: params.event.teamId,
      createdByUserId: params.event.createdByUserId,
      points: params.event.points
    })
  }

  let automatedEvents: typeof results = []
  for(let i = 0; i < results.length; i += 1) {
    let currentEvent = results[i]
    let currentAutomatedEvents = getNextAutomatedEvents({
      event: currentEvent,
      context: params.context
    })
    automatedEvents = [
      ...automatedEvents,
      ...currentAutomatedEvents
    ]
  }
  results = [
    ...results,
    ...automatedEvents
  ]

  return results
}