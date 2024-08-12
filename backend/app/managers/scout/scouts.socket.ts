import User from "App/Models/User"
import ScoutEvent from "./ScoutEvent"
import Scout from "App/Models/Scout"
import { AuthorizationHelpers } from "../authorization.manager"
import { TYPE_TO_VOLLEYBALL_SCOUT_EVENT, VolleyballScoutEventJson } from "./events/volleyball/VolleyballScoutEvent"
import ScoutsManager from "./scouts.manager"
import { FIRST_POINT } from "./events/volleyball/common"
import Ws from "App/Services/Ws"
import { Context } from "../base.manager"

export type ScoutSocketEventMapping = {
  'scout:add': VolleyballScoutEventJson,
  'scout:stashReload': {
    scout: Scout
  }
}

class ScoutSocket {
  constructor() { }

  public async emit<
    EventName extends keyof ScoutSocketEventMapping, 
    EventData extends ScoutSocketEventMapping[EventName]
  >(params: {
    data: {
      event: EventName,
      data: EventData
    },
    context?: Context
  }) {
    if(params.data.event == 'scout:stashReload') {
      let data = params.data.data as ScoutSocketEventMapping['scout:stashReload']

      let scout = await Scout.query({ client: params.context?.trx })
        .preload('event', b => b.preload('team'))
        .where('id', data.scout.id)
        .firstOrFail()

      let roomName = Ws.roomName({
        team: scout.event.team,
        namespace: 'scout'
      })

      let eventName = Ws.roomName({
        team: scout.event.team,
        namespace: 'scout:stashReload'
      })

      console.log('emitting zio porco', { eventName, data })

      Ws.io.to(roomName).emit(eventName, data)
    }
  }

  public async handleEvent<
    Event extends keyof ScoutSocketEventMapping,
    EventData extends ScoutSocketEventMapping[Event]
  >(params: {
    event: Event,
    data: EventData,
    user: User
  }) {
    if(params.event == 'scout:add') {
      let data = params.data as ScoutSocketEventMapping['scout:add']

      // check if user can manage the scout
      let scout = await Scout.query()
        .preload('event')
        .where('id', data.scoutId)
        .firstOrFail()
      
      let canManageScout = await AuthorizationHelpers.userCanInTeam({
        data: {
          user: params.user,
          team: { id: scout.event.teamId },
          action: 'manage',
          resource: 'scout'
        }
      })
  
      if (!canManageScout) {
        throw new Error('cannot manage the scout')
      }
  
      if(params.event == 'scout:add') {
        await this.handleAdd({ scoutEvent: data, user: params.user, scout })
      }
    }
  }

  private async handleAdd(params: {
    scoutEvent: VolleyballScoutEventJson
    scout: Scout
    user: User
  }) {
    if (!params.scoutEvent.points) params.scoutEvent.points = params.scout.stash?.points
    if (!params.scoutEvent.points) params.scoutEvent.points = FIRST_POINT

    let Cl = TYPE_TO_VOLLEYBALL_SCOUT_EVENT[params.scoutEvent.type]
    let event = new Cl({ 
      ...params.scoutEvent,
      createdByUserId: params.user.id
    })
    await event.preReceived({ 
      data: {
        scout: params.scout
      }
    })
    await event.save()
    await event.postReceived({
      data: {
        scout: params.scout
      }
    })

    let scoutManager = new ScoutsManager()
    await scoutManager.recalculateStash({ 
      data: { id: params.scout.id },
      context: {
        user: params.user
      }
    })
  }
}

export default new ScoutSocket()