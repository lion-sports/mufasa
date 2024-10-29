import User from "App/Models/User"
import Scout from "App/Models/Scout"
import { AuthorizationHelpers } from "../authorization.manager"
import { TYPE_TO_VOLLEYBALL_SCOUT_EVENT, VolleyballScoutEventJsonAddParameters } from "./events/volleyball/VolleyballScoutEvent"
import ScoutsManager from "./scouts.manager"
import { FIRST_POINT } from "./events/volleyball/common"
import Ws from "App/Services/Ws"
import { Context } from "../base.manager"
import PlayersManager from "../players.manager"

export type ScoutSocketEventMapping = {
  'scout:add': VolleyballScoutEventJsonAddParameters,
  'scout:stashReload': {
    scout: Scout
  },
  'scout:lastEventReload': {
    scoutId: number
  },
  'scout:analysisReload': {
    scoutId: number
  },
  'scout:undo': {
    scoutId: number
  },
  'scout:restart': {
    scoutId: number
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

      Ws.io.to(roomName).emit(eventName, data)
    } else if (params.data.event == 'scout:lastEventReload') {
      let data = params.data.data as ScoutSocketEventMapping['scout:lastEventReload']

      let scout = await Scout.query({ client: params.context?.trx })
        .preload('event')
        .preload('players')
        .where('id', data.scoutId)
        .firstOrFail()

      let roomName = Ws.roomName({
        team: {
          id: scout.event.teamId
        },
        namespace: 'scout'
      })

      let eventName = Ws.roomName({
        team: {
          id: scout.event.teamId
        },
        namespace: 'scout:lastEventReload'
      })

      let playersManager = new PlayersManager()
      let lastEventsForPlayers = await playersManager.lastScoutEventsForMany({
        data: {
          players: scout.players,
          scout: scout
        },
        context: params.context
      })

      Ws.io.to(roomName).emit(eventName, {
        lastEventsForPlayers
      })
    } else if (params.data.event == 'scout:analysisReload') {
      let data = params.data.data as ScoutSocketEventMapping['scout:analysisReload']

      let scout = await Scout.query({ client: params.context?.trx })
        .preload('event')
        .preload('players')
        .where('id', data.scoutId)
        .firstOrFail()

      let roomName = Ws.roomName({
        team: {
          id: scout.event.teamId
        },
        namespace: 'scout'
      })

      let eventName = Ws.roomName({
        team: {
          id: scout.event.teamId
        },
        namespace: 'scout:analysisReload'
      })

      let scoutManager = new ScoutsManager()
      let analysis = await scoutManager.analysis({
        data: {
          id: scout.id
        },
        context: params.context
      })

      Ws.io.to(roomName).emit(eventName, {
        analysis
      })
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
    if (params.event == 'scout:add' || params.event == 'scout:undo' || params.event == 'scout:restart') {
      let data = params.data as ScoutSocketEventMapping['scout:add']

      // check if user can manage the scout
      let scout = await Scout.query()
        .preload('event')
        .preload('scoutInfo')
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
      } else if(params.event == 'scout:undo') {
        await this.handleUndo({ user: params.user, scout })
      } else if (params.event == 'scout:restart') {
        await this.handleRestart({ user: params.user, scout })
      }
    }
  }

  private async handleAdd(params: {
    scoutEvent: VolleyballScoutEventJsonAddParameters
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
      },
      context: {
        user: params.user
      }
    })
    await event.save()
    await event.postReceived({
      data: {
        scout: params.scout
      },
      context: {
        user: params.user
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

  private async handleUndo(params: {
    scout: Scout
    user: User
  }) {
    let scoutManager = new ScoutsManager()
    await scoutManager.undo({
      data: { id: params.scout.id },
      context: {
        user: params.user
      }
    })
  }

  private async handleRestart(params: {
    scout: Scout
    user: User
  }) {
    let scoutManager = new ScoutsManager()
    await scoutManager.restart({
      data: { id: params.scout.id },
      context: {
        user: params.user
      }
    })
  }
}

export default new ScoutSocket()